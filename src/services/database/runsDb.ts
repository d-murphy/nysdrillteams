import { Collection, Db } from 'mongodb';
import { Run, RunsData, insertRunResp } from '../../types/types'; 
import { getCollectionPromise } from './db';

export async function runsDbFactory(dbPromise: Promise<Db>, collectionName: string):Promise<RunsData | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName); 
    if(collection) return new RunsDb(collection); 
}

class RunsDb implements RunsData{
    _dbCollection: Collection; 
    constructor(collection: Collection) {
        this._dbCollection = collection; 
    }
    insertRun(newRun: Run): insertRunResp {
        return { result: true, run: newRun }
        
    }
    deleteRun(runId: number): boolean {
        return true; 
    }
    updateRun(runId: number, pointsUpdate: number, timeUpdate: string): Run {
        return {team:'', contest:'', tournamentId:1, track: '', time: '', date: new Date(), urls: [], sanctioned:true}; 
    }
    getRun(runId: number): Run | undefined {
        return undefined; 
    }
    async getRunsFromTournament(tournamentId: number): Promise<Run[]> {
        console.log(await this._dbCollection.findOne()); 
        return [{team:'Bro', contest:'', tournamentId:1, track: '', time: '', date: new Date(), urls: [], sanctioned:true}]; 
    }
    getFilteredRuns(years: number[], contests: string[], teams: string[], circuit: string[]): Run[] {
        return []; 
    }
}