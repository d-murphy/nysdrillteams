import { InsertOneResult, DeleteResult } from 'mongodb'
import { FantasyGameHistoryMethods, FantasyGameHistory } from '../../types/types'

class FantasyGameHistoryService {

    constructor (
        private fantasyGameHistoryDataSource: FantasyGameHistoryMethods
    ){}

    public getFantasyGameHistory(user: string, limit: number, offset: number): Promise<FantasyGameHistory[]> {
        return this.fantasyGameHistoryDataSource.getFantasyGameHistory(user, limit, offset); 
    }

    public insertGameHistory(gameHistory: FantasyGameHistory): Promise<InsertOneResult> {
        return this.fantasyGameHistoryDataSource.insertGameHistory(gameHistory); 
    }


    public getGameHistoryByGameId(gameId: string): Promise<FantasyGameHistory[]> {
        return this.fantasyGameHistoryDataSource.getGameHistoryByGameId(gameId); 
    }

    public deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        return this.fantasyGameHistoryDataSource.deleteFantasyGame(gameId); 
    }

    public getMostGamesPlayed(limit: number, offset: number): Promise<{user: string, gameCount: number}[]> {
        return this.fantasyGameHistoryDataSource.getMostGamesPlayed(limit, offset); 
    }
}
    
export default FantasyGameHistoryService;
