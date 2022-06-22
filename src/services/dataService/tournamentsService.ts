import { TournamentsData, Tournament, insertTournamentResp } from '../../types/types'


class TournamentsService {

    constructor ( private dataSource : TournamentsData ){}

    public insertTournament(newTournament: Tournament): insertTournamentResp {
        newTournament.date = new Date(newTournament.date); 
        newTournament.year = newTournament.date.getFullYear();
        return this.dataSource.insertTournament(newTournament); 
    }
    public deleteTournament(tournamentId: number): boolean {
        return this.dataSource.deleteTournament(tournamentId); 
    }
    public updateTournament(updatedTournament:Tournament): Tournament {
        return this.dataSource.updateTournament(updatedTournament); 
    }
    public getTournament(tournamentId:number): Tournament | undefined {
        return this.dataSource.getTournament(tournamentId); 
    }
    public getTournaments(years: number[]=[]): Tournament[] {
        return this.dataSource.getTournaments(years); 
    }
    public getTournamentsByName(name: string): Tournament[] {
        return this.dataSource.getTournamentsByName(name); 
    }
    public getTournamentsByTrack(track: string): Tournament[] {
        return this.dataSource.getTournamentsByTrack(track); 
    }
}
    
export default TournamentsService; 