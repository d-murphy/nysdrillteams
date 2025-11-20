import { Collection, Db, UpdateResult } from 'mongodb';
import { FantasyName, FantasyNameSuggestion, FantasyNameMethods } from '../../types/types'; 
import { getCollectionPromise } from '../../library/db';

export async function fantasyNameDbFactory(dbPromise: Promise<Db>, nameSuggestionsCollection: string, playersCollection: string): Promise<FantasyNameMethods | undefined> {
    const nameSuggestionsCol = await getCollectionPromise(dbPromise, nameSuggestionsCollection);
    const playersCol = await getCollectionPromise(dbPromise, playersCollection);
    
    if(nameSuggestionsCol && playersCol) return new FantasyNameDb(nameSuggestionsCol, playersCol); 
    return undefined; 
}

class FantasyNameDb implements FantasyNameMethods {
    _nameSuggestionsCollection: Collection; 
    _playersCollection: Collection;
    
    constructor(nameSuggestionsCollection: Collection, playersCollection: Collection) {
        this._nameSuggestionsCollection = nameSuggestionsCollection; 
        this._playersCollection = playersCollection;
    }
    
    async getFantasyTeamNames(emails: string[]): Promise<Omit<FantasyName, 'accessCode'>[]> {
        const query = { email: { $in: emails } };
        return (this._playersCollection.find(query).project({ accessCode: 0 }).toArray() as unknown as FantasyName[]);
    }

    async isFantasyTeamNameAvailable(town: string, name: string): Promise<boolean> {
        const query = { town: town, name: name };
        const count = await this._playersCollection.countDocuments(query);
        return count === 0;
    }

    async upsertFantasyTeamName(email: string, town: string, name: string): Promise<UpdateResult> {
        const filter = { email: email };
        const update = { 
            $set: { 
                email: email, 
                town: town, 
                name: name 
            } 
        };
        return this._playersCollection.updateOne(filter, update, { upsert: true });
    }

    async getRandomFantasyTeamTown(): Promise<string> {
        const query = { type: 'town' };
        const count = await this._nameSuggestionsCollection.countDocuments(query);
        const randomIndex = Math.floor(Math.random() * count);
        const result = await this._nameSuggestionsCollection.findOne(query, { skip: randomIndex });
        return result?.name || '';
    }

    async getFantasyTeamTowns(searchString: string, limit: number, offset: number): Promise<string[]> {
        const query = { 
            type: 'town',
            name: { $regex: searchString, $options: 'i' }
        };
        const results = await this._nameSuggestionsCollection
            .find(query)
            .sort({ name: 1 }) // Sort alphabetically by name
            .skip(offset)
            .limit(limit)
            .toArray() as unknown as FantasyNameSuggestion[];
        
        return results.map(result => result.name);
    }

    async getTeamNameSuggestions(town: string, limit: number, offset: number): Promise<string[]> {
        const firstLetter = town.charAt(0).toUpperCase();
        const halfLimit = Math.ceil(limit / 2);
        
        // Get half the results matching the first letter of the town
        const matchingQuery = { 
            type: 'team',
            name: { $regex: `^${firstLetter}`, $options: 'i' }
        };
        
        // Get half the results NOT matching the first letter of the town
        const nonMatchingQuery = { 
            type: 'team',
            name: { $not: { $regex: `^${firstLetter}`, $options: 'i' } }
        };
        
        // Execute both queries in parallel
        const [matchingResults, nonMatchingResults] = await Promise.all([
            this._nameSuggestionsCollection
                .aggregate([
                    { $match: matchingQuery },
                    { $sample: { size: halfLimit } }
                ])
                .toArray() as unknown as FantasyNameSuggestion[],
            this._nameSuggestionsCollection
                .aggregate([
                    { $match: nonMatchingQuery },
                    { $sample: { size: halfLimit } }
                ])
                .toArray() as unknown as FantasyNameSuggestion[]
        ]);
        
        // Combine and shuffle the results
        const allResults = [
            ...matchingResults.map(result => result.name),
            ...nonMatchingResults.map(result => result.name)
        ];
                
        return allResults.slice(0, limit);
    }

    async setCodeUsed(email: string, accessCode: string): Promise<boolean> {
        const filter = { email: email, accessCode: accessCode };
        const update = { $set: { codeUsed: true } };
        const result = await this._playersCollection.updateOne(filter, update);
        return result.modifiedCount > 0;
    }
}
