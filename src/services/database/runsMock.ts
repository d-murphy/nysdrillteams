import { Run, RunsData } from '../../types/types'; 

const runs: Run[] = [
    {
        id: 123,
        team: "Central Islip Hoboes", 
        teamId: 1, 
        contest: "Three Man Ladder",
        tournament: "Central Islip Invitational", 
        tournamentId: 1,
        year: 2019,
        time: 6.3,
        runningPosition: 1, 
        circuit: ["Suffolk"], 
        date: new Date('7/28/2019')
    }, 
    {
        id: 124,
        team: "Central Islip Hoboes", 
        teamId: 1, 
        contest: "B Ladder",
        tournament: "Hagerman Invitational", 
        tournamentId: 2,
        year: 2020,
        time: 5.27,
        runningPosition: 15, 
        circuit: ["Suffolk"], 
        date: new Date('7/28/2020')
    }

]; 

const runsData: RunsData = {
    insertRun(newRun:Run): boolean {
        runs.push(newRun); 
        return true; 
    },
    deleteRun(runId:number): boolean {
        const index = runs.findIndex(el => {
            return el.id == runId
        })
        if(index != -1) {
            runs.splice(index,1); 
            return true;   
        } else {
            return false; 
        }
    }, 
    updateRun(updatedRun:Run):Run {
        const index = runs.findIndex(el => {
            return el.id == updatedRun.id
        })
        runs[index] = updatedRun; 
        return updatedRun; 
    }, 
    getRunsFromTournament(tournamentId:number):Run[] {
        console.log('mock version')
        return runs.filter(el => {
            return el.tournamentId == tournamentId; 
        })
    }, 
    getFilteredRuns( years: number[] = [], contests: string[] = [], teams: string[] = [] ):Run[] {
        let returnArr = runs; 
        if(years.length) returnArr = returnArr.filter(el => years.includes(el.year))
        if(contests.length) returnArr = returnArr.filter(el => contests.includes(el.contest))
        if(teams.length) returnArr = returnArr.filter(el => teams.includes(el.team)); 
        return returnArr; 
    }
}

export default runsData; 