import { InsertOneResult, DeleteResult } from 'mongodb'
import { FantasyGameHistoryMethods, FantasyGameHistory, FantasyDraftPick, FantasyGame, SimulationRunMethods, SimulationRun } from '../../types/types'


const contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]; 

export type TotalPointsWFinish = {user: string, points: number, finish?: number};
type calculateFantasyGameHistoryReturn = {
    fantasyGameHistory: FantasyGameHistory[],
    totalPointsWFinish: TotalPointsWFinish[]
}

class FantasyGameHistoryService {

    constructor (
        private fantasyGameHistoryDataSource: FantasyGameHistoryMethods,
        private simulationRunDataSource: SimulationRunMethods
    ){}

    public getFantasyGameHistory(user: string, limit: number, offset: number): Promise<FantasyGameHistory[]> {
        return this.fantasyGameHistoryDataSource.getFantasyGameHistory(user, limit, offset); 
    }

    public calculateFantasyGameHistory(draftPicks: FantasyDraftPick[], game: FantasyGame, runs: SimulationRun[]): calculateFantasyGameHistoryReturn {
        const fantasyGameHistory: FantasyGameHistory[] = [];
        const runMap = new Map<string, SimulationRun>();
        runs.forEach(run => {
            runMap.set(run.key.split("|").slice(0, 3).join("|"), run);
        })
        type DraftPickWithRun = FantasyDraftPick & { finalRun: number };
        const draftPicksWRun: DraftPickWithRun[] = draftPicks.map(el => {
            const run = runMap.get(el.contestSummaryKey); 
            return {
                ...el as FantasyDraftPick, 
                finalRun: run?.finalRun
            } as DraftPickWithRun;
        });
        type DraftPickWithPoints = DraftPickWithRun & { points?: number };
        const draftPicksWPoints: DraftPickWithPoints[] = []; 
        contests.forEach(contest => {
            const contestPicks = draftPicksWRun.filter(el => el.contestSummaryKey.split("|")[2] === contest);
            const contestPicksSorted = contestPicks.sort((a, b) =>  a.finalRun > b.finalRun ? -1 : 1);
            const contestPicksWPoints = assignPoints(contestPicksSorted, [5,4,3,2,1]);
            draftPicksWPoints.push(...contestPicksWPoints);
        })
        const totalPoints = draftPicksWPoints.reduce<Record<string, number>>((acc, el) => {
            const user = el.user; 
            const points = el?.points || 0; 
            if(user && points) {
                acc[user] = (acc[user] || 0) + points;
            }
            return acc;
        }, {});
        const totalPointsArray = Object.entries(totalPoints).map(([user, points]) => {
            return { user, points } 
        });
        const totalPointsWFinish: TotalPointsWFinish[] = assignFinish<{user: string, points: number}>(totalPointsArray, "points", true, [1,2,3,4,5]);
        console.log("totalPointsWFinish", totalPointsWFinish);
        totalPointsWFinish.forEach(el => {
            if(el.user && !el.user.startsWith("autodraft")) {
                fantasyGameHistory.push({
                    gameId: game.gameId,
                    user: el.user,
                    contestSummaryKeys: draftPicksWPoints.filter(el => el.user === el.user).map(el => el.contestSummaryKey),
                    gameType: game.gameType,
                    win: el?.finish === 1,
                    top5: Boolean(el?.finish),
                    // @ts-ignore this is ok
                    finish: (el?.finish || -1) as number, 
                    participantCount: game.users.length,
                    points: el.points,
                    displayAfter: new Date(Date.now() + 1000 * 30),
                });
            }
        });


        return {
            fantasyGameHistory, 
            totalPointsWFinish
        }
    }

    public insertGameHistory(gameHistory: FantasyGameHistory): Promise<InsertOneResult> {
        return this.fantasyGameHistoryDataSource.insertGameHistory(gameHistory); 
    }


    public getGameHistoryByGameId(gameId: string): Promise<FantasyGameHistory[]> {
        return this.fantasyGameHistoryDataSource.getGameHistoryByGameId(gameId); 
    }

    public deleteFantasyGame(gameId: string): Promise<DeleteResult> {
        return this.fantasyGameHistoryDataSource.deleteFantasyGame(gameId); 
    }

    public getMostGamesPlayed(limit: number, offset: number): Promise<{user: string, gameCount: number}[]> {
        return this.fantasyGameHistoryDataSource.getMostGamesPlayed(limit, offset); 
    }
}
    
export default FantasyGameHistoryService;





interface RankableItem {
    [key: string]: any;
    finish?: number;
}

export function assignFinish<T extends RankableItem>(
    objArr: T[], 
    keyToRank: keyof T, 
    sortDescending: boolean, 
    finishes: number[]
): T[] {
    const returnArr: T[] = [];
    const sortedObjArr = objArr.sort((a, b) => {
        const aVal = a[keyToRank] as number;
        const bVal = b[keyToRank] as number;
        return sortDescending ? bVal - aVal : aVal - bVal;
    });
    
    sortedObjArr.forEach((el, index) => {
        if (index === 0) {
            el.finish = finishes.shift();
        }
        if (index > 0) {
            if (el[keyToRank] === sortedObjArr[index - 1][keyToRank] && sortedObjArr[index - 1].finish) {
                el.finish = sortedObjArr[index - 1].finish;
                if (finishes.length) finishes.shift();
            } else {
                if (finishes.length) el.finish = finishes.shift();
            }
        }
        returnArr.push(el);
    });
    
    return returnArr;
}


type DraftPickWithRunAndPoints = FantasyDraftPick & { finalRun: number } & { points?: number };
export function assignPoints(
    objArr: DraftPickWithRunAndPoints[],
    pointsToAssign: number[]
): DraftPickWithRunAndPoints[] {
    const returnArr: DraftPickWithRunAndPoints[] = [];
    const sortedObjArr = objArr.sort((a, b) => {
    // @ts-ignore this is ok
    const isADQ = a.finalRun === "NT" || a.finalRun === "OT";
    // @ts-ignore this is ok
    const isBDQ = b.finalRun === "NT" || b.finalRun === "OT";
    if(isADQ && isBDQ) return 0;
    if(isADQ) return 1;
    if(isBDQ) return -1;
    return a.finalRun > b.finalRun ? 1 : -1;
    });

    let pointIndex = 0;

    for (let i = 0; i < sortedObjArr.length; i++) {
        const el = sortedObjArr[i];
        
        // Check if there's a tie
        if (i > 0 && el.finalRun === sortedObjArr[i - 1].finalRun) {
            // Same value as previous, share the same points
            el.points = sortedObjArr[i - 1].points;
        } else {
            // New value - find all items with this value to calculate shared points
            let tieCount = 1;
            for (let j = i + 1; j < sortedObjArr.length; j++) {
                if (sortedObjArr[j].finalRun === el.finalRun) {
                    tieCount++;
                } else {
                    break;
                }
            }

            // Calculate shared points for tied items
            if (tieCount > 1 && pointIndex + tieCount <= pointsToAssign.length) {
                // Sum up points for tied positions
                let totalPoints = 0;
                for (let k = 0; k < tieCount; k++) {
                    totalPoints += pointsToAssign[pointIndex + k];
                }
                // Divide equally
                el.points = totalPoints / tieCount;
                pointIndex += tieCount;
            } else if (pointIndex < pointsToAssign.length) {
                // No tie, assign normal points
                el.points = pointsToAssign[pointIndex];
                pointIndex++;
            }
        }

        returnArr.push(el);
    }

    return returnArr;
}


