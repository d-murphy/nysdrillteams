const dotenv = require('dotenv'); 
const { getDbPromise, getCollectionPromise } = require('../dist/library/db')
var gaussian = require('gaussian');

dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 


const INCLUDE_UP_TO = 2025; 
const YEAR_START = 1970;

const contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]; 
const years = Array(300).fill().map((x,i)=>i + YEAR_START).filter(el => el <= INCLUDE_UP_TO); 

const originalGoodRunCutoffs = {
    "Three Man Ladder": 6.9, 
    "B Ladder": 5.8, 
    "C Ladder": 9.8, 
    "C Hose": 13.7, 
    "B Hose": 8.7, 
    "Efficiency": 10, 
    "Motor Pump": 7, 
    "Buckets": 25
};

const goodRunCutoffsByDecade = {
    1970: {
        "Three Man Ladder": 8, 
        "B Ladder": 6.8, 
        "C Ladder": 12, 
        "C Hose": 17, 
        "B Hose": 11, 
        "Efficiency": 11.2, 
        "Motor Pump": 9, 
        "Buckets": 30
    }, 

    1974: {
        "Three Man Ladder": 7,
        "B Ladder": 6.7,
        "C Ladder": 11.5,
        "C Hose": 16.5,
        "B Hose": 10,
        "Efficiency": 10.3,
        "Motor Pump": 8.2,
        "Buckets": 29
    }, 
    1978: {
        "Three Man Ladder": originalGoodRunCutoffs["Three Man Ladder"],
        "B Ladder": 6.2,
        "C Ladder": 11.3,
        "C Hose": 16,
        "B Hose": 9.8,
        "Efficiency": originalGoodRunCutoffs["Efficiency"],
        "Motor Pump": 8.2,
        "Buckets": 27
    }, 
    1984: {
        "Three Man Ladder": originalGoodRunCutoffs["Three Man Ladder"],
        "B Ladder": 6,
        "C Ladder": 10.6,
        "C Hose": 15,
        "B Hose": 9.1,
        "Efficiency": originalGoodRunCutoffs["Efficiency"],
        "Motor Pump": 7.7,
        "Buckets": originalGoodRunCutoffs["Buckets"]
    },
    1988: {
        "Three Man Ladder": originalGoodRunCutoffs["Three Man Ladder"],
        "B Ladder": 5.8,
        "C Ladder": 10.2,
        "C Hose": 14.2,
        "B Hose": 9.1,
        "Efficiency": originalGoodRunCutoffs["Efficiency"],
        "Motor Pump": 7.4,
        "Buckets": originalGoodRunCutoffs["Buckets"]
    },
    1992: {
        "Three Man Ladder": originalGoodRunCutoffs["Three Man Ladder"],
        "B Ladder": originalGoodRunCutoffs["B Ladder"],
        "C Ladder": 10,
        "C Hose": 14,
        "B Hose": originalGoodRunCutoffs["B Hose"],
        "Efficiency": originalGoodRunCutoffs["Efficiency"],
        "Motor Pump": 7.3,
        "Buckets": originalGoodRunCutoffs["Buckets"]
    }, 
    2000: {
        "Three Man Ladder": originalGoodRunCutoffs["Three Man Ladder"],
        "B Ladder": originalGoodRunCutoffs["B Ladder"],
        "C Ladder": originalGoodRunCutoffs["C Ladder"],
        "C Hose": originalGoodRunCutoffs["C Hose"],
        "B Hose": originalGoodRunCutoffs["B Hose"],
        "Efficiency": originalGoodRunCutoffs["Efficiency"],
        "Motor Pump": originalGoodRunCutoffs["Motor Pump"],
        "Buckets": originalGoodRunCutoffs["Buckets"]
    }
} 

function getGoodRunCutoffs(year){
    if(year < 1974) return goodRunCutoffsByDecade[1970]; 
    if(year < 1978) return goodRunCutoffsByDecade[1974]; 
    if(year < 1984) return goodRunCutoffsByDecade[1978]; 
    if(year < 1988) return goodRunCutoffsByDecade[1984]; 
    if(year < 1992) return goodRunCutoffsByDecade[1988]; 
    if(year < 2000) return goodRunCutoffsByDecade[1992]; 
    return goodRunCutoffsByDecade[2000]; 
}

const badRunMean = {
    "Three Man Ladder": 8.6, 
    "B Ladder": 7.2, 
    "C Ladder": 13.2, 
    "C Hose": 18, 
    "B Hose": 12, 
    "Efficiency": 12.5, 
    "Motor Pump": 9, 
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
    await createContestSummaries(); 
    // await createSimulations(false); 
    // await calculateNysChampionshipProjections(); 


    
})()

