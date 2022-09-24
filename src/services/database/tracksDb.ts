import { Collection, Db, DeleteResult, InsertOneResult, ObjectId, UpdateResult } from 'mongodb';
import { TracksData, Track } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function tracksDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<TracksData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new TracksDb(collection); 
    return undefined; 
}

class TracksDb implements TracksData{
    _dbCollection: Collection; 
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    async insertTrack(newTrack: Track): Promise<InsertOneResult> {
        return this._dbCollection.insertOne(newTrack); 
    }
    async deleteTrack(trackId: string): Promise<DeleteResult> {
        const query = { _id: new ObjectId(trackId) };
        return await this._dbCollection.deleteOne(query);
    } 
    async updateTrack(trackId:string, fieldsToUpdate:{}): Promise<UpdateResult> {
        const filter = { _id: new ObjectId(trackId) };
        const updateDoc = {
            $set: fieldsToUpdate,
        };
        return await this._dbCollection.updateOne(filter, updateDoc);    
    }
    async getTrack(trackId: string): Promise<Track | undefined> {
        const query = { _id: new ObjectId(trackId) };
        return await (this._dbCollection.findOne(query)) as unknown as Track; 
    }
    async getTracks(): Promise<Track[]> {
        let result: Track[] | undefined; 
        return await (this._dbCollection.find().toArray()) as unknown as Track[]
    }
    async getTrackByName(trackName: string): Promise<Track | undefined> {
        const query = { name: trackName };
        return await (this._dbCollection.findOne(query)) as unknown as Track;         
    }
}