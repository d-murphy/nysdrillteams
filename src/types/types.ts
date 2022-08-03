import { Collection, ObjectId } from "mongodb"

export type Run = {
    id?: number, 
    team: string, 
    hometown?: string, 
    nickname?: string, 
    contest: string,
    year: number, 
    tournament: string,
    tournamentId: number,
    track: string, 
    time: string, 
    runningPosition?: number, 
    nassauPoints?: boolean, 
    suffolkPoints?: boolean, 
    westernPoints?: boolean, 
    northernPoints?: boolean, 
    suffolkOfPoints?: boolean, 
    nassauOfPoints?: boolean, 
    liOfPoints?: boolean, 
    juniorPoints?: boolean,
    date: Date, 
    urls: string[], 
    sanctioned: boolean, 
    points?: number, 
    rank?: string, 
    notes?: string,
    stateRecord?: string,
    currentStateRecord?: string
}

export interface RunsData {
    _dbCollection: Collection | undefined;  
    insertRun(newRun: Run): Promise<runDbResult>;
    deleteRun(runId: number): Promise<boolean>;
    updateRun(runId: number, pointsUpdate: number, timeUpdate: string, rankUpdate: string): Promise<runDbResult>; 
    getRun(runId: number): Promise<Run | undefined>;
    getRunsFromTournament(tournamentId:number): Promise<Run[]>
    getFilteredRuns(        
        years?: number[], 
        contests?: string[], 
        teams?: string[], 
        tracks?:string[], 
        tournaments?:string[], 
        ranks?:string[], 
        stateRecord?: boolean, 
        currentStateRecord?: boolean,
    ): Promise<Run[]>
}

export type runDbResult = {
    result: boolean, 
    run: Run | undefined
}


export type Tournament = {
    id: number, 
    name: string, 
    year: number, 
    date: Date, 
    startTime: Date, 
    nassauPoints: boolean, 
    suffolkPoints: boolean, 
    westernPoints: boolean, 
    northernPoints: boolean, 
    suffolkOfPoints: boolean, 
    nassauOfPoints: boolean, 
    liOfPoints: boolean, 
    juniorPoints: boolean,
    nassauSchedule: boolean, 
    suffolkSchedule: boolean, 
    westernSchedule: boolean, 
    northernSchedule: boolean, 
    liOfSchedule: boolean, 
    juniorSchedule: boolean,
    track: string,
    runningOrder?: { [runningPosition:number]: string },
    sanctioned: boolean, 
    cfp: boolean, 
    top5?: {teamName: string, finishingPosition: string, points: number}[] 
    contests: {name:string, cfp:boolean, sanction:boolean}[],
    liveStreamPlanned?: boolean
    urls?: string[], 
    waterTime?: string
}

export interface TournamentsData {
    insertTournament(newTournament: Tournament): tournamentDbResp;
    deleteTournament(tournamentId: number): boolean;
    updateTournament(updatedTournament:Tournament): Tournament; 
    getTournament(tournamentId:number): Tournament | undefined; 
    getTournaments(years:number[]): Tournament[]; 
    getTournamentsByName(name:string):Tournament[]; 
    getTournamentsByTrack(name:string):Tournament[]; 
}

export type tournamentDbResp = {
    result: boolean, 
    tournament: Tournament | undefined
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
    insertTrack(newTrack: Track): trackDbResp;
    deleteTrack(trackId: number): boolean;
    updateTrack(updatedTrack:Track): Track; 
    getTrack(trackId:number): Track | undefined;
    getTrackByName(trackName:string): Track | undefined;
    getTracks(): Track[];
}

export type trackDbResp = {
    result: boolean, 
    track: Track | undefined
}


export type Team = {
    _id: ObjectId, 
    id?: number,
    fullName: string,  
    circuit: string,
    imageUrl?: string, 
    active?: boolean, 
    hometown: string, 
    nickname: string, 
    class: string
}

export interface TeamData {
    insertTeam(newTeam: Team): Promise<teamDbResp>;
    deleteTeam(teamId: string): Promise<boolean>;
    updateTeam(teamId:string, fieldsToUpdate: {}): Promise<boolean>; 
    getTeam(teamId:number): Promise<Team | undefined>;
    getTeams(): Promise<Team[]>;
}

export type teamDbResp = {
    result: boolean, 
    team: Team | undefined
}
