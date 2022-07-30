const fs = require('fs'); 
const dotenv = require('dotenv'); 
const { getDbPromise, getCollectionPromise } = require('../dist/services/database/db')

dotenv.config(); 
let { PORT, DB_NAME, dbUn, dbPass } = process.env; 


// reading source files and reshaping. 

let teamsLUT = readFileToObject("./dataForMigration/1_teams.txt", 0);  
let seasonLUT = readFileToObject("./dataForMigration/2_season.txt", 1);  
let divisionSeriesLUT = readFileToObject("./dataForMigration/3_division_series.txt", 0); 
let divisions = readFileToObject("./dataForMigration/4_divisions.txt", 0); 
let drillNamesLUT = readFileToObject("./dataForMigration/5_drill_names.txt", 0);  
let eventNamesLUT = readFileToObject("./dataForMigration/6_event_names.txt", 0); 
let uniqueDrillsLUT = readFileToObject("./dataForMigration/7_unique_drills.txt", 0);  
let uniqueEventsLUT = readFileToObject("./dataForMigration/8_unique_events.txt", 0);  
let eventResultsLUT = readFileToObject("./dataForMigration/9_event_results.txt", 0); 

// print examples

console.log('teams example', teamsLUT["1"])
console.log('season example', seasonLUT["2020"])
console.log('division series example', divisionSeriesLUT["1"])
console.log('division example', divisions["1"])
console.log('drill name example', drillNamesLUT["1"])
console.log('event name example', eventNamesLUT["1"])
console.log('unique drill example', uniqueDrillsLUT["1"])
console.log('unique event example', uniqueEventsLUT["1"])
console.log('event example', eventResultsLUT["1"])

// additional data maps

let trackNameLUT = buildTrackNameLUT(uniqueDrillsLUT)
let circuitLU = {
    "1": "Nassau", 
    "2": "Western", 
    "3": "Northern", 
    "4": "Suffolk"
}; 
let classLU = {
    "1": "Motorized",
    "6": "Juniors"
}; 

(async function(){
    console.log('starting the collection buiids'); 
    let writeDocResults = await loadRuns(); 
    console.log("Write runs result: ", writeDocResults)
    let loadTeamsResult = await loadTeams(); 
    console.log('load teams result: ', loadTeamsResult); 
    let loadTracksResult = await loadTracks(); 
    console.log('load tracks result: ', loadTracksResult); 
    let loadDrillsResult = await loadDrills(); 
    console.log('load teams result: ', loadDrillsResult); 
})()


// data read / manip funcs

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

function readFileToObject(filename, indexOfKey){
    let newObj = {}
    try {
        const data = fs.readFileSync(filename, 'utf8');
        addToTable(newObj, data, indexOfKey); 
    } catch (e) {
        console.log('error reading: ', filename); 
    }
    return newObj; 
}

function buildTrackNameLUT(uniqueDrillsLUT){
    let newLUT = {}; 

    let trackSet = new Set() 
    Object.values(uniqueDrillsLUT).forEach(el => {
        trackSet.add(el.location); 
    })
    trackSet.forEach(track => {
        let newStr; 
        let indOf_Track = track ? track.toLowerCase().search(' track') : -1
        if(indOf_Track>=0){
            let trackArr = track.split(''); 
            trackArr.splice(indOf_Track, 6); 
            newStr = trackArr.join(''); 
        } else {
            newStr = track; 
        }
        if(track && track!= 'NULL') {
            newLUT[track] = newStr
        }; 
    })
    return newLUT; 
}

// db funcs

async function getCollection(collectionName){
    const dbConnectionStr =
        `mongodb+srv://${dbUn}:${dbPass}@nysdrillteams.4t9radi.mongodb.net/?retryWrites=true&w=majority`;
    const dbPromise = await getDbPromise(dbConnectionStr, DB_NAME);
    const collection = await getCollectionPromise(dbPromise, collectionName); 
    return collection; 
}

