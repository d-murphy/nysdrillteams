import { Collection, ObjectId, InsertOneResult, DeleteResult, UpdateResult } from "mongodb"

export type Run = {
    id?: number, 
    team: string, 
    hometown?: string, 
    nickname?: string, 
    contest: string,
    year: number, 
    tournament: string,
    tournamentId: string,
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
    currentStateRecord?: number, 
    totalPointsOverride?: number
}

export interface RunsData {
    _dbCollection: Collection | undefined;  
    insertRun(newRun: Run): Promise<InsertOneResult>;
    deleteRun(runId: number): Promise<DeleteResult>;
    updateRun(runId: number, fieldsToUpdate: {}): Promise<UpdateResult>; 
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
        nassauPoints?: boolean, 
        suffolkPoints?: boolean, 
        westernPoints?: boolean, 
        northernPoints?: boolean, 
        suffolkOfPoints?: boolean, 
        nassauOfPoints?: boolean, 
        liOfPoints?: boolean, 
        juniorPoints?: boolean,
        sanctioned?: boolean,     
        page?: number
    ): Promise<{}[]>; 
    getBig8(year:number): Promise<{}[]>
    getTopRuns(years?: number[], teams?: string[], tracks?: string[]): Promise<{}[][]>
    getTotalPoints(year: number, totalPointsFieldName: TotalPointsFields, byContest: boolean, contests?: string[]): Promise<{_id: string, points: number}[]>
    getContestNames(): Promise<{_id: string, nameCount:number}[]>
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
    insertTeam(newTeam: Team): Promise<InsertOneResult>;
    deleteTeam(teamId: string): Promise<DeleteResult>;
    updateTeam(teamId:string, fieldsToUpdate: {}): Promise<UpdateResult>; 
    getTeam(teamId:number): Promise<Team | undefined>;
    getTeams(): Promise<Team[]>;
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
    waterTime?: string, 
    host: string
}

export interface TournamentW_id extends Tournament {
    _id?: ObjectId;
}

export interface TournamentsData {
    insertTournament(newTournament: Tournament): Promise<InsertOneResult>;
    deleteTournament(tournamentId: string): Promise<DeleteResult>;
    updateTournament(tournamentId:string, fieldsToUpdate:{}): Promise<UpdateResult>; 
    getTournament(tournamentId:number): Promise<Tournament | undefined>; 
    getFilteredTournaments(        
        years?: number[], 
        tracks?:string[], 
        tournaments?:string[], 
    ): Promise<Tournament[]>; 
    getTournsCtByYear():Promise<{_id: number, yearCount: number }[]>; 
    getTournamentNames(): Promise<{_id: string, nameCount:number}[]>; 
    getHostNames(): Promise<{_id: string, nameCount:number}[]>; 
}

export type Track = {
    id: number, 
    name: string, 
    address: string, 
    city: string, 
    notes: string,
    imageUrls: string[], 
    archHeightFt: number, 
    archHeightInches: number, 
    distanceToHydrant: 200 | 225
}

export interface TracksData {
    insertTrack(newTrack: Track): Promise<InsertOneResult>;
    deleteTrack(trackId: string): Promise<DeleteResult>;
    updateTrack(trackId:string, fieldsToUpdate:{}): Promise<UpdateResult>; 
    getTrack(trackId:string): Promise<Track | undefined>;
    getTrackByName(trackName:string): Promise<Track | undefined>;
    getTracks(): Promise<Track[]>;
}

export type TotalPointsFields = "Nassau" | "Suffolk" | "Western" | "Northern" | "Junior" | "Suffolk OF" | "Nassau OF" | "LI OF";  

export interface User {
    username: string, 
    password: string, 
    role: string
}

export interface UsersData {
    insertUser(user: User): Promise<InsertOneResult>,
    deleteUser(userId: number): Promise<DeleteResult>,
    updateUser(userId: number, role?: string, password?: string): Promise<UpdateResult>,
    getUsers(): Promise<User[]> 
    getUser(username:string): Promise<User | undefined>
}

export interface Update {
    _id?: ObjectId,
    date: Date, 
    user: string, 
    update: string
}

export interface UpdatesData {
    insertUpdate(newUpdate: Update): Promise<InsertOneResult>,  
    getRecent(): Promise<Update[]>
}