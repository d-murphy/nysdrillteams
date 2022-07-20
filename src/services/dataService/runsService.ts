import { Run, RunsData, Tournament, Team, insertRunResp } from '../../types/types'

class RunsService {

    constructor ( private dataSource : RunsData ){}
    public getRunsFromTournament(tournamentId:number): Promise<Run[]> {
        return this.dataSource.getRunsFromTournament(tournamentId); 
    }
    public getFilteredRuns(years: number[], contests: string[], teams: string[], circuits: string[]): Run[] {
        return this.dataSource.getFilteredRuns(years, contests, teams, circuits); 
    }
    public getRun(runId: number): Run | undefined {
        return this.dataSource.getRun(runId); 
    } 
    public insertRun(newRun: Run, tournament: Tournament, team: Team): insertRunResp {
        let run: Run = newRun;
        run.id = Math.floor(Math.random()*100000)
        run.team = team.name; 
        run.date = new Date(newRun.date); 
        run.year = run.date.getFullYear(); 
        run.tournament = tournament.name;
        run.tournamentId = tournament.id; 
        run.runningPosition = run.runningPosition;  
        run.sanctioned = tournament.sanctioned; 
        run.circuit = tournament.circuits.includes(team.circuit) ? team.circuit : ''; 
        return this.dataSource.insertRun(run);
    }
    public deleteRun(runId: number): boolean {
        return this.dataSource.deleteRun(runId);
    }
    public updateRun(runId: number, pointsUpdate:number, timeUpdate: string): Run {
        return this.dataSource.updateRun(runId, pointsUpdate, timeUpdate);
    }
}
    
export default RunsService; 