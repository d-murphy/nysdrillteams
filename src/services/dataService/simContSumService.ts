import { SimulationContestSummaryMethods, SimulationContestSummary } from '../../types/types'

class SimContSumService {

    constructor ( private dataSource : SimulationContestSummaryMethods ){}

    public getTopSimulationContestSummaries(contests: string, sortBy: string, limit: number, offset: number, teams?: string, years?: string): Promise<SimulationContestSummary[]> {
        
        const contestArr: string[] = contests.split(','); 
        const teamArr: string[] = teams ? teams.split(',') : []; 
        const yearArr: number[] = years ? years.split(',').map(Number) : []; 
        
        return this.dataSource.getTopSimulationContestSummaries(contestArr, sortBy, limit, offset, teamArr, yearArr); 
    }
}
    
export default SimContSumService;
