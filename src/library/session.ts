const SESSION_MAX = 1000 * 60 * 1; 

class SessionAdmin {
    users: {[index:string]: {last: Date, ip: string, sessionId: string, role: string}}
    checkCt: number
    constructor(){
        this.users = {}; 
        this.checkCt = 0; 
    }
    checkSession(user:string, ip:string, sessionId:string):boolean{
        if(!this.users[user]) return false; 
        let session = this.users[user]; 
        let sessionCurrent = (
                +session.last - +(new Date()) > SESSION_MAX ||
                session.ip != ip || 
                session.sessionId != sessionId 
            ) ? false : true; 
        if(!sessionCurrent) this.deleteSession(user); 
        if(sessionCurrent) session.last = new Date(); 
        return sessionCurrent; 
    }
    checkRole(user:string, roles:string[]){
        return roles.includes(this.users[user].role); 
    }
    createSession(user:string, ip:string, sessionId:string, role:string):string{
        this.users[user] = {last: new Date(), ip: ip, sessionId: makeid(), role: role}; 
        this.checkCt++; 
        if(this.checkCt==20) this.cleanSessions(); 
        return this.users[user].sessionId; 
    }
    deleteSession(user:string):boolean{
        let entryDeleted = false; 
        if(this.users[user]){
            delete this.users[user]; 
            entryDeleted = true; 
        }
        return entryDeleted; 
    }
    cleanSessions(){
        let users = Object.keys(this.users); 
        users.forEach(user => {
            if(+this.users[user].last - +(new Date()) > SESSION_MAX ) delete this.users[user]
        })
        this.checkCt = 0; 
    }
}; 

export default SessionAdmin; 



function makeid() {
    const ID_LENGTH = 20; 
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < ID_LENGTH; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   return result;
}

