import { Collection, Db, ObjectId } from 'mongodb';
import { TeamData, Team, teamDbResp } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function teamsDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<TeamData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new TeamsDb(collection); 
    return undefined; 
}


class TeamsDb implements TeamData{
    _dbCollection: Collection; 
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    async insertTeam(newTeam:Team): Promise<teamDbResp> {
        let result; 
        try {
            result = await this._dbCollection.insertOne(newTeam); 
        } catch (e) {
            console.log("Error inserting document: ", e); 
        }
        if(result) return { result: true, team: newTeam } 
        return {result: false, team: newTeam }

    }
    async deleteTeam(teamId:string): Promise<boolean> {
        const query = { _id: new ObjectId(teamId) };
        let result; 
        try {
            result = await this._dbCollection.deleteOne(query);
        } catch (e) {
            console.log('Error deleting document'); 
        }
        if(result) return result.deletedCount == 1 ? true : false; 
        return false;  
    } 
    async updateTeam(teamId:string, fieldsToUpdate: {}):Promise<boolean> {
        const filter = { _id: new ObjectId(teamId) };
        const updateDoc = {
            $set: fieldsToUpdate,
        };
        let result; 
        try {  
            result = await this._dbCollection.updateOne(filter, updateDoc);    
            console.log('db result: ', result);      
        } catch (e) {
            console.log('There was an error updating document id: ', teamId);          
        }
        if(result) return result.acknowledged && result.modifiedCount == 1 ? true : false; 
        return false; 
    } 
    async getTeam(teamId:number):Promise<Team | undefined> {
        const query = { _id: new ObjectId(teamId) };
        let result:Team | undefined = undefined; 
        try {
            result = await (this._dbCollection.findOne(query)) as unknown as Team; 
        } catch (e) {
            console.log ("There was an error retrieving document: ", teamId); 
        }
        if(result) return result;
        return undefined; 

    } 
    async getTeams():Promise<Team[]> {
        let result: Team[] | undefined; 
        try {
            result = await (this._dbCollection.find().toArray()) as unknown as Team[]
        } catch (e) {
            console.log("There was an error retrieving the teams list")
        }
        if(result) return result; 
        return []; 
    }
}