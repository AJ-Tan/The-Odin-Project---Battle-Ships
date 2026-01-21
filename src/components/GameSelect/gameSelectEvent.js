import "./gameSelectStyle.css";
import { Player } from "../../classes/Player";
import { GameState } from "../../classes/GameState";
import { pubsub } from "../../classes/Pubsub";

const gameCanvas = document.querySelector(".game-canvas");
const gameArea = document.querySelector(".game-area");
const gameSelect = document.querySelector(".game-select");
const btnGameSelect = document.querySelectorAll(".btn-game-select");

const btnNext = document.querySelector(".btn-next");
const btnStart = document.querySelector(".btn-start");
const btnNew = document.querySelector(".btn-new");

let controller;
let signal;

export const newGame = () => {
  gameSelect.classList.remove("hide");
  gameCanvas.classList.remove("show");
  gameArea.dataset.mode = "placement";
  pubsub.clear();
  controller.abort();
};

btnGameSelect.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    gameSelect.classList.add("hide");
    subGameStatusDisplay();
    if (e.currentTarget.dataset.mode === "player") {
      gameCanvas.classList.add("show");
      setPlayers();
      btnNext.classList.add("show");
    } else {
      gameCanvas.classList.add("show");
      setPlayers(true);
      btnStart.classList.add("show");
    }
  });
});

const subGameStatusDisplay = () => {
  pubsub.subscribe("displayGameStatus", ([primaryText, secondaryText]) => {
    const primaryTextElement = document.querySelector(".game-status--primary");
    const secondaryTextElement = document.querySelector(
      ".game-status--secondary",
    );
    secondaryTextElement.classList.remove("animate");
    if (primaryText) {
      primaryTextElement.textContent = primaryText;
    }

    if (secondaryText) {
      secondaryTextElement.textContent = secondaryText;
      const timedAction = setTimeout(() => {
        secondaryTextElement.classList.add("animate");
      }, 1);
    }
  });
};

const setPlayers = (isOppComputer = false) => {
  gameArea.replaceChildren();

  const player1 = new Player("Player 1");
  const player2 = new Player(
    isOppComputer ? "Computer" : "Player 2",
    isOppComputer,
  );
  const gameState = new GameState(player1, player2);
  pubsub.publish("setPlayerPlacement", "player 1");
  pubsub.publish("setGamestate", gameState);

  InitializeGameButtons(gameState);
};

const InitializeGameButtons = (GameState) => {
  controller = new AbortController();
  signal = controller.signal;

  btnNext.addEventListener(
    "click",
    () => {
      const player1Board = GameState.player1.board;
      if (!player1Board.isAllShipInBoard()) {
        pubsub.publish("displayGameStatus", [
          ,
          "Place all your ships first to proceed.",
        ]);
        return;
      }

      gameArea.dataset.turn = "player 2";
      btnNext.classList.remove("show");
      btnStart.classList.add("show");
      pubsub.publish("setPlayerPlacement", "player 2");
    },
    { signal },
  );

  btnStart.addEventListener(
    "click",
    () => {
      let playerBoard = null;

      if (gameArea.dataset.turn === "player 1") {
        playerBoard = GameState.player1.board;
      } else {
        playerBoard = GameState.player2.board;
      }

      if (!playerBoard.isAllShipInBoard()) {
        pubsub.publish("displayGameStatus", [
          ,
          "Place all your ships first to proceed.",
        ]);
        return;
      }

      gameArea.dataset.turn = "player 1";
      pubsub.publish("setGameState", "game");
      btnStart.classList.remove("show");
    },
    { signal },
  );

  btnNew.addEventListener(
    "click",
    () => {
      newGame();
      btnNew.classList.remove("show");
    },
    { signal },
  );
};
