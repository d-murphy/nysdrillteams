import { FortyForFortyGame, FortyForFortyGameMethods, SimulationRunMethods } from '../../types/types';
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
            gameMode
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

        const finalTimes = game.contestSummaryKeys.map(key => runMap.get(key) ?? "OT");
        return { ...game, finalTimes };
    }
}

export default FortyForFortyService;
