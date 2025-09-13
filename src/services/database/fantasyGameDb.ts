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
    
    async createFantasyGame(gameId: string, user: string, gameType: 'one-team' | '8-team' | '8-team-no-repeat', countAgainstRecord: boolean, secondsPerPick: number): Promise<FantasyGame> {
        const newGame: FantasyGame = {
            gameId: gameId,
            status: 'stage',
            gameType: gameType,
            countAgainstRecord: countAgainstRecord,
            users: [user],
            simulationIndex: [],
            secondsPerPick: secondsPerPick
        };
        
        await this._dbCollection.insertOne(newGame);
        return newGame;
    }

    async deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        const query = { gameId: gameId };
        return this._dbCollection.deleteOne(query);
    }

    async addUsersToFantasyGame(gameId: string, users: string[]): Promise<UpdateResult> {
        const filter = { gameId: gameId };
        const updateDoc = {
            $addToSet: { users: { $each: users } }
        };
        return this._dbCollection.updateOne(filter, updateDoc);
    }

    async getFantasyGame(gameId: string): Promise<FantasyGame> {
        const query = { gameId: gameId };
        return (this._dbCollection.findOne(query) as unknown as FantasyGame);
    }

    async getFantasyGames(user: string, limit: number, offset: number): Promise<FantasyGame[]> {
        const query = { users: user };
        return (this._dbCollection.find(query).skip(offset).limit(limit).toArray() as unknown as FantasyGame[]);
    }

}
