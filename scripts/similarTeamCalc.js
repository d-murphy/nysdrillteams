const dotenv = require('dotenv'); 
const { getDbPromise, getCollectionPromise } = require('../dist/library/db')

dotenv.config(); 
let { DB_NAME, dbUn, dbPass } = process.env; 

const INCLUDE_UP_TO = 2023; 
const YEAR_DIF_DENOM = INCLUDE_UP_TO - 1960
const YEAR_START = 1950;

const contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]; 
const years = Array(300).fill().map((x,i)=>i + YEAR_START).filter(el => el <= INCLUDE_UP_TO); 

const greatRunCutoffs = {
    "Three Man Ladder": 6.30, 
    "B Ladder": 5.2, 
    "C Ladder": 8.9, 
    "C Hose": 12.5, 
    "B Hose": 7.85, 
    "Efficiency": 9, 
    "Motor Pump": 5.75, 
    "Buckets": 21
}

const goodRunCutoffs = {
    "Three Man Ladder": 6.75, 
    "B Ladder": 5.55, 
    "C Ladder": 9.4, 
    "C Hose": 13.1, 
    "B Hose": 8.4, 
    "Efficiency": 9.6, 
    "Motor Pump": 6.4, 
    "Buckets": 23
}

const okayRunCutoffs = {
    "Three Man Ladder": 7.2, 
    "B Ladder": 6.2, 
    "C Ladder": 10.2, 
    "C Hose": 15, 
    "B Hose": 10, 
    "Efficiency": 10.5, 
    "Motor Pump": 9, 
    "Buckets": 28
}

let results = []; 

(async function(){
    // await calculateMtxScores(); 
    await findNeighbors(); 
})()


async function findNeighbors(){
    const similarTeamsMtxCol = await getCollection("similarTeamsMtx"); 
    const similarTeamsMtx = await similarTeamsMtxCol.find({}).toArray(); 
    console.log('len of similarTeamsMtx: ', similarTeamsMtx.length); 

    let forSorting = []; 

    for(let i=0; i<similarTeamsMtx.length; i++){
        for(let j=0; j<similarTeamsMtx.length; j++){
            if(i === j) continue; 
            const distance = calcDistance(similarTeamsMtx[i], similarTeamsMtx[j]); 
            forSorting.push({
                team: similarTeamsMtx[i].team, 
                year: similarTeamsMtx[i].year,
                otherTeam: similarTeamsMtx[j].team, 
                otherYear: similarTeamsMtx[j].year, 
                distance: distance 
            })
        }
        i % 20 === 0 ? console.log('finished i: ', i) : null; 
    }
    forSorting.sort((a,b) => {
        return a.team === b.team ? a.distance < b.distance ? -1 : 1 : 
            a.team < b.team ? -1 : 1; 
    })
    const counter = {}; 
    forSorting = forSorting.filter(el => {
        const key = `${el.team}-${el.year}`
        if(!counter[key]) counter[key] = 0; 
        counter[key] ++
        return counter[key] <= 15
    })
   console.log('forSorting len: ', forSorting.length); 
   writeFullCollection('similarTeamsDist', forSorting)
}

function calcDistance(year1, year2){
    let sumBeforeSqRt = 0; 
    sumBeforeSqRt += ((year1.year - year2.year) * 2 / YEAR_DIF_DENOM) ** 2; 
    contests.forEach(contest => {
//        sumBeforeSqRt += (year1[`${contest}-PtsPct`] - year2[`${contest}-PtsPct`]) ** 2; 
        sumBeforeSqRt += (year1[`${contest}-GreatPct`] - year2[`${contest}-GreatPct`]) ** 2; 
        sumBeforeSqRt += (year1[`${contest}-GoodPct`] - year2[`${contest}-GoodPct`]) ** 2; 
        sumBeforeSqRt += (year1[`${contest}-OkayPct`] - year2[`${contest}-OkayPct`]) ** 2; 
    })
    return Math.sqrt(sumBeforeSqRt); 
}

