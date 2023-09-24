import { RunsData, TeamData, TournamentsData, TeamTournHistory, HistoryData, Team} from "../../types/types";
import RunsService from "./runsService";
import TournamentsService from "./tournamentsService";
import TeamsService from "./teamsService";

export default class HistoryService {
    _lastRan: Date | null = null; 
    _isUpdating: boolean = false; 
    _dataSource: HistoryData; 
    _teamsDataSource: TeamData; 
    _runsDataSource: RunsData; 
    _tournsDataSource: TournamentsData; 
    _intervalId: ReturnType<typeof setInterval>; 

    constructor ( private dataSource : HistoryData, runsDataSource: RunsData, tournsDataSource: TournamentsData, teamsDataSource: TeamData ){
        this._dataSource = dataSource; 
        this._teamsDataSource = teamsDataSource; 
        this._runsDataSource = runsDataSource; 
        this._tournsDataSource = tournsDataSource; 
        this._intervalId = setInterval(async () => {
            const currentDate = new Date(); 
            if([1,2,3,4,5].includes(currentDate.getDay()) && currentDate.getHours() ===5){
                console.log("Starting team history update at: ", currentDate.toLocaleString())
                await this.updateHistories(); 
                const finishTime = new Date(); 
                const mins = (finishTime.getTime() - currentDate.getTime()) / (1000 * 60); 
                console.log("Finished team history update after: ", mins, " mins at: ", finishTime.toLocaleString())
            }
        }, 1000 * 60 * 60)
    }
    public async updateHistories(): Promise<boolean> {
        this._isUpdating = true; 
        const teamHistories = await allTeamTournHistory(this._runsDataSource, this._tournsDataSource, this._teamsDataSource); 
        const result = this._dataSource.insertHistories(teamHistories); 
        this._lastRan = new Date(); 
        this._isUpdating = false; 
        return result; 
    }
    public async getHistory(teamName: string){
        return this._dataSource.getHistory(teamName); 
    }
    public getLastRan(): Date | null {
        return this._lastRan; 
    }
    public getIsUpdating(): boolean {
        return this._isUpdating; 
    }
}



export async function allTeamTournHistory(runsDb: RunsData, tournsDB: TournamentsData, teamsDb: TeamData){
    const teamService = new TeamsService(teamsDb); 

    const teams = await teamService.getTeams()
    const teamNameArr = teams.map(el => el.fullName); 

    const teamHistories: {team: string, histories: TeamTournHistory[]}[] = []; 
    for(let teamName of teamNameArr){
        const teamTournHistory = await makeTeamTournHistory(runsDb, tournsDB, teamName); 
        teamHistories.push({team: teamName, histories: teamTournHistory}); 
        console.log("finished team history for: ", teamName); 
    }
    return teamHistories; 
}


export async function makeTeamTournHistory(runsDb: RunsData, tournsDB: TournamentsData, teamName: string){
    const runsService = new RunsService(runsDb); 
    const tournsService = new TournamentsService(tournsDB); 

    const teamHistory: Record<number, TeamTournHistory> = {}; 
    const startPosHis = await tournsService.getTournsAppearing(teamName); 
    const finishHis = await tournsService.getTournsTop5(teamName); 
    const runHis = await runsService.getTournRunCounts(teamName); 
    const ptsHis = await runsService.getTournPoints(teamName); 

    startPosHis.forEach(el => {
        teamHistory[el.id] = {
            name: el.name, 
            id: el.id, 
            date: el.date, 
            track: el.track, 
            runningOrderPos: parseInt(el.runningOrder.k)
        }
    })

    finishHis.forEach(el => {
        if(teamHistory[el.id]){
            teamHistory[el.id].finishingPosition = el.top5.finishingPosition; 
            teamHistory[el.id].points = el.top5.points; 
        } else {
            teamHistory[el.id] = {
                name: el.name, 
                id: el.id, 
                date: el.date, 
                track: el.track, 
                finishingPosition: el.top5.finishingPosition,
                points: el.top5.points
            }
        }
    })

    runHis.forEach(el => {
        const tournId = parseInt(el._id.tournamentId); 
        if(teamHistory[tournId]){
            teamHistory[tournId].stateRecordCount = el.stateRecordCount; 
            teamHistory[tournId].runCount = el.tournamentRunCount; 
            teamHistory[tournId].videoCount = el.videoCount; 
        } else {
            teamHistory[tournId] = {
                name: el._id.tournament, 
                id: tournId, 
                date: el._id.date, 
                track: el._id.track, 
                stateRecordCount: el.stateRecordCount, 
                runCount: el.tournamentRunCount, 
                videoCount: el.videoCount
            }
        }
    })

    ptsHis.forEach(el => {
        const tournId = parseInt(el._id.tournamentId); 
        if(teamHistory[tournId]){
            if(!teamHistory[tournId].points) teamHistory[tournId].points = el.points; 
        }
    })
    return Object.values(teamHistory); 
}