import { Run, RunsData } from '../../types/types'; 

const runs: Run[] = loadMockRuns(); 

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
    getRun(runId: number): Run | undefined{
        return runs.find(el => el.id == runId)
    },
    getRunsFromTournament(tournamentId:number):Run[] {
        console.log('mock version')
        return runs.filter(el => {
            return el.tournamentId == tournamentId; 
        })
    }, 
    getFilteredRuns( years: number[] = [], contests: string[] = [], teams: string[] = [], circuits: string[] = [] ):Run[] {
        let returnArr = runs; 
        if(years.length) returnArr = returnArr.filter(el => years.includes(el.year !== undefined ? el.year : 0))
        if(contests.length) returnArr = returnArr.filter(el => contests.includes(el.contest))
        if(teams.length) returnArr = returnArr.filter(el => teams.includes(el.team)); 
        if(circuits.length) returnArr = returnArr.filter(el => circuits.includes(el.circuit !== undefined ? el.circuit : '')); 
        return returnArr; 
    }
}

export default runsData; 


function loadMockRuns(): Run[]{
    return [
        {
            id: 123,
            team: "Central Islip Hoboes", 
            contest: "Three Man Ladder",
            tournament: "Central Islip Invitational",
            tournamentId: 1,
            year: 2019,
            time: '6.3',
            runningPosition: 1, 
            track: "Central Islip",
            circuit: "Suffolk", 
            date: new Date('7/28/2019'), 
            urls: [], 
            sanctioned:true
        }, 
        {
            id: 124,
            team: "Central Islip Hoboes", 
            contest: "B Ladder",
            tournament: "Hagerman Invitational", 
            tournamentId: 2,
            year: 2020,
            time: '5.27',
            runningPosition: 15, 
            track: "Hagerman",
            circuit: "Suffolk", 
            date: new Date('7/28/2020'), 
            urls: [], 
            sanctioned:true
        }, 
        {
            id: 125,
            team: "Central Islip Hoboes", 
            contest: "C Ladder",
            tournament: "Hagerman Invitational", 
            tournamentId: 2,
            year: 2020,
            time: '9.3',
            runningPosition: 15, 
            track: "Hagerman",
            circuit: "Suffolk", 
            date: new Date('7/28/2020'), 
            urls: [], 
            sanctioned:true
        }, 
        {
            id: 126,
            team: "Bay Shore Redskins", 
            contest: "C Hose",
            tournament: "Hagerman Invitational", 
            tournamentId: 2,
            year: 2020,
            time: '12.5',
            runningPosition: 13, 
            track: "Hagerman",
            circuit: "Suffolk", 
            date: new Date('7/28/2020'), 
            urls: [], 
            sanctioned:true
        }, 
        {
            id: 127,
            team: "Carle Place Frogs", 
            contest: "Efficiency",
            tournament: "Hagerman Invitational", 
            tournamentId: 2,
            year: 2020,
            time: '9.67',
            runningPosition: 12, 
            track: "Hagerman",
            circuit: "", 
            date: new Date('7/28/2020'), 
            urls: [], 
            sanctioned:true
        }, 
        {
            id: 127,
            team: "Bay Shore Redskins", 
            contest: "Motor Pump",
            tournament: "Hagerman Invitational", 
            tournamentId: 2,
            year: 2020,
            time: '6.12',
            runningPosition: 13, 
            track: "Hagerman",
            circuit: "Suffolk", 
            date: new Date('7/28/2020'), 
            urls: [], 
            sanctioned:true
        }, 
        {
            id: 126,
            team: "Bay Shore Redskins", 
            contest: "Buckets",
            tournament: "Hagerman Invitational", 
            tournamentId: 2,
            year: 2020,
            time: '23.20',
            runningPosition: 13, 
            track: "Hagerman",
            circuit: "Suffolk", 
            date: new Date('7/28/2020'), 
            urls: [], 
            sanctioned:true
        }
    
    ]; 
}