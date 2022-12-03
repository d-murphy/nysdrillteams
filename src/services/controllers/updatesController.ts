import express, {Request, Response} from 'express'; 
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
        let result: InsertOneResult | undefined; 
        try {
            result = await Updates.insertUpdate(newUpdate)
        } catch(e){
            console.error("Error inserting update: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result);
    })
    
    router.get('/getUpdates', [sessionsMdw], async (req: Request, res: Response) => {
        let updates: Update[]; 
        try {
            updates = await Updates.getRecent();
        } catch(e) {
            console.error("Error getting updates: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(updates); 
    })
    
    return router; 
}