async function calculateMtxScores(){
    console.log('Process start'); 
    const runsCol = await getCollection("runs"); 
    const teamsCol = await getCollection("teams"); 
    const teams = await getTeams(teamsCol); 
    console.log('teams acquired - len: ', teams.length); 

    for(let i=0; i<teams.length; i++){
        const team = teams[i]; 
        const rnCt = await runsCol.find({team: team}).count(); 
        if(rnCt <=100) continue; 
        for(let j=0; j<years.length; j++){
            const year = years[j]; 
            console.log('calling runs on : ', team, year); 
            const runs = await getRuns(runsCol, team, year); 

            const entry = {
                team: team, 
                year: year, 
                numRuns: Math.min(1, runs.length / 100), 
                key: `${team}-${year}`
            }
            contests.forEach(contest => {
                const contestRuns = runs.filter(el => el.contest === contest); 
                entry[`${contest}-Ct`] = contestRuns.length; 
                entry[`${contest}-PtsPct`] = 0; 
                contestRuns.forEach(el => {
                    entry[`${contest}-PtsPct`] += parseFloat(el.points) || 0; 
                }) 
                entry[`${contest}-PtsPct`] = !entry[`${contest}-Ct`] ? 0 : entry[`${contest}-PtsPct`] / (entry[`${contest}-Ct`] * 5); 
                const greatRuns = contestRuns.filter(el => parseFloat(el.timeNum) <= greatRunCutoffs[contest]); 
                entry[`${contest}-GreatPct`] = !contestRuns.length ? 0 : greatRuns.length / contestRuns.length; 
                const goodRuns = contestRuns.filter(el => parseFloat(el.timeNum) <= goodRunCutoffs[contest]); 
                entry[`${contest}-GoodPct`] = !contestRuns.length ? 0 : goodRuns.length / contestRuns.length; 
                const okayRuns = contestRuns.filter(el => parseFloat(el.timeNum) <= okayRunCutoffs[contest]); 
                entry[`${contest}-OkayPct`] = !contestRuns.length ? 0 : okayRuns.length / contestRuns.length; 
            })
            results.push(entry); 

        }
    }

    results = results.filter(el => el.numRuns >= .4); 
    console.log('results len: ',  results); 
    const writeResult = await addDocsToCollection('similarTeamsMtx', results)
    console.log('write result: ', writeResult); 
}



async function getTeams(teamsCol){
    let teams = await teamsCol.find({$or: [{circuit: 'Northern'}, {circuit: 'Suffolk'}, {circuit: 'Nassau'}, {circuit: 'Western'}]}).project({ fullName: 1, _id: 0 }).toArray(); 
    teams = teams.map(el => el.fullName); 
    return teams; 
}

async function getRuns(runsCol, team, year){
    return await runsCol.find({
        team: team, 
        year: year, 
        time: { $nin: ['NA', 'NULL'] }
    })
    .project({timeNum: 1, points: 1, contest: 1}).toArray(); 
}




async function getCollection(collectionName){
    const dbConnectionStr =
        `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
    const dbPromise = await getDbPromise(dbConnectionStr, DB_NAME);
    const collection = await getCollectionPromise(dbPromise, collectionName); 
    return collection; 
}

async function addDocsToCollection(collectionName, documents){
    let collection = await getCollection(collectionName); 
    let result; 
    try {
        console.log('starting write to db: '); 
        result = await collection.insertMany(documents)
        console.log('write to db finished: ', result);
    } catch(e) {
        console.log('error during db write: ', e); 
    }
    return result; 
}



async function writeFullCollection(collectionName, documents){
    let tempCollection = await getCollection(`temp-${collectionName}`); 
    let result, renameResult; 
    try {
        console.log('starting write to db: '); 
        result = await tempCollection.insertMany(documents)
        console.log('write to db finished.  Starting rename.');
        renameResult = await tempCollection.rename(collectionName, {dropTarget: true})
        console.log('rename complete.');  
    } catch(e) {
        console.log('error during db write: ', e); 
    }
    return renameResult; 
}
