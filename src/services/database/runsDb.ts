import { Collection, Db, ObjectId } from 'mongodb';
import { Run, RunsData, runDbResult } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function runsDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<RunsData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new RunsDb(collection); 
    return undefined; 
}

class RunsDb implements RunsData{
    _dbCollection: Collection; 
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    async insertRun(newRun: Run): Promise<runDbResult> {
        let result; 
        try {
            result = await this._dbCollection.insertOne(newRun); 
        } catch (e) {
            console.log("Error inserting document: ", e); 
        }
        if(result) return { result: true, run: newRun } 
        return {result: false, run: newRun }
    }
    async deleteRun(runId: number): Promise<boolean> {
        const query = { _id: new ObjectId(runId) };
        let result; 
        try {
            result = await this._dbCollection.deleteOne(query);
        } catch (e) {
            console.log('Error deleting document'); 
        }
        if(result) return true;
        return false;  
    }
    async updateRun(runId: number, pointsUpdate: number, timeUpdate: string, rankUpdate: string): Promise<runDbResult> {
        const filter = { _id: new ObjectId(runId) };
        const updateDoc = {
            $set: {
                rank: rankUpdate, 
                points: pointsUpdate, 
                time: timeUpdate
            },
        };
        let result:Run | undefined; 
        try {  
            result = (await this._dbCollection.updateOne(filter, updateDoc) as unknown as Run);         
        } catch (e) {
            console.log('There was an error updating document id: ', runId);          
        }
        if(result) return {result: true, run: result}; 
        return  {result: true, run: undefined};
    }
    async getRun(runId: number): Promise<Run | undefined> {
        const query = { _id: new ObjectId(runId) };
        let result:Run | undefined = undefined; 
        try {
            result = await (this._dbCollection.findOne(query)) as unknown as Run; 
        } catch (e) {
            console.log ("There was an error retrieving document: ", runId); 
        }
        if(result) return result;
        return undefined; 
    }
    async getRunsFromTournament(tournamentId: string): Promise<Run[]> {
        const query = { tournamentId: tournamentId };
        let result; 
        try { 
            result = await (this._dbCollection.find(query).toArray() as unknown as Run[]); 
        } catch (e) {
            console.log ("There was an error retrieving documents for tournament: ", tournamentId); 
        }
        if(result) return result; 
        return []; 
    }
    async getFilteredRuns(
        years?: number[], 
        contests?: string[], 
        teams?: string[],
        tracks?:string[], 
        tournaments?:string[], 
        ranks?:string[], 
        stateRecord?: boolean, 
        currentStateRecord?: boolean,
        ): Promise<Run[]> {
        let query: {
            year?:{}, 
            contest?:{}, 
            team?:{}, 
            track?:{}, 
            tournament?:{}, 
            rank?:{}, 
            stateRecord?: boolean, 
            currentStateRecord?: boolean
        } = {};
        if(years && years.length) query.year = {$in : years};
        if(contests && contests.length) query.contest = {$in : contests};
        if(teams && teams.length) query.team = {$in : teams};
        if(tracks && tracks.length) query.track = {$in : tracks};
        if(tournaments && tournaments.length) query.tournament = {$in : tournaments};
        if(ranks && ranks.length) query.rank = {$in : ranks};
        if(stateRecord) query.stateRecord = stateRecord;
        if(currentStateRecord) query.currentStateRecord = currentStateRecord;

        let result; 
        try {
            result = (await this._dbCollection.find(query).toArray() as unknown as Run[]); 
        } catch (e) {
            console.log ("There was an error in the getFilteredRuns function with query: ", query); 
        }
        if(result) return result; 
        return []; 
    }
    async getBig8(year: number): Promise<{}[]> {
        let result: {}[] | undefined = undefined;  
        try {
            result = await this._dbCollection.aggregate(
                [
                    {
                        $match: {
                            year: year, 
                            contest: { $in: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"] }, 
                            timeNum: { $ne: NaN }
                        },
                    },
                    { $sort: { "timeNum": 1} }, 
                    {
                        $group: {
                            _id: "$contest",
                            "matched_doc": { "$first": "$$ROOT" }                     
                         }
                    }
                ]
            ).toArray() 
        } catch(e){
            console.log('Error retrieving big 8: ', e); 
        }
        if(!result) return []
        return result; 
    }
    async getTopRuns(years?: number[], teams?: string[], tracks?: string[]): Promise<{}[][]> {
        let contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]; 
        let promiseArr: Promise<{}[]>[] = []; 
        let results: {}[][] | undefined = undefined;  
        contests.forEach(contest => {
            let filterObj: {year?:{}, team?:{}, track?: {}, contest?: {}, timeNum?: {}} = {}; 
            if(years && years.length) filterObj.year =  { $in: years } 
            if(teams && teams.length) filterObj.team =  { $in: teams } 
            if(tracks && tracks.length) filterObj.track =  { $in: tracks } 
            filterObj.contest = contest; 
            filterObj.timeNum = { $nin: [NaN, 0] }
            let dbProm = this._dbCollection.aggregate(
                [
                    {
                        $match: filterObj,
                    },
                    {
                        $sort: { "timeNum" : 1 }
                    },
                    {
                        $limit: 10
                    }
                ]
            ).toArray() 
            promiseArr.push(dbProm); 
        })
        try {
            results = await Promise.all(promiseArr); 
        } catch(e){
            console.log('Error retrieving top runs: ', e); 
        }
        if(results) return results;
        return []; 
    }

}