import SessionAdmin from '../../library/session'
import { Handler } from 'express'

export function createSessionsMdw(sessionAdmin:SessionAdmin):Handler{
    return (req,res,next) => {
        let user = req.body?.user; 
        let sessionId = req.body?.sessionId; 
        let ip = req.socket.remoteAddress; 
        if(!user || !sessionId || !ip) return res.status(400).send({message: 'user or sessionId needed for this request.'}); 
        if(!sessionAdmin.checkSession(user, ip, sessionId)) return res.status(403).send({message: 'Please login again.'}); 
        next(); 
    }
}

export function createAuthMdw(sessionAdmin:SessionAdmin, rolesAllowed: string[]):Handler{
    return (req,res,next) => {
        let user = req.body?.user; 
        if(!user) return res.status(400).send({message: 'user needed for this request.'}); 
        if(!sessionAdmin.checkRole(user, rolesAllowed)) return res.status(403).send({message: 'You are not authorized for this action.'}); 
        next(); 
    }
}
