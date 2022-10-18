import express, {Request, Response} from 'express'; 
import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';

import { RunsData, TotalPointsFields, Run } from '../../types/types';
import RunsService from '../dataService/runsService';
import SessionAdmin from '../dataService/session'
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw';



export function runsRouter (runsDataSource:RunsData, sessionAdmin:SessionAdmin){
    const Runs = new RunsService(runsDataSource); 
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin', 'scorekeeper']); 

    const router = express.Router()
    router.get('/getRun', async (req: Request, res: Response) => {
        const runId: number = (req.query.runId as unknown as number);
        if(!runId){
            return res.status(400).send('runId not valid')
        }
        let run: Run | undefined; 
        try {
            run = await Runs.getRun(runId); 
        } catch(e) {
            console.error("Error retrieving Run: ", e); 
            return res.status(500).send("Internal server error"); 
        }
        res.status(200).send(run);
    })
    
    
    router.post('/insertRun', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let newRun = req.body.runsData;
        let team = req.body.teamData; 
        let tournament = req.body.tournamentData; 
        if(!newRun?.contest || !newRun?.time || 
            !team?.name || !team?.circuit || 
            !tournament?.runningOrder || !tournament?.runningOrder[team?.name] || !tournament?.name || !tournament?.id || !tournament?.name || !tournament?.id
            ){
            return res.status(400).send('malformed reqeust')
        }
        let result: InsertOneResult | undefined; 
        try {
            result = await Runs.insertRun(newRun, tournament)
        } catch(e){
            console.error("Error inserting run: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result);
    })
    
    router.post('/deleteRun', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const runId: number = (req.body.runId as unknown as number);
        if(!runId) return res.status(400).send('run id not valid')
        let runResult: DeleteResult | undefined; 
        try {
            runResult = await Runs.deleteRun(runId);
        } catch(e){
            console.error("Error during delete run: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(runResult);
    })
    
    router.post('/updateRun', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let runId = req.body.runId; 
        let pointsUpdate = req.body.pointsUpdate;
        let timeUpdate = req.body.timeUpdate;  
        let rankUpdate = req.body.rankUpdate;  
        if((!pointsUpdate && !timeUpdate && !rankUpdate) || !runId) return res.status(400).send('update body not valid')
        let run: UpdateResult | undefined; 
        try {
            run = await Runs.updateRun(runId, pointsUpdate, timeUpdate, rankUpdate); 
        } catch(e){
            console.error("Error updating run: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(run);
    })
    
    
    router.get('/getRunsFromTournament', async (req: Request, res: Response) => {
        const tournamentId: string = (req.query.tournamentId as unknown as string);  
        if(!tournamentId) return res.status(400).send('tournament id not valid')
        let runs: Run[]; 
        try {
            runs = await Runs.getRunsFromTournament(tournamentId);
        } catch(e) {
            console.error("Error getting tournament runs: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(runs); 
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

        let runs: Run[]; 
        try {
            runs = await Runs.getFilteredRuns(years, contests, teams, tracks, tournaments, ranks, stateRecord, currentStateRecord);
        } catch(e){
            console.error("Error filtering runs: ", e); 
            return res.status(500).send('Internal server error.'); 
        }
        res.status(200).send(runs); 
    })

    router.get('/getBig8', async (req:Request, res: Response) => {
        let year: number = parseInt(req.query.year as unknown as string); 
        if(!year) return res.status(400).send('Missing year from request'); 
        let runs: {}[];
        try {
            runs = await Runs.getBig8(year); 
        } catch(e){
            console.error("Error making big 8 call: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(runs); 
    })

    router.get('/getTopRuns', async (req: Request, res: Response) => {
        let years: number[], teams:string[], tracks:string[] 
        years = checkQuery(req, 'years').map(Number); 
        teams = checkQuery(req, 'teams'); 
        tracks = checkQuery(req, 'tracks'); 

        let runs: {}[]; 
        try {
            runs = await Runs.getTopRuns(years, teams, tracks); 
        } catch(e){
            console.error("Error getting top runs: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(runs); 
    })

    router.get('/getTotalPoints', async (req: Request, res: Response) => {
        let contests = checkQuery(req, 'contests');
        let year = parseInt(req.query.year as unknown as string); 
        let totalPointsFieldName = req.query.totalPointsFieldName as unknown as TotalPointsFields; 
        if(!year || !["Nassau", "Suffolk", "Western", "Northern", "Junior", "Suffolk OF", "Nassau OF", "LI OF"].includes(totalPointsFieldName)) return res.status(400).send('totalPointsFieldName or year not valid.')
        let totals: {}[]; 
        try {
            totals = await Runs.getTotalPoints(year, totalPointsFieldName, contests);  
        } catch(e){
            console.error("Error retrieving total points: ", e); 
            return res.status(500).send('Internal server error.'); 
        }
        return res.status(200).send(totals); 
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