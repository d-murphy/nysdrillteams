import { HistoryData, RunsData, TeamData, TournamentsData } from "../../types/types";
import HistoryService from "../dataService/historyService";
import { checkSessionsMdw, createAuthMdw } from "./createSessionAndAuthMdw";
import SessionAdmin from '../dataService/session'
import express, {Request, Response, NextFunction} from 'express'; 


export function historiesRouter (historyDataSource:HistoryData, runsDataSource: RunsData, tournsDataSource: TournamentsData, teamsDataSource: TeamData,  sessionAdmin:SessionAdmin ){
    const Histories = new HistoryService(historyDataSource, runsDataSource, tournsDataSource, teamsDataSource); 
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin', 'scorekeeper']); 

    const router = express.Router()
    router.get('/getHistory', async (req: Request, res: Response) => {
        const teamName: string = req.query.teamname as string; 
        if(!teamName){
            return res.status(400).send('teamname not valid')
        }
        let history = await Histories.getHistory(teamName); 
        res.status(200).send(history);
    })

    // router.post('/updateHistory', [sessionsMdw, authMdw], (req: Request, res: Response) => {
    //     if(Histories._isUpdating) return res.status(500).send("History update already in progress"); 
    //     Histories.updateHistories(); 
    //     res.status(200).send("History update started."); 
    // })

    // router.get('/getUpdateStatus', (req: Request, res: Response) => {
    //     const data = { lastRan: Histories.getLastRan(), isUpdating: Histories.getIsUpdating() }; 
    //     res.status(200).send(data); 
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
