import express, {Request, Response} from 'express'; 
import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { Tournament, TournamentsData } from '../../types/types';
import TournamentsService from '../dataService/tournamentsService';
import SessionAdmin from '../../library/session'
import { createAuthMdw, createSessionsMdw } from './createSessionAndAuthMdw';


export function tournamentsRouter (tournamentsDataSource:TournamentsData, sessionAdmin:SessionAdmin){
    const Tournaments = new TournamentsService(tournamentsDataSource); 
    const sessionsMdw = createSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(sessionAdmin, ['admin', 'scorekeeper']); 

    const router = express.Router()

    router.get('/getTournament', async (req: Request, res: Response) => {
        let tournamentId:number = parseInt(req.query?.tournamentId as unknown as string); 
        if(!tournamentId) return res.status(400).send('Tournament id not valid.')
        let tournament: Tournament | undefined; 
        try {
            tournament = await Tournaments.getTournament(tournamentId);
        } catch(e) {
            console.error("Error retrieving tournament: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(tournament);
    })

    router.post('/insertTournament', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let newTournament = req.body;
        if( !newTournament?.name || !newTournament?.date ||  
            !newTournament?.track   
            ){
            return res.status(400).send('malformed reqeust')
        }
        let result: InsertOneResult; 
        try {
            result = await Tournaments.insertTournament(newTournament)
        } catch(e) {
            console.error("Error inserting tournament: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(result);
    })

    router.post('/deleteTournament', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const tournamentId: number = (req.body?.tournamentId as unknown as number);
        if(!tournamentId) return res.status(400).send('team id not valid')
        let result: DeleteResult; 
        try {
            result = await Tournaments.deleteTournament(tournamentId); 
        } catch(e) {
            console.error("Error deleting tournament:  ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(result);
    })

    router.post('/updateTournament', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const tournamentId: string = (req.body?.tournamentId as unknown as string); 
        const fieldsToUpdate: {} = (req.body?.fieldsToUpdate as unknown as {}); 
        if(!tournamentId || !fieldsToUpdate) return res.status(400).send('update body not valid'); 
        let result: UpdateResult; 
        try {
            result = await Tournaments.updateTournament(tournamentId, fieldsToUpdate);
        } catch(e) {
            console.error("Error updating tournament: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result);
    })

    router.get('/getFilteredTournaments', async (req: Request, res: Response) => {
        let years: number[], tracks:string[], tournaments: string[];  
        years = checkQuery(req, 'years').map(Number); 
        tracks = checkQuery(req, 'tracks'); 
        tournaments = checkQuery(req, 'tournaments'); 
        let result: Tournament[]; 
        try {
            result = await Tournaments.getFilteredTournaments(years, tracks, tournaments); 
        } catch(e) {
            console.error("Error getting filtered tournaments: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result); 
    })

    router.get('/getTournsCtByYear', async( req: Request, res: Response) => {
        let result: {_id: number, yearCount:number}[]
        try {
            result = await Tournaments.getTournsCtByYear();
        } catch(e) {
            console.error("Error getting tournament counts: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(result); 
    })
    return router;
}

function checkQuery(req:Request, fieldName:string): string[]{
    if(req.query[fieldName]){
        let qryString: string = (req.query[fieldName] as unknown as string); 
        return qryString.split(",");  
    } else {
        return []
    }
}