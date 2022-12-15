import express, {NextFunction, Request, Response} from 'express'; 
import { TracksData, Track } from '../../types/types'
import TracksService from '../dataService/tracksService';
import SessionAdmin from '../dataService/session';
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw'; 

export function tracksRouter (tracksDataSource:TracksData, sessionAdmin:SessionAdmin){
    const Tracks = new TracksService(tracksDataSource); 
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin', 'scorekeeper']); 

    const router = express.Router()

    router.get('/getTrack', async (req: Request, res: Response) => {
        const trackId: string = (req.query.trackId as unknown as string);
        if(!trackId) return res.status(400).send('run id not valid')
        let track = await Tracks.getTrack(trackId);
        return res.status(200).send(track); 
    })

    router.get('/getTrackByName', async (req: Request, res: Response) => {
        const trackName: string = (req.query.trackName as unknown as string);
        if(!trackName) return res.status(400).send('run id not valid')
        let track = await Tracks.getTrackByName(trackName); 
        res.status(200).send(track);
    })

    router.post('/insertTrack', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let newTrack = req.body;
        if( !newTrack?.name || !newTrack?.address || !newTrack?.city  ) return res.status(400).send('malformed reqeust'); 
        let result = await Tracks.insertTrack(newTrack); 
        return res.status(200).send(result); 
    })

    router.post('/deleteTrack', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const trackId: string = (req.body.trackId as unknown as string);
        if(!trackId) return res.status(400).send('team id not valid')
        let result = await Tracks.deleteTrack(trackId); 
        return res.status(200).send(`Delete successful.`);
    })

    router.post('/updateTrack', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let trackId = req.body.trackId; 
        let fieldsToUpdate = req.body.fieldsToUpdate; 
        if(!trackId || !fieldsToUpdate) return res.status(400).send('update body not valid'); 
        let result = await Tracks.updateTrack(trackId, fieldsToUpdate); 
        return res.status(200).send(result); 
    })

    router.get('/getTracks', async (req: Request, res: Response) => {
        let tracks: Track[]; 
        tracks = await Tracks.getTracks();
        return res.status(200).send(tracks); 
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

