import express, {Request, Response} from 'express'; 
const router = express.Router()

import runsData from '../database/runsMock';
import RunsService from '../dataService/runsService';

const Runs = new RunsService(runsData); 


router.get('/getRun', (req: Request, res: Response) => {
    console.log('anything?')
    const runId: number = (req.query.runId as unknown as number);
    if(!runId){
        res.status(400).send('run id not valid')
        return
    }
    let run = Runs.getRun(runId);
    res.send(run);
})


router.post('/insertRun', (req: Request, res: Response) => {

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
    let result = Runs.insertRun(newRun, tournament, team)
    if(!result.result){
        res.status(500).send('Internal server error')
    }
    res.status(200).send(result);
})

router.post('/deleteRun', (req: Request, res: Response) => {
    const runId: number = (req.body.runId as unknown as number);
    if(!runId){
        res.status(400).send('run id not valid')
        return
    }
    let run = Runs.deleteRun(runId);
    res.send(`Delete successful: ${run}`);
})

router.post('/updateRun', (req: Request, res: Response) => {
    let runId = req.body.runId; 
    let pointsUpdate = req.body.pointsUpdate;
    let timeUpdate = req.body.timeUpdate;   
    if((!pointsUpdate && !timeUpdate) || !runId){
        res.status(400).send('update body not valid')
        return 
    }
    let run = Runs.updateRun(runId, pointsUpdate, timeUpdate);
    res.send(run);
})


router.get('/getRunsFromTournament', (req: Request, res: Response) => {
    const tournamentId: number = (req.query.tournamentId as unknown as number);  
    if(!tournamentId){
        res.status(400).send('tournament id not valid')
        return
    }
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