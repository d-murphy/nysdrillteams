import { Collection, Db, InsertOneResult } from 'mongodb';
import { Update, UpdatesData } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function updatesDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<UpdatesData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new UpdatesDb(collection); 
    return undefined; 
}

class UpdatesDb implements UpdatesData{
    _dbCollection: Collection; 
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    async insertUpdate(newUpdate: Update): Promise<InsertOneResult> {
        return this._dbCollection.insertOne(newUpdate); 
    }
    async getRecent(): Promise<Update[]> {
        return (this._dbCollection.aggregate(
            [
                { $sort: { "_id": -1} }, 
                {
                    $limit: 300
                }
            ]
        ).toArray() as unknown as Update[])
    }
}

