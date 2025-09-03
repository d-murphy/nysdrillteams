import express, {Request, Response, NextFunction} from 'express'; 

import { ProjectionMethods, Projection } from '../../types/types';
import ProjectionService from '../dataService/projectionService'; 

export function projectionRouter (projectionDataSource:ProjectionMethods){
    const Projection = new ProjectionService(projectionDataSource); 

    const router = express.Router()

    router.get('/getProjections', async (req: Request, res: Response) => {
        const year: number = parseInt(req.query.year as string); 
        if(!year) {
            return res.status(400).send('Year parameter is required');
        }
        let projections = await Projection.getProjections(year); 
        res.status(200).send(projections);
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
