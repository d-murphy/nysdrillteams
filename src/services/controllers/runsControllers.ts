import express, {Request, Response, NextFunction} from 'express'; 

import { RunsData, TotalPointsFields, Run } from '../../types/types';
import RunsService from '../dataService/runsService';
import SessionAdmin from '../dataService/session'
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw';



export function runsRouter (runsDataSource:RunsData, sessionAdmin:SessionAdmin){
    const Runs = new RunsService(runsDataSource); 
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin', 'scorekeeper']); 
    const authMdwForEdit = createAuthMdw(['admin', 'scorekeeper', 'video']);

    const router = express.Router()
    router.get('/getRun', async (req: Request, res: Response) => {
        const runId: number = (req.query.runId as unknown as number);
        if(!runId){
            return res.status(400).send('runId not valid')
        }
        let run = await Runs.getRun(runId); 
        res.status(200).send(run);
    })
    
    
    router.post('/insertRun', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let newRun = req.body.runsData;
        if(!newRun?.contest || !newRun?.time || !newRun?.team){
            return res.status(400).send('malformed reqeust')
        }
        let result = await Runs.insertRun(newRun) 
        return res.status(200).send(result);
    })
    
    router.post('/deleteRun', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const runId: number = (req.body.runId as unknown as number);
        if(!runId) return res.status(400).send('run id not valid')
        let runResult = await Runs.deleteRun(runId); 
        res.status(200).send(runResult);
    })
    
    router.post('/updateRun', [sessionsMdw, authMdwForEdit], async (req: Request, res: Response) => {
        let runId = req.body.runId; 
        let fieldsToUpdate = req.body?.fieldsToUpdate; 
        if(!fieldsToUpdate || !runId) return res.status(400).send('update body not valid')
        let run = await Runs.updateRun(runId, fieldsToUpdate); 
        return res.status(200).send(run);
    })
    
    
    router.get('/getRunsFromTournament', async (req: Request, res: Response) => {
        const tournamentId: string = (req.query.tournamentId as unknown as string);  
        if(!tournamentId) return res.status(400).send('tournament id not valid')
        let runs = await Runs.getRunsFromTournament(tournamentId); 
        return res.status(200).send(runs); 
    })
    
    router.get('/getFilteredRuns', async (req: Request, res: Response) => {
        let years: number[], contests:string[], teams:string[], tracks:string[], tournaments: string[], ranks: string[]; 
        years = checkQuery(req, 'years').map(Number); 
        contests = checkQuery(req, 'contests'); 
        teams = checkQuery(req, 'teams'); 
        tracks = checkQuery(req, 'tracks'); 
        tournaments = checkQuery(req, 'tournaments'); 
        ranks = checkQuery(req, 'ranks'); 
        let stateRecord = String(req.query?.stateRecord).toLowerCase() == "true" 
        let currentStateRecord = String(req.query?.currentStateRecord).toLowerCase() == "true" 
        let suffolkPoints = String(req.query?.suffolkPoints).toLowerCase() == "true" 
        let nassauPoints = String(req.query?.nassauPoints).toLowerCase() == "true"
        let northernPoints = String(req.query?.northernPoints).toLowerCase() == "true"
        let westernPoints = String(req.query?.westernPoints).toLowerCase() == "true"
        let suffolkOfPoints = String(req.query?.suffolkOfPoints).toLowerCase() == "true"
        let nassauOfPoints = String(req.query?.nassauOfPoints).toLowerCase() == "true"
        let liOfPoints = String(req.query?.liOfPoints).toLowerCase() == "true"
        let juniorPoints = String(req.query?.juniorPoints).toLowerCase() == "true"
        let sanctioned = String(req.query?.sanctioned).toLowerCase() == "true"
        let page = Number(req.query?.page); 
        let runs = await Runs.getFilteredRuns(years, contests, teams, tracks, tournaments, ranks, stateRecord, currentStateRecord, 
            nassauPoints, suffolkPoints, westernPoints, northernPoints, suffolkOfPoints, nassauOfPoints, liOfPoints, juniorPoints, sanctioned, page); 
        res.status(200).send(runs); 
    })

    router.get('/getBig8', async (req:Request, res: Response) => {
        let year: number = parseInt(req.query.year as unknown as string); 
        if(!year) return res.status(400).send('Missing year from request'); 
        let runs = await Runs.getBig8(year);
        return res.status(200).send(runs); 
    })

    router.get('/getTopRuns', async (req: Request, res: Response) => {
        let years: number[], teams:string[], tracks:string[] 
        years = checkQuery(req, 'years').map(Number); 
        teams = checkQuery(req, 'teams'); 
        tracks = checkQuery(req, 'tracks'); 

        let runs = await Runs.getTopRuns(years, teams, tracks); 
        return res.status(200).send(runs); 
    })

    router.get('/getTotalPoints', async (req: Request, res: Response) => {
        let contests = checkQuery(req, 'contests');
        let year = parseInt(req.query.year as unknown as string); 
        let byContest = (req.query?.byContest as unknown as string || '').toLowerCase() === 'true'; 
        let totalPointsFieldName = req.query.totalPointsFieldName as unknown as TotalPointsFields; 
        if(!year || !["Nassau", "Suffolk", "Western", "Northern", "Junior", "Suffolk OF", "Nassau OF", "LI OF"].includes(totalPointsFieldName)) return res.status(400).send('totalPointsFieldName or year not valid.')
        let totals = await Runs.getTotalPoints(year, totalPointsFieldName, byContest, contests);
        return res.status(200).send(totals); 
    })

    // router.get('/getContestNames', async (req: Request, res: Response) => {
    //     let contestNames = await Runs.getContestNames(); 
    //     return res.status(200).send(contestNames); 
    // })

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