async function addKeyToSimulationContestSummaries() {
    const simulationRunsCol = await getCollection("simulation-runs"); 

    console.log("starting update");
    
    // First, check how many documents need updating
    const totalDocs = await simulationRunsCol.countDocuments({});
    const docsWithKey = await simulationRunsCol.countDocuments({ key: { $exists: true } });
    const docsToUpdate = totalDocs - docsWithKey;
    
    console.log(`Total documents: ${totalDocs}`);
    console.log(`Documents with key: ${docsWithKey}`);
    console.log(`Documents to update: ${docsToUpdate}`);
    
    if (docsToUpdate === 0) {
        console.log("All documents already have keys. Exiting.");
        return;
    }
    
    // Process in batches using cursor (no memory loading)
    const batchSize = 1000;
    let processedCount = 0;
    let batchNumber = 1;
    
    console.log("Starting cursor-based batch processing...");
    
    // Use cursor to stream documents - only get docs without keys
    const cursor = simulationRunsCol.find({ key: { $exists: false } }).batchSize(batchSize);
    
    while (await cursor.hasNext()) {
        const batch = [];
        
        // Collect a batch of documents
        for (let i = 0; i < batchSize && await cursor.hasNext(); i++) {
            const doc = await cursor.next();
            batch.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: {
                        $set: {
                            key: `${doc.team}|${doc.year}|${doc.contest}|${doc.iteration}`
                        }
                    }
                }
            });
        }

        console.log("before write"); 
        
        if (batch.length > 0) {
            // Execute the batch
            const result = await simulationRunsCol.bulkWrite(batch, { ordered: false });
            processedCount += result.modifiedCount;
            
            console.log(`Batch ${batchNumber}: Processed ${batch.length} documents, ${result.modifiedCount} updated`);
            console.log(`Total processed: ${processedCount}/${docsToUpdate} (${((processedCount/docsToUpdate)*100).toFixed(1)}%)`);
            
            batchNumber++;
        }
    }
    
    await cursor.close();
    console.log(`Update complete! Processed ${processedCount} documents.`);



    // console.log("starting update");
    // for(let i=0; i<500; i++) {
    //     const result = await simulationRunsCol.updateMany(
    //         {iteration: i},
    //         [
    //             {
    //                 $set: {
    //                     key: { $concat: ["$team", "|", { $toString: "$year" }, "|", { $toString: "$contest" }, "|", { $toString: "$iteration" }] }
    //                 }
    //             }
    //         ]
    //     )
    //     console.log("result: ", i, " - ", result);     
    // }
}

