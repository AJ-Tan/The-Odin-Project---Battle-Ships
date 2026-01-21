import { Gameboard } from "../../classes/Gameboard";
import { pubsub } from "../../classes/Pubsub";
import {
  ShipComponent,
  generateShipDraggable,
} from "../ShipComponent/ShipComponent";
import { generateBoardCell, dragFunction } from "./_GameBoardCell";
import { generateBoardFogCell } from "./_GameBoardFogCell";

import "./gameBoardComponent.css";

export const GameBoardComponent = (boardSize = 8) => {
  const gameArea = document.querySelector(".game-area");
  const board = new Gameboard(boardSize);

  const playerBoard = document.createElement("div");
  playerBoard.classList.add("player-board");
  gameArea.appendChild(playerBoard);

  const boardContent = document.createElement("div");
  boardContent.classList.add("board-content");
  playerBoard.appendChild(boardContent);

  const playerBoardShips = document.createElement("div");
  playerBoardShips.classList.add("player-ships");
  boardContent.appendChild(playerBoardShips);

  const playerBoardShipsContainer = document.createElement("div");
  playerBoardShipsContainer.classList.add("player-ships-container");
  playerBoardShips.appendChild(playerBoardShipsContainer);

  const boardContainer = document.createElement("div");
  boardContainer.classList.add("board-container");
  boardContent.appendChild(boardContainer);

  const resultOverlay = document.createElement("div");
  resultOverlay.classList.add("result-overlay");
  boardContainer.appendChild(resultOverlay);

  pubsub.subscribe("allSunk", (sunkBoard) => {
    if (sunkBoard === board) {
      resultOverlay.classList.add("lose");
    } else {
      resultOverlay.classList.add("win");
    }
  });

  const cellContainer = document.createElement("div");
  cellContainer.classList.add("cell-container");
  boardContainer.appendChild(cellContainer);
  cellContainer.appendChild(generateBoardCell(board));

  const fogContainer = document.createElement("div");
  fogContainer.classList.add("fog-container");
  fogContainer.appendChild(generateBoardFogCell(board));
  boardContainer.appendChild(fogContainer);

  const addBoardShip = (name, width, length) => {
    const shipComponent = ShipComponent(name, width, length, board);
    shipComponent.shipObj.board = board;
    playerBoardShipsContainer.appendChild(shipComponent.shipContainer);
    board.shipNodes[name] = { ship: shipComponent.shipObj, nodes: [] };

    shipComponent.shipDraggable.addEventListener("click", () => {
      const shipMainNode = board.shipNodes[name].nodes[0];
      dragFunction(shipMainNode, board, shipComponent.shipObj, false, true);

      if (board.shipNodes[name].nodes.length === 0) {
        shipComponent.shipDraggable.resetRotation();
      }
    });
  };

  const playerBoardBtns = document.createElement("div");
  playerBoardBtns.classList.add("player-board-btns");
  playerBoardShips.appendChild(playerBoardBtns);

  const randomButton = document.createElement("button");
  randomButton.classList.add("player-ship-random");
  randomButton.textContent = "Randomize";
  randomButton.addEventListener("click", () => {
    randomPlacement();
  });
  playerBoardBtns.appendChild(randomButton);

  const randomPlacement = () => {
    resetBoard();
    const shipNodes = board.shipNodes;
    const nodeArray = board.boardNodeArray();
    for (let key in shipNodes) {
      let randomIndex = Math.floor(Math.random() * nodeArray.length);

      // random rotate
      if (Math.floor(Math.random() * 2)) {
        generateShipDraggable(
          shipNodes[key].ship.draggableElement,
          true,
          board,
        );
      }

      let dragNode = dragFunction(
        nodeArray[randomIndex],
        board,
        shipNodes[key].ship,
        false,
      );

      while (!dragNode.isValidDrop) {
        randomIndex = Math.floor(Math.random() * nodeArray.length);
        dragNode = dragFunction(
          nodeArray[randomIndex],
          board,
          shipNodes[key].ship,
          false,
        );
      }
      shipNodes[key].ship.draggableElement.rotateButton.classList.add("show");
      dragFunction(
        nodeArray[randomIndex],
        board,
        shipNodes[key].ship,
        false,
        true,
      );
    }
  };

  const resetButton = document.createElement("button");
  resetButton.classList.add("player-ship-reset");
  resetButton.textContent = "Reset";
  resetButton.addEventListener("click", () => {
    resetBoard();
  });
  playerBoardBtns.appendChild(resetButton);

  const resetBoard = () => {
    for (let key in board.shipNodes) {
      board.shipNodes[key].nodes.forEach((nodes) => {
        nodes.ship = null;
        nodes.fogElement.className = "fog-cell";
      });
      board.shipNodes[key].nodes = [];
      board.shipNodes[key].ship.numHit = 0;
      board.shipNodes[key].ship.sunk = false;
      board.shipNodes[key].ship.draggableElement.style.top = "unset";
      board.shipNodes[key].ship.draggableElement.style.left = "unset";
      board.shipNodes[key].ship.draggableElement.resetRotation();
      board.shipNodes[key].ship.draggableElement.rotateButton.classList.remove(
        "show",
      );
    }

    resultOverlay.classList.remove("win");
    resultOverlay.classList.remove("lose");
    fogContainer.replaceChildren(generateBoardFogCell(board));
    fogContainer.classList.remove("show");
    pubsub.publish("setGameState", "placement");
  };

  return {
    addBoardShip,
    resetBoard,
    randomPlacement,
    resultOverlay,
    playerBoard,
    board,
  };
};
