import { DeleteResult, UpdateResult } from 'mongodb'
import { FantasyGameMethods, FantasyGame } from '../../types/types'

class FantasyService {

    constructor (
        private fantasyGameDataSource: FantasyGameMethods
    ){}

    public createFantasyGame(
        user: string, gameType: 'one-team' | '8-team' | '8-team-no-repeat', 
        countAgainstRecord: boolean, 
        secondsPerPick: number,
        tournamentCt: number, 
        isSeason: boolean, 
        tournamentSize: number, 
    ): Promise<FantasyGame> {
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const users = [user, ...(new Array(tournamentSize - 1).fill("autodraft"))];
        let simulationIndex = isSeason ? new Array(12).fill(-1) : new Array(1).fill(-1);
        simulationIndex = simulationIndex.map(() => Math.floor(Math.random() * 499));
        return this.fantasyGameDataSource.createFantasyGame(
            gameId, user, gameType, countAgainstRecord, secondsPerPick, 
            tournamentCt, users, simulationIndex); 
    }

    public deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        return this.fantasyGameDataSource.deleteFantasyGame(gameId); 
    }

    public updateFantasyGameState(gameId: string, state: 'draft' | 'complete'): Promise<UpdateResult> {
        return this.fantasyGameDataSource.updateFantasyGameState(gameId, state); 
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
