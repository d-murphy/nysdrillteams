import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb'
import { Update, UpdatesData } from '../../types/types'

 class UpdatesService {
    constructor ( private dataSource : UpdatesData ){}
    public insertUpdate(newUpdate: Update ): Promise<InsertOneResult> {
        return this.dataSource.insertUpdate(newUpdate);    
    }
    public getRecent(): Promise<Update[]> {
        return this.dataSource.getRecent();
    }
}
    
export default UpdatesService; 