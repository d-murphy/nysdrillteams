import { FortyForFortyGame, FortyForFortyGameMethods, SimulationRunMethods } from '../../types/types';
import calcFortyForForty from '../../library/calcFortyForForty';

class FortyForFortyService {

    constructor(
        private dataSource: FortyForFortyGameMethods,
        private simulationRunDataSource: SimulationRunMethods
    ) {}

    public async insertFortyForFortyGame(contestSummaryKeys: string[], gameMode: string, user?: string): Promise<string> {
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const simInd = Math.floor(Math.random() * 500);

        const keys = contestSummaryKeys.map(key => `${key}|${simInd}`);
        const runs = await this.simulationRunDataSource.getSimulationRuns(keys);

        const contests = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"]; 
        runs.sort((a, b) => {
            const aContest = a.key.split('|')[2];
            const bContest = b.key.split('|')[2];
            return contests.indexOf(aContest) - contests.indexOf(bContest);
        })



        const times = runs.map(run => run.finalRun);
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

    public async getFortyForFortyGame(gameId: string): Promise<(FortyForFortyGame & { finalTimes: number[] }) | undefined> {
        const game = await this.dataSource.getFortyForFortyGame(gameId);
        if (!game) return undefined;

        const keys = game.contestSummaryKeys.map(key => `${key}|${game.simInd}`);
        const runs = await this.simulationRunDataSource.getSimulationRuns(keys);

        const runMap = new Map<string, number>();
        runs.forEach(run => {
            const contestSummaryKey = run.key.split('|').slice(0, 3).join('|');
            runMap.set(contestSummaryKey, run.finalRun);
        });

        const finalTimes = game.contestSummaryKeys.map(key => runMap.get(key) || 0);
        return { ...game, finalTimes };
    }
}

export default FortyForFortyService;
