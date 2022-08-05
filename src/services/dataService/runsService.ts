import { Run, RunsData, TournamentW_id, Team, runDbResult } from '../../types/types'

class RunsService {

    constructor ( private dataSource : RunsData ){}
    public getRunsFromTournament(tournamentId:string): Promise<Run[]> {
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
    public insertRun(newRun: Run, tournament: TournamentW_id ): Promise<runDbResult> {
        let run: Run = newRun;
        run.date = new Date(newRun.date); 
        run.year = run.date.getFullYear(); 
        run.tournament = tournament.name;
        run.tournamentId = (tournament._id as unknown as string); 
        run.track = tournament.track; 
        run.sanctioned =  getSanction(tournament.contests, run.contest); 
        run.nassauPoints = getCfp(tournament.contests, run.contest) && tournament.nassauPoints; 
        run.suffolkPoints = getCfp(tournament.contests, run.contest) && tournament.suffolkPoints;
        run.westernPoints = getCfp(tournament.contests, run.contest) && tournament.westernPoints;
        run.northernPoints = getCfp(tournament.contests, run.contest) && tournament.northernPoints;
        run.suffolkOfPoints = getCfp(tournament.contests, run.contest) && tournament.suffolkOfPoints;
        run.nassauOfPoints = getCfp(tournament.contests, run.contest) && tournament.nassauOfPoints;
        run.liOfPoints = getCfp(tournament.contests, run.contest) && tournament.liOfPoints;
        run.juniorPoints = getCfp(tournament.contests, run.contest) && tournament.juniorPoints;
        return this.dataSource.insertRun(run);    
    }
    public deleteRun(runId: number): Promise<boolean> {
        return this.dataSource.deleteRun(runId);
    }
    public updateRun(runId: number, pointsUpdate:number, timeUpdate: string, rankUpdate:string): Promise<runDbResult> {
        return this.dataSource.updateRun(runId, pointsUpdate, timeUpdate, rankUpdate);
    }
}
    
export default RunsService; 



function getSanction(contestArr: {name:string, cfp:boolean, sanction:boolean}[], contest:string): boolean {
    let contestObj = contestArr.find(el => {
        return el.name == contest; 
    })
    if(contestObj) return contestObj.sanction; 
    return false
}

function getCfp (contestArr: {name:string, cfp:boolean, sanction:boolean}[], contest:string): boolean {
    let contestObj = contestArr.find(el => {
        return el.name == contest; 
    })
    if(contestObj) return contestObj.cfp; 
    return false
}