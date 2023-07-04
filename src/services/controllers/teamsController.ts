import express, {Request, Response, NextFunction} from 'express'; 
const router = express.Router()
import { TeamData, Team } from '../../types/types'
import TeamsService from '../dataService/teamsService';
import SessionAdmin from '../dataService/session'
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw';


export function teamsRouter (teamsDataSource:TeamData, sessionAdmin: SessionAdmin){
    const Teams = new TeamsService(teamsDataSource); 
    const router = express.Router()
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authAdminMdw = createAuthMdw(['admin']); 
    const authAdminSkMdw = createAuthMdw(['admin', 'scorekeeper']); 

    router.get('/getTeam', async (req: Request, res: Response) => {
        const teamId: number = parseInt((req.query?.teamId as unknown as string));
        if(!teamId) return res.status(400).send('Team id not valid')
        let team = await Teams.getTeam(teamId); 
        return res.status(200).send(team);
    })


    router.post('/insertTeam', [sessionsMdw, authAdminSkMdw], async (req: Request, res: Response) => {
        let newTeam = req.body;
        if(!newTeam?.fullName || !newTeam?.nickname || !newTeam?.hometown || !newTeam?.circuit ) return res.status(401).send('malformed reqeust')
        let result = await Teams.insertTeam(newTeam) 
        res.status(200).send(result);
    })

    router.post('/deleteTeam', [sessionsMdw, authAdminMdw], async (req: Request, res: Response) => {
        const teamId: string = (req.body?.teamId as unknown as string);
        if(!teamId) return res.status(400).send('team id not valid')
        let result = await Teams.deleteTeam(teamId); 
        res.status(200).send(result);
    })

    router.post('/updateTeam', [sessionsMdw, authAdminSkMdw], async (req: Request, res: Response) => {
        let teamId = req.body?.teamId; 
        let fieldsToUpdate = req.body?.fieldsToUpdate; 
        if(!teamId || !fieldsToUpdate) return res.status(400).send('update body not valid') 
        let result = await Teams.updateTeam(teamId, fieldsToUpdate); 
        res.status(200).send(result);
    })

    router.get('/getTeams', async (req: Request, res: Response) => {
        let teams = await Teams.getTeams();
        res.status(200).send(teams); 
    })

    router.get('/getSimilarTeams', async (req: Request, res: Response) => {
        const team = req.query?.team as string;
        const year = parseInt(req.query?.year as string); 
        if(!team || !year) return res.status(400).send('missing team or year in query'); 
        let teams = await Teams.getSimilarTeams(team, year); 
        res.status(200).send(teams); 
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