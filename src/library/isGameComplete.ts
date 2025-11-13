import { FantasyDraftPick, FantasyGame } from "../types/types";




export default function isGameComplete (game: FantasyGame, draftPicks: FantasyDraftPick[]): boolean {
    const picksNeeded = game.gameType === 'one-team' ? 1 : 8 * game.users.length;
    const picksMade = draftPicks.length;
    return picksMade >= picksNeeded;
}