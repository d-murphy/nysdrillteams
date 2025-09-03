const dotenv = require('dotenv'); 
const { getDbPromise, getCollectionPromise } = require('../dist/library/db')
var gaussian = require('gaussian');

dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 


const INCLUDE_UP_TO = 2024; 
const YEAR_START = 1945;

const contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]; 
const years = Array(300).fill().map((x,i)=>i + YEAR_START).filter(el => el <= INCLUDE_UP_TO); 

const goodRunCutoffs = {
    "Three Man Ladder": 6.75, 
    "B Ladder": 5.55, 
    "C Ladder": 9.4, 
    "C Hose": 13.1, 
    "B Hose": 8.4, 
    "Efficiency": 9.6, 
    "Motor Pump": 6.5, 
    "Buckets": 23.5
};

const badRunMean = {
    "Three Man Ladder": 8.2, 
    "B Ladder": 6.8, 
    "C Ladder": 13.2, 
    "C Hose": 17, 
    "B Hose": 12, 
    "Efficiency": 12.5, 
    "Motor Pump": 8.2, 
    "Buckets": 31
};

const badRunSd = {
    "Three Man Ladder": .4, 
    "B Ladder": .4, 
    "C Ladder": .4, 
    "C Hose": .4, 
    "B Hose": .35, 
    "Efficiency": .45, 
    "Motor Pump": .35, 
    "Buckets": 1.75
}

const minRunSd = {
    "Three Man Ladder": .08, 
    "B Ladder": .08, 
    "C Ladder": .1, 
    "C Hose": .18, 
    "B Hose": .14, 
    "Efficiency": .14, 
    "Motor Pump": .15, 
    "Buckets": .25
}

const bestRuns = {
    "Three Man Ladder": 6, 
    "B Ladder": 4.82, 
    "C Ladder": 8.46, 
    "C Hose": 11.82,
    "B Hose": 7.38, 
    "Efficiency": 8.37, 
    "Motor Pump": 5.42, 
    "Buckets": 19.47
};

const numOfSimulations = 500; 



( async function () {
    // await createContestSummaries(); 
    // await createSimulations(true); 

    await calculateNysChampionshipProjections(); 


    // const simulationTeamsCol = await getCollection("simulation-teams"); 
    // const simulationTeams = await simulationTeamsCol.find({}).toArray(); 
    // let mlIndex; 
    // simulationTeams.forEach((el, ind) => {
    //     if(!mlIndex && el.team === "Westbury FD") mlIndex = ind; 
    // })
    // console.log("the ml index: ", mlIndex); 
    // console.log("total len: ", simulationTeams.length); 

})()

