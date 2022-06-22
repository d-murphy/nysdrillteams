import { Tournament, TournamentsData, insertTournamentResp } from '../../types/types'; 

const tournaments: Tournament[] = loadMockTournaments(); 

const tracksData: TournamentsData = {
    insertTournament(newTournament:Tournament): insertTournamentResp {
        if(!newTournament.id) newTournament.id = Math.floor(Math.random()*10000)
        tournaments.push(newTournament); 
        return {result: true, tournament: newTournament}; 
    },
    deleteTournament(tournamentId:number): boolean {
        const index = tournaments.findIndex(el => {
            return el.id == tournamentId
        })
        if(index != -1) {
            tournaments.splice(index,1); 
            return true;   
        } else {
            return false; 
        }
    }, 
    updateTournament(updatedTournament:Tournament):Tournament {
        const index = tournaments.findIndex(el => {
            return el.id == updatedTournament.id
        })
        tournaments[index] = updatedTournament; 
        return updatedTournament; 
    }, 
    getTournament(tournamentId:number):Tournament | undefined {
        return tournaments.find(el => {
            return el.id == tournamentId; 
        })
    }, 
    getTournaments(years:number[] = []):Tournament[] {
        if(years.length==0) return tournaments; 
        return tournaments.filter(torn => {
            return years.includes(torn.year)
        }); 
    },
    getTournamentsByName(name:string):Tournament[] {
        return tournaments.filter(torn => {
            return torn.name == name; 
        }); 
    }, 
    getTournamentsByTrack(track: string): Tournament[] {
        return tournaments.filter(torn => {
            return torn.track == track; 
        });  
    }

}

export default tracksData; 


