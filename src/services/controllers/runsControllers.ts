import express, {Request, Response} from 'express'; 
const router = express.Router()

import runsData from '../database/runsMock';
import RunsService from '../dataService/runsService';

const Runs = new RunsService(runsData); 

router.get('/getRunsFromTournament', (req: Request, res: Response) => {
    const tournamentId: number = (req.query.tournamentId as unknown as number);  
    let runs = Runs.getRunsFromTournament(tournamentId); 
    res.send(runs); 
})

router.get('/getFilteredRuns', (req: Request, res: Response) => {
    let yearsStr:string , years: number[], contestStr:string , contests:string[], teamsStr:string, teams:string[]; 
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
    let runs = Runs.getFilteredRuns(years, contests, teams); 
    res.send(runs); 
})


module.exports = router