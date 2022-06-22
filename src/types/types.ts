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
    points?: number, 
    notes?: string,
    stateRecord?: boolean,
    currentStateRecord?: boolean
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
    circuitsForSchedule?: string[], 
    track: string,
    runningOrder?: { [runningPosition:number]: string },
    sanctioned: boolean, 
    top5?: {teamName: string, finishingPosition: string, points: number}[] 
    contests: string[],
    liveStreamPlanned?: boolean
    urls?: string[], 
    waterTime?: string
}

export interface TournamentsData {
    insertTournament(newTournament: Tournament): insertTournamentResp;
    deleteTournament(tournamentId: number): boolean;
    updateTournament(updatedTournament:Tournament): Tournament; 
    getTournament(tournamentId:number): Tournament | undefined; 
    getTournaments(years:number[]): Tournament[]; 
    getTournamentsByName(name:string):Tournament[]; 
    getTournamentsByTrack(name:string):Tournament[]; 
}

export type insertTournamentResp = {
    result: boolean, 
    tournament: Tournament
}



export type Track = {
    id: number, 
    name: string, 
    address: string, 
    city: string, 
    notes: string,
    imageUrls: string[], 
    archHeight: string | null,
    distanceToHydrant: number | null
}

export interface TracksData {
    insertTrack(newTrack: Track): insertTrackResp;
    deleteTrack(trackId: number): boolean;
    updateTrack(updatedTrack:Track): Track; 
    getTrack(trackId:number): Track | undefined;
    getTrackByName(trackName:string): Track | undefined;
    getTracks(): Track[];
}

export type insertTrackResp = {
    result: boolean, 
    track: Track
}


export type Team = {
    id: number,
    fullName: string,  
    name: string,
    town: string,
    circuit: string,
    imageUrl?: string, 
    active?: boolean
}

export interface TeamData {
    insertTeam(newTeam: Team): insertTeamResp;
    deleteTeam(teamId: number): boolean;
    updateTeam(updatedTeam:Team): Team; 
    getTeam(teamId:number): Team | undefined;
    getTeams(): Team[];
}

export type insertTeamResp = {
    result: boolean, 
    team: Team
}
