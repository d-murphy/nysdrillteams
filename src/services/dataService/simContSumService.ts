import { SimulationContestSummaryMethods, SimulationContestSummary } from '../../types/types'

class SimContSumService {

    constructor ( private dataSource : SimulationContestSummaryMethods ){}

    public getSimulationContestSummary(team: string, year: number): Promise<SimulationContestSummary[]> {
        return this.dataSource.getSimulationContestSummary(team, year); 
    }
}
    
export default SimContSumService;
