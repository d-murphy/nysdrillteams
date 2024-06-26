import SessionAdmin from '../dataService/session'
import { Handler } from 'express'

export function checkSessionsMdw(sessionAdmin:SessionAdmin):Handler{
    return (req,res,next) => {
        const sessionId = 
            (req.body?.sessionId as unknown as string) || (req.query?.sessionId as unknown as string)
        let ip = req.header('x-forwarded-for') || req.socket.remoteAddress;  
        if(!sessionId || !ip) return res.status(400).send({message: 'Your login timed out.  Please login again.'}); 
        let sessionInfo = sessionAdmin.checkSession(ip, sessionId); 
        if(!sessionInfo) return res.status(403).send({message: 'Please login again.'}); 
        res.locals['user'] = sessionInfo.username; 
        res.locals['role'] = sessionInfo.role; 
        next(); 
    }
}

export function createAuthMdw(rolesAllowed: string[]):Handler{
    return (req,res,next) => {
        let userRole = res.locals['role']
        let roleMatch = false; 
        rolesAllowed.forEach(role => {
            if(userRole == role) roleMatch = true; 
        })
        if(!roleMatch) return res.status(403).send({message: 'Role not allowed to perform this action.'}); 
        next(); 
    }
}
