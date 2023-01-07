import { Collection, Db, DeleteResult, InsertOneResult, ObjectId, UpdateResult } from 'mongodb';
import { TournamentsData, Tournament, TournamentW_id } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function tournamentsDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<TournamentsData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    let lastIdDoc = await (collection?.find()
            .sort({id:-1})
            .collation( {locale: 'en_US',  numericOrdering: true}).limit(1).toArray() as unknown as Tournament[])
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
    async insertTournament(newTournament: Tournament): Promise<InsertOneResult> {        
        let docToInsert: TournamentW_id = newTournament; 
        docToInsert._id = new ObjectId;  
        this._lastId++; 
        docToInsert.id = this._lastId;   
        return this._dbCollection.insertOne(docToInsert);
    }
    async deleteTournament(tournamentId: string): Promise<DeleteResult> {
        const query = { _id: new ObjectId(tournamentId) };
        return this._dbCollection.deleteOne(query);
    }
    async updateTournament(tournamentId:string, fieldsToUpdate: {}): Promise<UpdateResult> {
        const filter = { _id: new ObjectId(tournamentId) };
        const updateDoc = {
            $set: fieldsToUpdate,
        };
        return this._dbCollection.updateOne(filter, updateDoc);    
    }
    async getTournament(tournamentId: number): Promise<Tournament | undefined> {
        const query = { id: tournamentId };
        return (this._dbCollection.findOne(query)) as unknown as Tournament; 
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
        return (this._dbCollection.find(query).toArray() as unknown as Tournament[]); 
    }
    async getTournsCtByYear():Promise<{_id: number, yearCount: number}[]> {
        return this._dbCollection.aggregate(
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
        ).toArray() as unknown as {_id: number, yearCount: number}[]
    }
    async getTournamentNames():Promise<{_id: string, nameCount:number}[]>{
        return this._dbCollection.aggregate(
            [
                {
                    $group: {
                        _id: "$name",
                        nameCount: {
                            $count: {}
                        }
                    }
                }, 
                { $sort: { _id: 1 } }
            ]
        ).toArray() as unknown as {_id: string, nameCount:number}[]
    }
}