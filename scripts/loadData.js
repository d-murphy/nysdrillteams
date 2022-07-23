const fs = require('fs'); 
const dotenv = require('dotenv'); 
const { getDbPromise, getCollectionPromise } = require('../dist/services/database/db')

dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 


let teamsLUT = {}; 
let seasonLUT = {}; 
let divisionSeriesLUT = {}; 
let divisions = {}; 
let drillNamesLUT = {}; 
let eventNamesLUT = {}; 
let uniqueDrillsLUT = {}; 
let uniqueEventsLUT = {}; 
let eventResultsLUT = {}; 

try {
    const data = fs.readFileSync("./dataForMigration/1_teams.txt", 'utf8');
    addToTable(teamsLUT, data, 0); 
    console.log('team example', teamsLUT[1])
    // console.log(teamsLUT[2])
    // console.log(teamsLUT[3])
    // console.log(teamsLUT[4])
    // console.log(teamsLUT[5])
} catch (e) {
    console.log('in teams read', e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/2_season.txt", 'utf8'); 
    addToTable(seasonLUT, data,1); 
    console.log('season LUT: ', seasonLUT['2020']); 
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/3_division_series.txt", 'utf8'); 
    addToTable(divisionSeriesLUT, data,0); 
    console.log('divisionSeriesLUT: ', divisionSeriesLUT['52']); 
    // console.log(divisionSeriesLUT['53']); 
    // console.log(divisionSeriesLUT['54']); 
    // console.log(divisionSeriesLUT['55']); 
    // console.log(divisionSeriesLUT['56']); 
    // console.log(divisionSeriesLUT['57']); 
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/4_divisions.txt", 'utf8'); 
    addToTable(divisions, data,0); 
    console.log('divisions: ', divisions['4'])
    // console.log(drillNamesLUT['1'])
    // console.log(drillNamesLUT['2'])
    // console.log(drillNamesLUT['3'])
    // console.log(drillNamesLUT['4'])
} catch (e) {
    console.log(e); 
}


try {
    const data = fs.readFileSync("./dataForMigration/5_drill_names.txt", 'utf8'); 
    addToTable(drillNamesLUT, data,0); 
    console.log('drillNamesLUT: ', drillNamesLUT['203'])
    // console.log(drillNamesLUT['1'])
    // console.log(drillNamesLUT['2'])
    // console.log(drillNamesLUT['3'])
    // console.log(drillNamesLUT['4'])
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/6_event_names.txt", 'utf8'); 
    addToTable(eventNamesLUT, data,0); 
    console.log('eventNamesLUT: ', eventNamesLUT['1'])
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/7_unique_drills.txt", 'utf8'); 
    addToTable(uniqueDrillsLUT, data,0); 
    console.log('uniqueDrillsLUT: ', uniqueDrillsLUT['2188'])
    // console.log(uniqueDrillsLUT['1'])
    // console.log(uniqueDrillsLUT['2'])
    // console.log(uniqueDrillsLUT['3'])
    // console.log(uniqueDrillsLUT['4'])
    // console.log(uniqueDrillsLUT['5'])
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/8_unique_events.txt", 'utf8'); 
    addToTable(uniqueEventsLUT, data,0); 
    console.log('uniqueEventsLUT: ', uniqueEventsLUT['17002'])
    // console.log(uniqueEventsLUT['1'])
    // console.log(uniqueEventsLUT['2'])
    // console.log(uniqueEventsLUT['3'])
    // console.log(uniqueEventsLUT['4'])
    // console.log(uniqueEventsLUT['5'])
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/9_event_results.txt", 'utf8'); 
    addToTable(eventResultsLUT, data,0); 
    console.log('three man?', Object.values(eventResultsLUT).filter(el => {return el.id == '250753' }))
    // console.log(eventResultsLUT['2001'])
    // console.log(eventResultsLUT['3002'])
    // console.log(eventResultsLUT['4003'])
    // console.log(eventResultsLUT['5004'])
    // console.log(eventResultsLUT['6005'])
} catch (e) {
    console.log(e); 
}


var numWOType = 0; 
var numWoDate = 0; 
var numWoTourName = 0; 
var numWoTourId = 0; 
var runIdsWithError = new Set(); 

(async function(){
    const dbConnectionStr =
        `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
    const dbPromise = await getDbPromise(dbConnectionStr, DB_NAME);
    const collection = await getCollectionPromise(dbPromise, 'runs'); 

    let runsForDb = []; 
    Object.values(eventResultsLUT).forEach(el => {
        try{
            runsForDb.push({
                id: el.id, 
                team: teamsLUT[el.individual_id].team_name, 
                hometown: teamsLUT[el.individual_id].hometown,
                nickname: teamsLUT[el.individual_id].nickname,
                contest: getContest(el.event_id),
                year: getDateYr(el.event_id), 
                tournament: getTournamentName(el.event_id),
                tournamentId: getTournamentId(el.event_id),
                host: uniqueEventsLUT[el.event_id] ? uniqueEventsLUT[el.event_id].host : null, 
                track: uniqueEventsLUT[el.event_id] ? uniqueEventsLUT[el.event_id].location : null,  
                time: el.time, 
                runningPosition: el.ro_number, 
                nassauPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].nass_cm_ : null : null, 
                suffolkPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].suff_cm_ : null : null, 
                westernPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].wny_cm_: null : null, 
                northernPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].nny_cm_: null : null, 
                suffolkOfPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].suffof_cm_: null : null, 
                nassauOfPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].nassof_cm_: null : null, 
                liOfPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].liof_cm_: null : null, 
                juniorPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].jr_cm_: null : null,
                date: getDate(el.event_id), 
                urls: [], 
                sanctioned: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].sanctioned : null : null,
                points: el.points,
                rank: el.rank,  
                notes: '',
                stateRecord: false,
                currentStateRecord: false
            })    
        } catch (e){
            console.log('new error: ', e)
        }
    })
    console.log('number of runs: ', Object.values(eventResultsLUT).length)
    console.log('num of failed types: ', numWOType)
    console.log('num of failed dates: ', numWoDate)
    console.log('num of failed tourn name: ', numWoTourName)
    console.log('num of failed tournId: ', numWoTourId); 
    console.log('run example', runsForDb[286619], runsForDb[281619], runsForDb[280619])
    let errStr = 'The following runs Ids had errors when loading:\n\n'; 
    runIdsWithError.forEach(el => {
        errStr += el + ', '
    })
    fs.writeFileSync('runWithError.txt', errStr)

    let result
    try {
        console.log('starting write to db: '); 
        result = await collection.insertMany(runsForDb)
    } catch(e) {
        console.log('error during db write: ', e); 
        result = false; 
    }
    console.log('db result: ', result); 
    return
})()



function getContest(event_id){

    let uniqueEvent = uniqueEventsLUT[event_id]; 
    let type = uniqueEvent ? uniqueEvent.type : null; 
    let eventName = type ? eventNamesLUT[type] : null; 
    let result = eventName ? eventName.name : null; 
    if(!result) {
        runIdsWithError.add(event_id);
        numWOType++;  
    }
    return result; 
}

function getDate(event_id, counting=true){
    let uniqueEvent = uniqueEventsLUT[event_id]; 
    let projectId = uniqueEvent ? uniqueEvent.projectround_id : null; 
    let drill = projectId ? uniqueDrillsLUT[projectId] : null; 
    let date = drill ? drill.start_date_field : null; 
    if(!date && counting) {
        runIdsWithError.add(event_id);
        numWoDate++;  
    }
    return date; 
}

function getDateYr(event_id){
    let dateVal = getDate(event_id, false); 
    let yearVal = dateVal ? new Date(dateVal).getFullYear() : null; 
    return yearVal; 
}

function getTournamentName(event_id){

    let uniqueEvent = uniqueEventsLUT[event_id]; 
    let projectId = uniqueEvent ? uniqueEvent.projectround_id : null;
    let drill = projectId ? uniqueDrillsLUT[projectId] : null; 
    let round_id = drill ? drill.round_id : null; 
    let drillName = round_id ? drillNamesLUT[round_id] : null; 
    let result = drillName ? drillName.name : null; 
    if(!result) {
        runIdsWithError.add(event_id);
        numWoTourName++;  
    }
    return result; 
}

function getTournamentId(event_id){

    let event = uniqueEventsLUT[event_id]; 
    let projectId = event ? event.projectround_id : null ; 
    if(!projectId) {
        runIdsWithError.add(event_id);
        numWoTourId++;  
    }
    return projectId; 
}

function addToTable(lut, text, indexOfKey){
    const lines = text.split('\n')
    let keysLine = lines.shift(); 
    let keys = keysLine.split(";"); 
    keys = keys.map(el => el.replace(/"/g, '').trim())
    lines.forEach(line => {
        let lineSp = line.split(";");
        lineSp = lineSp.map(el => el.replace(/"/g,'').trim()) 
        lut[lineSp[indexOfKey]] = {}
        let innerObj = lut[lineSp[indexOfKey]]
        lineSp.forEach((val, ind) => {
            innerObj[keys[ind]] = val; 
        })
    })
}