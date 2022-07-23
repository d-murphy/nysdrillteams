import {MongoClient, Db, Collection} from 'mongodb'; 

const getDbPromise = (uri:string, dbName:string):Promise<Db> => {

    return new Promise(async (res,rej)=>{
        try {
            const client = new MongoClient(uri);
            await client.connect();
            res(client.db(dbName)); 
        } catch (err) {
            console.error('MongoDB connection failed: ', err);
            rej(null); 
        }
    
    }) 
}

const getCollectionPromise = async (dbPromise:Promise<Db | null>, collectionName:string): Promise<Collection | null> => {
    let db = await dbPromise; 
    if(db){
        return db.collection(collectionName); 
    }   
    return null; 
}

export { getDbPromise, getCollectionPromise }

