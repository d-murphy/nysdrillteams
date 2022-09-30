import express, {Request, Response} from 'express'; 
import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { TracksData, Track } from '../../types/types'

import TracksService from '../dataService/tracksService';

export function tracksRouter (tracksDataSource:TracksData){
    const Tracks = new TracksService(tracksDataSource); 
    const router = express.Router()

    router.get('/getTrack', async (req: Request, res: Response) => {
        const trackId: string = (req.query.trackId as unknown as string);
        if(!trackId) return res.status(400).send('run id not valid')
        let track: Track | undefined;
        try {
            track = await Tracks.getTrack(trackId);
        } catch(e){
            console.error("Error getting track: ", track); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(track); 
    })

    router.get('/getTrackByName', async (req: Request, res: Response) => {
        const trackName: string = (req.query.trackName as unknown as string);
        if(!trackName) return res.status(400).send('run id not valid')
        let track: Track | undefined; 
        try {
            track = await Tracks.getTrackByName(trackName);
        } catch(e){
            console.error("Error getting track by name: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(track);
    })

    // router.post('/insertTrack', async (req: Request, res: Response) => {
    //     let newTrack = req.body;
    //     if( !newTrack?.name || !newTrack?.address || !newTrack?.city  ) return res.status(400).send('malformed reqeust'); 
    //     let result: InsertOneResult | undefined; 
    //     try {
    //         result = await Tracks.insertTrack(newTrack); 
    //     } catch(e) {
    //         console.error("Error inserting track: ", e); 
    //         return res.status(500).send("Internal server error."); 
    //     }
    //     return res.status(200).send(result); 
    // })

    // router.post('/deleteTrack', async (req: Request, res: Response) => {
    //     const trackId: string = (req.body.trackId as unknown as string);
    //     if(!trackId) return res.status(400).send('team id not valid')
    //     let result: DeleteResult | undefined; 
    //     try {
    //         result = await Tracks.deleteTrack(trackId);
    //     } catch(e) {
    //         console.error("Error deleting track: ", e); 
    //         return res.status(500).send("Internal server error."); 
    //     }
    //     return res.status(200).send(`Delete successful.`);
    // })

    // router.post('/updateTrack', async (req: Request, res: Response) => {
    //     let trackId = req.body.trackId; 
    //     let fieldsToUpdate = req.body.fieldsToUpdate; 
    //     if(!trackId || !fieldsToUpdate) return res.status(400).send('update body not valid'); 
    //     let result: UpdateResult | undefined; 
    //     try {
    //         result = await Tracks.updateTrack(trackId, fieldsToUpdate); 
    //     } catch(e) {
    //         console.error("Error updating track: ", e); 
    //         return res.status(500).send("Internal server error."); 
    //     }
    //     return res.status(200).send(result); 
    // })

    router.get('/getTracks', async (req: Request, res: Response) => {
        let tracks: Track[]; 
        try {
            tracks = await Tracks.getTracks();
        } catch(e){
            console.error("Error getting tracks: ", e); 
            return res.status(500).send("Internal server error."); 
        } 
        return res.status(200).send(tracks); 
    })

    return router; 
}

