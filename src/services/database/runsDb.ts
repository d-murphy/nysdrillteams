import { Collection, Db, DeleteResult, InsertOneResult, ObjectId, UpdateResult, Decimal128 } from 'mongodb';
import { Run, RunsData, TotalPointsFields } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function runsDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<RunsData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new RunsDb(collection); 
    return undefined; 
}

const DEFAULT_CONTESTS = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]

class RunsDb implements RunsData{
    _dbCollection: Collection; 
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    async insertRun(newRun: Run): Promise<InsertOneResult> {
        return this._dbCollection.insertOne(newRun); 
    }
    async deleteRun(runId: number): Promise<DeleteResult> {
        const query = { _id: new ObjectId(runId) };
        return this._dbCollection.deleteOne(query);
    }
    async updateRun(runId: number, fieldsToUpdate: {}): Promise<UpdateResult> {
        const filter = { _id: new ObjectId(runId) };
        const updateDoc = {
            $set: fieldsToUpdate,
        }
        return this._dbCollection.updateOne(filter, updateDoc);     
    }
    async getRun(runId: number): Promise<Run | undefined> {
        const query = { _id: new ObjectId(runId) };
        let result:Run | undefined = undefined; 
        return (this._dbCollection.findOne(query)) as unknown as Run; 
    }
    async getRunsFromTournament(tournamentId: string): Promise<Run[]> {
        const query = { tournamentId: tournamentId };
        return (this._dbCollection.find(query).toArray() as unknown as Run[]); 
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
        return (this._dbCollection.find(query).toArray() as unknown as Run[]); 
    }
    async getBig8(year: number): Promise<{}[]> {
        return await this._dbCollection.aggregate(
            [
                {
                    $match: {
                        year: year, 
                        contest: { $in: DEFAULT_CONTESTS }, 
                        timeNum: {$nin : [null, NaN]}
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
    }
    async getTopRuns(years?: number[], teams?: string[], tracks?: string[]): Promise<{}[][]> {
        let contests = DEFAULT_CONTESTS; 
        let promiseArr: Promise<{}[]>[] = []; 
        contests.forEach(contest => {
            let filterObj: {year?:{}, team?:{}, track?: {}, contest?: {}, timeNum?: {}} = {}; 
            if(years && years.length) filterObj.year =  { $in: years } 
            if(teams && teams.length) filterObj.team =  { $in: teams } 
            if(tracks && tracks.length) filterObj.track =  { $in: tracks } 
            filterObj.contest = contest; 
            filterObj.timeNum = { $nin: [NaN, 0, null] }
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
        return Promise.all(promiseArr); 
    }
    async getTotalPoints(year: number, totalPointsFieldName: TotalPointsFields, contests: string[] = DEFAULT_CONTESTS): Promise<{_id: string, points: number}[]>  {
        const tpFieldLookup = {
            "Nassau": "nassauPoints", 
            "Suffolk": "suffolkPoints", 
            "Western": "westernPoints", 
            "Northern": "northernPoints", 
            "Junior": "juniorPoints", 
            "Suffolk OF": "suffolkOfPoints", 
            "Nassau OF": "nassauOfPoints", 
            "LI OF": "liOfPoints"
        }
        const tpFieldName = tpFieldLookup[totalPointsFieldName]; 

        let matchObj: {[index:string]: any} = {
            year: year, 
            contest: { $in: DEFAULT_CONTESTS }, 
            points: {"$gt" : 0}
        }
        // using a variable for the column name, so set match object dynamically.
        matchObj[tpFieldName] = { $gt: 0 }; 
        return this._dbCollection.aggregate(
            [
                {
                    $match: matchObj,
                },
                {
                    $group: {
                        _id: "$team",
                        points: { "$sum": "$points" }
                        }
                }, 
                {
                    $sort: {
                        points: -1
                    }
                }
            ]
        ).toArray() as unknown as {_id: string, points: number}[]
    }
}

