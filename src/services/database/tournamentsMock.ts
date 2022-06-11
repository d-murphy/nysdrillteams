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
            track: 'Lindenhurst',
            runningOrder: { 'Central Islip Hoboes': 1, 'Hagerman Gamblers': 2, 'Bay Shore Redskins': 3 }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"], 
            liveStreamPlanned: true,
            top5: [ {teamName: "Central Islip Hoboes", finishingPosition: "1"} ], 
            urls: ["http://www.youtube.com"]  

     
        },
        {
            id: 2, 
            name: 'North Bellmore Invitational', 
            year: 2022, 
            date: new Date('6/11/2022'), 
            circuits: ['Nassau'], 
            track: 'Merrick',
            runningOrder: { 'Port Washington Road Runners': 1, 'Carle Place Frogs': 2, 'Manhasset Lakeville Minute Men': 3 }, 
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
            track: 'Ridge',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 5, 
            name: 'Joe Hunter Memorial', 
            year: 2022, 
            date: new Date('6/30/2022'), 
            circuits: [], 
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
            track: 'Central Islip',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        },
        {
            id: 11, 
            name: 'Hempstead Invitational', 
            year: 2022, 
            date: new Date('8/6/2022'), 
            circuits: ["Suffolk", "Nassau"], 
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
            track: 'West Sayville',
            runningOrder: { }, 
            sanctioned: true, 
            contests: ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]              
        }
    ]; 
}