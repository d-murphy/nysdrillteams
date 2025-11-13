import express, {Request, Response, NextFunction} from 'express'; 

import { SimulationRunMethods, SimulationRun } from '../../types/types';
import SimulationRunService from '../dataService/simulationRunService'; 

export function simulationRunRouter(simulationRunDataSource: SimulationRunMethods) {
    const simulationRunService = new SimulationRunService(simulationRunDataSource); 

    const router = express.Router();

    router.post('/getSimulationRuns', async (req: Request, res: Response) => {
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

        if (keys.length > 400) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: `Cannot request more than 400 keys. Received: ${keys.length}` 
            });
        }

        const runs = await simulationRunService.getSimulationRuns(keys);
        res.status(200).send(runs);
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

