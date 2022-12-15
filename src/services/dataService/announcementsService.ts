export default class AnnouncementService {
    _announcements: string[]
    constructor (){
        this._announcements = []; 
    }
    public update(newList: string[]):void {
        this._announcements = [...newList];     
    }
    public get(): string[]{
        return this._announcements; 
    }
}
    