function loadMockTournaments(): Tournament[]{
    return [
        {
            id: 1, 
            name: 'Lindenhurst Invitational Drill', 
            year: 2022, 
            date: new Date('6/4/2022 10:00 am'), 
            circuits: ['Suffolk', 'Nassau'], 
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            track: 'Lindenhurst',
            runningOrder: { 
                3:'Central Islip Hoboes', 
                4: 'West Sayville Flying Dutchmen', 
                5: 'East Islip Guzzlers', 
                6: 'Islip Wolves', 
                7:'Hagerman Gamblers', 
                10:'Bay Shore Redskins',
                11: 'Port Washington Road Runners', 
                12: 'Hempstead Yellow Hornets', 
                13: 'Roslyn Highlanders'
            }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"], 
            liveStreamPlanned: true,
            top5: [ {teamName: "Central Islip Hoboes", finishingPosition: "1", points:20} ], 
            urls: ["http://www.youtube.com"]  

     
        },
        {
            id: 2, 
            name: 'North Bellmore Invitational', 
            year: 2022, 
            date: new Date('6/11/2022'), 
            circuits: ['Nassau'], 
            circuitsForSchedule: [ 'Nassau'],
            track: 'Merrick',
            runningOrder: { 10:'Port Washington Road Runners', 13:'Carle Place Frogs', 14:'Manhasset Lakeville Minute Men' }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"], 
            liveStreamPlanned: true              
        },
        {
            id: 3, 
            name: 'Town of Brookhaven', 
            year: 2022, 
            date: new Date('6/17/2022'), 
            circuits: [], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 4, 
            name: 'Selden Invitational', 
            year: 2022, 
            date: new Date('6/25/2022'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 401, 
            name: 'Selden Invitational', 
            year: 2021, 
            date: new Date('6/25/2021'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            top5: [ 
                {teamName: "West Sayville Flying Dutchmen", finishingPosition: "1", points:15},
                {teamName: "Carle Place Frogs", finishingPosition: "1", points:15} 
             ], 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 402, 
            name: 'Selden Invitational', 
            year: 2020, 
            date: new Date('6/25/2020'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            top5: [ 
                {teamName: "West Sayville Flying Dutchmen", finishingPosition: "1", points:18},
                {teamName: "Carle Place Frogs", finishingPosition: "2", points:15} 
             ], 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 403, 
            name: 'Selden Invitational', 
            year: 2019, 
            date: new Date('6/25/2019'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            top5: [ 
                {teamName: "East Islip Guzzlers", finishingPosition: "1", points:25},
                {teamName: "Bay Shore Redskins", finishingPosition: "2", points: 20}
             ], 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },

        {
            id: 5, 
            name: 'Joe Hunter Memorial', 
            year: 2022, 
            date: new Date('6/30/2022'), 
            circuits: [], 
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            track: 'Hempstead',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 6, 
            name: 'Nassau County', 
            year: 2022, 
            date: new Date('7/9/2022'), 
            circuits: ["Nassau"], 
            circuitsForSchedule: [ 'Nassau'],
            track: 'Merrick',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"], 
            liveStreamPlanned: true              
        },
        {
            id: 7, 
            name: 'Suffolk County', 
            year: 2022, 
            date: new Date('7/9/2022'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Copiague',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 8, 
            name: 'Joe Gonnelly Memorial', 
            year: 2022, 
            date: new Date('7/16/2022'), 
            circuits: [], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Hagerman',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 9, 
            name: 'Farmingville Invitational', 
            year: 2022, 
            date: new Date('7/23/2022'), 
            circuits: [], 
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"], 
            liveStreamPlanned: true              
        },
        {
            id: 10, 
            name: 'Central Islip Invitational', 
            year: 2022, 
            date: new Date('7/30/2022'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            track: 'Central Islip',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"], 
            urls: []  
              
        },
        {
            id: 101, 
            name: 'Central Islip Invitational', 
            year: 2021, 
            date: new Date('7/30/2021'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            track: 'Central Islip',
            runningOrder: { }, 
            sanctioned: true, 
            top5: [ 
                {teamName: "West Sayville Flying Dutchmen", finishingPosition: "1", points:15},
                {teamName: "Carle Place Frogs", finishingPosition: "1", points:15} 
             ], 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 102, 
            name: 'Central Islip Invitational', 
            year: 2020, 
            date: new Date('7/30/2020'), 
            circuits: ["Suffolk"], 
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            track: 'Central Islip',
            runningOrder: { }, 
            sanctioned: true, 
            top5: [ 
                {teamName: "West Sayville Flying Dutchmen", finishingPosition: "1", points:18},
                {teamName: "Carle Place Frogs", finishingPosition: "2", points:15} 
             ], 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 103, 
            name: 'Central Islip Invitational', 
            year: 2019, 
            date: new Date('7/30/2019'), 
            circuits: ["Suffolk"], 
            track: 'Central Islip',
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            runningOrder: { }, 
            sanctioned: true, 
            top5: [ 
                {teamName: "East Islip Guzzlers", finishingPosition: "1", points:25},
                {teamName: "Bay Shore Redskins", finishingPosition: "2", points: 20}
             ], 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 11, 
            name: 'Hempstead Invitational', 
            year: 2022, 
            date: new Date('8/6/2022'), 
            circuits: ["Suffolk", "Nassau"], 
            circuitsForSchedule: ['Suffolk', 'Nassau'],
            track: 'Hempstead',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 12, 
            name: 'New York State', 
            year: 2022, 
            date: new Date('8/20/2022'), 
            circuits: ["Suffolk", "Nassau", "Northern", "Western"], 
            circuitsForSchedule: ['Suffolk', 'Nassau', "Northern", "Western"],
            track: 'Merrick',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 13, 
            name: 'Town of Islip', 
            year: 2022, 
            date: new Date('8/26/2022'), 
            circuits: [], 
            circuitsForSchedule: ['Suffolk'],
            track: 'Central Islip',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 14, 
            name: 'Hagerman Labor Day', 
            year: 2022, 
            date: new Date('9/3/2022'), 
            circuits: ["Suffok"], 
            circuitsForSchedule: ['Nassau'],
            track: 'Hagerman',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 15, 
            name: 'West Hempstead', 
            year: 2022, 
            date: new Date('9/5/2022'), 
            circuits: ["Nassau"], 
            circuitsForSchedule: ['Nassau'],
            track: 'Hempstead',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 16, 
            name: 'Town of Babylon', 
            year: 2022, 
            date: new Date('9/9/2022'), 
            circuits: [], 
            circuitsForSchedule: ['Nassau'],
            track: 'Lindenhurst',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 17, 
            name: 'Sea Breeze Invitational', 
            year: 2022, 
            date: new Date('6/25/2022'), 
            circuits: ["Western"], 
            circuitsForSchedule: ["Western"],
            track: 'Point Pleasant',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 18, 
            name: 'Deerfield Invitational', 
            year: 2022, 
            date: new Date('7/9/2022'), 
            circuits: ["Western", "Northern"], 
            circuitsForSchedule: ["Western", "Northern"],
            track: 'Deerfield',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 19, 
            name: 'Main-Transit Invitational', 
            year: 2022, 
            date: new Date('7/15/2022'), 
            circuits: ["Western"], 
            circuitsForSchedule: ["Western"],
            track: 'Main-Transit',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 20, 
            name: 'Spencerport Invitational', 
            year: 2022, 
            date: new Date('8/6/2022'), 
            circuits: ["Western"], 
            circuitsForSchedule: ["Western"],
            track: 'Spencerport',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 21, 
            name: 'Point Pleasant Invitational', 
            year: 2022, 
            date: new Date('8/27/2022'), 
            circuits: ["Western"], 
            circuitsForSchedule: ["Western"],
            track: 'Point Pleasant',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 22, 
            name: 'Bayville Invitational OF', 
            year: 2022, 
            date: new Date('6/18/2022'), 
            circuits: ["Old Fashioned"], 
            circuitsForSchedule: ["Old Fashioned"],
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "Running Ladder", "Efficiency", "Running Hose", "Buckets"]              
        },
        {
            id: 23, 
            name: 'West Sayville Jr. Invitational', 
            year: 2022, 
            date: new Date('7/24/2022'), 
            circuits: ["Junior"], 
            circuitsForSchedule: ["Junior"],
            track: 'West Sayville',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        }
    ]; 
}