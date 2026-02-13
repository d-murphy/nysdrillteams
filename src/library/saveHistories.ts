import FantasyGameHistoryService from "../services/dataService/fantasyGameHistoryService";
import { FantasyDraftPick, FantasyGame, SimulationRun } from "../types/types";


export default async function saveHistories(draftPicks: FantasyDraftPick[], game: FantasyGame, runs: SimulationRun[], historyService: FantasyGameHistoryService): Promise<boolean> {

    const historiesAndFinishes = historyService.calculateFantasyGameHistory(draftPicks, game, runs);
    const fantasyGameHistories = historiesAndFinishes.fantasyGameHistory;
    for(const history of fantasyGameHistories) {
        await historyService.insertGameHistory(history);
    }; 
    return true; 
}