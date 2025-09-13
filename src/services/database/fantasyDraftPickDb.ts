import { Collection, Db, InsertOneResult, DeleteResult } from 'mongodb';
import { FantasyDraftPick, FantasyDraftPickMethods } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function fantasyDraftPickDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<FantasyDraftPickMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new FantasyDraftPickDb(collection); 
    return undefined; 
}

class FantasyDraftPickDb implements FantasyDraftPickMethods {
    _dbCollection: Collection; 
    
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    
    async deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        const query = { gameId: gameId };
        return this._dbCollection.deleteMany(query);
    }

    async getFantasyDraftPicks(gameId: string): Promise<FantasyDraftPick[]> {
        const query = { gameId: gameId };
        return (this._dbCollection.find(query).sort({draftPick: 1}).toArray() as unknown as FantasyDraftPick[]);
    }

    async insertDraftPick(draftPick: FantasyDraftPick): Promise<InsertOneResult> {
        return this._dbCollection.insertOne(draftPick);
    }

}
