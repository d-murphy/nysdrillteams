import express, { Request, Response, NextFunction } from 'express';
import { FortyForFortyGameMethods, SimulationRunMethods } from '../../types/types';
import FortyForFortyService from '../dataService/fortyForFortyService';

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

    router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            res.status(500);
            res.json("Internal server error.");
        }
        next(err);
    });

    return router;
}
