import { v4 as uuidv4 } from 'uuid';

const SESSION_MAX = 1000 * 60 * 30; 

class SessionAdmin {
    sessions: {[index:string]: {last: Date, ip: string, username:string, role:string}}
    checkCt: number
    constructor(){
        this.sessions = {}; 
        this.checkCt = 0; 
    }
    checkSession(ip:string, sessionId:string): {last: Date, ip:string, username:string, role:string} | null {
        let session = this.sessions[sessionId];  
        if(!session) return null; 
        let sessionCurrent = +(new Date()) - +session.last < SESSION_MAX && session.ip === ip  
        if(!sessionCurrent) {
            this.deleteSession(sessionId); 
            return null; 
        }
        session.last = new Date(); 
        return session;  
    }
    createSession(ip:string, username:string, role:string):string{
        console.log('creating session for: ', ip, username, role); 
        let sessionId = uuidv4(); 
        this.sessions[sessionId] = {last: new Date(), ip: ip, username:username, role:role}; 
        this.checkCt++; 
        if(this.checkCt==20) this.cleanSessions(); 
        return sessionId; 
    }
    deleteSession(sessionId:string):boolean{
        let entryDeleted = false; 
        if(this.sessions[sessionId]){
            delete this.sessions[sessionId]; 
            entryDeleted = true; 
        }
        return entryDeleted; 
    }
    async cleanSessions(){
        let sessionIds = Object.keys(this.sessions); 
        sessionIds.forEach(sessionId => {
            if(+(new Date()) - +this.sessions[sessionId].last > SESSION_MAX ) delete this.sessions[sessionId]
        })
        this.checkCt = 0; 
    }
}; 

export default SessionAdmin; 
