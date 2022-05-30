import { Run, RunsData } from '../../types/types'

class RunsService {

    constructor ( private dataSource : RunsData ){}
    public getRunsFromTournament(tournamentId:number): Run[] {
        return this.dataSource.getRunsFromTournament(tournamentId); 
    }
    public getFilteredRuns(years: number[], contests: string[], teams: string[], circuits: string[]): Run[] {
        return this.dataSource.getFilteredRuns(years, contests, teams, circuits); 
    }
    public getRun(runId: number): Run | undefined {
        return this.dataSource.getRun(runId); 
    } 
    public insertRun(newRun: Run): boolean {
        return this.dataSource.insertRun(newRun);
    }
    public deleteRun(runId: number): boolean {
        return this.dataSource.deleteRun(runId);
    }
    public updateRun(updatedRun:Run): Run {
        return this.dataSource.updateRun(updatedRun);
    }
}
    
export default RunsService; 