async function writeDocs(collectionName, documents){
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


// building collections

async function loadRuns (){

    var numWOContest = {ids: [], count: 0}; 
    var numWoDate = {ids: [], count: 0}; 
    var numWoDateYr = {ids: [], count: 0}; 
    var numWoTourName = {ids: [], count: 0}; 
    var numWoTourId = {ids: [], count: 0}; 

    let runsForDb = []; 
    Object.values(eventResultsLUT).forEach(el => {
        try{
            runsForDb.push({
                id: el.id, 
                team: teamsLUT[el.individual_id] ? teamsLUT[el.individual_id].team_name : null,
                hometown: teamsLUT[el.individual_id] ? teamsLUT[el.individual_id].hometown : null,
                nickname: teamsLUT[el.individual_id] ? teamsLUT[el.individual_id].nickname : null,
                contest: getContest(el.event_id, numWOContest),
                year: getDateYr(el.event_id, numWoDateYr), 
                tournament: getTournamentName(el.event_id, numWoTourName),
                tournamentId: getTournamentId(el.event_id, numWoTourId),
                host: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].host : null : null, 
                track: getTrack(el.event_id), 
                time: el.time, 
                runningPosition: parseInt(el.ro_number) ? parseInt(el.ro_number) : null, 
                nassauPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].nass_cm_ : null : null, 
                suffolkPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].suff_cm_ : null : null, 
                westernPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].wny_cm_: null : null, 
                northernPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].nny_cm_: null : null, 
                suffolkOfPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].suffof_cm_: null : null, 
                nassauOfPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].nassof_cm_: null : null, 
                liOfPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].liof_cm_: null : null, 
                juniorPoints: uniqueEventsLUT[el.event_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id] ? uniqueDrillsLUT[uniqueEventsLUT[el.event_id].projectround_id].jr_cm_: null : null,
                date: getDate(el.event_id, numWoDate), 
                urls: [], 
                sanctioned: uniqueEventsLUT[el.event_id] ? ['1','Sanctioned'].includes(uniqueEventsLUT[el.event_id].sanction) : false,
                cfp: uniqueEventsLUT[el.event_id] ? ['1','Counts For Points'].includes(uniqueEventsLUT[el.event_id].cfp) : false,
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
    console.log('num of failed types: ', numWOContest.count)
    console.log('num of failed dates: ', numWoDate.count)
    console.log('num of failed tourn name: ', numWoTourName.count)
    console.log('num of failed tournId: ', numWoTourId.count); 
    console.log('run example', runsForDb[286619], runsForDb[281619], runsForDb[280619])
    let errStr = 'The following runs Ids had errors when loading:\n\n'; 
    errStr = addToErrString(errStr, 'contest', numWOContest.ids); 
    errStr = addToErrString(errStr, 'date', numWoDate.ids); 
    errStr = addToErrString(errStr, 'tournament name', numWoTourName.ids); 
    errStr = addToErrString(errStr, 'tournament id', numWoTourId.ids); 
    fs.writeFileSync('runWithError.txt', errStr)
    return writeDocs('runs', runsForDb); 
}

async function loadTeams(){
    let teamsArr = []; 
    Object.values(teamsLUT).forEach(el => {
        teamsArr.push({
            id: el.id, 
            fullName: el.team_name, 
            nickname: el.nickname, 
            hometown: el.hometown, 
            circuit: circuitLU[el.region_code] ? circuitLU[el.region_code] : el.region_code,  
            imageUrl: el.avatar, 
            active: true, 
            class: classLU[el.class] ? classLU[el.class] : el.class
        })
    })
    return writeDocs('teams', teamsArr)
}

async function loadTracks(){
    let trackDocs = []; 
    let trackSet2 = new Set(); 
    Object.values(trackNameLUT).forEach(el => {
        trackSet2.add(el); 
    })
    trackSet2.forEach(track => {
        trackDocs.push({
            name: track, 
            address: '', 
            city: '', 
            notes: '', 
            imageUrls: [], 
            archHeight: null, 
            distanceToHydrant: null
        })
    })
    return writeDocs('tracks', trackDocs)
}

async function loadDrills(){
    let drillsArr = []; 

    let events = Object.values(uniqueEventsLUT); 
    Object.values(uniqueDrillsLUT).forEach(el => {

        let infoFromRuns = getInfoFromRuns(el.id)

        drillsArr.push({
            id: el.id, 
            name: getTournamentNameFromDrill(el.round_id), 
            year: new Date(el.start_date_field).getFullYear(), 
            date: el.start_date_field, 
            startTime: el.start_time,
            nassauPoints: el.nass_cm_, 
            suffolkPoints: el.suff_cm_ , 
            westernPoints: el.wny_cm_ , 
            northernPoints: el.nny_cm_, 
            suffolkOfPoints: el.suffof_cm_ , 
            nassauOfPoints: el.nassof_cm_ , 
            liOfPoints: el.liof_cm_ , 
            juniorPoints: el.jr_cm_ ,
            nassauSchedule: el.nass_cm_, 
            suffolkSchedule: el.suff_cm_, 
            westernSchedule: el.wny_cm_ , 
            northernSchedule: el.nny_cm_, 
            liOfSchedule:  el.liof_cm_ , 
            juniorSchedule: el.jr_cm_ ,        
            track: trackNameLUT[el.location] ? trackNameLUT[el.location] : null,
            runningOrder: infoFromRuns.runningOrder,
            sanctioned: ['1', 'Sanctioned'].includes(el.sanctioned), 
            cfp: ['1', 'Sanctioned'].includes(el.cfp),
            top5: infoFromRuns.top5,  
            contests: contestStrArr(events, el.id),
            liveStreamPlanned: false,
            urls: [], 
            waterTime: el.water_time        
        })
    })
    return writeDocs('tournaments', drillsArr)
}

// helper funcs for building collection funcs

