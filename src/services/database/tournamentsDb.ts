import { Collection, Db, DeleteResult, InsertOneResult, ObjectId, UpdateResult } from 'mongodb';
import { TournamentsData, Tournament, TournamentW_id, FinishesReturn } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function tournamentsDbFactory(dbPromise: Promise<Db>, collectionName: string, idTrackerCollectionName: string):Promise<TournamentsData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    let idTrackerCollection = await getCollectionPromise(dbPromise, idTrackerCollectionName); 
    if(collection && idTrackerCollection) return new TournamentsDb(collection, idTrackerCollection); 
    return undefined; 
}


class TournamentsDb implements TournamentsData{
    _dbCollection: Collection; 
    _idTrackerCollection: Collection; 
    constructor(collection: Collection, idTrackerCollection: Collection) {
        this._dbCollection = collection;
        this._idTrackerCollection = idTrackerCollection; 
    }
    async insertTournament(newTournament: Tournament): Promise<InsertOneResult> {        
        let docToInsert: TournamentW_id = newTournament; 
        docToInsert._id = new ObjectId;  

        const result = await this._idTrackerCollection.findOneAndUpdate(
            {name: 'tournament id'}, 
            { $inc: { idCounter: 1 }}, 
            {returnDocument: 'after'}
        ); 
        const document = result.value as unknown as {idCounter: number}; 
        docToInsert.id = document.idCounter;   
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
    async getHostNames():Promise<{_id: string, nameCount:number}[]>{
        return this._dbCollection.aggregate(
            [
                {
                    $group: {
                        _id: "$host",
                        nameCount: {
                            $count: {}
                        }
                    }
                }, 
                { $sort: { _id: 1 } }
            ]
        ).toArray() as unknown as {_id: string, nameCount:number}[]
    }

    async getFinishes(team: string, years?: number[]){
        let query: {
            year?:{}, 
        } = {};
        if(years && years.length) query.year = {$in : years};

        return this._dbCollection.aggregate(
            [
                {
                    $match: query
                }, 
                {
                    $unwind:
                    {
                      path: "$top5",
                      includeArrayIndex: "tournamentFinishArrInd",
                      preserveNullAndEmptyArrays: false
                    }
                },
                {
                    $match: {"top5.teamName": team}
                }, 
                {
                    $project: {
                        _id: 1, 
                        id: 1, 
                        name: 1, 
                        year: 1, 
                        date: 1, 
                        track: 1, 
                        top5: 1, 
                        host: 1
                    }
                }

            ]
        ).toArray() as unknown as FinishesReturn[]
    }
    // this type is wrong

    async getTournsTop5(team:string):Promise<{name: string, id: number, date: Date, track: string, top5: {teamName: string, finishingPosition: string, points: number}}[]>
    {
    const query = {  "top5.teamName" : team }; 
    return this._dbCollection.aggregate(
        [
            {
                $unwind: "$top5"
            }, 
            {
                $match: query
            }, 
            {
                $project: {
                    name: 1, 
                    id: 1, 
                    date: 1, 
                    track: 1, 
                    top5: 1
                }
            }
        ]
    ).toArray() as unknown as {name: string, id: number, date: Date, track: string, top5: {teamName: string, finishingPosition: string, points: number}}[]
}
    async getTournsAppearing(team: string): Promise<{name: string, id: number, date: Date, track: string, runningOrder: { k:string, v: string }}[]> {
        const query = { "runningOrder.v": team }; 
        return this._dbCollection.aggregate(
            [
                {
                    $project: {
                        name: 1, 
                        id: 1, 
                        date: 1, 
                        track: 1, 
                        runningOrder: { $objectToArray: "$runningOrder" }     
                    }
                }, 
                {
                    $unwind: {
                        path: "$runningOrder",
                    }
                }, 
                {
                    $match: query
                }, 
            ]
        ).toArray() as unknown as {name: string, id: number, date: Date, track: string, runningOrder: { k:string, v: string }}[]
    }



}