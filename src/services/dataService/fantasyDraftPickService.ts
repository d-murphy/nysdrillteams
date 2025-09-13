import { InsertOneResult, DeleteResult } from 'mongodb'
import { FantasyDraftPickMethods, FantasyDraftPick } from '../../types/types'

class FantasyDraftPickService {

    constructor (
        private fantasyDraftPickDataSource: FantasyDraftPickMethods
    ){}

    public getFantasyDraftPicks(gameId: string): Promise<FantasyDraftPick[]> {
        return this.fantasyDraftPickDataSource.getFantasyDraftPicks(gameId); 
    }

    public insertDraftPick(draftPick: FantasyDraftPick): Promise<InsertOneResult> {
        return this.fantasyDraftPickDataSource.insertDraftPick(draftPick); 
    }


    public deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        return this.fantasyDraftPickDataSource.deleteFantasyGame(gameId); 
    }
}
    
export default FantasyDraftPickService;