function getInfoFromRuns(tournId){
    let eventIdArr = []; 
    Object.values(uniqueEventsLUT).forEach(el => {
        if(el.projectround_id == tournId && ['1','Counts For Points'].includes(el.cfp)) eventIdArr.push(el.id)
    })
    let runsForTourn = []; 
    Object.values(eventResultsLUT).forEach(el => {
        if(eventIdArr.includes(el.event_id)) {
            runsForTourn.push(el)
        }
    })
    runsForTourn = runsForTourn.map(el => {
        return {
            ...el,
            team: teamsLUT[el.individual_id] ? teamsLUT[el.individual_id].team_name : null
        }
    })
    let points = {}; 
    runsForTourn.forEach(el => {
        if(!points[el.team]){
            points[el.team] = parseInt(el.points) ? parseInt(el.points) : 0; 
        } else {
            points[el.team] += parseInt(el.points) ? parseInt(el.points) : 0; 
        }
    })
    let pointsArr = []; 
    Object.keys(points).forEach(el => {
        pointsArr.push({teamName: el, points: points[el]})
    })
    pointsArr.sort((a,b) => a.points > b.points ? -1 : 1); 
    let finishes = ["1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place"]; 
    pointsArr.forEach((el, index) => {
        if(index == 0) el.finishingPosition = finishes.shift(); 
        if(index > 0) {
            if(el.points == pointsArr[index-1].points && pointsArr[index-1].finishingPosition){
                el.finishingPosition = pointsArr[index-1].finishingPosition; 
                if(pointsArr.length) finishes.shift(); 
            } else {
                if(pointsArr.length) el.finishingPosition = finishes.shift(); 
            }
        }
    })
    pointsArr = pointsArr.filter(el => {
        return el.finishingPosition
    })

    let runningOrder = {}; 
    runsForTourn.forEach(el => {
        let rowNum = parseInt(el.ro_number) ? parseInt(el.ro_number) : null; 
        if(rowNum && !runningOrder[rowNum]){
            runningOrder[rowNum] = el.team
        }
    })
    return {top5: pointsArr, runningOrder: runningOrder}
}

function contestStrArr(events, drillId){
    return events.filter(el => {
        return el.projectround_id == drillId; 
    })
    .sort((a,b) => {
        return parseInt(a.event_num) < parseInt(b.event_num) ? -1 : 1; 
    })
    .map(el => {
        return {
            name: eventNamesLUT[el.type] ? eventNamesLUT[el.type].name : el.type, 
            cfp: ['1','Counts For Points'].includes(el.cfp), 
            sanction: ['1','Sanctioned'].includes(el.sanction)
        }
    })
}

function addToErrString(errStr, header, idArr){
    errStr += `${errStr}\n`
    idArr.forEach(el => {
        errStr += el + ", "
    })
    errStr += '\n'
    return errStr; 
}

function getContest(event_id, numWOContest){

    let uniqueEvent = uniqueEventsLUT[event_id]; 
    let type = uniqueEvent ? uniqueEvent.type : null; 
    let eventName = type ? eventNamesLUT[type] : null; 
    let result = eventName ? eventName.name : null; 
    if(!result) {
        numWOContest.ids.push(event_id);
        numWOContest.count++;  
    }
    return result; 
}

function getDate(event_id, numWoDate, counting=true){
    let uniqueEvent = uniqueEventsLUT[event_id]; 
    let projectId = uniqueEvent ? uniqueEvent.projectround_id : null; 
    let drill = projectId ? uniqueDrillsLUT[projectId] : null; 
    let date = drill ? drill.start_date_field : null; 
    if(!date && counting) {
        numWoDate.ids.push(event_id);
        numWoDate.count++;  
    }
    return date; 
}

function getDateYr(event_id, numWoDateYr){
    let dateVal = getDate(event_id, numWoDateYr, false); 
    let yearVal = dateVal ? new Date(dateVal).getFullYear() : null; 
    return yearVal; 
}

function getTournamentName(event_id, numWoTourName){

    let uniqueEvent = uniqueEventsLUT[event_id]; 
    let projectId = uniqueEvent ? uniqueEvent.projectround_id : null;
    let drill = projectId ? uniqueDrillsLUT[projectId] : null; 
    let round_id = drill ? drill.round_id : null; 
    let drillName = round_id ? drillNamesLUT[round_id] : null; 
    let result = drillName ? drillName.name : null; 
    if(!result) {
        numWoTourName.ids.push(event_id);
        numWoTourName.count++;  
    }
    return result; 
}

function getTournamentNameFromDrill(round_id){
    let drillName = round_id ? drillNamesLUT[round_id] : null; 
    let result = drillName ? drillName.name : null; 
    return result; 
}


function getTournamentId(event_id, numWoTourId){

    let event = uniqueEventsLUT[event_id]; 
    let projectId = event ? event.projectround_id : null ; 
    if(!projectId) {
        numWoTourId.ids.push(event_id);
        numWoTourId.count++;  
    }
    return projectId; 
}

function getTrack(event_id){
    let event = uniqueEventsLUT[event_id]; 
    let projectId = event ? event.projectround_id : null;
    let drill = projectId ? uniqueDrillsLUT[projectId] : null; 
    let track = drill ? drill.location : null; 
    let result = track ? trackNameLUT[track] : null; 
    return result; 
}
