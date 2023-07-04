import { Collection, Db, DeleteResult, InsertOneResult, UpdateResult, ObjectId } from 'mongodb';
import { TeamData, Team, SimilarTeam } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function teamsDbFactory(dbPromise: Promise<Db>, collectionName: string, similarTeamsCollectionName: string):Promise<TeamData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    let similarTeamsCollection = await getCollectionPromise(dbPromise, similarTeamsCollectionName); 
    if(collection && similarTeamsCollection) return new TeamsDb(collection, similarTeamsCollection); 
    return undefined; 
}


class TeamsDb implements TeamData{
    _dbCollection: Collection; 
    _similarTeamsCollection: Collection; 
    constructor(collection: Collection, similarTeamsCollection: Collection) {
        this._dbCollection = collection; 
        this._similarTeamsCollection = similarTeamsCollection; 
    }
    async insertTeam(newTeam:Team): Promise<InsertOneResult> {
        return this._dbCollection.insertOne(newTeam); 
    }
    async deleteTeam(teamId:string): Promise<DeleteResult> {
        const query = { _id: new ObjectId(teamId) };
        return this._dbCollection.deleteOne(query);
    } 
    async updateTeam(teamId:string, fieldsToUpdate: {}):Promise<UpdateResult> {
        const filter = { _id: new ObjectId(teamId) };
        const updateDoc = {
            $set: fieldsToUpdate,
        };
        return this._dbCollection.updateOne(filter, updateDoc);    
    } 
    async getTeam(teamId:number):Promise<Team | undefined> {
        const query = { _id: new ObjectId(teamId) };
        return (this._dbCollection.findOne(query)) as unknown as Team; 
    } 
    async getTeams():Promise<Team[]> {
        return (this._dbCollection.find().toArray()) as unknown as Team[]
    }
    async getSimilarTeams(team: string, year: number): Promise<SimilarTeam[]> {
        const query = {team: team, year: year}; 
        return (this._similarTeamsCollection.find(query)).toArray() as unknown as SimilarTeam[]; 
    }
}