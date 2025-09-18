import express, {Request, Response, NextFunction, response} from 'express'; 

import { FantasyGameMethods, FantasyDraftPickMethods, FantasyGameHistoryMethods, FantasyGame, FantasyDraftPick, FantasyGameHistory, SimulationContestSummaryMethods } from '../../types/types';
import FantasyService from '../dataService/fantasyService';
import FantasyDraftPickService from '../dataService/fantasyDraftPickService';
import FantasyGameHistoryService from '../dataService/fantasyGameHistoryService';

export function fantasyRouter(
    fantasyGameDataSource: FantasyGameMethods,
    fantasyDraftPickDataSource: FantasyDraftPickMethods,
    fantasyGameHistoryDataSource: FantasyGameHistoryMethods,
    contestSummaryDataSource: SimulationContestSummaryMethods
) {
    const fantasyService = new FantasyService(fantasyGameDataSource);
    const draftPickService = new FantasyDraftPickService(fantasyDraftPickDataSource, fantasyGameDataSource, contestSummaryDataSource);
    const historyService = new FantasyGameHistoryService(fantasyGameHistoryDataSource);

    const router = express.Router();

    // Store active SSE connections
    const activeConnections = new Map<string, Set<Response>>();

    // Helper function to broadcast updates to all connected clients for a game
    const broadcastToGame = (gameId: string, message: any) => {
        const connections = activeConnections.get(gameId);
        if (connections) {
            const messageStr = `data: ${JSON.stringify(message)}\n\n`;
            connections.forEach(res => {
                try {
                    res.write(messageStr);
                } catch (error) {
                    // Remove dead connections
                    connections.delete(res);
                }
            });
        }
    };

    // Helper function to clean up connections
    const cleanupConnection = (gameId: string, res: Response, keepAlive?: NodeJS.Timeout) => {
        if (keepAlive) {
            clearInterval(keepAlive);
        }
        
        const connections = activeConnections.get(gameId);
        if (connections) {
            connections.delete(res);
            if (connections.size === 0) {
                activeConnections.delete(gameId);
            }
        }
    };

    // Fantasy Game endpoints
    router.post('/createGame', async (req: Request, res: Response) => {

        console.log("createGame", req.body);
        const { user, gameType, countAgainstRecord, secondsPerPick, tournamentCt, isSeason, tournamentSize } = req.body;


        if (!user || !gameType || typeof countAgainstRecord !== 'boolean' || typeof isSeason !== 'boolean') {
            return res.status(400).send('Missing required fields: user, gameType, countAgainstRecord, isSeason');
        }

        if (!['one-team', '8-team', '8-team-no-repeat'].includes(gameType)) {
            return res.status(400).send('Invalid gameType. Must be one of: one-team, 8-team, 8-team-no-repeat');
        }

        let finalSecondsPerPick = secondsPerPick || 30;
        let finalTournamentCt = tournamentCt || 12;
        let finalTournamentSize = tournamentSize || 50;

        const game = await fantasyService.createFantasyGame(user, gameType, countAgainstRecord, finalSecondsPerPick, finalTournamentCt, isSeason, finalTournamentSize);
        res.status(201).send(game);
    });

    router.get('/getGame/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const game = await fantasyService.getFantasyGame(gameId);
        res.status(200).send(game);
    });

    // Real-time game updates via Server-Sent Events
    router.get('/getGameLive/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        
        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Add this connection to the active connections
        if (!activeConnections.has(gameId)) {
            activeConnections.set(gameId, new Set());
        }
        activeConnections.get(gameId)!.add(res);

        // Send initial game data
        try {
            const game = await fantasyService.getFantasyGame(gameId);
            res.write(`data: ${JSON.stringify({ type: 'gameUpdate', data: game })}\n\n`);
        } catch (error) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to fetch game data' })}\n\n`);
        }

        // Keep connection alive
        const keepAlive = setInterval(() => {
            try {
                res.write(': keepalive\n\n');
            } catch (error) {
                // Connection is dead, clean up
                cleanupConnection(gameId, res, keepAlive);
            }
        }, 30000);

        // Handle client disconnect
        req.on('close', () => {
            cleanupConnection(gameId, res, keepAlive);
        });

        // Handle connection errors
        req.on('error', () => {
            cleanupConnection(gameId, res, keepAlive);
        });
    });

    router.put('/updateGameState/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const { state, users } = req.body;

        if (!state || typeof state !== 'string' || !['draft', 'complete'].includes(state)) {
            return res.status(400).send('Invalid state. Must be one of: draft, complete');
        }

        if(state === 'draft' && !users) {
            return res.status(400).send('Users are required when state is draft');
        }

        const result = await fantasyService.updateFantasyGameState(gameId, state as 'draft' | 'complete', users);
        if(state === 'draft') {
            const result2 = await draftPickService.runAutoDraftPicks(gameId, -1);
        }
        const updatedGame = await fantasyService.getFantasyGame(gameId);

        const connections = activeConnections.get(gameId);
        try {
            if (connections) {
                connections.forEach(res => {
                    res.write(`data: ${JSON.stringify({ type: 'gameUpdate', data: updatedGame })}\n\n`);
                    res.end();
                });
                setTimeout(() => {
                    activeConnections.delete(gameId);
                }, 5000)
            }
        } catch (error) {
            console.error('Failed to broadcast game update:', error);
        }

        res.status(200).send(result);
    });


    router.get('/getGames/:user', async (req: Request, res: Response) => {
        const { user } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        
        const games = await fantasyService.getFantasyGames(user, limit, offset);
        res.status(200).send(games);
    });

    router.put('/addUsers/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const { users } = req.body;
        
        if (!Array.isArray(users)) {
            return res.status(400).send('Users must be an array');
        }

        const result = await fantasyService.addUsersToFantasyGame(gameId, users);
        
        // Broadcast game update to all connected clients
        try {
            const updatedGame = await fantasyService.getFantasyGame(gameId);
            broadcastToGame(gameId, { type: 'gameUpdate', data: updatedGame });
        } catch (error) {
            console.error('Failed to broadcast game update:', error);
        }
        
        res.status(200).send(result);
    });

    router.delete('/deleteGame/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const result = await fantasyService.deleteFantasyGame(gameId);
        res.status(200).send(result);
    });

    // Fantasy Draft Pick endpoints
    router.get('/getDraftPicks/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const draftPicks = await draftPickService.getFantasyDraftPicks(gameId);
        res.status(200).send(draftPicks);
    });

    // Real-time draft picks via Server-Sent Events
    router.get('/getDraftPicksLive/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        
        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Add this connection to the active connections
        if (!activeConnections.has(gameId)) {
            activeConnections.set(gameId, new Set());
        }
        activeConnections.get(gameId)!.add(res);

        // Send initial draft picks data
        try {
            const draftPicks = await draftPickService.getFantasyDraftPicks(gameId);
            res.write(`data: ${JSON.stringify({ type: 'draftPicksUpdate', data: draftPicks })}\n\n`);
        } catch (error) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to fetch draft picks' })}\n\n`);
        }

        // Keep connection alive
        const keepAlive = setInterval(() => {
            try {
                res.write(': keepalive\n\n');
            } catch (error) {
                // Connection is dead, clean up
                cleanupConnection(gameId, res, keepAlive);
            }
        }, 30000);

        // Handle client disconnect
        req.on('close', () => {
            cleanupConnection(gameId, res, keepAlive);
        });

        // Handle connection errors
        req.on('error', () => {
            cleanupConnection(gameId, res, keepAlive);
        });
    });

    router.post('/insertDraftPick', async (req: Request, res: Response) => {
        const draftPick: FantasyDraftPick = req.body;
        
        if (!draftPick.gameId || !draftPick.user || typeof draftPick.draftPick !== 'number' || !draftPick.contestSummaryKey) {
            return res.status(400).send('Missing required fields: gameId, user, draftPick, contestSummaryKey');
        }

        const result = await draftPickService.insertDraftPick(draftPick);

        const result2 = await draftPickService.runAutoDraftPicks(draftPick.gameId, draftPick.draftPick); 
        
        // Broadcast draft picks update to all connected clients
        try {
            const updatedDraftPicks = await draftPickService.getFantasyDraftPicks(draftPick.gameId);
            broadcastToGame(draftPick.gameId, { type: 'draftPicksUpdate', data: updatedDraftPicks });
        } catch (error) {
            console.error('Failed to broadcast draft picks update:', error);
        }
        
        res.status(201).send({result, result2});
    });

    router.delete('/deleteDraftPicks/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const result = await draftPickService.deleteFantasyGame(gameId);
        res.status(200).send(result);
    });

    // Fantasy Game History endpoints
    router.get('/getGameHistory/:user', async (req: Request, res: Response) => {
        const { user } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        
        const history = await historyService.getFantasyGameHistory(user, limit, offset);
        res.status(200).send(history);
    });

    router.get('/getGameHistoryByGameId/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const history = await historyService.getGameHistoryByGameId(gameId);
        res.status(200).send(history);
    });

    router.post('/insertGameHistory', async (req: Request, res: Response) => {
        const gameHistory: FantasyGameHistory = req.body;
        
        if (!gameHistory.gameId || !gameHistory.user || !gameHistory.teamName ) {
            return res.status(400).send('Missing required fields: gameId, user, gameType');
        }

        const result = await historyService.insertGameHistory(gameHistory);
        res.status(201).send(result);
    });

    router.delete('/deleteGameHistory/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const result = await historyService.deleteFantasyGame(gameId);
        res.status(200).send(result);
    });

    // Combined operations
    router.delete('/deleteGameAndRelated/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        
        // Delete from all three collections
        const [gameResult, draftPickResult, historyResult] = await Promise.all([
            fantasyService.deleteFantasyGame(gameId),
            draftPickService.deleteFantasyGame(gameId),
            historyService.deleteFantasyGame(gameId)
        ]);

        res.status(200).send({
            gameDeleted: gameResult,
            draftPicksDeleted: draftPickResult,
            historyDeleted: historyResult
        });
    });

    router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            res.status(500);
            res.json("Internal server error.");
        }       
        next(err);
    });

    return router;
}
