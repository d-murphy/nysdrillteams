import express, {Request, Response} from 'express'; 
import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
const router = express.Router()
import { TeamData, Team } from '../../types/types'
import TeamsService from '../dataService/teamsService';
import SessionAdmin from '../dataService/session'
import { createAuthMdw, createSessionsMdw } from './createSessionAndAuthMdw';


export function teamsRouter (teamsDataSource:TeamData, sessionAdmin: SessionAdmin){
    const Teams = new TeamsService(teamsDataSource); 
    const router = express.Router()
    const sessionsMdw = createSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(sessionAdmin, ['admin', 'scorekeeper']); 

    router.get('/getTeam', async (req: Request, res: Response) => {
        const teamId: number = parseInt((req.query?.teamId as unknown as string));
        if(!teamId) return res.status(400).send('Team id not valid')
        let team: Team | undefined; 
        try {
            team = await Teams.getTeam(teamId);
        } catch(e) {
            console.error("Error getting team: ", e); 
            return res.status(500).send('Internal server error.'); 
        }
        console.log('the team: ', team); 
        return res.status(200).send(team);
    })


    router.post('/insertTeam', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let newTeam = req.body;
        if(!newTeam?.fullName || !newTeam?.nickname || !newTeam?.hometown || !newTeam?.circuit ) return res.status(401).send('malformed reqeust')
        let result: InsertOneResult; 
        try {
            result = await Teams.insertTeam(newTeam)
        } catch(e) {
            console.error("Error inserting team: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(result);
    })

    router.post('/deleteTeam', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const teamId: string = (req.body?.teamId as unknown as string);
        if(!teamId) return res.status(400).send('team id not valid')
        let result: DeleteResult; 
        try {
            result = await Teams.deleteTeam(teamId); 
        } catch(e) {
            console.error("Error deleting team: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(result);
    })

    router.post('/updateTeam', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        let teamId = req.body?.teamId; 
        let fieldsToUpdate = req.body?.fieldsToUpdate; 
        if(!teamId || !fieldsToUpdate) return res.status(400).send('update body not valid') 
        let result: UpdateResult; 
        try {
            result = await Teams.updateTeam(teamId, fieldsToUpdate);
        } catch(e){
            console.error("Error updating team: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(result);
    })

    router.get('/getTeams', async (req: Request, res: Response) => {
        let teams
        try {
            teams = await Teams.getTeams(); 
        } catch(e){
            console.error("Error getting teams: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        res.status(200).send(teams); 
    })

    return router; 
}