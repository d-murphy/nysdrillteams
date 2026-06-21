import { Collection, Db, InsertOneResult } from 'mongodb';
import { FortyForFortyGame, FortyForFortyGameMethods } from '../../types/types';
import { getCollectionPromise } from '../../library/db';

export async function fortyForFortyDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<FortyForFortyGameMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName);
    if(collection) return new FortyForFortyDb(collection);
    return undefined;
}

class FortyForFortyDb implements FortyForFortyGameMethods {
    _dbCollection: Collection;

    constructor(collection: Collection) {
        this._dbCollection = collection;
    }

    async insertFortyForFortyGame(game: FortyForFortyGame): Promise<InsertOneResult> {
        return this._dbCollection.insertOne(game as any);
    }

    async getFortyForFortyGame(gameId: string): Promise<FortyForFortyGame | undefined> {
        const query = { gameId };
        const result = await this._dbCollection.findOne(query) as unknown as FortyForFortyGame;
        return result || undefined;
    }
}
