import express, {Request, Response} from 'express'; 
const router = express.Router()

import tournamentsData from '../database/tournamentsMock';
import TournamentsService from '../dataService/tournamentsService';

const Tournaments = new TournamentsService(tournamentsData); 

router.get('/getTournament', (req: Request, res: Response) => {
    const tournamentId: number = (req.query?.tournamentId as unknown as number);
    if(!tournamentId){
        res.status(400).send('run id not valid')
        return
    }
    let tournament = Tournaments.getTournament(tournamentId);
    res.send(tournament);
})


router.post('/insertTournament', (req: Request, res: Response) => {

    let newTournament = req.body?.tournamentData;
    if( !newTournament?.name || !newTournament?.date || !newTournament?.circuits || 
        !newTournament?.track || !newTournament?.sanctioned  
        ){
        res.status(401).send('malformed reqeust')
        return
    }
    let result = Tournaments.insertTournament(newTournament)
    if(!result.result){
        res.status(500).send('Internal server error')
    }
    res.status(200).send(result);
})

router.post('/deleteTournament', (req: Request, res: Response) => {
    const tournamentId: number = (req.body?.tournamentId as unknown as number);
    if(!tournamentId){
        res.status(400).send('team id not valid')
        return
    }
    let result = Tournaments.deleteTournament(tournamentId);
    res.send(`Delete successful: ${result}`);
})

router.post('/updateTournament', (req: Request, res: Response) => {
    let updatedTournament = req.body?.updatedTournament; 
    if(!updatedTournament){
        res.status(400).send('update body not valid')
        return 
    }
    let track = Tournaments.updateTournament(updatedTournament);
    res.send(track);
})


router.get('/getTournaments', (req: Request, res: Response) => {
    let yearsStr = (req.query?.years as unknown as string); 
    if(!yearsStr){
        res.status(400).send('malformed request');
        return;
    }
    let years = yearsStr.split(",").map(el => parseInt(el))
    let tournaments = Tournaments.getTournaments(years); 
    res.send(tournaments); 
})

router.get('/getTournamentsByName', (req: Request, res: Response) => {
    let name = (req.query?.name as unknown as string); 
    if(!name){
        res.status(400).send('malformed request');
        return;
    }
    let tournaments = Tournaments.getTournamentsByName(name); 
    res.send(tournaments); 
})

router.get('/getTournamentsByTrack', (req: Request, res: Response) => {
    let track = (req.query?.track as unknown as string); 
    if(!track){
        res.status(400).send('malformed request');
        return;
    }
    let tournaments = Tournaments.getTournamentsByTrack(track); 
    res.send(tournaments); 
})


module.exports = router