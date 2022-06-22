import express, {Request, Response} from 'express'; 
const router = express.Router()

import tracksData from '../database/tracksMock';
import TracksService from '../dataService/tracksService';

const Tracks = new TracksService(tracksData); 

router.get('/getTrack', (req: Request, res: Response) => {
    const trackId: number = (req.query.trackId as unknown as number);
    if(!trackId){
        res.status(400).send('run id not valid')
        return
    }
    let track = Tracks.getTrack(trackId);
    res.send(track);
})


router.get('/getTrackByName', (req: Request, res: Response) => {
    const trackName: string = (req.query.trackName as unknown as string);
    if(!trackName){
        res.status(400).send('run id not valid')
        return
    }
    let track = Tracks.getTrackByName(trackName);
    res.send(track);
})


router.post('/insertTrack', (req: Request, res: Response) => {

    let newTrack = req.body.trackData;
    if( !newTrack?.name || !newTrack?.address || !newTrack?.city  ){
        res.status(401).send('malformed reqeust')
        return
    }
    let result = Tracks.insertTrack(newTrack)
    if( !result  ){
        res.status(500).send('Internal server error')
    }
    res.status(200).send(result);
})

router.post('/deleteTrack', (req: Request, res: Response) => {
    const trackId: number = (req.body.trackId as unknown as number);
    if(!trackId){
        res.status(400).send('team id not valid')
        return
    }
    let result = Tracks.deleteTrack(trackId);
    res.send(`Delete successful: ${result}`);
})

router.post('/updateTrack', (req: Request, res: Response) => {
    let updatedTrack = req.body.updatedTrack; 
    if(!updatedTrack){
        res.status(400).send('update body not valid')
        return 
    }
    let track = Tracks.updateTrack(updatedTrack);
    res.send(track);
})


router.get('/getTracks', (req: Request, res: Response) => {
    let tracks = Tracks.getTracks(); 
    res.send(tracks); 
})

module.exports = router