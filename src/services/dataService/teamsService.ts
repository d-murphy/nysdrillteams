import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { TeamData, Team, SimilarTeam } from '../../types/types'

class TeamsService {

    constructor ( private dataSource : TeamData ){}

    public insertTeam(newTeam: Team): Promise<InsertOneResult> {
        return this.dataSource.insertTeam(newTeam); 
    }
    public deleteTeam(teamId: string): Promise<DeleteResult> {
        return this.dataSource.deleteTeam(teamId); 
    }
    public updateTeam(teamId:string, fieldsToUpdate: {}): Promise<UpdateResult> {
        return this.dataSource.updateTeam(teamId, fieldsToUpdate); 
    }
    public getTeam(teamId:number): Promise<Team | undefined> {
        return this.dataSource.getTeam(teamId); 
    }
    public getTeams(): Promise<Team[]> {
        return this.dataSource.getTeams(); 
    }
    public getSimilarTeams(team:string, year: number): Promise<SimilarTeam[]> {
        return this.dataSource.getSimilarTeams(team, year); 
    }
}
    
export default TeamsService; 