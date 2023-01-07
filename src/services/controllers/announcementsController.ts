import express, {Request, Response, NextFunction} from 'express'; 
import AnnouncementService from '../dataService/announcementsService';
import SessionAdmin from '../dataService/session'
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw';

export function announcementRouter (sessionAdmin:SessionAdmin){
    const Announcements = new AnnouncementService();  
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin', 'scorekeeper']); 

    const router = express.Router()
    router.get('/getAnnouncements', (req: Request, res: Response) => {
        let announcements = Announcements.get(); 
        res.status(200).send(announcements);
    })
        
    router.post('/updateAnnouncements', [sessionsMdw, authMdw], (req: Request, res: Response) => {
        let announcements = req.body.announcements;
        if(!announcements || !Array.isArray(announcements)){
            return res.status(400).send('malformed reqeust')
        }
        Announcements.update(announcements); 
        return res.status(200).send({ok:true, message: 'Announcements updated.'});
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