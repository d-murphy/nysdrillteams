import { Collection, Db, InsertOneResult, DeleteResult } from 'mongodb';
import { FantasyGameHistory, FantasyGameHistoryMethods } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function fantasyGameHistoryDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<FantasyGameHistoryMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new FantasyGameHistoryDb(collection); 
    return undefined; 
}

class FantasyGameHistoryDb implements FantasyGameHistoryMethods {
    _dbCollection: Collection; 
    
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    
    async deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        const query = { gameId: gameId };
        return this._dbCollection.deleteMany(query);
    }

    async getFantasyGameHistory(user: string, limit: number, offset: number): Promise<FantasyGameHistory[]> {
        const query = { user: user };
        return (this._dbCollection.find(query).sort({gameId: -1}).skip(offset).limit(limit).toArray() as unknown as FantasyGameHistory[]);
    }

    async insertGameHistory(gameHistory: FantasyGameHistory): Promise<InsertOneResult> {
        return this._dbCollection.insertOne(gameHistory);
    }

    async getGameHistoryByGameId(gameId: string): Promise<FantasyGameHistory[]> {
        const query = { gameId: gameId };
        return (this._dbCollection.find(query).toArray() as unknown as FantasyGameHistory[]);
    }
}
