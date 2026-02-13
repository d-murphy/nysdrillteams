import { InsertOneResult, DeleteResult } from 'mongodb'
import { FantasyDraftPickMethods, FantasyDraftPick, FantasyGameMethods, SimulationContestSummaryMethods, FantasyGame, SimulationRun } from '../../types/types'
import { getDraftOrder } from '../../library/getDraftOrder';
import { calculateRounds } from '../../library/calculateRounds';
import getDataToBroadcast from '../../library/getDataToBroadcast';
import SimulationRunService from './simulationRunService';
import FantasyGameHistoryService from './fantasyGameHistoryService';
import FantasyService from './fantasyService';
import isGameComplete from '../../library/isGameComplete';
import saveHistories from '../../library/saveHistories';

class FantasyDraftPickService {

    private contests: string[];
    private sortCols: string[];

    constructor (
        private fantasyDraftPickDataSource: FantasyDraftPickMethods, 
        private contestSummaryDataSource: SimulationContestSummaryMethods
    ){
        this.contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]
        this.sortCols = ["speedRating", "overallScore"];
    }

    public getFantasyDraftPicks(gameId: string): Promise<FantasyDraftPick[]> {
        return this.fantasyDraftPickDataSource.getFantasyDraftPicks(gameId); 
    }

    public async insertDraftPick(draftPick: FantasyDraftPick): Promise<InsertOneResult | null> {
        const isValid = await this.validateDraftPick(draftPick);
        if(!isValid) return null;
        return this.fantasyDraftPickDataSource.insertDraftPick(draftPick); 
    }

    private getHighestPick(draftPicks: FantasyDraftPick[]): number {
        return draftPicks.reduce((max, pick) => Math.max(max, pick.draftPick), -1);
    }

    private async validateDraftPick(draftPick: FantasyDraftPick): Promise<boolean> {
        const picks = await this.getFantasyDraftPicks(draftPick.gameId);
        const highestPick = this.getHighestPick(picks);
        return draftPick.draftPick -1 === highestPick;
    }

    public deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        return this.fantasyDraftPickDataSource.deleteFantasyGame(gameId); 
    }

    public isNonAutoUserPick(draftPicks: FantasyDraftPick[], game: FantasyGame): boolean {
        const rounds = calculateRounds(game);
        const draftOrder = getDraftOrder(game.users, rounds);
        const lastPickIndex = draftPicks.length === 0 ? -1 : draftPicks[draftPicks.length - 1]?.draftPick;
        const nextPick = draftOrder[lastPickIndex + 1];
        const isNonAutoUserPick = nextPick.split("-")[0] !== 'autodraft';
        return isNonAutoUserPick;
    }

    public async setAutoPickIfNeededAndBroadcast(
        fantasyService: FantasyService, draftPickService: FantasyDraftPickService, 
        simulationRunService: SimulationRunService, historyService: FantasyGameHistoryService, 
        game: FantasyGame, 
        broadcastToGame: (gameId: string, data: any) => void): Promise<void> {
        const gameData = await getDataToBroadcast(fantasyService, draftPickService, simulationRunService, historyService, game.gameId, game);
        const gameComplete = isGameComplete(game, gameData.draftPicks);
        if(gameComplete) return;
        const currentPickIndex = gameData.draftPicks.length;
        const rounds = calculateRounds(game);
        const draftOrder = getDraftOrder(game.users, rounds);
        const nextPick = draftOrder[currentPickIndex];
        const userToPickFor = nextPick.split("-")[0];
        if(userToPickFor === 'autodraft') return; 
        const secondsPerPick = game.secondsPerPick;
        (async () => {
            await new Promise<boolean>((resolve) => {
                setTimeout(() => resolve(true), secondsPerPick * 1000);
            });
            await this.userTimeOutProcessAndBroadcast(fantasyService, draftPickService, simulationRunService, historyService, game, currentPickIndex, userToPickFor, broadcastToGame);
        })();
    }

    public async userTimeOutProcessAndBroadcast(
        fantasyService: FantasyService, draftPickService: FantasyDraftPickService, 
        simulationRunService: SimulationRunService, historyService: FantasyGameHistoryService, 
        game: FantasyGame, currentPickIndex: number, userToPickFor: string, 
        broadcastToGame: (gameId: string, data: any) => void): Promise<void> {
        const draftPicks = await this.getFantasyDraftPicks(game.gameId);
        const highestPick = this.getHighestPick(draftPicks);
        // check if autopick is needed
        if(currentPickIndex !== (highestPick + 1)) return; 

        const pick = await this._runAutoDraftPick(userToPickFor, currentPickIndex, game, 50);
        const insertDraftPickResult = await this.insertDraftPick(pick);
        const dataToBroadcast = await getDataToBroadcast(fantasyService, draftPickService, simulationRunService, historyService, game.gameId);
        broadcastToGame(game.gameId, { type: 'gameUpdate', data: dataToBroadcast });
        if(insertDraftPickResult) {
            draftPicks.push(pick);
            await this.autoDraftAndGameCompleteCheckWithBroadcast(fantasyService, draftPickService, simulationRunService, historyService, game, draftPicks, pick, game.gameId, broadcastToGame);
        }
    }

    public async autoDraftAndGameCompleteCheckWithBroadcast(
        fantasyService: FantasyService, draftPickService: FantasyDraftPickService, 
        simulationRunService: SimulationRunService, historyService: FantasyGameHistoryService, 
        game: FantasyGame, draftPicks: FantasyDraftPick[], draftPick: FantasyDraftPick,
        gameId: string, broadcastToGame: (gameId: string, data: any) => void) {
        await this.runComputerPicksAndBroadcast(fantasyService, draftPickService, simulationRunService, historyService, game, draftPicks, gameId, broadcastToGame);
        await this.runGameCompleteCheckAndBroadcast(fantasyService, draftPickService, simulationRunService, historyService, game, draftPicks, draftPick, broadcastToGame);
    }

    public async runComputerPicksAndBroadcast(
        fantasyService: FantasyService, draftPickService: FantasyDraftPickService, 
        simulationRunService: SimulationRunService, historyService: FantasyGameHistoryService, 
        game: FantasyGame, draftPicks: FantasyDraftPick[], 
        gameId: string, broadcastToGame: (gameId: string, data: any) => void
    ) {
        const lastPickIndex = draftPicks.length === 0 ? -1 : draftPicks.length - 1; 
        let computerPickIfNeededResult = await this.computerPickIfNeeded(game, lastPickIndex, draftPicks); 
        while(computerPickIfNeededResult) {
            draftPicks.push(computerPickIfNeededResult);
            const autoDraftDataToBroadcast = await getDataToBroadcast(fantasyService, draftPickService, simulationRunService, historyService, gameId, game, draftPicks);  
            broadcastToGame(gameId, { type: 'gameUpdate', data: autoDraftDataToBroadcast });
            await new Promise(resolve => setTimeout(resolve, (Math.random() * 200 + 200)));
            computerPickIfNeededResult = await draftPickService.computerPickIfNeeded(game, computerPickIfNeededResult.draftPick, draftPicks); 
        }
        await this.setAutoPickIfNeededAndBroadcast(
            fantasyService, draftPickService, simulationRunService, historyService,
            game, broadcastToGame
        );

    }

    public async runGameCompleteCheckAndBroadcast(
        fantasyService: FantasyService, draftPickService: FantasyDraftPickService, 
        simulationRunService: SimulationRunService, historyService: FantasyGameHistoryService, 
        game: FantasyGame, draftPicks: FantasyDraftPick[], draftPick: FantasyDraftPick,
        broadcastToGame: (gameId: string, data: any) => void) {
        if(isGameComplete(game as FantasyGame, draftPicks as FantasyDraftPick[])) {
            await fantasyService.updateFantasyGameState(draftPick.gameId, 'complete');
            const dataToBroadcast = await getDataToBroadcast(fantasyService, draftPickService, simulationRunService, historyService, draftPick.gameId);
            await saveHistories(dataToBroadcast.draftPicks as FantasyDraftPick[], dataToBroadcast.game as FantasyGame, dataToBroadcast.runs as SimulationRun[], historyService);
            broadcastToGame(draftPick.gameId, { type: 'gameUpdate', data: dataToBroadcast });
        }
    }

    public async computerPickIfNeeded(game: FantasyGame, lastPickIndex: number, currentPicks?: FantasyDraftPick[]): Promise<FantasyDraftPick | null> {
        const nextPickIndex = lastPickIndex + 1;
        const users = game.users;
        const rounds =  calculateRounds(game);
        const gameComplete = isGameComplete(game, currentPicks || []);
        if(gameComplete) return null;

        const draftOrder = getDraftOrder(users, rounds);
        const nextPick = draftOrder[nextPickIndex];
        if(!nextPick) return null;
        if(nextPick.split("-")[0] !== 'autodraft') {
            return null;
        }

        const pick = await this._runAutoDraftPick(nextPick, nextPickIndex, game, 2,  currentPicks);
        const insertDraftPickResult = await this.insertDraftPick(pick);
        if(!insertDraftPickResult) return null;
        return pick;

    }

    public async _runAutoDraftPick(userToPickFor: string, nextPickIndex: number, game: FantasyGame, topN: number = 2, currentPicks?: FantasyDraftPick[]): Promise<FantasyDraftPick> {
        const isNoRepeat = game.gameType === '8-team-no-repeat';
        const gameId = game.gameId;
        const currentPicksToUse = currentPicks || await this.fantasyDraftPickDataSource.getFantasyDraftPicks(gameId);
        
        const picksForUser = currentPicksToUse.filter(pick => pick.user === userToPickFor);
        const contestsComplete = picksForUser.map(pick => pick.contestSummaryKey.split("|")[2]);
        const remainingContests = this.contests.filter(contest => !contestsComplete.includes(contest));
        const randomContest = remainingContests[Math.floor(Math.random() * remainingContests.length)];

        const draftStrategy = this.sortCols[Math.floor(Math.random() * this.sortCols.length)] 
        const teamContestKeyArrToExclude = isNoRepeat ? currentPicksToUse.map(pick => {
            const [team, year, contest] = pick.contestSummaryKey.split("|");
            return `${team}|${contest}`;
        }) : [];

        const keysToExclude = currentPicksToUse.map(pick => pick.contestSummaryKey);
        const options = await this.contestSummaryDataSource.getTopSimulationContestSummaries(
            [randomContest], draftStrategy, topN, 0, undefined, undefined, 
            teamContestKeyArrToExclude, keysToExclude
        );
        if(!options.length) {
            throw new Error("Auto draft - No options found");
        }
        const draftChoice = options[Math.floor(Math.random() * options.length)];
        const draftPick: FantasyDraftPick = {
            gameId: gameId,
            user: userToPickFor,
            contestSummaryKey: draftChoice?.key || '',
            draftPick: nextPickIndex, 
            time: new Date()
        }
        return draftPick;
    }
}
    
export default FantasyDraftPickService;
