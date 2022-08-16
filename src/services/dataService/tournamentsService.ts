import { TournamentsData, Tournament, tournamentDbResp } from '../../types/types'


class TournamentsService {

    constructor ( private dataSource : TournamentsData ){}

    public insertTournament(newTournament: Tournament): Promise<tournamentDbResp> {
        newTournament.date = new Date(newTournament.date); 
        newTournament.year = newTournament.date.getFullYear();
        return this.dataSource.insertTournament(newTournament); 
    }
    public deleteTournament(tournamentId: number): Promise<boolean> {
        return this.dataSource.deleteTournament(tournamentId); 
    }
    public updateTournament(tournamentId: string, fieldsToUpdate: {}): Promise<boolean> {
        return this.dataSource.updateTournament(tournamentId, fieldsToUpdate); 
    }
    public getTournament(tournamentId:number): Promise<Tournament | undefined> {
        return this.dataSource.getTournament(tournamentId); 
    }
    public getFilteredTournaments(years?: number[], tracks?:string[], tournaments?:string[]): Promise<Tournament[]>{
        return this.dataSource.getFilteredTournaments(years, tracks, tournaments); 
    }
    public getTournsCtByYear(): Promise<{_id: number, yearCount: number}[]>{
        return this.dataSource.getTournsCtByYear(); 
    }
    
}
    
export default TournamentsService; 