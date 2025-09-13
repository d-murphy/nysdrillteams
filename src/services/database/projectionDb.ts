import { Collection, Db } from 'mongodb';
import { Projection, ProjectionMethods } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function projectionDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<ProjectionMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new ProjectionDb(collection); 
    return undefined; 
}

class ProjectionDb implements ProjectionMethods {
    _dbCollection: Collection; 
    
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    
    async getProjections(year: number): Promise<Projection[]> {
        const query = { year: year };
        return (this._dbCollection.find(query).toArray() as unknown as Projection[]);
    }

    async getAvailableYears(): Promise<number[]> {
        return this._dbCollection.distinct('year') as unknown as number[];
    }
}



