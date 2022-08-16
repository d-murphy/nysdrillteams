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
    timeNum: number, 
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
    stateRecord?: number,
    currentStateRecord?: number
}

export interface RunsData {
    _dbCollection: Collection | undefined;  
    insertRun(newRun: Run): Promise<runDbResult>;
    deleteRun(runId: number): Promise<boolean>;
    updateRun(runId: number, pointsUpdate: number, timeUpdate: string, rankUpdate: string): Promise<runDbResult>; 
    getRun(runId: number): Promise<Run | undefined>;
    getRunsFromTournament(tournamentId:string): Promise<Run[]>
    getFilteredRuns(        
        years?: number[], 
        contests?: string[], 
        teams?: string[], 
        tracks?:string[], 
        tournaments?:string[], 
        ranks?:string[], 
        stateRecord?: boolean, 
        currentStateRecord?: boolean,
    ): Promise<Run[]>; 
    getBig8(year:number): Promise<{}[]>
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

export interface TournamentW_id extends Tournament {
    _id?: ObjectId;
}

export interface TournamentsData {
    insertTournament(newTournament: Tournament): Promise<tournamentDbResp>;
    deleteTournament(tournamentId: number): Promise<boolean>;
    updateTournament(tournamentId:string, fieldsToUpdate:{}): Promise<boolean>; 
    getTournament(tournamentId:number): Promise<Tournament | undefined>; 
    getFilteredTournaments(        
        years?: number[], 
        tracks?:string[], 
        tournaments?:string[], 
    ): Promise<Tournament[]>; 
    getTournsCtByYear():Promise<{_id: number, yearCount: number }[]>
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
    insertTrack(newTrack: Track): Promise<trackDbResp>;
    deleteTrack(trackId: string): Promise<boolean>;
    updateTrack(trackId:string, fieldsToUpdate:{}): Promise<boolean>; 
    getTrack(trackId:string): Promise<Track | undefined>;
    getTrackByName(trackName:string): Promise<Track | undefined>;
    getTracks(): Promise<Track[]>;
}

export type trackDbResp = {
    result: boolean, 
    track: Track | undefined
}


export type Team = {
    id?: number,
    fullName: string,  
    circuit: string,
    imageUrl?: string, 
    active?: boolean, 
    hometown: string, 
    nickname: string, 
    region: string
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
