import FantasyDraftPickService from "../services/dataService/fantasyDraftPickService";
import FantasyGameHistoryService, { TotalPointsWFinish } from "../services/dataService/fantasyGameHistoryService";
import FantasyService from "../services/dataService/fantasyService";
import SimulationRunService from "../services/dataService/simulationRunService";
import { FantasyDraftPick, FantasyGame, SimulationRun } from "../types/types";
import isGameComplete from "./isGameComplete";



type FantasyGameBroadcast = {
    game: FantasyGame, 
    draftPicks: FantasyDraftPick[], 
    runs?: SimulationRun[], 
    totalPointsWFinish?: TotalPointsWFinish[]
}

export default async function getDataToBroadcast(
    fantasyService: FantasyService, 
    draftPickService: FantasyDraftPickService, 
    simulationRunService: SimulationRunService, 
    historyService: FantasyGameHistoryService, 
    gameId: string, 
    previouslyRequestedGame?: FantasyGame, 
    previouslyRequestedDraftPicks?: FantasyDraftPick[], 
): Promise<FantasyGameBroadcast> {
    const game = previouslyRequestedGame || await fantasyService.getFantasyGame(gameId);
    const draftPicks = previouslyRequestedDraftPicks || await draftPickService.getFantasyDraftPicks(gameId);

    const dataToBroadcast: FantasyGameBroadcast = {
        game: game,
        draftPicks: draftPicks,
    };  

    if(isGameComplete(game, draftPicks)) {
        const gameSimIndex = game.simulationIndex[0]; 
        const keys = draftPicks.map(pick => pick.contestSummaryKey + "|" + gameSimIndex);
        const runs = await simulationRunService.getSimulationRuns(keys); 
        dataToBroadcast.runs = runs;
        const historiesAndFinishes = historyService.calculateFantasyGameHistory(draftPicks, game, runs);
        dataToBroadcast.totalPointsWFinish = historiesAndFinishes.totalPointsWFinish;
    }
    return dataToBroadcast;
}