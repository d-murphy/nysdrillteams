import { DeleteResult, UpdateResult } from 'mongodb'
import { FantasyGameMethods, FantasyGame } from '../../types/types'

class FantasyService {

    constructor (
        private fantasyGameDataSource: FantasyGameMethods
    ){}

    public createFantasyGame(user: string, gameType: 'one-team' | '8-team' | '8-team-no-repeat', countAgainstRecord: boolean, secondsPerPick: number): Promise<FantasyGame> {
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return this.fantasyGameDataSource.createFantasyGame(gameId, user, gameType, countAgainstRecord, secondsPerPick); 
    }

    public deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        return this.fantasyGameDataSource.deleteFantasyGame(gameId); 
    }

    public addUsersToFantasyGame(gameId: string, users: string[]): Promise<UpdateResult> {
        return this.fantasyGameDataSource.addUsersToFantasyGame(gameId, users); 
    }

    public getFantasyGame(gameId: string): Promise<FantasyGame> {
        return this.fantasyGameDataSource.getFantasyGame(gameId); 
    }

    public getFantasyGames(user: string, limit: number, offset: number): Promise<FantasyGame[]> {
        return this.fantasyGameDataSource.getFantasyGames(user, limit, offset); 
    }
}
    
export default FantasyService;
