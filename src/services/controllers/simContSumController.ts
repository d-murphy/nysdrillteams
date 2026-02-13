import express, {Request, Response, NextFunction} from 'express'; 

import { SimulationContestSummaryMethods, SimulationContestSummary } from '../../types/types';
import SimContSumService from '../dataService/simContSumService';

export function simContSumRouter (simContSumDataSource:SimulationContestSummaryMethods){
    const SimContSum = new SimContSumService(simContSumDataSource); 

    const router = express.Router()

    router.get('/getTopSimulationContestSummaries', async (req: Request, res: Response) => {
        const contests: string = req.query.contests as string; 
        const sortBy: string = req.query.sortBy as string; 
        const limit: number = parseInt(req.query.limit as string) || 20; 
        const offset: number = parseInt(req.query.offset as string) || 0; 
        const teams: string = req.query.teams as string; 
        const years: string = req.query.years as string; 
        const teamContestKeyArrToExclude: string = req.query.teamContestKeyArrToExclude as string; 
        const teamYearContestKeyArrToExclude: string = req.query.teamYearContestKeyArrToExclude as string; 
        
        if(!contests || !sortBy) {
            return res.status(400).send('contests and sortBy parameters are required');
        }
        
        let topSummaries = await SimContSum.getTopSimulationContestSummaries(
            contests, 
            sortBy, 
            limit, 
            offset, 
            teams || undefined, 
            years || undefined, 
            teamContestKeyArrToExclude || undefined,
            teamYearContestKeyArrToExclude || undefined
        ); 
        res.status(200).send(topSummaries);
    })

    router.post('/getSimulationContestSummariesByKeys', async (req: Request, res: Response) => {
        const { keys } = req.body;
        
        if (!keys || !Array.isArray(keys)) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'keys must be an array' 
            });
        }

        if (keys.length === 0) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'keys array cannot be empty' 
            });
        }

        const summaries = await SimContSum.getSimulationContestSummaries(keys);
        res.status(200).send(summaries);
    })

    router.use((err:Error, req:Request, res:Response, next:NextFunction) => {
        if (err) {
            res.status(500);
            res.json("Internal server error.");
        }       
        next(err);
    });

    return router; 
}
