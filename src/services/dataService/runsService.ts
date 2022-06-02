import { Run, RunsData, Tournament, Team } from '../../types/types'

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
    public insertRun(newRun: Run, tournament: Tournament, team: Team): boolean {
        let run: Run = newRun;
        run.year = newRun.date.getFullYear();
        run.tournament = tournament.name;
        run.runningPosition = tournament.runningOrder[newRun.team];
        run.circuit = tournament.circuits.includes(team.circuit) ? team.circuit : ''; 
        return this.dataSource.insertRun(run);
    }
    public deleteRun(runId: number): boolean {
        return this.dataSource.deleteRun(runId);
    }
    public updateRun(updatedRun:Run): Run {
        return this.dataSource.updateRun(updatedRun);
    }
}
    
export default RunsService; 