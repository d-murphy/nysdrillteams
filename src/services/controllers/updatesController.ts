import express, {Request, Response, NextFunction} from 'express'; 
import { InsertOneResult } from 'mongodb';

import { Update, UpdatesData } from '../../types/types';
import UpdatesService from '../dataService/updatesService';
import SessionAdmin from '../dataService/session'
import { checkSessionsMdw } from './createSessionAndAuthMdw';



export function updatesRouter (updatesDataSource:UpdatesData, sessionAdmin:SessionAdmin){
    const Updates = new UpdatesService(updatesDataSource); 
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 

    const router = express.Router()
    router.post('/insertUpdate', [sessionsMdw], async (req: Request, res: Response) => {
        let newUpdate = req.body.updateData;
        if(!newUpdate?.user || !newUpdate?.date || !newUpdate?.update){
            return res.status(400).send('malformed reqeust')
        }
        let result = await Updates.insertUpdate(newUpdate) 
        return res.status(200).send(result);
    })
    
    router.get('/getUpdates', [sessionsMdw], async (req: Request, res: Response) => {
        let updates = await Updates.getRecent(); 
        return res.status(200).send(updates); 
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