async function calculateNysChampionshipProjections(){

    const tournamentCol = await getCollection("tournaments"); 
    const simulationRunsCol = await getCollection("simulation-runs"); 
    const tournaments = await tournamentCol.find({name: "New York State Championship"}).toArray(); 


    const resultArr = []; 

    const goodRunCtr = {}; 
    

    // for(let i=0; i<1; i++){
    for(let i=0; i<tournaments.length; i++){
        const tournament = tournaments[i]; 
        const year = tournament.year; 

        const runningOrder = tournament.runningOrder; 
        const runningOrderArray = Object.values(runningOrder); 

        const simulationTally = {}; 
        runningOrderArray.forEach(el => {
            simulationTally[el] = {
                Overall: {
                    wins: 0, 
                    top5: 0, 
                }
            }
            contests.forEach(contest => {
                simulationTally[el][contest] = {
                    wins: 0, 
                    top5: 0, 
                }
            })
        })

        // for(let j=3; j<5; j++){
        for(let j=0; j<numOfSimulations; j++){
            let tournResult = {}; 
            const simulatedRuns = await simulationRunsCol.find({
                team: {$in: runningOrderArray}, year: year, iteration: j
            }).toArray(); 

            console.log("starting year / iteration: ",  year, " - ", j); 


            for(let k=0; k<contests.length; k++){
                const contest = contests[k]; 
                let contestSimulatedRuns = simulatedRuns.filter(el => el.contest === contest); 

                contestSimulatedRuns = contestSimulatedRuns.sort((a,b) => {
                    let aNum = a.finalRun == "NT" ? 98 : a.finalRun == "OT" ? 97 : a.finalRun;  
                    let bNum = b.finalRun == "NT" ? 98 : b.finalRun == "OT" ? 97 : b.finalRun;  
                    return aNum < bNum ? -1 : 1; 
                })

                const pointsToAward = [5,4,3,2,1]; 
                contestSimulatedRuns = contestSimulatedRuns.map((el, index) => {

                    // if(el.finalRun <= goodRunCutoffs[contest]) {
                    //     if(!goodRunCtr[year]) goodRunCtr[year] = {}; 
                    //     if(!goodRunCtr[year][contest]) goodRunCtr[year][contest] = 0; 
                    //     goodRunCtr[year][contest]++; 
                    // }

                    const points = pointsToAward.shift() || 0; 
                    return {
                        points: points, 
                        isContestWin: points === 5 ? true : false,
                        ...el
                    }
                })

                let runIndex = 0; 
                while(contestSimulatedRuns[runIndex]?.points){
                    const time = contestSimulatedRuns[runIndex].finalRun; 
                    let tiesIndex = runIndex + 1; 
                    let pointsToShare = contestSimulatedRuns[runIndex].points; 
                    const markTieAsWin = contestSimulatedRuns[runIndex].isContestWin; 
                    while(time === contestSimulatedRuns[tiesIndex]?.finalRun){
                        pointsToShare += contestSimulatedRuns[tiesIndex].points; 
                        tiesIndex++
                    }
                    if(tiesIndex === runIndex + 1) {
                        runIndex++; 
                        continue; 
                    }
                    pointsToShare = Math.floor((pointsToShare / (tiesIndex - runIndex)) * 100) / 100; 

                    contestSimulatedRuns[runIndex].points = pointsToShare; 
                    contestSimulatedRuns[runIndex].isContestWin = markTieAsWin; 
                    tiesIndex--; 
                    while(tiesIndex - runIndex !== 0){
                        contestSimulatedRuns[tiesIndex].points = pointsToShare; 
                        contestSimulatedRuns[tiesIndex].isContestWin = markTieAsWin; 
                        tiesIndex--; 
                    }

                    runIndex++; 
                }

                contestSimulatedRuns.forEach(el => {
                    if(el.points) {
                        simulationTally[el.team][contest].top5++; 
                    }
                    if(el.isContestWin) {
                        simulationTally[el.team][contest].wins++; 
                    }
                })
                
                contestSimulatedRuns.forEach((el) => {
                    if(!tournResult[el.team]) {
                        tournResult[el.team] = 0; 
                    } 
                    tournResult[el.team] += el.points; 
                }); 
                                

                // console.log("contestSimulatedRuns: ", contest, " - ", year, " - ", 
                //     contestSimulatedRuns.slice(0, 10).map(el => `${el.team} - ${el.finalRun} - ${el.points}`)); 
                
            }

            const tournResultArray = Object.entries(tournResult).map((el) => {
                return {
                    team: el[0], 
                    points: el[1], 
                }
            })
            tournResultArray.sort((a,b) => b.points - a.points); 

            let finishes = ["1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place"]; 
            tournResultArray.forEach((el, index) => {
                if(index == 0) el.finish = finishes.shift(); 
                if(index > 0) {
                    if(el.points == tournResultArray[index-1].points && tournResultArray[index-1].finish){
                        el.finish = tournResultArray[index-1].finish; 
                        finishes.shift(); 
                    } else {
                        el.finish = finishes.shift(); 
                    }
                }
                if(el.finish === "1st Place") {
                    simulationTally[el.team].Overall.wins++; 
                    simulationTally[el.team].Overall.top5++; 
                } else if(el.finish){
                    simulationTally[el.team].Overall.top5++; 
                }
            })

            // console.log("tournResultArray: ", tournResultArray.slice(0,10)); 
                    
        }

        const documents = Object.entries(simulationTally).map((el) => {
            return {
                team: el[0], 
                year: year, 
                'Three Man Ladder Wins': el[1]['Three Man Ladder'].wins, 
                'Three Man Ladder Top5': el[1]['Three Man Ladder'].top5, 
                'B Ladder Wins': el[1]['B Ladder'].wins, 
                'B Ladder Top5': el[1]['B Ladder'].top5, 
                'C Ladder Wins': el[1]['C Ladder'].wins, 
                'C Ladder Top5': el[1]['C Ladder'].top5, 
                'C Hose Wins': el[1]['C Hose'].wins, 
                'C Hose Top5': el[1]['C Hose'].top5, 
                'B Hose Wins': el[1]['B Hose'].wins, 
                'B Hose Top5': el[1]['B Hose'].top5, 
                'Efficiency Wins': el[1]['Efficiency'].wins, 
                'Efficiency Top5': el[1]['Efficiency'].top5, 
                'Motor Pump Wins': el[1]['Motor Pump'].wins, 
                'Motor Pump Top5': el[1]['Motor Pump'].top5, 
                'Buckets Wins': el[1]['Buckets'].wins, 
                'Buckets Top5': el[1]['Buckets'].top5, 
                'Overall Wins': el[1].Overall.wins, 
                'Overall Top5': el[1].Overall.top5, 
            }
        })
        resultArr.push(documents); 
    }

    const allDocs = resultArr.flat(); 
    const addDocsResult = await writeFullCollection('simulation-projections', allDocs); 
    console.log("addDocsResult: ", addDocsResult); 
    // console.log("goodRunCtr: ", goodRunCtr); 


}


