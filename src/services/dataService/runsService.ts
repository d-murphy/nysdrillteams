import { Run, RunsData } from '../../types/types'

class RunsService {

    constructor ( private dataSource : RunsData ){}
    public getRunsFromTournament(tournamentId:number): Run[] {
        return this.dataSource.getRunsFromTournament(tournamentId); 
    }
    public getFilteredRuns(years: number[], contests: string[], teams: string[]): Run[] {
        return this.dataSource.getFilteredRuns(years, contests, teams); 
    }
}
    
export default RunsService; 