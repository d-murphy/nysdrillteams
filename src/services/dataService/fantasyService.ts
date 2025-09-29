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

    public updateFantasyGameState(gameId: string, state: 'stage-draft' | 'draft' | 'complete', users?: string[]): Promise<UpdateResult> {

        if(state === 'stage-draft' && !users) {
            return Promise.reject(new Error('Users are required when state is stage-draft'));
        }

        if(state === 'stage-draft' && users){
            users.sort(() => Math.random() - 0.5);
            users = users?.map((el, index) => el === "autodraft" ? `autodraft-${index}` : el);
        }
        return this.fantasyGameDataSource.updateFantasyGameState(gameId, state, users); 
    }

    public async addUsersToFantasyGame(gameId: string, users: string[]): Promise<UpdateResult> {
        const game = await this.fantasyGameDataSource.getFantasyGame(gameId);
        const currentUsers = game.users;
        const firstAutoDraftIndex = currentUsers.map(el => el.split("-")[0]).indexOf("autodraft");
        const newUsers = [...currentUsers.slice(0, firstAutoDraftIndex), ...users, ...currentUsers.slice(firstAutoDraftIndex + users.length)];
        return this.fantasyGameDataSource.addUsersToFantasyGame(gameId, newUsers); 
    }

    public getFantasyGame(gameId: string): Promise<FantasyGame> {
        return this.fantasyGameDataSource.getFantasyGame(gameId); 
    }

    public getFantasyGames(user: string, limit: number, offset: number): Promise<FantasyGame[]> {
        return this.fantasyGameDataSource.getFantasyGames(user, limit, offset); 
    }
}
    
export default FantasyService;
