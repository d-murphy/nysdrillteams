import { Collection, Db, DeleteResult, InsertOneResult, ObjectId, UpdateResult } from 'mongodb';
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
        return (this._dbCollection.findOne(query)) as unknown as Run; 
    }
    async getRunsFromTournament(tournamentId: string): Promise<Run[]> {
        const query = { tournamentId: tournamentId };
        return (this._dbCollection.find(query).toArray() as unknown as Run[]); 
    }
    async getTeamSummary(year: number, team: string): Promise<Run[]> {
        const query = { year: year, team: team, time: { $nin: ['NA', 'NULL'] }}; 
        return (this._dbCollection.find(query).toArray() as unknown as Run[])
    }
    async getYearRunCounts(team:string):Promise<{_id: string, yearRunCount:number}[]>{
        const query = { team: team, time: { $nin: ['NA', 'NULL'] }}; 
        return this._dbCollection.aggregate(
            [
                {
                    $match: query
                }, 
                {
                    $group: {
                        _id: "$year",
                        yearRunCount: {
                            $count: {}
                        }
                    }
                }, 
                { $sort: { _id: 1 } }
            ]
        ).toArray() as unknown as {_id: string, yearRunCount:number}[]
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
        nassauPoints?: boolean, 
        suffolkPoints?: boolean, 
        westernPoints?: boolean, 
        northernPoints?: boolean, 
        suffolkOfPoints?: boolean, 
        nassauOfPoints?: boolean, 
        liOfPoints?: boolean, 
        juniorPoints?: boolean,  
        sanctioned?: boolean,  
        page?: number, 
        limit?: number
        ): Promise<{}[]> {
        let query: {
            year?:{}, 
            contest?:{}, 
            team?:{}, 
            track?:{}, 
            tournament?:{}, 
            rank?:{}, 
            stateRecord?: {}, 
            currentStateRecord?: {}, 
            nassauPoints?: {}, 
            suffolkPoints?: {}, 
            westernPoints?: {}, 
            northernPoints?: {}, 
            suffolkOfPoints?: {}, 
            nassauOfPoints?: {}, 
            liOfPoints?: {}, 
            juniorPoints?: {}, 
            sanctioned?: {}
        } = {};
        if(years && years.length) query.year = {$in : years};
        if(contests && contests.length) query.contest = {$in : contests};
        if(teams && teams.length) query.team = {$in : teams};
        if(tracks && tracks.length) query.track = {$in : tracks};
        if(tournaments && tournaments.length) query.tournament = {$in : tournaments};
        if(ranks && ranks.length) query.rank = {$in : ranks};
        if(stateRecord) query.stateRecord = {$in: [1, true]}
        if(currentStateRecord) query.currentStateRecord = {$in: [1, true]}
        if(nassauPoints) query.nassauPoints = {$in: [1, true]}
        if(suffolkPoints) query.suffolkPoints = {$in: [1, true]}
        if(westernPoints) query.westernPoints = {$in: [1, true]}
        if(northernPoints) query.northernPoints = {$in: [1, true]} 
        if(suffolkOfPoints) query.suffolkOfPoints = {$in: [1, true]} 
        if(nassauOfPoints) query.nassauOfPoints = {$in: [1, true]}
        if(liOfPoints) query.liOfPoints = {$in: [1, true]}
        if(juniorPoints) query.juniorPoints = {$in: [1, true]} 
        if(sanctioned) query.sanctioned = {$in: [1, true]}
        page = page ? page : 1; 
        const skipCt = page * 20 - 20; 
        limit = limit ? limit : 20;
        return await this._dbCollection.aggregate(
            [
                {
                    $match: query
                }, 
                {   $addFields: { 
                        customSort: {
                            $cond: { 
                                if: {
                                    $or: [
                                        { $eq: [ "$timeNum", NaN ] },
                                        { $eq: [ "$timeNum", 0 ] },
                                        { $eq: [ "$timeNum", null ] }                                
                                    ]
                                }, 
                                then: 99999,
                                else: "$timeNum"
                            }
                        }
                    }
                }, 
                {   $sort: { "customSort": 1}}, 
                {   $facet: {
                    metadata: [ { $count: "total" }, { $addFields: { page: Number(page) } } ],
                    data: [ { $skip: skipCt }, { $limit: limit } ] // add projection here wish you re-shape the docs
                } }
            ]
        ).toArray(); 
    }
    async getBig8(year: number): Promise<{}[]> {
        return await this._dbCollection.aggregate(
            [
                {
                    $match: {
                        year: year, 
                        contest: { $in: DEFAULT_CONTESTS }, 
                        timeNum: { $nin: [NaN, 0, null] }
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
    async getTeamRecord(team: string): Promise<{}[]> {
        return await this._dbCollection.aggregate(
            [
                {
                    $match: {
                        team: team, 
                        timeNum: { $nin: [NaN, 0, null] }
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
    async getTotalPoints(year: number, totalPointsFieldName: TotalPointsFields, byContest = false, contests: string[] = DEFAULT_CONTESTS): Promise<{_id: string, points: number}[]>  {
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
            contest: { $in: contests }, 
            $or: [
                { points: {"$gt" : 0}},
                { totalPointsOverride: {"$gt": 0}}
            ]
        }
        // using a variable for the column name, so set match object dynamically.
        matchObj[tpFieldName] = {$in: [1, true]}

        const groupId = !byContest ? "$team" : { team: "$team", contest: "$contest" }; 
        return this._dbCollection.aggregate(
            [
                {
                    $match: matchObj,
                },
                {
                    $project:
                      {
                        team: 1, 
                        contest: 1, 
                        points: 1, 
                        totalPointsOverride: 1, 
                        overidePoints:
                          {
                            $cond: { if: { $gte: [ "$totalPointsOverride", 0 ] }, then: "$totalPointsOverride", else: "$points" }
                          }
                      }
                },
                {
                    $group: {
                        _id: groupId,
                        points: { "$sum": "$overidePoints" }
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
    async getContestNames():Promise<{_id: string, nameCount:number}[]>{
        return this._dbCollection.aggregate(
            [
                {
                    $group: {
                        _id: "$contest",
                        nameCount: {
                            $count: {}
                        }
                    }
                }, 
                { $sort: { _id: 1 } }
            ]
        ).toArray() as unknown as {_id: string, nameCount:number}[]

    }
    async getTournRunCounts(team:string):Promise<{
            _id: {tournament: string, tournamentId: string, date: Date, track: string}, 
            tournamentRunCount:number, 
            stateRecordCount: number, 
            videoCount: number
        }[]>
        {
        const query = { team: team, time: { $nin: ['NA', 'NULL'] }}; 
        return this._dbCollection.aggregate(
            [
                {
                    $match: query
                }, 
                {
                    $group: {
                        "_id": {
                            tournament: "$tournament", 
                            tournamentId: "$tournamentId", 
                            date: "$date", 
                            track: "$track",
                        },
                        tournamentRunCount: {
                            $count: {}
                        },
                        stateRecordCount: {
                            $sum: { $cond: ["$stateRecord", 1, 0] }
                        }, 
                        videoCount: {
                            $sum: { $cond: [{ $gt: [ { $size: "$urls"} , 0 ] }, 1, 0]}
                        }
                    }
                }, 
            ]
        ).toArray() as unknown as {_id: {tournament: string, tournamentId: string, date: Date, track: string}, tournamentRunCount:number, stateRecordCount: number, videoCount: number}[]
    }
    async getTournPoints(team:string):Promise<{
        _id: {tournament: string, tournamentId: string, date: Date, track: string}, 
        points: number, 
    }[]>
    {
    const query = { team: team, points: { $nin: ['NA', 'NULL', NaN] }}; 
    return this._dbCollection.aggregate(
        [
            {
                $match: query
            }, 
            {
                $group: {
                    "_id": {
                        tournament: "$tournament", 
                        tournamentId: "$tournamentId", 
                        date: "$date", 
                        track: "$track",
                    },
                    points: {
                        $sum: "$points"
                    },
                }
            }, 
        ]
    ).toArray() as unknown as {_id: {tournament: string, tournamentId: string, date: Date, track: string}, points:number}[]
}

}

