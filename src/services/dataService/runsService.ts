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
    _topRunsCalls: number = 0; 
    _big8Calls: number = 0; 
    _totalPointsCalls: number = 0; 
    constructor ( private dataSource : RunsData ){}
    public insertRun(newRun: Run ): Promise<InsertOneResult> {
        return this.dataSource.insertRun(newRun);    
    }
    public deleteRun(runId: number): Promise<DeleteResult> {
        return this.dataSource.deleteRun(runId);
    }
    public updateRun(runId: number, fieldsToUpdate:{}): Promise<UpdateResult> {
        return this.dataSource.updateRun(runId, fieldsToUpdate);
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
        nassauPoints?: boolean, 
        suffolkPoints?: boolean, 
        westernPoints?: boolean, 
        northernPoints?: boolean, 
        suffolkOfPoints?: boolean, 
        nassauOfPoints?: boolean, 
        liOfPoints?: boolean, 
        juniorPoints?: boolean, 
        sanctioned?: boolean,    
        page?: number
        ): Promise<{}[]> {
        return this.dataSource.getFilteredRuns(years, contests, teams, tracks, tournaments, ranks, stateRecord, currentStateRecord, 
                nassauPoints, suffolkPoints, westernPoints, northernPoints, suffolkOfPoints, nassauOfPoints, liOfPoints, juniorPoints, sanctioned, page); 
    }
    public async getBig8(year:number): Promise<{}[]> {
        this._big8Calls++; 
        year = year*1; 
        if(!this._big8Cache[year] || ( this._big8Cache[year] && (+new Date() - +this._big8Cache[year].created) > 1000 * 60 * 60 )) {
            let result = await this.dataSource.getBig8(year);
            if(result.length){
                console.log('Updating the Big 8 cache for year: ', year);
                this._big8Cache[year] = {result:[], created: new Date() };     
                this._big8Cache[year].result = result; 
            }
        } else {
            // clean cache occassionally
            if(this._big8Calls % 10 == 0){
                console.log('starting big8 cache clean')
                this._big8Calls = 0; 
                Object.keys(this._big8Cache).forEach((key) => {
                    if((+new Date() - +this._big8Cache[parseInt(key)].created) > 1000 * 60 * 60 ){
                        console.log('delete cache for year: ', key)
                        delete this._big8Cache[parseInt(key)]
                    }
                })                
            }            
        }
        return this._big8Cache[year]?.result ? this._big8Cache[year]?.result : [];   
    }
    public async getTopRuns(years?: number[], teams?: string[], tracks?: string[]): Promise<{}[]> {
        this._topRunsCalls++; 
        let key = createTopRunsKey(years, teams, tracks); 
        if(!this._topRunsCache[key] || ( this._topRunsCache[key] && (+new Date() - +this._topRunsCache[key].created) > 1000 * 60 * 60 )) {
            let result = await this.dataSource.getTopRuns(years, teams, tracks); 
            if(result.length){
                console.log('Updating the Top Runs cache for key: ', key);
                this._topRunsCache[key] = {result:[], created: new Date() };     
                this._topRunsCache[key].result = result; 
            }
        } else {
            // clean cache occassionally
            if(this._topRunsCalls % 10 == 0){
                console.log('starting TopRuns cache clean')
                this._topRunsCalls = 0; 
                Object.keys(this._topRunsCache).forEach((key) => {
                    if((+new Date() - +this._topRunsCache[key].created) > 1000 * 60 * 60  ){
                        console.log('delete cache for Top Run key: ', key)
                        delete this._topRunsCache[key]
                    }
                })                
            }            
        }
        return this._topRunsCache[key]?.result ? this._topRunsCache[key].result : []; 
    }
    public async getTotalPoints(year: number, totalPointsFieldName:TotalPointsFields, byContest=false, contests?: string[]): Promise<{}[]> {
        this._totalPointsCalls++; 
        if(!contests) contests = [];
        let key = createTotalPointsCacheKey(year, totalPointsFieldName, contests); 
        if(!this._totalPointsCache[key] || ( this._totalPointsCache[key] && (+new Date() - +this._totalPointsCache[key].created) > 1000 * 60 * 60  )){
            console.log("Creating total points cache for: ", key); 
            let result: {}[]; 
            if(contests.length){ 
                result = await this.dataSource.getTotalPoints(year, totalPointsFieldName, byContest, contests); 
            } else {
                result = await this.dataSource.getTotalPoints(year, totalPointsFieldName, byContest); 
            }
            this._totalPointsCache[key] = {result: result, created: new Date()}; 
        } else {
            // clean cache occassionally
            if(this._totalPointsCalls % 10 == 0){
                console.log('starting Total Points cache clean')
                this._totalPointsCalls = 0; 
                Object.keys(this._totalPointsCache).forEach((key) => {
                    if((+new Date() - +this._totalPointsCache[key].created) > 1000 * 60 * 60 ){
                        console.log('delete cache for total points key: ', key)
                        delete this._totalPointsCache[key]
                    }
                })                
            }            
        }
        return this._totalPointsCache[key].result; 
    }
    public getContestNames(): Promise<{_id: string, nameCount:number}[]> {
        return this.dataSource.getContestNames(); 
    } 
}
    
export default RunsService; 


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

