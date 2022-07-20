import { Collection } from 'mongodb';
import { Run, RunsData, insertRunResp } from '../../types/types'; 

const runs: Run[] = loadMockRuns(); 

const runsData: RunsData = {
    _dbCollection: undefined, 
    insertRun(newRun:Run): insertRunResp {
        runs.push(newRun); 
        return { result: true, run: newRun }
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
    updateRun(runId: number, pointsUpdate:number | undefined = undefined, timeUpdate:string | undefined = undefined):Run {
        const index = runs.findIndex(el => {
            return el.id == runId
        })
        if(pointsUpdate) runs[index].points = pointsUpdate; 
        if(timeUpdate) runs[index].time = timeUpdate; 
        return runs[index]; 
    }, 
    getRun(runId: number): Run | undefined{
        return runs.find(el => el.id == runId)
    },
    async getRunsFromTournament(tournamentId:number):Promise<Run[]> {
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
            tournament: "Linderhurst Invitational",
            tournamentId: 12,
            year: 2022,
            time: '6.32',
            runningPosition: 1, 
            track: "Central Islip",
            circuit: "Suffolk", 
            date: new Date('7/28/2019'), 
            urls: [], 
            sanctioned:true,
            points: 0
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
            sanctioned:true,
            points: 0
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
            sanctioned:true,
            points: 0
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
            sanctioned:true,
            points: 4
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
            sanctioned:true,
            points: 3
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
            sanctioned: true,
            points: 2.5
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
        },
        {
            id: 551,
            team: "Central Islip Hoboes", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '6.32',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 5
        },
        {
            id: 552,
            team: "West Sayville Flying Dutchmen", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '6.62',
            runningPosition: 4, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 3
        },
        {
            id: 553,
            team: "East Islip Guzzlers", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '6.99',
            runningPosition: 5, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 0
        },
        {
            id: 554,
            team: "Islip Wolves", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '6.45',
            runningPosition: 6, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 4
        },
        {
            id: 555,
            team: "Hagerman Gamblers", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '6.81',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 1
        },
        {
            id: 556,
            team: "Bay Shore Redskins", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: 'NT',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 0
        },
        {
            id: 557,
            team: "Port Washington Road Runners", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: 'OT',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 0
        },
        {
            id: 558,
            team: "Hempstead Yellow Hornets", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '6.70',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 2
        },
        {
            id: 559,
            team: "Roslyn Highlanders", 
            contest: "Three Man Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '8.20',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 0
        },
        {
            id: 551,
            team: "Central Islip Hoboes", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '5.22',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 3
        },
        {
            id: 552,
            team: "West Sayville Flying Dutchmen", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '5.07',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 5
        },
        {
            id: 553,
            team: "East Islip Guzzlers", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '5.61',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 1
        },
        {
            id: 554,
            team: "Islip Wolves", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '5.14',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 4
        },
        {
            id: 555,
            team: "Hagerman Gamblers", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: 'NT',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: ["http://www.youtube.com"], 
            sanctioned:true,
            points: 0
        },
        {
            id: 556,
            team: "Bay Shore Redskins", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: 'NT',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 0
        },
        {
            id: 557,
            team: "Port Washington Road Runners", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: 'OT',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 0
        },
        {
            id: 558,
            team: "Hempstead Yellow Hornets", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: '5.45',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 2
        },
        {
            id: 559,
            team: "Roslyn Highlanders", 
            contest: "B Ladder",
            tournament: "Linderhurst Invitational",
            tournamentId: 1,
            year: 2022,
            time: 'OT',
            runningPosition: 3, 
            track: "Lindenhurst",
            circuit: "Suffolk", 
            date: new Date('6/5/2022'), 
            urls: [], 
            sanctioned:true,
            points: 0
        }
    
    ]; 
}