async function createSimulations(deleteExisting = false){

    const simulationTeamsCol = await getCollection("simulation-teams"); 
    const contestSummaryCol = await getCollection("simulation-contest-summary"); 
    const simulationRunsCol = await getCollection("simulation-runs"); 

    const simulationTeams = await simulationTeamsCol.find({}).toArray(); 

    console.log("creating simulation data for team / seasons: ", simulationTeams.length); 

    // for(let i=0; i<simulationTeams.length; i++){
    for(let i=0; i<simulationTeams.length; i++){
        console.log("starting simulation for team / season: ", i); 
        const simulationTeam = simulationTeams[i]; 
        const team = simulationTeam.team; 
        const year = simulationTeam.year; 

        console.log("starting simulations for team / season: ", team, year); 
        const contestSummaryInfo = await contestSummaryCol.find({team: team, year: year}).toArray(); 

        if(!contestSummaryInfo.length) {
            console.log("ALERT - no contest summary info found for team / season: ", team, year); 
            continue; 
        } 

        if(deleteExisting) {
            const deleteResult = await simulationRunsCol.deleteMany({team: team, year: year}); 
            console.log("delete result: ", deleteResult); 
        }

        for(let j=0; j<contestSummaryInfo.length; j++){
            const contestSummary = contestSummaryInfo[j]; 
            const contest = contestSummary.contest; 

            const ct = contestSummary.ct; 
            if(!ct) continue; 

            // const existingSimulationsCt = await simulationRunsCol.countDocuments({team: team, year: year, contest: contest}); 
            // if(existingSimulationsCt === 1000) {
            //     console.log("Found 1000 simulations.  Skipping ", team, year, contest); 
            //     continue; 
            // }
            // if(existingSimulationsCt > 0 || existingSimulationsCt > 1000) {
            //     console.log("Found incomplete or more than needed result count.  Deleting ", team, year, contest); 
            //     const deleteResult = await simulationRunsCol.deleteMany({team: team, year: year, contest: contest}); 
            //     console.log("delete result: ", deleteResult); 
            // }

            const goodCt = contestSummary.goodCt; 
            let goodAvg = contestSummary.goodAvg; 
            let goodSd = contestSummary.goodSd; 

            goodAvg = !goodAvg ? badRunMean[contest] : goodAvg; 
            goodSd = goodSd === null ? badRunSd[contest] : Math.max(goodSd, minRunSd[contest]); 

            const badAvg = badRunMean[contest]; 
            const badSd = badRunSd[contest]; 

            let completionPct = goodCt / ct; 
            completionPct = completionPct === 1 ? (ct / ct + 1) : 
                Math.max(completionPct, .15); 

            // decided the long tails weren't helpful for simulation. 

            // const dist = generateDistrubtion(goodAvg, goodSd, contest); 
            // const randomRuns = aThousandRandomNumbers.map(el => Math.floor( dist.ppf(el) * 100 ) / 100); 


            const hitOrMissRandomNumbers = Array(numOfSimulations).fill().map(() => Math.random()); 
            const isHit = hitOrMissRandomNumbers.map(el => el < completionPct ? true : false); 

            const runRandomNumbers = Array(numOfSimulations).fill().map(() => Math.random()); 
            const hits = runRandomNumbers.map(el => generateRunFromTriangleDist(el, goodAvg, goodSd));
            const missRandomNumbers = Array(numOfSimulations).fill().map(() => Math.random()); 
            const misses = missRandomNumbers.map((el, ind) => {
                if(el < .2) return "OT"; 
                if(el < .4) return "NT"; 
                const runRandomNumber = runRandomNumbers[ind]; 
                return generateRunFromTriangleDist(runRandomNumber, badAvg, badSd);
            })

            const finalRuns = isHit.map((el, ind) => el ? hits[ind] : misses[ind]);

            const documents = finalRuns.map((el, ind) => {

                return {
                    team: team, 
                    year: year, 
                    contest: contest, 
                    iteration: ind,
                    // goodAvg: goodAvg, 
                    // goodSd: goodSd, 
                    // badAvg: badAvg, 
                    // badSd: badSd, 
                    // isHit: isHit[ind], 
                    // completionPct: completionPct, 
                    // hitOrMissRandomNumber: hitOrMissRandomNumbers[ind], 
                    // runRandomNumber: runRandomNumbers[ind], 
                    // missRandomNumber: missRandomNumbers[ind], 
                    finalRun: el
                }
            }); 

            addDocsToCollection(simulationRunsCol, documents); 
        }
    }
}

