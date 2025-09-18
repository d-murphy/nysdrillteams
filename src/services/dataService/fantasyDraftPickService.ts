import { InsertOneResult, DeleteResult } from 'mongodb'
import { FantasyDraftPickMethods, FantasyDraftPick, FantasyGameMethods, SimulationContestSummaryMethods } from '../../types/types'

class FantasyDraftPickService {

    constructor (
        private fantasyDraftPickDataSource: FantasyDraftPickMethods, 
        private fantasyGameDataSource: FantasyGameMethods, 
        private contestSummaryDataSource: SimulationContestSummaryMethods
    ){}

    public getFantasyDraftPicks(gameId: string): Promise<FantasyDraftPick[]> {
        return this.fantasyDraftPickDataSource.getFantasyDraftPicks(gameId); 
    }

    public insertDraftPick(draftPick: FantasyDraftPick): Promise<InsertOneResult> {
        return this.fantasyDraftPickDataSource.insertDraftPick(draftPick); 
    }


    public deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        return this.fantasyDraftPickDataSource.deleteFantasyGame(gameId); 
    }

    public async runAutoDraftPicks(gameId: string, lastPickIndex: number): Promise<void> {

        const contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]
        const sortCols = ["consistency", "speedRating", "overallScore"];

        const nextPickIndex = lastPickIndex + 1;
        const game = await this.fantasyGameDataSource.getFantasyGame(gameId);
        const users = game.users;
        const rounds = game.gameType === 'one-team' ? 1 : 8; 
        const isNoRepeat = game.gameType === '8-team-no-repeat';

        const draftOrder = []; 
        for(let i = 0; i < rounds; i++) {
            const loopUsers = [...users]; 
            const isSnakeReverseRound = i % 2 === 1;
            const roundUsers = isSnakeReverseRound ? loopUsers.reverse() : loopUsers;
            draftOrder.push(...roundUsers);
        }
        const listFromNextPick = draftOrder.slice(nextPickIndex);
        const firstNonAutoDraftPickIndex = listFromNextPick.findIndex(pick => pick.split("-")[0] !== 'autodraft');

        const picksToMake = firstNonAutoDraftPickIndex === 0 ? [] : 
            firstNonAutoDraftPickIndex === -1 ? listFromNextPick :
            listFromNextPick.slice(0, firstNonAutoDraftPickIndex);

        if(picksToMake.length === 0) return; 

        const currentPicks = await this.fantasyDraftPickDataSource.getFantasyDraftPicks(gameId);

        const picksToCheck = []; 

        for(let i = 0; i < picksToMake.length; i++) {
            const nextPick = picksToMake[i];
            const loopPickIndex = i + nextPickIndex;
            const picksForUser = currentPicks.filter(pick => pick.user === nextPick);
            const contestsComplete = picksForUser.map(pick => pick.contestSummaryKey.split("|")[2]);
            const remainingContests = contests.filter(contest => !contestsComplete.includes(contest));
            const randomContest = remainingContests[Math.floor(Math.random() * remainingContests.length)];

            const autoDraftNumber = nextPick.split("-")[1];
            const draftStrategyType = parseInt(autoDraftNumber) % 4;
            const draftStrategy = draftStrategyType === 3 ? 
                sortCols[Math.floor(Math.random() * sortCols.length)] : 
                sortCols[draftStrategyType];
            const teamContestKeyArrToExclude = isNoRepeat ? picksForUser.map(pick => {
                const [team, year, contest] = pick.contestSummaryKey.split("|");
                return `${team}|${contest}`;
            }) : [];
            const keysToExclude = picksForUser.map(pick => pick.contestSummaryKey);

            const options = await this.contestSummaryDataSource.getTopSimulationContestSummaries(
                [randomContest], draftStrategy, 3, 0, undefined, undefined, 
                teamContestKeyArrToExclude, keysToExclude
            );
            const draftChoice = options[Math.floor(Math.random() * options.length)];
            const draftPick = {
                gameId: gameId,
                user: nextPick,
                contestSummaryKey: draftChoice.key,
                draftPick: loopPickIndex
            }
            picksToCheck.push(draftPick);
            currentPicks.push(draftPick);
            await this.fantasyDraftPickDataSource.insertDraftPick(draftPick);
        }

        //@ts-ignore
        return {picksToCheck}; 



    }
}
    
export default FantasyDraftPickService;
