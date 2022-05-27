import { Run } from '../../types/types'; 

const runs: Run[] = []; 

const insertRun = function(newRun:Run): boolean {
    runs.push(newRun); 
    return true; 
}

const deleteRun = function (runId:number): boolean {
    const index = runs.findIndex(el => {
        return el.id == runId
    })
    if(index != -1) {
        runs.splice(index,1); 
        return true;   
    } else {
        return false; 
    }
}

const updateRun = function (updatedRun:Run):Run {
    const index = runs.findIndex(el => {
        return el.id == updatedRun.id
    })
    runs[index] = updatedRun; 
    return updatedRun; 
}

const getRuns = function():Run[] {
    return runs; 
}

const getRunsFromTournament = function(tournamentId:number):Run[] {
    return runs.filter(el => {
        return el.tournamentId == tournamentId; 
    })
}

const getFilteredRuns = function( years: number[] = [], contests: string[] = [], teams: string[] = [] ):Run[] {
    let returnArr = runs; 
    if(years.length) returnArr = returnArr.filter(el => years.includes(el.year))
    if(contests.length) returnArr = returnArr.filter(el => contests.includes(el.contest))
    if(teams.length) returnArr = returnArr.filter(el => teams.includes(el.team)); 
    return returnArr; 
}
