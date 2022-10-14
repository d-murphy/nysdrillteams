import express, {Request, Response} from 'express'; 
import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { UsersData, User } from '../../types/types'
import UsersService from '../dataService/usersService';
import SessionAdmin from '../dataService/session';
import { createAuthMdw, createSessionsMdw } from './createSessionAndAuthMdw';

export function usersRouter (usersDataSource:UsersData, sessionAdmin:SessionAdmin, jwtSecret:string){
    const Users = new UsersService(usersDataSource, jwtSecret); 
    const sessionsMdw = createSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(sessionAdmin, ['admin', 'scorekeeper']); 

    const router = express.Router()

    router.get('/getUsers', async(req:Request, res:Response) => {
        let users; 
        try {
            users = await Users.getUsers(); 
        } catch(e){
            console.error("Error getting Users: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(users); 
    })

    router.post('/insertUser', async(req:Request, res:Response) => {
        const username: string = req.body.username; 
        const password: string = req.body.password; 
        const rolesArr: string[] = req.body.rolesArr
        console.log('username: ', username, "password: ", password, "roles: ", rolesArr)
        if(!username || !password || !rolesArr || !rolesArr.length) return res.status(400).send("malformed request.")
        let result; 
        try {
            result = await Users.insertUser({username:username, password:password, rolesArr: rolesArr}); 
        } catch(e) {
            console.error("Error inserting user: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result); 
    })

    router.post("/updateUser", async(req:Request, res: Response) => {
        const userId = req.body.userId; 
        const roleArr = req.body.roleArr; 
        const password = req.body.password; 
        if(!userId) return res.status(400).send("malformed request"); 
        let result; 
        try {
            result = await Users.updateUser(userId, roleArr, password); 
        } catch(e) {
            console.error("Error updating user: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result); 
    })

    router.post("/deleteUser", async(req:Request, res:Response) => {
        const userId = req.body.userId; 
        if(!userId) return res.status(400).send("malfored request"); 
        let result; 
        try {
            result = await Users.deleteUser(userId); 
        } catch (e) {
            console.error("Error delete user: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result); 
    })

    router.post("/login", async(req:Request, res:Response) => {
        const username = req.body.username; 
        const password = req.body.password; 
        if(!username || !password) return res.status(400).send("malformed request."); 
        let result; 
        try{
            result = await Users.checkPass(username, password); 
        } catch(e) {
            console.error("Error attempting login: ", e); 
            return res.status(500).send("Internal server error."); 
        }
        return res.status(200).send(result); 
    })

    return router; 
}

