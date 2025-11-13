import express, {Request, Response, NextFunction, response} from 'express'; 

import { FantasyGameMethods, FantasyDraftPickMethods, FantasyGameHistoryMethods, FantasyGame, FantasyDraftPick, FantasyGameHistory, SimulationContestSummaryMethods, SimulationRunMethods, SimulationRun } from '../../types/types';
import FantasyService from '../dataService/fantasyService';
import FantasyDraftPickService from '../dataService/fantasyDraftPickService';
import FantasyGameHistoryService, { TotalPointsWFinish } from '../dataService/fantasyGameHistoryService';
import { InsertOneResult } from 'mongodb';
import { awsCognitoAuthMiddleware, requireRole, requireGroup } from './awsCognitoMdw';
import SimulationRunService from '../dataService/simulationRunService';
import isGameComplete from '../../library/isGameComplete';

export function fantasyRouter(
    fantasyGameDataSource: FantasyGameMethods,
    fantasyDraftPickDataSource: FantasyDraftPickMethods,
    fantasyGameHistoryDataSource: FantasyGameHistoryMethods,
    contestSummaryDataSource: SimulationContestSummaryMethods, 
    simulationRunDataSource: SimulationRunMethods
) {
    const fantasyService = new FantasyService(fantasyGameDataSource);
    const draftPickService = new FantasyDraftPickService(fantasyDraftPickDataSource, fantasyGameDataSource, contestSummaryDataSource);
    const historyService = new FantasyGameHistoryService(fantasyGameHistoryDataSource, simulationRunDataSource);
    const simulationRunService = new SimulationRunService(simulationRunDataSource);

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
        const dataToBroadcast: {game?: FantasyGame, draftPicks?: FantasyDraftPick[], runs?: SimulationRun[], totalPointsWFinish?: TotalPointsWFinish[]} = {};  
        try {
            const game = await fantasyService.getFantasyGame(gameId);
            const draftPicks = await draftPickService.getFantasyDraftPicks(gameId);
            dataToBroadcast.game = game;
            dataToBroadcast.draftPicks = draftPicks;
            if(isGameComplete(game, draftPicks)) {
                const gameSimIndex = game.simulationIndex[0]; 
                const keys = draftPicks.map(pick => pick.contestSummaryKey + "|" + gameSimIndex);
                const runs = await simulationRunService.getSimulationRuns(keys); 
                dataToBroadcast.runs = runs;
                const historiesAndFinishes = historyService.calculateFantasyGameHistory(draftPicks, game, runs);
                dataToBroadcast.totalPointsWFinish = historiesAndFinishes.totalPointsWFinish;
            }
            console.log("sending initial game data with status: ", game.status);
            res.write(`data: ${JSON.stringify({ type: 'gameUpdate', data: dataToBroadcast })}\n\n`);
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

        if (!state || typeof state !== 'string' || !['draft', 'complete', 'stage-draft'].includes(state)) {
            return res.status(400).send('Invalid state. Must be one of: draft, complete, stage-draft');
        }

        if(state === 'stage-draft' && !users) {
            return res.status(400).send('Users are required when state is stage-draft');
        }

        const result = await fantasyService.updateFantasyGameState(gameId, state as 'stage-draft' | 'draft', users);
        const game = await fantasyService.getFantasyGame(gameId);
        try {
            broadcastToGame(gameId, { type: 'gameUpdate', data: {game, draftPicks: []} });    
            if(state === 'draft') {
                let autoDraftResult = await draftPickService.runAutoDraftPicks(gameId, -1); 
                while(autoDraftResult.autoDraftPicks.length > 0) {
                    const autoDraftDataToBroadcast: {game?: FantasyGame, draftPicks?: FantasyDraftPick[]} = {};  
                    const draftPicks = await draftPickService.getFantasyDraftPicks(gameId);
                    autoDraftDataToBroadcast.draftPicks = draftPicks;
                    autoDraftDataToBroadcast.game = game;
                    broadcastToGame(gameId, { type: 'gameUpdate', data: autoDraftDataToBroadcast });
                    const lastPick = autoDraftResult.autoDraftPicks[autoDraftResult.autoDraftPicks.length - 1];
                    autoDraftResult = await draftPickService.runAutoDraftPicks(gameId, lastPick.draftPick); 
                }
            }

        } catch (error) {
            console.error('Failed to update fantasy game state:', error);
            broadcastToGame(gameId, { type: 'error', message: 'Failed to update fantasy game state' });
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

        var insertDraftPickResult = await draftPickService.insertDraftPick(draftPick);

        try {
            // broadcasting draft pick
            const dataToBroadcast: {game?: FantasyGame, draftPicks?: FantasyDraftPick[], runs?: SimulationRun[], totalPointsWFinish?: TotalPointsWFinish[]} = {};  
            var game = await fantasyService.getFantasyGame(draftPick.gameId);
            var updatedDraftPicks = await draftPickService.getFantasyDraftPicks(draftPick.gameId);
            dataToBroadcast.draftPicks = updatedDraftPicks;
            dataToBroadcast.game = game;
            broadcastToGame(draftPick.gameId, { type: 'gameUpdate', data: dataToBroadcast });

            // broadcast auto draft picks
            var autodraftResult = await draftPickService.runAutoDraftPicks(draftPick.gameId, draftPick.draftPick);             
            while(autodraftResult.autoDraftPicks.length > 0) {
                updatedDraftPicks = await draftPickService.getFantasyDraftPicks(draftPick.gameId);
                dataToBroadcast.draftPicks = updatedDraftPicks;
                broadcastToGame(draftPick.gameId, { type: 'gameUpdate', data: dataToBroadcast });    
                const lastPick = autodraftResult.autoDraftPicks[autodraftResult.autoDraftPicks.length - 1];
                // 
                await new Promise(resolve => setTimeout(resolve, (Math.random() * 200 + 200)));
                autodraftResult = await draftPickService.runAutoDraftPicks(draftPick.gameId, lastPick.draftPick); 
            }
            // broadcast game complete
            if(isGameComplete(game, updatedDraftPicks)) {
                await fantasyService.updateFantasyGameState(draftPick.gameId, 'complete');
                dataToBroadcast.game = await fantasyService.getFantasyGame(draftPick.gameId);
                const gameSimIndex = game.simulationIndex[0]; 
                const keys = updatedDraftPicks.map(pick => pick.contestSummaryKey + "|" + gameSimIndex);
                const runs = await simulationRunService.getSimulationRuns(keys); 
                dataToBroadcast.runs = runs;
                const historiesAndFinishes = historyService.calculateFantasyGameHistory(updatedDraftPicks, game, runs);
                dataToBroadcast.totalPointsWFinish = historiesAndFinishes.totalPointsWFinish;
                const fantasyGameHistories = historiesAndFinishes.fantasyGameHistory;
                fantasyGameHistories.forEach(async history => {
                    await historyService.insertGameHistory(history);
                });
                broadcastToGame(draftPick.gameId, { type: 'gameUpdate', data: dataToBroadcast });
            }

        } catch (error) {
            console.error('Failed during broadcasting in insert draft pick:', error);
            broadcastToGame(draftPick.gameId, { type: 'error', message: 'Failure during fantasy draft.' });
            return res.status(500).send('Failed to get fantasy game or draft picks'); 
        }

        res.status(201).send({insertDraftPickResult});
    });



    router.get('/getGames', async (req: Request, res: Response) => {
        const user = req.query.user as string | null;
        const state = req.query.state as 'stage' | 'stage-draft' | 'draft' | 'complete' | null;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        
        const games = await fantasyService.getFantasyGames(user, state as 'stage' | 'stage-draft' | 'draft' | 'complete' | null, limit, offset);
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
