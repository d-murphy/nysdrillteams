import { TeamData, Team, teamDbResp } from '../../types/types'

class TeamsService {

    constructor ( private dataSource : TeamData ){}

    public insertTeam(newTeam: Team): Promise<teamDbResp> {
        return this.dataSource.insertTeam(newTeam); 
    }
    public deleteTeam(teamId: string): Promise<boolean> {
        return this.dataSource.deleteTeam(teamId); 
    }
    public updateTeam(teamId:string, fieldsToUpdate: {}): Promise<boolean> {
        return this.dataSource.updateTeam(teamId, fieldsToUpdate); 
    }
    public getTeam(teamId:number): Promise<Team | undefined> {
        return this.dataSource.getTeam(teamId); 
    }
    public getTeams(): Promise<Team[]> {
        return this.dataSource.getTeams(); 

    }
}
    
export default TeamsService; 