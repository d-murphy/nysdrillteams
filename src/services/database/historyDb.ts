import { Collection, Db, Document,  } from 'mongodb';
import { TeamTournHistory, HistoryData } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';



export async function historyDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<HistoryDb | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    let tempCollection = await getCollectionPromise(dbPromise, `temp-${collectionName}`)
    if(collection && tempCollection) return new HistoryDb(collection, tempCollection, collectionName); 
    return undefined; 
}


class HistoryDb implements HistoryData{
    _dbCollection: Collection; 
    _tempDbCollection: Collection; 
    _collectionName: string; 

    constructor(collection: Collection, tempCollection: Collection, collectionName: string) {
        this._dbCollection = collection; 
        this._tempDbCollection = tempCollection; 
        this._collectionName = collectionName; 
    }
    async insertHistories(teamHistories: {team: string, histories: TeamTournHistory[]}[]): Promise<boolean> {
        let result = await this._tempDbCollection.insertMany(teamHistories as unknown as Document[]); 
        console.log("Temp histories db write successful.  Starting rename."); 
        const renameResult = await this._tempDbCollection.rename(this._collectionName, {dropTarget: true})
        console.log("Rename complete."); 
        return true; 
    }
    async getHistory(team: string): Promise<{team: string, histories: TeamTournHistory[]}> {
        const query = { team: team };
        return (this._dbCollection.findOne(query)) as unknown as {team: string, histories: TeamTournHistory[]}; 
    }
}