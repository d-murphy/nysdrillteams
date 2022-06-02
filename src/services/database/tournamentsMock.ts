import { Tournament, TournamentsData } from '../../types/types'; 

const tournaments: Tournament[] = loadMockTournaments(); 

const tracksData: TournamentsData = {
    insertTournament(newTournament:Tournament): boolean {
        tournaments.push(newTournament); 
        return true; 
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
    getTournaments():Tournament[] {
        return tournaments; 
    }
}

export default tracksData; 


function loadMockTournaments(): Tournament[]{
    return [
        {
            id: 1, 
            name: 'Central Islip Invitational', 
            year: 2020, 
            date: new Date('7/28/2020'), 
            circuits: ['Suffolk', 'Nassau'], 
            track: 'Central Islip',
            runningOrder: { 'Central Islip Hoboes': 1, 'Hagerman Gamblers': 2, 'Bay Shore Redskins': 3 }, 
            sanctioned: true      
        },
        {
            id: 1, 
            name: 'Hagerman Invitational', 
            year: 2020, 
            date: new Date('8/28/2020'), 
            circuits: ['Suffolk'], 
            track: 'Hagerman',
            runningOrder: { 'Central Islip Hoboes': 8, 'Hagerman Gamblers': 1, 'Bay Shore Redskins': 7 }, 
            sanctioned: true              
        }
    ]; 
}