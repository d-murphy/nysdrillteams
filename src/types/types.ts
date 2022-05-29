export type Run = {
    id: number, 
    team: string, 
    contest: string,
    year: number, 
    tournament: string
    tournamentId: number,
    time: number, 
    runningPosition: number, 
    circuit: string, 
    date: Date, 
    urls: string[]
}

export interface RunsData {
    insertRun(newRun: Run): boolean;
    deleteRun(runId: number): boolean;
    updateRun(updatedRun:Run): Run; 
    getRun(runId: number): Run | undefined; 
    getRunsFromTournament(tournamentId:number): Run[]
    getFilteredRuns(years: number[], contests: string[], teams: string[], circuit: string[]): Run[]
}


export type Tournament = {
    id: number, 
    name: string, 
    year: number, 
    date: Date, 
    circuits: string[], 
    track: string,
    runningOrder: {string: number}
}

export interface TournamentsData {
    insertTournament(newTournament: Tournament): boolean;
    deleteTournament(tournamentId: number): boolean;
    updateTournament(updatedTournament:Tournament): Tournament; 
    getTournament(tournamentId:number): Tournament | undefined; 
    getTournaments(): Tournament[]
}


export type Track = {
    id: number, 
    name: string, 
    address: string, 
    city: string, 
    notes: string,
    imageUrls: [], 
    archHeight: number | null,
    distanceToHydrant: number | null
}

export interface TracksData {
    insertTrack(newTournament: Track): boolean;
    deleteTrack(tournamentId: number): boolean;
    updateTrack(updatedTournament:Track): Track; 
    getTrack(trackId:number): Track | undefined;
    getTracks(): Track[];
}
