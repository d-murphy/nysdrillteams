import { SimulationContestSummaryMethods, SimulationContestSummary } from '../../types/types'

class SimContSumService {

    constructor ( private dataSource : SimulationContestSummaryMethods ){}

    public getTopSimulationContestSummaries(
        contests: string, sortBy: string, limit: number, 
        offset: number, teams?: string, years?: string, 
        teamContestKeyArrToExclude?: string, 
        teamYearContestKeyArrToExclude?: string): Promise<SimulationContestSummary[]> {
        
        const contestArr: string[] = contests.split(','); 
        const teamArr: string[] = teams ? teams.split(',') : []; 
        const yearArr: number[] = years ? years.split(',').map(Number) : []; 
        const teamContestKeyArrToExcludeArr: string[] = teamContestKeyArrToExclude ? teamContestKeyArrToExclude.split(',') : []; 
        const teamYearContestKeyArrToExcludeArr: string[] = teamYearContestKeyArrToExclude ? teamYearContestKeyArrToExclude.split(',') : []; 
        return this.dataSource.getTopSimulationContestSummaries(contestArr, sortBy, limit, offset, teamArr, yearArr, teamContestKeyArrToExcludeArr, teamYearContestKeyArrToExcludeArr  ); 
    }
}
    
export default SimContSumService;
