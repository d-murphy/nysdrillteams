import { FortyForFortyGame, FortyForFortyGameMethods, FortyForFortyGameMode, SimulationRunMethods } from '../../types/types';
import calcFortyForForty from '../../library/calcFortyForForty';

class FortyForFortyService {

    constructor(
        private dataSource: FortyForFortyGameMethods,
        private simulationRunDataSource: SimulationRunMethods
    ) {}

    public async insertFortyForFortyGame(contestSummaryKeys: string[], gameMode: string, user?: string, simIndOverride?: number): Promise<string> {
        const contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]; 
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const simInd = simIndOverride || Math.floor(Math.random() * 500);
        const keys = contestSummaryKeys.map(key => `${key}|${simInd}`);
        const runs = await this.simulationRunDataSource.getSimulationRuns(keys);

        const runMap = new Map<string, number | string>();
        runs.forEach(run => {
            const contest = run.key.split('|')[2];
            runMap.set(contest, run.finalRun);
        });

        const times = contests.map(contest => runMap.get(contest) ?? "OT");
        const contestPoints = calcFortyForForty(times);
        const totalPoints = contestPoints.reduce((sum, pts) => sum + pts, 0);

        const game: FortyForFortyGame = {
            _id: gameId,
            gameId,
            user: user || '',
            simInd,
            contestSummaryKeys,
            contestPoints,
            totalPoints,
            gameMode, 
            leaderboardName: "not_set"
        };

        await this.dataSource.insertFortyForFortyGame(game);
        return gameId;
    }

    public async getFortyForFortyGame(gameId: string): Promise<(FortyForFortyGame & { finalTimes: (number | string)[] }) | undefined> {
        const game = await this.dataSource.getFortyForFortyGame(gameId);
        if (!game) return undefined;

        const keys = game.contestSummaryKeys.map(key => `${key}|${game.simInd}`);
        const runs = await this.simulationRunDataSource.getSimulationRuns(keys);

        const runMap = new Map<string, number | string>();
        runs.forEach(run => {
            const contestSummaryKey = run.key.split('|').slice(0, 3).join('|');
            runMap.set(contestSummaryKey, run.finalRun);
        });

        const minRunsLU: Record<string, number> = {
            "Three Man Ladder": 5.97, 
            "B Ladder": 4.79, 
            "C Ladder": 8.41, 
            "C Hose": 11.79, 
            "B Hose": 7.36,
            "Efficiency": 8.32, 
            "Motor Pump": 5.35, 
            "Buckets": 19.4 
        }

        const finalTimes = game.contestSummaryKeys.map(key => {
            const time = runMap.get(key) || "OT"; 
            const isStr = Number.isNaN(parseFloat(time as string))
            if(isStr) return time; 
            const contest = key.split("|")[2]; 
            return Math.max(time as number, minRunsLU[contest])
        })

        return { ...game, finalTimes };
    }

    public async updateLeaderboardName(gameId: string, leaderboardName: string): Promise<{ success: true } | { success: false; message: string }> {
        const game = await this.dataSource.getFortyForFortyGame(gameId);
        if (!game) {
            return { success: false, message: 'Game not found.' };
        }

        if (game.leaderboardName !== 'not_set') {
            return { success: false, message: 'Leaderboard name has already been set and cannot be changed.' };
        }

        await this.dataSource.updateLeaderboardName(gameId, leaderboardName);
        return { success: true };
    }

    public getRecentNamedGames(gameMode: FortyForFortyGameMode | undefined, limit: number, offset: number): Promise<FortyForFortyGame[]> {
        return this.dataSource.getRecentNamedGames(gameMode, limit, offset);
    }

    public getTopGamesThisWeek(gameMode: FortyForFortyGameMode | undefined, limit: number, offset: number): Promise<FortyForFortyGame[]> {
        return this.dataSource.getTopGamesThisWeek(gameMode, limit, offset);
    }

    public getTopGamesAllTime(gameMode: FortyForFortyGameMode | undefined, limit: number, offset: number): Promise<FortyForFortyGame[]> {
        return this.dataSource.getTopGamesAllTime(gameMode, limit, offset);
    }

    public countCompleteGames(): Promise<number> {
        return this.dataSource.countCompleteGames();
    }
}

export default FortyForFortyService;
