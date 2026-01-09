import { Gameboard } from "../../classes/Gameboard";
import { ShipComponent } from "../ShipComponent/ShipComponent";
import { generateBoardCell, dragFunction } from "./_GameBoardCell";

import "./gameBoardComponent.css";

export const GameBoardComponent = (boardSize = 8) => {
  const board = new Gameboard(boardSize);

  const playerBoard = document.createElement("div");
  playerBoard.dataset.mode = "placement";
  playerBoard.classList.add("player-board");
  document.body.appendChild(playerBoard);

  const playerBoardShips = document.createElement("div");
  playerBoardShips.classList.add("player-ships");
  playerBoard.appendChild(playerBoardShips);

  const changedBoardState = () => {
    if (playerBoard.dataset.mode === "placement") {
      for (let shipName in board.shipNodes) {
        board.shipNodes[shipName].ship.shipDraggable.draggable = true;
      }
    } else {
      for (let shipName in board.shipNodes) {
        board.shipNodes[shipName].ship.shipDraggable.draggable = false;
      }
    }
  };

  const boardContainer = document.createElement("div");
  boardContainer.classList.add("board-container");
  playerBoard.appendChild(boardContainer);

  boardContainer.appendChild(generateBoardCell(board));

  const changeBoardState = () => {
    const currentMode = playerBoard.dataset.mode;
    playerBoard.dataset.mode =
      currentMode === "placement" ? "game" : "placement";
    changedBoardState();
  };

  const testButton = document.createElement("button");
  testButton.textContent = "Toggle State";
  testButton.addEventListener("click", changeBoardState);
  playerBoard.appendChild(testButton);

  const addBoardShip = (name, width, length) => {
    const shipComponent = ShipComponent(name, width, length);
    shipComponent.shipObj.board = board;
    playerBoardShips.appendChild(shipComponent.shipContainer);
    board.shipNodes[name] = { ship: shipComponent.shipObj, nodes: [] };

    shipComponent.shipDraggable.addEventListener("click", () => {
      const shipMainNode = board.shipNodes[name].nodes[0];
      dragFunction(shipMainNode, board, shipComponent.shipObj, false, true);

      if (board.shipNodes[name].nodes.length === 0) {
        shipComponent.shipDraggable.resetRotation();
      }
    });
  };

  return { addBoardShip };
};
