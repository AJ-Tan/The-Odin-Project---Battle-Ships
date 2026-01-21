import { Player } from "./classes/Player";
import { GameState } from "./classes/GameState";

const player1 = new Player("Player 1");
const player2 = new Player("Player 2");
const gameState = new GameState(player1, player2);

const state = document.createElement("button");
state.textContent = "state";
state.addEventListener("click", () => {
  gameState.changeGameState();
});
document.body.appendChild(state);

const reset = document.createElement("button");
reset.textContent = "reset";
reset.addEventListener("click", () => {
  gameState.resetBoard();
});
document.body.appendChild(reset);
