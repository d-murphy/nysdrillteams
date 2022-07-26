import { Run, RunsData, Tournament, Team, insertRunResp } from '../../types/types'

class RunsService {

    constructor ( private dataSource : RunsData ){}
    public getRunsFromTournament(tournamentId:number): Promise<Run[]> {
        return this.dataSource.getRunsFromTournament(tournamentId); 
    }
    public getFilteredRuns(
        years?: number[], 
        contests?: string[], 
        teams?: string[], 
        tracks?:string[], 
        tournaments?:string[], 
        ranks?:string[], 
        stateRecord?: boolean, 
        currentStateRecord?: boolean,
        ): Promise<Run[]> {
        return this.dataSource.getFilteredRuns(years, contests, teams, tracks, tournaments, ranks, stateRecord, currentStateRecord); 
    }
    public getRun(runId: number): Promise<Run | undefined> {
        return this.dataSource.getRun(runId); 
    } 
    public insertRun(newRun: Run, tournament: Tournament, team: Team): Promise<insertRunResp> {
        let run: Run = newRun;
        run.team = team.name; 
        run.hometown = team.hometown; 
        run.nickname = team.nickname; 
        run.date = new Date(newRun.date); 
        run.year = run.date.getFullYear(); 
        run.tournament = tournament.name;
        run.tournamentId = tournament.id; 
        run.track = tournament.track; 
        run.sanctioned = tournament.sanctioned; 
        run.nassauPoints = tournament.circuits.includes("Nassau");
        run.suffolkPoints = tournament.circuits.includes("Suffolk");
        run.westernPoints = tournament.circuits.includes("Western");
        run.northernPoints = tournament.circuits.includes("Northern");
        run.suffolkOfPoints = tournament.circuits.includes("Suffolk-OF");
        run.nassauOfPoints = tournament.circuits.includes("Nassau-OF");
        run.liOfPoints = tournament.circuits.includes("LI-OF");
        run.juniorPoints = tournament.circuits.includes("Junior");
        return this.dataSource.insertRun(run);    
    }
    public deleteRun(runId: number): Promise<boolean> {
        return this.dataSource.deleteRun(runId);
    }
    public updateRun(runId: number, pointsUpdate:number, timeUpdate: string, rankUpdate:string): Promise<Run> {
        return this.dataSource.updateRun(runId, pointsUpdate, timeUpdate, rankUpdate);
    }
}
    
export default RunsService; 