import { Collection, Db, InsertOneResult, UpdateResult } from 'mongodb';
import { FortyForFortyGame, FortyForFortyGameMethods, FortyForFortyGameMode } from '../../types/types';
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

    async updateLeaderboardName(gameId: string, leaderboardName: string): Promise<UpdateResult> {
        const filter = { gameId };
        const updateDoc = { $set: { leaderboardName } };
        return this._dbCollection.updateOne(filter, updateDoc);
    }

    private namedGamesFilter(gameMode?: FortyForFortyGameMode, sinceMs?: number) {
        const query: {
            leaderboardName: { $exists: true; $ne: string };
            gameMode?: FortyForFortyGameMode;
            gameId?: { $gte: string };
        } = {
            leaderboardName: { $exists: true, $ne: 'not_set' }
        };
        if (gameMode) query.gameMode = gameMode;
        // gameId encodes creation time as game_${Date.now()}_...
        if (sinceMs !== undefined) query.gameId = { $gte: `game_${sinceMs}_` };
        return query;
    }

    async getRecentNamedGames(gameMode: FortyForFortyGameMode | undefined, limit: number, offset: number): Promise<FortyForFortyGame[]> {
        const query = this.namedGamesFilter(gameMode);
        return this._dbCollection
            .find(query)
            .sort({ gameId: -1 })
            .skip(offset)
            .limit(limit)
            .toArray() as unknown as FortyForFortyGame[];
    }

    async getTopGamesThisWeek(gameMode: FortyForFortyGameMode | undefined, limit: number, offset: number): Promise<FortyForFortyGame[]> {
        const weekAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const query = this.namedGamesFilter(gameMode, weekAgoMs);
        return this._dbCollection
            .find(query)
            .sort({ totalPoints: -1, gameId: -1 })
            .skip(offset)
            .limit(limit)
            .toArray() as unknown as FortyForFortyGame[];
    }

    async getTopGamesAllTime(gameMode: FortyForFortyGameMode | undefined, limit: number, offset: number): Promise<FortyForFortyGame[]> {
        const query = this.namedGamesFilter(gameMode);
        return this._dbCollection
            .find(query)
            .sort({ totalPoints: -1, gameId: -1 })
            .skip(offset)
            .limit(limit)
            .toArray() as unknown as FortyForFortyGame[];
    }

    async countCompleteGames(): Promise<number> {
        return this._dbCollection.countDocuments({});
    }
}
