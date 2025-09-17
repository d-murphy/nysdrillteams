import { Collection, Db, Sort } from 'mongodb';
import { SimulationContestSummary, SimulationContestSummaryMethods } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function simContSumDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<SimulationContestSummaryMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new SimContSumDb(collection); 
    return undefined; 
}

class SimContSumDb implements SimulationContestSummaryMethods {
    _dbCollection: Collection; 
    
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    
    async getTopSimulationContestSummaries(contestArr: string[], sortBy: string, limit: number, offset: number, teamArr: string[], yearArr: number[]): Promise<SimulationContestSummary[]> {
        const query: {team?: string, year?: number, contest?: string} = {}; 
        if(teamArr.length) {            
            const teamRegexArr = teamArr.map(str => new RegExp(str, 'i'));
            query.team = { $in: teamRegexArr } as unknown as string; 
        }
        if(yearArr.length) query.year = { $in: yearArr } as unknown as number; 
        query.contest = { $in: contestArr } as unknown as string; 

        let sortObj: Sort = {}; 
        if(sortBy === "consistency") {
            sortObj.consistency = -1; 
            sortObj.speedRating = -1; 
        } else {
            sortObj.speedRating = -1; 
            sortObj.consistency = -1; 
        }

        return (this._dbCollection.find(query).skip(offset).limit(limit).sort(sortObj).toArray() as unknown as SimulationContestSummary[]);
    }
}
