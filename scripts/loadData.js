const fs = require('fs'); 

let teamsLUT = {}; 
let seasonLUT = {}; 
let divisionSeriesLUT = {}; 
let drillNamesLUT = {}; 
let eventNamesLUT = {}; 
let uniqueDrillsLUT = {}; 
let uniqueEventsLUT = {}; 
let eventResultsLUT = {}; 

try {
    const data = fs.readFileSync("./dataForMigration/1_teams.txt", 'utf8');
    addToTable(teamsLUT, data, 0); 
    // console.log(teamsLUT[1])
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
    // console.log(seasonLUT); 
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/3_division_series.txt", 'utf8'); 
    addToTable(divisionSeriesLUT, data,0); 
    // console.log(divisionSeriesLUT['52']); 
    // console.log(divisionSeriesLUT['53']); 
    // console.log(divisionSeriesLUT['54']); 
    // console.log(divisionSeriesLUT['55']); 
    // console.log(divisionSeriesLUT['56']); 
    // console.log(divisionSeriesLUT['57']); 
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/5_drill_names.txt", 'utf8'); 
    addToTable(drillNamesLUT, data,0); 
    // console.log(drillNamesLUT['0'])
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
    // console.log(eventNamesLUT)
} catch (e) {
    console.log(e); 
}

try {
    const data = fs.readFileSync("./dataForMigration/7_unique_drills.txt", 'utf8'); 
    addToTable(uniqueDrillsLUT, data,0); 
    // console.log(uniqueDrillsLUT['0'])
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
    // console.log(uniqueEventsLUT['0'])
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
    console.log(eventResultsLUT['1000'])
    console.log(eventResultsLUT['2001'])
    console.log(eventResultsLUT['3002'])
    console.log(eventResultsLUT['4003'])
    console.log(eventResultsLUT['5004'])
    console.log(eventResultsLUT['6005'])
} catch (e) {
    console.log(e); 
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
