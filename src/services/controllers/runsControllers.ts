import express, {Request, Response} from 'express'; 
import { Db } from 'mongodb';

import { RunsData } from '../../types/types';
import RunsService from '../dataService/runsService';


export function runsRouter (runsDataSource:RunsData){
    const Runs = new RunsService(runsDataSource); 
    const router = express.Router()
    router.get('/getRun', async (req: Request, res: Response) => {
        const runId: number = (req.query.runId as unknown as number);
        if(!runId){
            res.status(400).send('runId not valid')
            return
        }
        let run = await Runs.getRun(runId);
        res.send(run);
    })
    
    
    router.post('/insertRun', async (req: Request, res: Response) => {
    
        let newRun = req.body.runsData;
        let team = req.body.teamData; 
        let tournament = req.body.tournamentData; 
    
        if(     !newRun?.contest || !newRun?.time || 
                !team?.name || !team?.circuit || 
                !tournament?.runningOrder || !tournament?.runningOrder[team?.name] || !tournament?.name || !tournament?.id || !tournament?.name || !tournament?.id
            ){
            res.status(401).send('malformed reqeust')
            return
        }
        let result = await Runs.insertRun(newRun, tournament, team)
        if(!result.result){
            res.status(500).send('Internal server error')
        }
        res.status(200).send(result);
    })
    
    router.post('/deleteRun', async (req: Request, res: Response) => {
        const runId: number = (req.body.runId as unknown as number);
        if(!runId){
            res.status(400).send('run id not valid')
            return
        }
        let run = await Runs.deleteRun(runId);
        res.send(`Delete successful: ${run}`);
    })
    
    router.post('/updateRun', async (req: Request, res: Response) => {
        let runId = req.body.runId; 
        let pointsUpdate = req.body.pointsUpdate;
        let timeUpdate = req.body.timeUpdate;  
        let rankUpdate = req.body.rankUpdate;  
        if((!pointsUpdate && !timeUpdate && !rankUpdate) || !runId){
            res.status(400).send('update body not valid')
            return 
        }
        let run = await Runs.updateRun(runId, pointsUpdate, timeUpdate, rankUpdate);
        res.send(run);
    })
    
    
    router.get('/getRunsFromTournament', async (req: Request, res: Response) => {
        const tournamentId: number = (req.query.tournamentId as unknown as number);  
        if(!tournamentId){
            res.status(400).send('tournament id not valid')
            return
        }
        let runs = await Runs.getRunsFromTournament(tournamentId); 
        res.send(runs); 
    })
    
    router.get('/getFilteredRuns', async (req: Request, res: Response) => {
        let years: number[], contests:string[], teams:string[], tracks:string[], tournaments: string[], ranks: string[] 
        years = checkQuery(req, 'years').map(Number); 
        contests = checkQuery(req, 'contests'); 
        teams = checkQuery(req, 'teams'); 
        tracks = checkQuery(req, 'tracks'); 
        tournaments = checkQuery(req, 'tournaments'); 
        ranks = checkQuery(req, 'ranks'); 
        let stateRecord = req.query?.stateRecord ? true : false
        let currentStateRecord = req.query?.currentStateRecord ? true : false; 

        let runs = await Runs.getFilteredRuns(years, contests, teams, tracks, tournaments, ranks, stateRecord, currentStateRecord); 
        res.send(runs); 
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