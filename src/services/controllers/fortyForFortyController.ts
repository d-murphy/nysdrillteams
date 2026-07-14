import express, { Request, Response, NextFunction } from 'express';
import { FortyForFortyGameMethods, FortyForFortyGameMode, SimulationRunMethods } from '../../types/types';
import FortyForFortyService from '../dataService/fortyForFortyService';

function parseGameMode(value: unknown): FortyForFortyGameMode | undefined | 'invalid' {
    if (value === undefined || value === '') return undefined;
    if (value === 'classic' || value === 'lifer') return value;
    return 'invalid';
}

function parseLimitOffset(req: Request): { limit: number; offset: number } {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    return { limit, offset };
}

export function fortyForFortyRouter(
    fortyForFortyDataSource: FortyForFortyGameMethods,
    simulationRunDataSource: SimulationRunMethods
) {
    const fortyForFortyService = new FortyForFortyService(fortyForFortyDataSource, simulationRunDataSource);

    const router = express.Router();

    router.post('/insert', async (req: Request, res: Response) => {
        const { contestSummaryKeys, user, gameMode } = req.body;

        if (!contestSummaryKeys || !Array.isArray(contestSummaryKeys) || contestSummaryKeys.length === 0) {
            return res.status(400).send('Missing required field: contestSummaryKeys');
        }

        if (!gameMode) {
            return res.status(400).send('Missing required field: gameMode');
        }

        const gameId = await fortyForFortyService.insertFortyForFortyGame(contestSummaryKeys, gameMode, user);
        res.status(201).send({ gameId });
    });

    router.get('/getGame/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const game = await fortyForFortyService.getFortyForFortyGame(gameId);
        res.status(200).send(game);
    });

    router.put('/updateLeaderboardName/:gameId', async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const { leaderboardName } = req.body;

        if (!leaderboardName || typeof leaderboardName !== 'string') {
            return res.status(400).send('Missing required field: leaderboardName');
        }

        const result = await fortyForFortyService.updateLeaderboardName(gameId, leaderboardName);
        if (!result.success) {
            return res.status(400).send(result.message);
        }

        res.status(200).send({ success: true });
    });

    router.get('/recentNamedGames', async (req: Request, res: Response) => {
        const gameMode = parseGameMode(req.query.gameMode);
        if (gameMode === 'invalid') {
            return res.status(400).send('Invalid gameMode. Must be classic or lifer.');
        }

        const { limit, offset } = parseLimitOffset(req);
        const games = await fortyForFortyService.getRecentNamedGames(gameMode, limit, offset);
        res.status(200).send(games);
    });

    router.get('/topGamesThisWeek', async (req: Request, res: Response) => {
        const gameMode = parseGameMode(req.query.gameMode);
        if (gameMode === 'invalid') {
            return res.status(400).send('Invalid gameMode. Must be classic or lifer.');
        }

        const { limit, offset } = parseLimitOffset(req);
        const games = await fortyForFortyService.getTopGamesThisWeek(gameMode, limit, offset);
        res.status(200).send(games);
    });

    router.get('/topGamesAllTime', async (req: Request, res: Response) => {
        const gameMode = parseGameMode(req.query.gameMode);
        if (gameMode === 'invalid') {
            return res.status(400).send('Invalid gameMode. Must be classic or lifer.');
        }

        const { limit, offset } = parseLimitOffset(req);
        const games = await fortyForFortyService.getTopGamesAllTime(gameMode, limit, offset);
        res.status(200).send(games);
    });

    router.get('/countCompleteGames', async (_req: Request, res: Response) => {
        const count = await fortyForFortyService.countCompleteGames();
        res.status(200).send({ count });
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
