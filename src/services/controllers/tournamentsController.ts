import express, {Request, Response} from 'express'; 
import { TournamentsData } from '../../types/types';
const router = express.Router()

import TournamentsService from '../dataService/tournamentsService';


export function tournamentsRouter (tournamentsDataSource:TournamentsData){
    const Tournaments = new TournamentsService(tournamentsDataSource); 
    const router = express.Router()


    router.get('/getTournament', async (req: Request, res: Response) => {
        let tournamentId:number = parseInt(req.query?.tournamentId as unknown as string); 
        if(!tournamentId){
            res.status(400).send('run id not valid')
            return
        }
        let tournament = await Tournaments.getTournament(tournamentId);
        if(!tournament) return res.status(500).send('Internal server error'); 
        res.status(200).send(tournament);
    })


    router.post('/insertTournament', async (req: Request, res: Response) => {

        let newTournament = req.body;
        if( !newTournament?.name || !newTournament?.date ||  
            !newTournament?.track   
            ){
            res.status(400).send('malformed reqeust')
            return
        }
        let result = await Tournaments.insertTournament(newTournament)
        if(!result?.result){
            res.status(500).send('Internal server error')
        }
        res.status(200).send(result);
    })

    router.post('/deleteTournament', async (req: Request, res: Response) => {
        const tournamentId: number = (req.body?.tournamentId as unknown as number);
        if(!tournamentId){
            res.status(400).send('team id not valid')
            return
        }
        let result = await Tournaments.deleteTournament(tournamentId);
        if(!result) return res.status(500).send('Internal server error'); 
        res.status(200).send(`Delete successful`);
    })

    router.post('/updateTournament', async (req: Request, res: Response) => {
        const tournamentId: string = (req.body?.tournamentId as unknown as string); 
        const fieldsToUpdate: {} = (req.body?.fieldsToUpdate as unknown as {}); 
        if(!tournamentId || !fieldsToUpdate){
            res.status(400).send('update body not valid')
            return 
        }
        let result = await Tournaments.updateTournament(tournamentId, fieldsToUpdate); 
        if(!result) return res.status(500).send('Internal server error'); 
        res.status(200).send(result);
    })

    router.get('/getFilteredTournaments', async (req: Request, res: Response) => {
        let years: number[], tracks:string[], tournaments: string[];  
        years = checkQuery(req, 'years').map(Number); 
        tracks = checkQuery(req, 'tracks'); 
        tournaments = checkQuery(req, 'tournaments'); 
        let result = await Tournaments.getFilteredTournaments(years, tracks, tournaments); 
        res.status(200).send(result); 
    })

    router.get('/getTournsCtByYear', async( req: Request, res: Response) => {
        let result = await Tournaments.getTournsCtByYear(); 
        if(result && result.length) return res.status(200).send(result); 
        res.status(500).send('Internal server error'); 
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