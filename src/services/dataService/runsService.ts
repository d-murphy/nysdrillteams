import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb'
import { Run, RunsData, TournamentW_id, TotalPointsFields } from '../../types/types'


interface big8Cache {
    [key: number]: {
        created: Date, 
        result: {}[]
    }
 }

interface topRunsCache {
    [key: string]: {
        created: Date, 
        result: {}[][]
    }
}

interface totalPointsCache {
    [key: string]: {
        created: Date, 
        result: {}[]
    }
}


 class RunsService {
    _big8Cache: big8Cache = {}
    _topRunsCache: topRunsCache = {}
    _totalPointsCache: totalPointsCache = {}
    constructor ( private dataSource : RunsData ){}
    public insertRun(newRun: Run, tournament: TournamentW_id ): Promise<InsertOneResult> {
        let run: Run = newRun;
        run.date = new Date(newRun.date); 
        run.year = run.date.getFullYear(); 
        run.tournament = tournament.name;
        run.tournamentId = (tournament._id as unknown as number); 
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
    public deleteRun(runId: number): Promise<DeleteResult> {
        return this.dataSource.deleteRun(runId);
    }
    public updateRun(runId: number, pointsUpdate:number, timeUpdate: string, rankUpdate:string): Promise<UpdateResult> {
        return this.dataSource.updateRun(runId, pointsUpdate, timeUpdate, rankUpdate);
    }
    public getRun(runId: number): Promise<Run | undefined> {
        return this.dataSource.getRun(runId); 
    } 
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
    public async getBig8(year:number): Promise<{}[]> {
        year = year*1; 
        if(!this._big8Cache[year] || ( this._big8Cache[year] && (+new Date() - +this._big8Cache[year].created) > 1000 * 60 * 60 *6 )) {
                let result = await this.dataSource.getBig8(year);
                if(result.length){
                    console.log('Updating the Big 8 cache for year: ', year);
                    this._big8Cache[year] = {result:[], created: new Date() };     
                    this._big8Cache[year].result = result; 
                }
        }
        return this._big8Cache[year]?.result ? this._big8Cache[year]?.result : [];   
    }
    public async getTopRuns(years?: number[], teams?: string[], tracks?: string[]): Promise<{}[]> {
        let key = createTopRunsKey(years, teams, tracks); 
        if(!this._topRunsCache[key] || ( this._topRunsCache[key] && (+new Date() - +this._topRunsCache[key].created) > 1000 * 60 * 60 * 24 * 7 )) {
            let result = await this.dataSource.getTopRuns(years, teams, tracks); 
            if(result.length){
                console.log('Updating the Top Runs cache for key: ', key);
                this._topRunsCache[key] = {result:[], created: new Date() };     
                this._topRunsCache[key].result = result; 
            }
        }
        return this._topRunsCache[key]?.result ? this._topRunsCache[key].result : []; 
    }
    public async getTotalPoints(year: number, totalPointsFieldName:TotalPointsFields, contests?: string[]): Promise<{}[]> {
        if(!contests) contests = [];
        let key = createTotalPointsCacheKey(year, totalPointsFieldName, contests); 
        if(!this._totalPointsCache[key] || ( this._totalPointsCache[key] && (+new Date() - +this._totalPointsCache[key].created) > 1000 * 60 * 60 * 24 * 7 )){
            console.log("Creating total points cache for: ", key); 
            let result: {}[]; 
            if(contests.length){ 
                result = await this.dataSource.getTotalPoints(year, totalPointsFieldName, contests); 
            } else {
                result = await this.dataSource.getTotalPoints(year, totalPointsFieldName); 
            }
            this._totalPointsCache[key] = {result: result, created: new Date()}; 
        }
        return this._totalPointsCache[key].result; 
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

function createTopRunsKey(years?: number[], teams?: string[], tracks?: string[]){
    let key = 'years:'; 
    key += addArrToKey(years) + ';'
    key += 'teams:'; 
    key += addArrToKey(teams) + ';'
    key += 'tracks:'; 
    key += addArrToKey(tracks) + ';'
    return key; 
}

function createTotalPointsCacheKey(year:number, totalPointsFieldName:string, contests: string[]){
    let key = ""; 
    key += `Year:${year};`; 
    key += `TotalPointsFieldName:${totalPointsFieldName};`; 
    key += "Contests:"; 
    contests.forEach(contest => {
        key += `${contest},`
    })
    return key; 
}

function addArrToKey(arr: (number | string)[] | undefined){
    let strToReturn: string = "";
    if(arr){
        arr.forEach((el, ind) => {
            strToReturn += el;
            strToReturn += ind < arr.length-1 ? ',' : '';  
        })    
    } 
    return strToReturn; 
}