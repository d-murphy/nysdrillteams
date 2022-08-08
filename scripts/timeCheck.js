const fs = require('fs'); 
const dotenv = require('dotenv'); 
const { getDbPromise, getCollectionPromise } = require('../dist/services/database/db')

dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 


(async function(){
    const dbConnectionStr =
        `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
    const dbPromise = await getDbPromise(dbConnectionStr, DB_NAME);
    const collection = await getCollectionPromise(dbPromise, 'runs'); 

    await searchWTime(collection, {"team": "Central Islip Hoboes", "year": 2022, "contest": "Three Man Ladder"})
    // await searchWTime(collection, {"tournamentId": "488"})
    // await testAgg(collection); 

})()


async function searchWTime(collection, searchObj){
    let startTime = new Date(); 
    let result = await collection.find(searchObj).toArray(); 
    let endTime = new Date(); 
    console.log('seconds: ', (endTime - startTime) / 1000)
    console.log('num of runs:', result.length)
    console.log(result)
}
let year = 2012
async function testAgg(collection){
    let startTime = new Date(); 
    let result = await collection.aggregate(
        [
            {
                $match: {
                    year: year, 
                    contest: { $in: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"] }, 
                    timeNum: { $ne: NaN }
                },
            },
            { $sort: { "timeNum": 1} }, 
            {
                $group: {
                    _id: "$contest",
                    "matched_doc": { "$first": "$$ROOT" }                     
                 }
            }
        ]
).toArray(); 
    console.log(result); 
    let endTime = new Date(); 
    console.log('seconds: ', (endTime - startTime) / 1000)
}