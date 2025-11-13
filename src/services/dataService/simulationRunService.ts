import { SimulationRunMethods, SimulationRun } from '../../types/types';

class SimulationRunService {

    constructor (
        private dataSource: SimulationRunMethods
    ){}

    public getSimulationRuns(keys: string[]): Promise<SimulationRun[]> {
        // Validate that keys array doesn't exceed 400
        if (keys.length > 450) {
            throw new Error(`Cannot request more than 450 keys. Received: ${keys.length}`);
        }
        return this.dataSource.getSimulationRuns(keys); 
    }
}
    
export default SimulationRunService;