function generateDistrubtion(goodAvg, goodSd, contest) {
    const avg = !goodAvg ? badRunMean[contest] : goodAvg; 
    const sd = goodSd === null ? badRunSd[contest] : Math.max(goodSd, minRunSd[contest]); 
    const distribution = gaussian(avg, sd);
    return distribution;    
}

function generateRunFromTriangleDist(randomNumber, avgToUse, sdToUse) {
    const min = avgToUse - (2 * sdToUse);
    const max = avgToUse + (2 * sdToUse);
    const mode = avgToUse;
    // Ensure p is within the valid range [0, 1]
    if (randomNumber < 0 || randomNumber > 1) {
        throw new Error("Probability randomNumber must be between 0 and 1.");
    }
    
    const Fc = (mode - min) / (max - min); 
    let result; 
    if (randomNumber < Fc) {
        result = min + Math.sqrt(randomNumber * (max - min) * (mode - min));
        } else {
        result = max - Math.sqrt((1 - randomNumber) * (max - min) * (max - mode));
    }
    return Math.floor(result * 100) / 100; 
}



async function createContestSummaries() {

    console.log("start of script"); 
    const runsCol = await getCollection("runs"); 
    const teamsCol = await getCollection("teams"); 
    const teams = await getTeams(teamsCol); 
    console.log("teams length: ", teams.length); 
    console.log("years length: ", years.length); 

    const runSummary = []; 
    const simulationTeams = []; 

    for(let i=0; i<teams.length; i++){
        const team = teams[i]; 
        console.log("starting team loop for team : ", team); 
        const rnCt = await runsCol.countDocuments({team: team}); 
        if(rnCt <=40) continue; 
        for(let j=0; j<years.length; j++){
            const year = years[j]; 
            const runs = await getRunsNoNA(runsCol, team, year); 
            if(!runs.length) continue; 
            simulationTeams.push({
                team: team, 
                year: year, 
                key: `${team}-${year}`
            })

            // console.log("runs: ", runs); 
            contests.forEach(contest => {
                try {
                    const contestRuns = runs.filter(run => run.contest === contest ); 
                    const ct = contestRuns.length; 
                    const goodRuns = contestRuns.filter(contestRun => {
                        // using 2 just to ignore any bad data - not sure there is any. 
                        return !Number.isNaN(contestRun.timeNum) && goodRunCutoffs[contest] >= contestRun.timeNum && contestRun.timeNum > 2
                    })
                    const goodCt = goodRuns.length; 
                    let goodAvg; 
                    let goodSd; 
                    let speedRating; 
                    if(!goodRuns.length) {
                        goodAvg = null
                        goodSd = null
                        speedRating = null
                    } else {
                        goodAvg = goodRuns.reduce((accum, el) => accum += parseFloat(el.timeNum), 0); 
                        goodAvg = goodAvg / goodCt; 
                        goodSd = getStandardDeviation(goodRuns.map(el => el.timeNum)); 
                        speedRating = bestRuns[contest] - goodAvg; 
                    }

                    runSummary.push({
                        team: team, 
                        year: year, 
                        contest: contest, 
                        ct: ct, 
                        goodCt: goodCt, 
                        goodAvg: Math.floor(goodAvg * 100) / 100, 
                        goodSd: goodSd, 
                        consistency: Math.floor((goodCt / ct) * 100) / 100, 
                        speedRating: speedRating, 
                        goodRunTimes: goodRuns.map(el => el.timeNum)
                    })

                


                    // this display could be  like a video game with bar charts in the column
                    

                } catch(e) {
                    console.log("error occurred: ", e); 
                    console.log("on runs: ", el); 
                }
            })
        }
    }


    console.log("runSummary length: ", runSummary.length); 
    const writeResult = await writeFullCollection('simulation-contest-summary', runSummary); 
    console.log("write result: ", writeResult); 

    const writeResult2 = await writeFullCollection('simulation-teams', simulationTeams); 
    console.log("write result: ", writeResult2); 



}




