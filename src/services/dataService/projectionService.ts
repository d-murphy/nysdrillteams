import { ProjectionMethods, Projection } from '../../types/types'

class ProjectionService {

    constructor ( private dataSource : ProjectionMethods ){}

    public getProjections(year: number): Promise<Projection[]> {
        return this.dataSource.getProjections(year); 
    }

    public getAvailableYears(): Promise<number[]> {
        return this.dataSource.getAvailableYears(); 
    }
}
    
export default ProjectionService;
