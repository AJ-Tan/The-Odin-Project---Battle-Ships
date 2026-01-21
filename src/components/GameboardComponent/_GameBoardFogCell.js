import { pubsub } from "../../classes/Pubsub";

let playerTurn = null;

export const generateBoardFogCell = (board) => {
  const fragment = document.createDocumentFragment();

  board.boardNodeArrayRows().forEach((boardRow) => {
    boardRow.forEach((node) => {
      const cell = document.createElement("div");
      cell.classList.add("fog-cell");
      cell.dataset.targeted = false;
      cell.boardNode = node;
      node.fogElement = cell;
      fogEvents(cell, board);
      fragment.appendChild(cell);
    });
  });

  pubsub.subscribe("playerTurn", (turnBoard) => {
    playerTurn = turnBoard;
  });

  return fragment;
};

const fogEvents = (cell, board) => {
  cell.addEventListener("click", () => {
    if (playerTurn === board || playerTurn === null) return;
    if (cell.dataset.targeted === "false") {
      cell.dataset.targeted = true;
      board.targetHistory.push(cell.boardNode);
      if (cell.boardNode.ship) {
        cell.classList.add("hit");
        cell.boardNode.ship.hit();
        if (cell.boardNode.ship.isSunk()) {
          removeShipFog(cell.boardNode.ship.name, board);
          cell.boardNode.ship.draggableElement.classList.add("show");
        }
        if (board.isAllSunk()) {
          pubsub.publish("allSunk", board);
          pubsub.publish("setGameState", "end");
          pubsub.publish("announceWinner");
          return;
        }
      } else {
        cell.classList.add("miss");
      }
      pubsub.publish("changePlayerTurn", board);
    }
  });
};

const removeShipFog = (name, board) => {
  board.shipNodes[name].nodes.forEach((node) => {
    node.fogElement.classList.add("ship-sunk");
    node.fogElement.classList.remove("hit");
  });
};
