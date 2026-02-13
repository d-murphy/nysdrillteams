import { FantasyGame } from "../types/types";



export function calculateRounds(game: FantasyGame) {
    return game.gameType === 'one-team' ? 1 : 8 * game.users.length;
}