async function getCollection(collectionName){
    const dbConnectionStr =
        `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;

    console.log("dbConnectionStr: ", dbConnectionStr); 
    console.log("DB_NAME: ", DB_NAME); 
    const dbPromise = await getDbPromise(dbConnectionStr, DB_NAME);
    const collection = await getCollectionPromise(dbPromise, collectionName); 
    return collection; 
}

async function getTeams(teamsCol){
    let teams = await teamsCol.find({$or: [{circuit: 'Northern'}, {circuit: 'Suffolk'}, {circuit: 'Nassau'}, {circuit: 'Western'}]}).project({ fullName: 1, _id: 0 }).toArray(); 
    teams = teams.map(el => el.fullName); 
    return teams; 
}

async function getRunsNoNA(runsCol, team, year){
    return await runsCol.find({
        team: team, 
        year: year, 
        time: { $nin: ['NA', 'NULL'] }
    })
    .project({timeNum: 1, points: 1, contest: 1, time:1, team:1, year:1}).toArray(); 
}


function getStandardDeviation (array) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    const sd = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n); 
    return Math.floor(sd * 100) / 100; 
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


async function addDocsToCollection(collection, documents){
    let result; 
    try {
        result = await collection.insertMany(documents)
    } catch(e) {
        console.log('error during db write: ', e); 
    }
    return result; 
}
