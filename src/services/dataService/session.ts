import jwt from 'jsonwebtoken'; 

const SESSION_MAX = 1000 * 60 * 1; 

class SessionAdmin {
    users: {[index:string]: {last: Date, ip: string, jwt: string, rolesArr: string[]}}
    checkCt: number
    constructor(){
        this.users = {}; 
        this.checkCt = 0; 
    }
    checkSession(ip:string, userJwt:string, jwtSecret:string): {username:string, rolesArr:string[]} | null {
        let decoded = jwt.verify(userJwt, jwtSecret) as {username:string, rolesArr:string[]}
        if(!decoded) return null; 

        let session = this.users[decoded.username];  
        let sessionCurrent = (
                +session.last - +(new Date()) > SESSION_MAX ||
                session.ip != ip || 
                session.jwt != userJwt 
            ) ? false : true; 
        if(!sessionCurrent) {
            this.deleteSession(decoded.username); 
            return null; 
        }
        session.last = new Date(); 
        return decoded; 
    }
    createSession(user:string, ip:string, userJwt:string, rolesArr:string[]):boolean{
        this.users[user] = {last: new Date(), ip: ip, jwt: userJwt, rolesArr: rolesArr}; 
        this.checkCt++; 
        if(this.checkCt==20) this.cleanSessions(); 
        return true; 
    }
    deleteSession(user:string):boolean{
        let entryDeleted = false; 
        if(this.users[user]){
            delete this.users[user]; 
            entryDeleted = true; 
        }
        return entryDeleted; 
    }
    async cleanSessions(){
        let users = Object.keys(this.users); 
        users.forEach(user => {
            if(+this.users[user].last - +(new Date()) > SESSION_MAX ) delete this.users[user]
        })
        this.checkCt = 0; 
    }
}; 

export default SessionAdmin; 
