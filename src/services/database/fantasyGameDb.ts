import { Collection, Db, DeleteResult, UpdateResult } from 'mongodb';
import { FantasyGame, FantasyGameMethods } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function fantasyGameDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<FantasyGameMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new FantasyGameDb(collection); 
    return undefined; 
}

class FantasyGameDb implements FantasyGameMethods {
    _dbCollection: Collection; 
    
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    
    async createFantasyGame(
        gameId: string, user: string, 
        gameType: 'one-team' | '8-team' | '8-team-no-repeat', 
        countAgainstRecord: boolean, 
        secondsPerPick: number,
        tournamentCt: number, 
        users: string[],
        simulationIndex: number[],
        name: string
    ): Promise<FantasyGame> {
        const newGame: FantasyGame = {
            gameId: gameId,
            status: 'stage',
            gameType: gameType,
            countAgainstRecord: countAgainstRecord,
            users: users,
            simulationIndex: simulationIndex,
            secondsPerPick: secondsPerPick,
            tournamentCt: tournamentCt,
            created: new Date(), 
            name: name
        };
        
        await this._dbCollection.insertOne(newGame);
        return newGame;
    }

    async deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        const query = { gameId: gameId };
        return this._dbCollection.deleteOne(query);
    }

    async updateFantasyGameState(gameId: string, state: 'draft' | 'complete', users?: string[]): Promise<UpdateResult> {
        const filter = { gameId: gameId };        
        const updateDoc: { $set: { status: string, users?: string[], completed?: Date } } = {
            $set: { status: state }
        };
        if(state === 'complete') updateDoc.$set.completed = new Date();
        if(users) updateDoc.$set.users = users;
        return this._dbCollection.updateOne(filter, updateDoc);
    }

    async addUsersToFantasyGame(gameId: string, users: string[]): Promise<UpdateResult> {
        const filter = { gameId: gameId };
        const updateDoc = {
            $set: { users: users }
        };
        return this._dbCollection.updateOne(filter, updateDoc);
    }

    async getFantasyGame(gameId: string): Promise<FantasyGame> {
        const query = { gameId: gameId };
        const result = ( await this._dbCollection.findOne(query) as unknown as FantasyGame);
        return result;
    }

    async getFantasyGames(user: string | null, state: 'stage' | 'stage-draft' | 'draft' | 'complete' | null, limit: number, offset: number): Promise<FantasyGame[]> {
        const query: { users?: string, status?: 'stage' | 'stage-draft' | 'draft' | 'complete' } = {};
        if(user) query.users = user;
        if(state) query.status = state;
        const sort: { [key: string]: 1 | -1 } = { created: -1 };
        return (this._dbCollection.find(query).skip(offset).limit(limit).sort(sort).toArray() as unknown as FantasyGame[]);
    }

    async getOpenFantasyGames(limit: number, offset: number, state: 'stage' | 'stage-draft' | 'draft' | 'complete'): Promise<FantasyGame[]> {
        const query = { 
            status: state, 
            created: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 6) }
        };
        return (this._dbCollection.find(query).skip(offset).limit(limit).toArray() as unknown as FantasyGame[]);
    }
}
