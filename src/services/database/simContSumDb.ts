import { Collection, Db } from 'mongodb';
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
    
    async getSimulationContestSummary(team: string, year: number): Promise<SimulationContestSummary[]> {
        const query = { team: team, year: year };
        return (this._dbCollection.find(query).toArray() as unknown as SimulationContestSummary[]);
    }
}
