import express, {Request, Response, NextFunction} from 'express'; 
import { UsersData, User } from '../../types/types'
import UsersService from '../dataService/usersService';
import SessionAdmin from '../dataService/session';
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw'; 

export function usersRouter (usersDataSource:UsersData, sessionAdmin:SessionAdmin){
    const Users = new UsersService(usersDataSource); 
    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin']); 

    const router = express.Router()

    router.get('/getUsers', async(req:Request, res:Response) => {
        let users = await Users.getUsers(); 
        return res.status(200).send(users); 
    })

    router.post('/insertUser', [sessionsMdw, authMdw], async(req:Request, res:Response) => {
        const username: string = req.body.username; 
        const password: string = req.body.password; 
        const role: string = req.body.role
        if(!username || !password || !role ) return res.status(400).send("malformed request.")
        let result = await Users.insertUser({username:username, password:password, role: role}); 
        return res.status(200).send(result); 
    })

    router.post("/deleteUser", [sessionsMdw, authMdw], async(req:Request, res:Response) => {
        const userId = req.body.userId; 
        if(!userId) return res.status(400).send("malfored request"); 
        let result = await Users.deleteUser(userId); 
        return res.status(200).send(result); 
    })

    router.post("/login", async(req:Request, res:Response) => {
        const username = req.body.username; 
        const password = req.body.password; 
        if(!username || !password) return res.status(400).send("malformed request."); 
        let checkPassResult = await Users.checkPass(username, password); 
        if(!checkPassResult) return res.status(403).send("Username and password not a match.");
        let ip = req.header('x-forwarded-for') || req.socket.remoteAddress || ''
        let sessionId = sessionAdmin.createSession(ip, username, checkPassResult.role)
        return res.status(200).send({username:username, sessionId:sessionId, role:checkPassResult.role}); 
    })

    router.post("/logout", async(req:Request, res:Response) => {
        const sessionId = (req.query?.sessionId as unknown as string); 
        if(!sessionId) return res.status(400).send("Need sessionId to logout."); 
        let logoutResult = await sessionAdmin.deleteSession(sessionId); 
        return res.status(200).send(logoutResult); 
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

