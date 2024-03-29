import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { TournamentsData, Tournament, FinishesReturn } from '../../types/types'


class TournamentsService {

    constructor ( private dataSource : TournamentsData ){}

    public insertTournament(newTournament: Tournament): Promise<InsertOneResult> {
        newTournament.date = new Date(newTournament.date); 
        newTournament.year = newTournament.date.getFullYear();
        return this.dataSource.insertTournament(newTournament); 
    }
    public deleteTournament(tournamentId: string): Promise<DeleteResult> {
        return this.dataSource.deleteTournament(tournamentId); 
    }
    public updateTournament(tournamentId: string, fieldsToUpdate: {}): Promise<UpdateResult> {
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
    public getTournamentNames(): Promise<{_id: string, nameCount:number}[]>{
        return this.dataSource.getTournamentNames(); 
    }
    public getHostNames(): Promise<{_id: string, nameCount:number}[]>{
        return this.dataSource.getHostNames(); 
    }
    public getFinishes(team: string, years?: number[]): Promise<FinishesReturn[]>{
        return this.dataSource.getFinishes(team, years); 
    }
    public getTournsTop5(team:string):Promise<{name: string, id: number, date: Date, track: string, top5: {teamName: string, finishingPosition: string, points: number}}[]> {
        return this.dataSource.getTournsTop5(team); 
    }
    public getTournsAppearing(team:string): Promise<{name: string, id: number, date: Date, track: string, runningOrder: { k:string,  v: string }}[]> {
        return this.dataSource.getTournsAppearing(team); 
    }


}
    
export default TournamentsService; 