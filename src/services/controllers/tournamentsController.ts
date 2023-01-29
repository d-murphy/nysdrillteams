import express, {Request, Response, NextFunction} from 'express'; 
import { TournamentsData } from '../../types/types';
import TournamentsService from '../dataService/tournamentsService';
import SessionAdmin from '../dataService/session'
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw';


export function tournamentsRouter (tournamentsDataSource:TournamentsData, sessionAdmin:SessionAdmin){
    const Tournaments = new TournamentsService(tournamentsDataSource); 
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin', 'scorekeeper']); 

    const router = express.Router()

    router.get('/getTournament', async (req: Request, res: Response) => {
        let tournamentId:number = parseInt(req.query?.tournamentId as unknown as string); 
        if(!tournamentId) return res.status(400).send('Tournament id not valid.')
        let tournament = await Tournaments.getTournament(tournamentId); 
        res.status(200).send(tournament);
    })

    router.post('/insertTournament', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let newTournament = req.body;
        if( !newTournament?.name || !newTournament?.date ||  
            !newTournament?.track   
            ){
            return res.status(400).send('malformed reqeust')
        }
        let result = await Tournaments.insertTournament(newTournament) 
        res.status(200).send(result);
    })

    router.post('/deleteTournament', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const tournamentId = (req.body?.tournamentId as unknown as string);
        if(!tournamentId) return res.status(400).send('team id not valid')
        let result = await Tournaments.deleteTournament(tournamentId); 
        res.status(200).send(result);
    })

    router.post('/updateTournament', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const tournamentId: string = (req.body?.tournamentId as unknown as string); 
        const fieldsToUpdate: {} = (req.body?.fieldsToUpdate as unknown as {}); 
        if(!tournamentId || !fieldsToUpdate) return res.status(400).send('update body not valid'); 
        let result = await Tournaments.updateTournament(tournamentId, fieldsToUpdate); 
        return res.status(200).send(result);
    })

    router.get('/getFilteredTournaments', async (req: Request, res: Response) => {
        let years: number[], tracks:string[], tournaments: string[];  
        years = checkQuery(req, 'years').map(Number); 
        tracks = checkQuery(req, 'tracks'); 
        tournaments = checkQuery(req, 'tournaments'); 
        let result = await Tournaments.getFilteredTournaments(years, tracks, tournaments); 
        return res.status(200).send(result); 
    })

    router.get('/getTournsCtByYear', async( req: Request, res: Response) => {
        let result = await Tournaments.getTournsCtByYear();
        res.status(200).send(result); 
    })

    router.get('/getTournamentNames', async( req: Request, res: Response) => {
        let result = await Tournaments.getTournamentNames();
        res.status(200).send(result); 
    })

    router.get('/getHostNames', async( req: Request, res: Response) => {
        let result = await Tournaments.getHostNames();
        res.status(200).send(result); 
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

function checkQuery(req:Request, fieldName:string): string[]{
    if(req.query[fieldName]){
        let qryString: string = (req.query[fieldName] as unknown as string); 
        return qryString.split(",");  
    } else {
        return []
    }
}