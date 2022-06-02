import express, {Request, Response} from 'express'; 
const router = express.Router()

import runsData from '../database/runsMock';
import RunsService from '../dataService/runsService';

import { Run } from '../../types/types'

const Runs = new RunsService(runsData); 

router.get('/getRun', (req: Request, res: Response) => {
    const runId: number = (req.query.runId as unknown as number);
    let run = Runs.getRun(runId);
    res.send(run);
})

router.post('/insertRun', (req: Request, res: Response) => {
    let newRun = req.body.runsData;
    if(!newRun?.team || !newRun?.contest || !newRun?.tournamentId || !newRun?.time){
        res.status(404).send('malformed reqeust')
        return
    }
    let team = req.body.teamData; 
    let tournament = req.body.tournament; 
    let result = Runs.insertRun(newRun, tournament, team)
    if(!result){
        res.status(500).send('Internal server error')
    }
    console.log('yeah?',req.body.name)
    res.status(200).send(result);
})

router.post('/deleteRun', (req: Request, res: Response) => {
    const runId: number = (req.body.runId as unknown as number);
    let run = Runs.deleteRun(runId);
    res.send(run);
})

router.get('/updateRun', (req: Request, res: Response) => {
    const updatedRun: Run = req.body.runId;
    let run = Runs.updateRun(updatedRun);

    res.send(run);
})


router.get('/getRunsFromTournament', (req: Request, res: Response) => {
    const tournamentId: number = (req.query.tournamentId as unknown as number);  
    let runs = Runs.getRunsFromTournament(tournamentId); 
    res.send(runs); 
})

router.get('/getFilteredRuns', (req: Request, res: Response) => {
    let years: number[], contests:string[], teams:string[], circuits:string[]; 
    if(req.query.years){
        const yearsStr: string = (req.query.years as unknown as string)
        years = yearsStr.split(",").map(Number)    
    } else {
        years = []; 
    }
    if(req.query.contests){
        const contestsStr: string = (req.query.contests as unknown as string)
        contests = contestsStr.split(",") 
    } else {
        contests = []; 
    }
    if(req.query.teams){
        const teamsStr: string = (req.query.teams as unknown as string)
        teams = teamsStr.split(",")    
    } else {
        teams = []; 
    }
    if(req.query.circuits){
        const circuitsStr: string = (req.query.circuits as unknown as string)
        circuits = circuitsStr.split(",")    
    } else {
        circuits = []; 
    }
    let runs = Runs.getFilteredRuns(years, contests, teams, circuits); 
    res.send(runs); 
})


module.exports = router