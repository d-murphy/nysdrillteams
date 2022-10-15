import SessionAdmin from '../dataService/session'
import { Handler } from 'express'

export function checkSessionsMdw(sessionAdmin:SessionAdmin, jwtSecret:string):Handler{
    return (req,res,next) => {
        const jwt = (req.query?.jwt as unknown as string); 
        let ip = req.socket.remoteAddress; 
        if(!jwt || !ip) return res.status(400).send({message: 'Something is wrong with your login.  Please login again.'}); 
        let sessionInfo = sessionAdmin.checkSession(ip, jwt, jwtSecret); 
        if(!sessionInfo) return res.status(403).send({message: 'Please login again.'}); 
        res.locals['user'] = sessionInfo.username; 
        res.locals['rolesArr'] = sessionInfo.rolesArr; 
        next(); 
    }
}

export function createAuthMdw(sessionAdmin:SessionAdmin, rolesAllowed: string[]):Handler{
    return (req,res,next) => {
        let userRoles = res.locals['rolesArr']
        let roleMatch = false; 
        rolesAllowed.forEach(role => {
            if(userRoles && userRoles.includes(role)) roleMatch = true; 
        })
        if(!roleMatch) return res.status(403).send({message: 'Role not allowed to perform this action.'}); 
        next(); 
    }
}
