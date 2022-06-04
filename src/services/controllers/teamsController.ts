import express, {Request, Response} from 'express'; 
const router = express.Router()

import teamsData from '../database/teamsMock';
import TeamsService from '../dataService/teamsService';

const Teams = new TeamsService(teamsData); 

router.get('/getTeam', (req: Request, res: Response) => {
    const teamId: number = (req.query.teamId as unknown as number);
    if(!teamId){
        res.status(400).send('run id not valid')
        return
    }
    let team = Teams.getTeam(teamId);
    res.send(team);
})


router.post('/insertTeam', (req: Request, res: Response) => {

    let newTeam = req.body.teamData;
    if( !newTeam?.fullName || !newTeam.name || !newTeam.town || !newTeam.circuit ){
        res.status(401).send('malformed reqeust')
        return
    }
    let result = Teams.insertTeam(newTeam)
    if(!result.result){
        res.status(500).send('Internal server error')
    }
    res.status(200).send(result);
})

router.post('/deleteTeam', (req: Request, res: Response) => {
    const teamId: number = (req.body.teamId as unknown as number);
    if(!teamId){
        res.status(400).send('team id not valid')
        return
    }
    let result = Teams.deleteTeam(teamId);
    res.send(`Delete successful: ${result}`);
})

router.post('/updateTeam', (req: Request, res: Response) => {
    let updatedTeam = req.body.updatedTeam; 
    if(!updatedTeam){
        res.status(400).send('update body not valid')
        return 
    }
    let run = Teams.updateTeam(updatedTeam);
    res.send(run);
})


router.get('/getTeams', (req: Request, res: Response) => {
    let teams = Teams.getTeams(); 
    res.send(teams); 
})

module.exports = router