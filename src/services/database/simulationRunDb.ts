import { Collection, Db } from 'mongodb';
import { SimulationRun, SimulationRunMethods } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function simulationRunDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<SimulationRunMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new SimulationRunDb(collection); 
    return undefined; 
}

class SimulationRunDb implements SimulationRunMethods {
    _dbCollection: Collection; 
    
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    
    async getSimulationRuns(keys: string[]): Promise<SimulationRun[]> {
        const query = { key: { $in: keys } };
        const projection = { key: 1, finalRun: 1 };
        return (this._dbCollection.find(query).project(projection).toArray() as unknown as SimulationRun[]);
    }
}

