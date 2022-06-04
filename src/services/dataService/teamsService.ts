import { TeamData, Team, insertTeamResp } from '../../types/types'

class TeamsService {

    constructor ( private dataSource : TeamData ){}

    public insertTeam(newTeam: Team): insertTeamResp {
        return this.dataSource.insertTeam(newTeam); 
    }
    public deleteTeam(teamId: number): boolean {
        return this.dataSource.deleteTeam(teamId); 
    }
    public updateTeam(updatedTeam:Team): Team {
        return this.dataSource.updateTeam(updatedTeam); 
    }
    public getTeam(teamId:number): Team | undefined {
        return this.dataSource.getTeam(teamId); 
    }
    public getTeams(): Team[] {
        return this.dataSource.getTeams(); 

    }
}
    
export default TeamsService; 