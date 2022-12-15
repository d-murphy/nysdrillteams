import { Collection, Db, DeleteResult, InsertOneResult, ObjectId, UpdateResult } from 'mongodb';
import { UsersData, User } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function usersDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<UsersData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new UsersDb(collection); 
    return undefined; 
}

class UsersDb implements UsersData{
    _dbCollection: Collection; 
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    async insertUser(user: User): Promise<InsertOneResult> {
        // encryption occurs in logic layer
        return this._dbCollection.insertOne(user); 
    }
    async deleteUser(userId: number): Promise<DeleteResult> {
        const query = { _id: new ObjectId(userId) };
        return this._dbCollection.deleteOne(query);
    }
    async updateUser(userId: number, role?: string, password?: string): Promise<UpdateResult> {
        const filter = { _id: new ObjectId(userId) };
        const body:{role?:string, password?:string} = {}; 
        if(role) body.role = role; 
        // encryption occurs in logic layer
        if(password) body.password = password; 
        const updateDoc = {
            $set: body,
        };
        return this._dbCollection.updateOne(filter, updateDoc);          
    }
    async getUsers() {
        return (this._dbCollection.find({}).project({ roleArr:1, username: 1 }).toArray() as unknown as User[]); 
    }
    async getUser(username:string): Promise<User | undefined>{
        const query = { username: username };
        return (this._dbCollection.findOne(query) as unknown as User);  
    }
}