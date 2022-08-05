import express, {Request, Response} from 'express'; 
import { TracksData } from '../../types/types'

import TracksService from '../dataService/tracksService';

export function tracksRouter (tracksDataSource:TracksData){
    const Tracks = new TracksService(tracksDataSource); 
    const router = express.Router()

    router.get('/getTrack', async (req: Request, res: Response) => {
        const trackId: string = (req.query.trackId as unknown as string);
        if(!trackId) return res.status(400).send('run id not valid')
        let track = await Tracks.getTrack(trackId);
        if(!track) return res.status(500).send("Internal server error"); 
        res.status(200).send(track);
    })

    router.get('/getTrackByName', async (req: Request, res: Response) => {
        const trackName: string = (req.query.trackName as unknown as string);
        if(!trackName) return res.status(400).send('run id not valid')
        let track = await Tracks.getTrackByName(trackName);
        if(!track) return res.status(500).send("Internal server error"); 
        res.status(200).send(track);
    })

    router.post('/insertTrack', async (req: Request, res: Response) => {
        let newTrack = req.body;
        if( !newTrack?.name || !newTrack?.address || !newTrack?.city  ){
            res.status(400).send('malformed reqeust')
            return
        }
        let result = await Tracks.insertTrack(newTrack)
        if(!result.result) res.status(500).send('Internal server error')
        res.status(200).send(result);
    })

    router.post('/deleteTrack', async (req: Request, res: Response) => {
        const trackId: string = (req.body.trackId as unknown as string);
        if(!trackId) return res.status(400).send('team id not valid')
        let result = await Tracks.deleteTrack(trackId);
        if(!result) return res.status(500).send('Internal server error'); 
        res.status(200).send(`Delete successful.`);
    })

    router.post('/updateTrack', async (req: Request, res: Response) => {
        let trackId = req.body.trackId; 
        let fieldsToUpdate = req.body.fieldsToUpdate; 
        if(!trackId || !fieldsToUpdate) return res.status(400).send('update body not valid'); 
        let result = await Tracks.updateTrack(trackId, fieldsToUpdate);
        if(!result) return res.status(500).send("Internal server error"); 
        res.status(200).send(result); 
    })

    router.get('/getTracks', async (req: Request, res: Response) => {
        let tracks = await Tracks.getTracks(); 
        if(!tracks) res.status(500).send("Intenral server error"); 
        res.status(200).send(tracks); 
    })
    return router; 
}

