import express, {Request, Response} from 'express'; 
const router = express.Router()
import { TeamData } from '../../types/types'
import TeamsService from '../dataService/teamsService';



export function teamsRouter (teamsDataSource:TeamData){
    const Teams = new TeamsService(teamsDataSource); 
    const router = express.Router()

    router.get('/getTeam', async (req: Request, res: Response) => {
        const teamId: number = parseInt((req.query?.teamId as unknown as string));
        if(!teamId){
            res.status(400).send('run id not valid')
            return
        }
        let team = await Teams.getTeam(teamId);
        res.send(team);
    })


    router.post('/insertTeam', async (req: Request, res: Response) => {
        let newTeam = req.body;
        if( !newTeam?.fullName || !newTeam?.nickname || !newTeam?.hometown || !newTeam?.circuit ){
            res.status(401).send('malformed reqeust')
            return
        }
        let result = await Teams.insertTeam(newTeam)
        if(!result?.result){
            return res.status(500).send('Internal server error')
        }
        res.status(200).send(result);
    })

    router.post('/deleteTeam', async (req: Request, res: Response) => {
        const teamId: string = (req.body?.teamId as unknown as string);
        if(!teamId){
            res.status(400).send('team id not valid')
            return
        }
        let result = await Teams.deleteTeam(teamId);
        res.send(result);
    })

    router.post('/updateTeam', async (req: Request, res: Response) => {
        let teamId = req.body?.teamId; 
        let fieldsToUpdate = req.body?.fieldsToUpdate; 
        if(!teamId){
            return res.status(400).send('update body not valid') 
        }
        let result = await Teams.updateTeam(teamId, fieldsToUpdate);
        if(!result){
            return res.status(500).send('Internal server error')
        }
        res.send(result);
    })


    router.get('/getTeams', async (req: Request, res: Response) => {
        let teams = await Teams.getTeams(); 
        if(!teams) return res.status(500).send('Internal server error'); 
        res.send(teams); 
    })
    return router; 
}