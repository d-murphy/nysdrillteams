import { UpdateResult } from 'mongodb';
import { FantasyNameMethods, FantasyName } from '../../types/types';

class FantasyNameService {

    constructor (
        private dataSource: FantasyNameMethods
    ){}

    public getFantasyTeamNames(emails: string[]): Promise<FantasyName[]> {
        return this.dataSource.getFantasyTeamNames(emails); 
    }

    public async getFantasyTeamNamePossiblyNew(email: string): Promise<FantasyName> {

        const existingTeamNames = await this.dataSource.getFantasyTeamNames([email]);
        if(existingTeamNames.length > 0) return existingTeamNames[0];
        var newTeamName: FantasyName | undefined = undefined; 
        while(!newTeamName || !this.dataSource.isFantasyTeamNameAvailable(newTeamName.town, newTeamName.name)) {
            const townName = await this.dataSource.getRandomFantasyTeamTown();
            const teamNameSuggestions = await this.dataSource.getTeamNameSuggestions(townName, 1, 0);
            const teamName = teamNameSuggestions[0]; 
            newTeamName = {
                email: email,
                town: townName,
                name: teamName, 
            }
        }
        await this.dataSource.upsertFantasyTeamName(email, newTeamName.town, newTeamName.name); 
        return newTeamName; 
    }

    public isFantasyTeamNameAvailable(town: string, name: string): Promise<boolean> {
        return this.dataSource.isFantasyTeamNameAvailable(town, name); 
    }

    public upsertFantasyTeamName(email: string, town: string, name: string): Promise<UpdateResult> {
        return this.dataSource.upsertFantasyTeamName(email, town, name); 
    }

    public getFantasyTeamTowns(searchString: string, limit: number, offset: number): Promise<string[]> {
        // Validate limit and offset
        const validLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100
        const validOffset = Math.max(offset, 0); // At least 0
        
        return this.dataSource.getFantasyTeamTowns(searchString, validLimit, validOffset); 
    }

    public getTeamNameSuggestions(town: string, limit: number, offset: number): Promise<string[]> {
        // Validate limit and offset
        const validLimit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100
        const validOffset = Math.max(offset, 0); // At least 0
        
        return this.dataSource.getTeamNameSuggestions(town, validLimit, validOffset); 
    }

    public setCodeUsed(email: string, accessCode: string): Promise<boolean> {
        return this.dataSource.setCodeUsed(email, accessCode); 
    }
}
    
export default FantasyNameService;
