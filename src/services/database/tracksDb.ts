import { Collection, Db, ObjectId } from 'mongodb';
import { TracksData, Track, trackDbResp } from '../../types/types'; 
import { getCollectionPromise } from './db';

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
    async insertTrack(newTrack: Track): Promise<trackDbResp> {
        let result; 
        try {
            result = await this._dbCollection.insertOne(newTrack); 
        } catch (e) {
            console.log("Error inserting document: ", e); 
        }
        if(result) return { result: true, track: newTrack } 
        return {result: false, track: newTrack }
    }
    async deleteTrack(trackId: string): Promise<boolean> {
        const query = { _id: new ObjectId(trackId) };
        let result; 
        try {
            result = await this._dbCollection.deleteOne(query);
        } catch (e) {
            console.log('Error deleting document'); 
        }
        if(result) return result.deletedCount == 1 ? true : false; 
        return false;     
    } 
    async updateTrack(trackId:string, fieldsToUpdate:{}): Promise<boolean> {
        const filter = { _id: new ObjectId(trackId) };
        const updateDoc = {
            $set: fieldsToUpdate,
        };
        console.log(filter, updateDoc)
        let result; 
        try {  
            result = await this._dbCollection.updateOne(filter, updateDoc);    
        } catch (e) {
            console.log('There was an error updating document id: ', trackId);          
        }
        console.log(result)
        if(result) return result.acknowledged && result.modifiedCount == 1 ? true : false; 
        return false;         
    }
    async getTrack(trackId: string): Promise<Track | undefined> {
        const query = { _id: new ObjectId(trackId) };
        let result:Track | undefined = undefined; 
        try {
            result = await (this._dbCollection.findOne(query)) as unknown as Track; 
        } catch (e) {
            console.log ("There was an error retrieving document: ", trackId); 
        }
        if(result) return result;
        return undefined;         
    }
    async getTracks(): Promise<Track[]> {
        let result: Track[] | undefined; 
        try {
            result = await (this._dbCollection.find().toArray()) as unknown as Track[]
        } catch (e) {
            console.log("There was an error retrieving the teams list")
        }
        if(result) return result; 
        return [];         
    }
    async getTrackByName(trackName: string): Promise<Track | undefined> {
        const query = { name: trackName };
        let result:Track | undefined = undefined; 
        try {
            result = await (this._dbCollection.findOne(query)) as unknown as Track; 
        } catch (e) {
            console.log ("There was an error retrieving document: ", trackName); 
        }
        if(result) return result;
        return undefined;         
        
    }
}