async function calculateNysChampionshipProjections(){

    const tournamentCol = await getCollection("tournaments"); 
    const simulationRunsCol = await getCollection("simulation-runs"); 
    const tournaments = await tournamentCol.find({name: "New York State Championship"}).toArray(); 
    tournaments.sort((a,b) => a.year - b.year); 


    const resultArr = []; 

    const goodRunCtr = {}; 
    

    // for(let i=0; i<1; i++){
    for(let i=0; i<tournaments.length; i++){
        const tournament = tournaments[i]; 
        const year = tournament.year; 

        console.log("Starting year", year); 
        if(year < 1970) continue; 

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
            if(j % 100 === 0) console.log("Starting iteration", j); 
            let tournResult = {}; 
            const simulatedRuns = await simulationRunsCol.find({
                team: {$in: runningOrderArray}, year: year, iteration: j
            }).toArray(); 


            for(let k=0; k<contests.length; k++){
                const contest = contests[k]; 
                let contestSimulatedRuns = simulatedRuns.filter(el => el.contest === contest); 
                if(j === 0 && k === 0){
                    console.log("contest sim runs count: ", contestSimulatedRuns.length, " with requested teams count: ", runningOrderArray.length); 
                    const teamsNotInSimulatedRuns = runningOrderArray.filter(el => !contestSimulatedRuns.some(el2 => el2.team === el)); 
                    console.log("teams not in simulated runs: ", teamsNotInSimulatedRuns.join(", ")); 
                }

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

    const simulationTeams = await simulationTeamsCol.find({}).sort({key: 1}).toArray(); 
    const numOfTeamsToSimulation = simulationTeams.length; 


    // for(let i=540; i<760; i++){
    for(let i=0; i<simulationTeams.length; i++){
        console.log("starting simulation for team / season: ", i, " of ", numOfTeamsToSimulation); 
        const simulationTeam = simulationTeams[i]; 
        const team = simulationTeam.team; 
        const year = simulationTeam.year; 

        console.log("The team / season: ", team, year); 
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

            const finalRuns = generateSimulatedRuns(contestSummary, contest, ct); 

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
    console.log("finished creating simulations"); 
}

function generateSimulatedRuns(contestSummary, contest, ct) {

    const goodCt = contestSummary.goodCt; 
    let goodAvg = contestSummary.goodAvg; 
    let goodSd = contestSummary.goodSd; 

    goodAvg = !goodAvg ? badRunMean[contest] : goodAvg; 
    goodSd = goodSd === null ? badRunSd[contest] : Math.max(goodSd, minRunSd[contest]); 

    const badAvg = badRunMean[contest]; 
    const badSd = badRunSd[contest]; 

    let completionPct = goodCt / (ct + 1 ); 
    completionPct = Math.max(completionPct, .15); 

    // decided the long tails weren't helpful for simulation. 

    // const dist = generateDistrubtion(goodAvg, goodSd, contest); 
    // const randomRuns = aThousandRandomNumbers.map(el => Math.floor( dist.ppf(el) * 100 ) / 100); 


    const finalRuns = []; 

    for(let i=0; i<numOfSimulations; i++){
        const hitOrMissRandomNumber = Math.random(); 
        const isHit = hitOrMissRandomNumber < completionPct; 
        const runRandomNumber = Math.random(); 
        const run = isHit ? generateRunFromTriangleDist(runRandomNumber, goodAvg, goodSd) : 
            runRandomNumber < .2 ? "OT" : 
            runRandomNumber < .4 ? "NT" : 
            generateRunFromTriangleDist(runRandomNumber, badAvg, badSd); 
        finalRuns.push(run); 
    }
    
    return finalRuns; 
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
    // for(let i=0; i<3; i++){
        const team = teams[i]; 
        console.log("starting team loop for team : ", i, " - ", team); 
        const rnCt = await runsCol.countDocuments({team: team, contest: {$in: contests}}); 
        if(rnCt <=40) {
            console.log("skipping team because of low run count: ", team); 
            continue; 
        }
        for(let j=0; j<years.length; j++){
            const year = years[j]; 
            const runsWithNA = await getRuns(runsCol, team, year); 
            const runs = runsWithNA.filter(el => el.time !== "NA" && el.time !== "NULL" && el.time !== null && el.time !== undefined && el.time !== ""); 
            if(!runs.length) continue; 

            simulationTeams.push({
                team: team, 
                year: year, 
                key: `${team}-${year}`
            })

            const goodRunCutoffs = getGoodRunCutoffs(year);

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
                    let consistencyScore = Math.floor((goodCt / (ct + 1)) * 100) / 100
                    const smallGoodRunCt = goodCt < 4; 
                    if(!goodRuns.length) {
                        goodAvg = null
                        goodSd = null
                        speedRating = null
                    } else {
                        goodAvg = goodRuns.reduce((accum, el) => accum += parseFloat(el.timeNum), 0); 
                        goodAvg = goodAvg / goodCt; 
                        goodSd = getStandardDeviation(goodRuns.map(el => el.timeNum)); 
                        const smallGoodRunCtPenalty = smallGoodRunCt ? bestRuns[contest] * .1 : 0; 
                        speedRating = Math.floor((bestRuns[contest] / (goodAvg + smallGoodRunCtPenalty)) * 100) / 100; 
                    }
                    let overallScore = (speedRating || 0) * (consistencyScore || 0); 

                    runSummary.push({
                        team: team, 
                        year: year, 
                        contest: contest, 
                        ct: ct, 
                        goodCt: goodCt, 
                        goodAvg: Math.floor(goodAvg * 100) / 100, 
                        goodSd: goodSd, 
                        consistency: consistencyScore, 
                        speedRating: speedRating, 
                        overallScore: overallScore, 
                        goodRunTimes: goodRuns.map(el => el.timeNum), 
                        key: `${team}|${year}|${contest}`, 
                        teamContestKey: `${team}|${contest}`
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
    let teams = await teamsCol.find({}).project({ fullName: 1, _id: 0 }).toArray(); 
    teams = teams.map(el => el.fullName); 
    return teams; 
}

async function getRuns(runsCol, team, year){
    return await runsCol.find({
        team: team, 
        year: year, 
        // time: { $nin: ['NA', 'NULL'] }
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
    // tempCollection.createIndex({team: 1, year: 1, contest: 1}); 
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
