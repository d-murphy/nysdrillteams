export type Run = {
    id?: number, 
    team: string, 
    contest: string,
    year?: number, 
    tournament?: string
    tournamentId: number,
    track: string, 
    time: string, 
    runningPosition?: number, 
    circuit?: string, 
    date: Date, 
    urls: string[], 
    sanctioned: boolean
    points?: number
}

export interface RunsData {
    insertRun(newRun: Run): insertRunResp;
    deleteRun(runId: number): boolean;
    updateRun(runId: number, pointsUpdate: number, timeUpdate: string): Run; 
    getRun(runId: number): Run | undefined; 
    getRunsFromTournament(tournamentId:number): Run[]
    getFilteredRuns(years: number[], contests: string[], teams: string[], circuit: string[]): Run[]
}

export type insertRunResp = {
    result: boolean, 
    run: Run
}


export type Tournament = {
    id: number, 
    name: string, 
    year: number, 
    date: Date, 
    circuits: string[], 
    track: string,
    runningOrder: { [teamName: string]: number },
    sanctioned: boolean
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
    insertTrack(newTrack: Track): boolean;
    deleteTrack(trackId: number): boolean;
    updateTrack(updatedTrack:Track): Track; 
    getTrack(trackId:number): Track | undefined;
    getTracks(): Track[];
}

export type Team = {
    id: number,
    fullName: string,  
    name: string,
    town: string,
    circuit: string,
    imageUrl: string, 
}

export interface TeamData {
    insertTeam(newTeam: Team): boolean;
    deleteTeam(teamId: number): boolean;
    updateTeam(updatedTeam:Team): Team; 
    getTeam(teamId:number): Team | undefined;
    getTeams(): Team[];
}