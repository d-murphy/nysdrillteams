export type Run = {
    id: number, 
    team: string, 
    teamId: number,
    contest: string,
    year: number, 
    tournament: string
    tournamentId: number, 
    time: number, 
    runningPosition: number, 
    circuit: string[], 
    date: Date
}

export interface RunsData {
    insertRun(newRun: Run): boolean;
    deleteRun(runId: number): boolean;
    updateRun(updatedRun:Run): Run; 
    getRunsFromTournament(tournamentId:number): Run[]
    getFilteredRuns(years: number[], contests: string[], teams: string[]): Run[]
}
