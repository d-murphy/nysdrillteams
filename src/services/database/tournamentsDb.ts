import { Collection, Db, ObjectId } from 'mongodb';
import { TournamentsData, Tournament, tournamentDbResp, TournamentW_id } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function tournamentsDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<TournamentsData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    let lastIdDoc = await (collection?.find().sort({id:-1}).limit(1).toArray() as unknown as Tournament[])
    console.log('Current highest tournament id: ', lastIdDoc[0].id)
    if(collection) return new TournamentsDb(collection, lastIdDoc[0].id); 
    return undefined; 
}


class TournamentsDb implements TournamentsData{
    _dbCollection: Collection; 
    _lastId: number; 
    constructor(collection: Collection, lastId: number) {
        this._dbCollection = collection;
        this._lastId = lastId; 
    }
    async insertTournament(newTournament: Tournament): Promise<tournamentDbResp> {        
        let result; 
        let docToInsert: TournamentW_id = newTournament; 
        docToInsert._id = new ObjectId;  
        this._lastId++; 
        docToInsert.id = this._lastId;  
        try {
            result = await this._dbCollection.insertOne(docToInsert); 
        } catch (e) {
            console.log("Error inserting document: ", e); 
        }
        if(result) return { result: true, tournament: docToInsert } 
        return {result: false, tournament: docToInsert }

    }
    async deleteTournament(tournamentId: number): Promise<boolean> {
        const query = { _id: new ObjectId(tournamentId) };
        let result; 
        try {
            result = await this._dbCollection.deleteOne(query);
        } catch (e) {
            console.log('Error deleting document'); 
        }
        if(result) return result.deletedCount == 1 ? true : false; 
        return false;  
        
    }
    async updateTournament(tournamentId:string, fieldsToUpdate: {}): Promise<boolean> {
        const filter = { _id: new ObjectId(tournamentId) };
        const updateDoc = {
            $set: fieldsToUpdate,
        };
        let result; 
        try {  
            result = await this._dbCollection.updateOne(filter, updateDoc);    
        } catch (e) {
            console.log('There was an error updating document id: ', tournamentId);          
        }
        if(result) return result.acknowledged && result.modifiedCount == 1 ? true : false; 
        return false; 
    }
    async getTournament(tournamentId: number): Promise<Tournament | undefined> {
        const query = { id: tournamentId };
        let result:Tournament | undefined = undefined; 
        try {
            result = await (this._dbCollection.findOne(query)) as unknown as Tournament; 
        } catch (e) {
            console.log ("There was an error retrieving document: ", tournamentId); 
        }
        if(result) return result;
        return undefined;         
    }
    async getFilteredTournaments(years?: number[], tracks?: string[], tournaments?: string[]): Promise<Tournament[]> {
        let query: {
            track?:{}, 
            name?:{}, 
            year?:{}, 
        } = {};
        if(years && years.length) query.year = {$in : years};
        if(tracks && tracks.length) query.track = {$in : tracks};
        if(tournaments && tournaments.length) query.name = {$in : tournaments};
        let result; 
        try {
            result = (await this._dbCollection.find(query).toArray() as unknown as Tournament[]); 
        } catch (e) {
            console.log ("There was an error in the getFilteredTournaments function with query: ", query); 
        }
        if(result) return result; 
        return []; 
    }
    async getTournsCtByYear():Promise<{_id: number, yearCount: number}[]> {
        let result: {_id: number, yearCount: number}[] | undefined = undefined;  
        try {
            result = (await this._dbCollection.aggregate(
                [
                    {
                        $group: {
                            _id: "$year",
                            yearCount: {
                                $count: {}
                            }
                        }
                    }, 
                    { $sort: { _id: -1 } }
                ]
            ).toArray() as unknown as {_id: number, yearCount: number}[])
        } catch(e){
            console.log('Error retrieving big 8: ', e); 
        }
        if(!result) return []
        return result; 
    }
}