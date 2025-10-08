import express, {Request, Response, NextFunction, response} from 'express'; 

import { FantasyGameMethods, FantasyDraftPickMethods, FantasyGameHistoryMethods, FantasyGame, FantasyDraftPick, FantasyGameHistory, SimulationContestSummaryMethods } from '../../types/types';
import FantasyService from '../dataService/fantasyService';
import FantasyDraftPickService from '../dataService/fantasyDraftPickService';
import FantasyGameHistoryService from '../dataService/fantasyGameHistoryService';
import { InsertOneResult } from 'mongodb';
import { awsCognitoAuthMiddleware, requireRole, requireGroup } from './awsCognitoMdw';

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
        console.log("number of connections: ", connections?.size);
        if (connections) {
            const messageStr = `data: ${JSON.stringify(message)}\n\n`;
            connections.forEach(res => {
                try {
                    console.log("broadcasting to connection"); 
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
        console.log("cleaning up connection");
        const connections = activeConnections.get(gameId);
        if (connections) {
            connections.delete(res);
            if (connections.size === 0) {
                activeConnections.delete(gameId);
            }
        }
    };

    // Fantasy Game endpoints
    router.post('/createGame', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const user = req.user?.email as string; 
        const { gameType, countAgainstRecord, secondsPerPick, tournamentCt, isSeason, tournamentSize, name } = req.body;

        console.log("req.user: ", user);

        if (!gameType || typeof countAgainstRecord !== 'boolean' || typeof isSeason !== 'boolean') {
            return res.status(400).send('Missing required fields: gameType, countAgainstRecord, isSeason');
        }

        if (!['one-team', '8-team', '8-team-no-repeat'].includes(gameType)) {
            return res.status(400).send('Invalid gameType. Must be one of: one-team, 8-team, 8-team-no-repeat');
        }
        if(user.toLowerCase()?.startsWith("autodraft")) {
            return res.status(400).send('Invalid user. Must be a real user');
        }

        let finalSecondsPerPick = secondsPerPick || 30;
        let finalTournamentCt = tournamentCt || 12;
        let finalTournamentSize = tournamentSize || 50;

        const game = await fantasyService.createFantasyGame(user, gameType, countAgainstRecord, finalSecondsPerPick, finalTournamentCt, isSeason, finalTournamentSize, name);
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
        console.log("getting game live: ", gameId);
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
            const draftPicks = await draftPickService.getFantasyDraftPicks(gameId);
            console.log("sending initial game data with status: ", game.status);
            res.write(`data: ${JSON.stringify({ type: 'gameUpdate', data: {game, draftPicks} })}\n\n`);
        } catch (error) {
            console.log("error fetching game data: ", error);
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to fetch game data' })}\n\n`);
        }

        // Keep connection alive
        const keepAlive = setInterval(() => {
            try {
                res.write(': keepalive\n\n');
            } catch (error) {
                // Connection is dead, clean up
                console.log("connection is dead, cleaning up");
                cleanupConnection(gameId, res, keepAlive);
            }
        }, 30000);

        // Handle client disconnect
        req.on('close', () => {
            console.log("connection closed, cleaning up");
            cleanupConnection(gameId, res, keepAlive);
        });

        // Handle connection errors
        req.on('error', (err) => {
            console.log("connection error: ", err);
            console.log("connection error, cleaning up");
            cleanupConnection(gameId, res, keepAlive);
        });
    });

    router.put('/updateGameState/:gameId', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const { state, users } = req.body;

        console.log("updateGameState", gameId, state, users);

        if (!state || typeof state !== 'string' || !['draft', 'complete', 'stage-draft'].includes(state)) {
            return res.status(400).send('Invalid state. Must be one of: draft, complete, stage-draft');
        }

        if(state === 'stage-draft' && !users) {
            return res.status(400).send('Users are required when state is stage-draft');
        }

        if(state === 'draft') {
            const autoDraftResult = await draftPickService.runAutoDraftPicks(gameId, -1);
        }
        const result = await fantasyService.updateFantasyGameState(gameId, state as 'stage-draft' | 'draft' | 'complete', users);

        const game = await fantasyService.getFantasyGame(gameId);
        console.log("game status: ", game);
        const draftPicks = await draftPickService.getFantasyDraftPicks(gameId);
        

        const connections = activeConnections.get(gameId);
        try {
            if (connections) {
                connections.forEach(res => {
                    res.write(`data: ${JSON.stringify({ type: 'gameUpdate', data: {game, draftPicks} })}\n\n`);
                    // res.end();
                });
                console.log("finished writing update"); 
                // setTimeout(() => {
                //     activeConnections.delete(gameId);
                // }, 5000)
            }
        } catch (error) {
            console.error('Failed to broadcast game update:', error);
        }

        res.status(200).send(result);
    });

    router.post('/insertDraftPick', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const draftPick: FantasyDraftPick = req.body;
        const user = req.user?.email as string; 
        draftPick.user = user;

        if (!draftPick.gameId || typeof draftPick.draftPick !== 'number' || !draftPick.contestSummaryKey) {
            return res.status(400).send('Missing required fields: gameId, draftPick, contestSummaryKey');
        }
        console.log("draftPick to insert", draftPick);


        var insertDraftPickResult: InsertOneResult;
        try {
            insertDraftPickResult = await draftPickService.insertDraftPick(draftPick);
        } catch (error) {
            console.error('Failed to insert draft pick:', error);
            broadcastToGame(draftPick.gameId, { type: 'error', message: 'Failed to insert draft pick' });
            return res.status(500).send('Failed to insert draft pick'); 
        }

        var autodraftResult: {autoDraftPicks: FantasyDraftPick[]};

        try {
            autodraftResult = await draftPickService.runAutoDraftPicks(draftPick.gameId, draftPick.draftPick); 
        } catch (error) {
            console.error('Failed to run auto draft picks:', error);
            broadcastToGame(draftPick.gameId, { type: 'error', message: 'Failed to run auto draft picks' });
            return res.status(500).send('Failed to run auto draft picks'); 
        }

        var game: FantasyGame;
        var updatedDraftPicks: FantasyDraftPick[];

        try {
            game = await fantasyService.getFantasyGame(draftPick.gameId);
            updatedDraftPicks = await draftPickService.getFantasyDraftPicks(draftPick.gameId);
            const picksNeeded = game.gameType === 'one-team' ? 1 : 8 * game.users.length;
            const picksMade = updatedDraftPicks.length;
            if(picksMade >= picksNeeded) {
                const result3 = await fantasyService.updateFantasyGameState(draftPick.gameId, 'complete');
                game = await fantasyService.getFantasyGame(draftPick.gameId);
            }
            console.log("broadcasting game update, pick length", updatedDraftPicks.length);
            broadcastToGame(draftPick.gameId, { type: 'gameUpdate', data: {game, draftPicks: updatedDraftPicks} });
        } catch (error) {
            console.error('Failed to get fantasy game or draft picks:', error);
            broadcastToGame(draftPick.gameId, { type: 'error', message: 'Failed to get fantasy game or draft picks' });
            return res.status(500).send('Failed to get fantasy game or draft picks'); 
        }

        res.status(201).send({insertDraftPickResult, autodraftResult});
    });



    router.get('/getGames/:user', async (req: Request, res: Response) => {
        const { user } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        
        const games = await fantasyService.getFantasyGames(user, limit, offset);
        res.status(200).send(games);
    });

    router.put('/addUsers/:gameId', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const { users } = req.body;
        const user = req.user?.email as string; 
        
        if (!Array.isArray(users)) {
            return res.status(400).send('Users must be an array');
        }

        if(!users.includes(user)) {
            return res.status(400).send('User is not in users array');
        }

        if(user.toLowerCase()?.startsWith("autodraft")) {
            return res.status(400).send('Invalid user. Must be a real user');
        }

        const result = await fantasyService.addUsersToFantasyGame(gameId, users);
        
        // Broadcast game update to all connected clients
        try {
            const updatedGame = await fantasyService.getFantasyGame(gameId);
            broadcastToGame(gameId, { type: 'gameUpdate', data: {game: updatedGame} });
        } catch (error) {
            console.error('Failed to broadcast game update:', error);
        }
        
        res.status(200).send(result);
    });

    router.delete('/deleteGame/:gameId', awsCognitoAuthMiddleware, requireRole('fantasy-admin'), async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const user = req.user?.email as string; 

        const game = await fantasyService.getFantasyGame(gameId);

        if(!game.users.includes(user)) {
            return res.status(400).send('User is not in users array');
        }

        if(game.status === 'complete' || game.status === 'draft') {
            return res.status(400).send('Game is complete, cannot delete');
        }; 

        await draftPickService.deleteFantasyGame(gameId);
        await historyService.deleteFantasyGame(gameId);
        const result = await fantasyService.deleteFantasyGame(gameId);
        res.status(200).send(result);
    });

    // Fantasy Draft Pick endpoints
    router.get('/getDraftPicks/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const draftPicks = await draftPickService.getFantasyDraftPicks(gameId);
        res.status(200).send(draftPicks);
    });

    // Fantasy Game History endpoints
    router.get('/getGameHistory/:user', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const user = req.user?.email as string; 
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
        
        if (!gameHistory.gameId || !gameHistory.user ) {
            return res.status(400).send('Missing required fields: gameId, user');
        }

        const result = await historyService.insertGameHistory(gameHistory);
        res.status(201).send(result);
    });

    router.get('/getMostGamesPlayed', async (req: Request, res: Response) => {
        const limit: number = parseInt(req.query.limit as string); 
        const offset: number = parseInt(req.query.offset as string); 
        const mostGamesPlayed = await historyService.getMostGamesPlayed(limit, offset); 
        res.status(200).send(mostGamesPlayed);
    });

    router.delete('/deleteGameAndRelated/:gameId', awsCognitoAuthMiddleware, requireRole('fantasy-admin'),  async (req: Request, res: Response) => {
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

    router.get('/getOpenFantasyGames', async (req: Request, res: Response) => {
        var limit: number = parseInt(req.query.limit as string); 
        var offset: number = parseInt(req.query.offset as string); 
        const state: 'stage' | 'stage-draft' | 'draft' | 'complete' = req.query.state as 'stage' | 'stage-draft' | 'draft' | 'complete'; 
        if(!state) {
            return res.status(400).send('Missing required fields: state');
        }
        limit = limit || 10;
        offset = offset || 0;
        const openFantasyGames = await fantasyService.getOpenFantasyGames(limit, offset, state); 
        res.status(200).send(openFantasyGames);
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
