import express, {Request, Response, NextFunction} from 'express'; 

import { SimulationContestSummaryMethods, SimulationContestSummary } from '../../types/types';
import SimContSumService from '../dataService/simContSumService';

export function simContSumRouter (simContSumDataSource:SimulationContestSummaryMethods){
    const SimContSum = new SimContSumService(simContSumDataSource); 

    const router = express.Router()

    router.get('/getSimulationContestSummary', async (req: Request, res: Response) => {
        const team: string = req.query.team as string; 
        const year: number = parseInt(req.query.year as string); 
        if(!team || !year) {
            return res.status(400).send('Team and year parameters are required');
        }
        let contestSummary = await SimContSum.getSimulationContestSummary(team, year); 
        res.status(200).send(contestSummary);
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
