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

        
        if(!contests || !sortBy) {
            return res.status(400).send('contests and sortBy parameters are required');
        }
        
        let topSummaries = await SimContSum.getTopSimulationContestSummaries(
            contests, 
            sortBy, 
            limit, 
            offset, 
            teams || undefined, 
            years || undefined
        ); 
        res.status(200).send(topSummaries);
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
