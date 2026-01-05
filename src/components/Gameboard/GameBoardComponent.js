import { Gameboard } from "../../classes/Gameboard";
import { ShipComponent } from "../ShipComponent/ShipComponent";
import { pubsub } from "../../classes/Pubsub";
import "./gameBoardComponent.css";

export const GameBoardComponent = (boardSize = 8) => {
  const board = new Gameboard(boardSize);

  const playerBoard = document.createElement("div");
  playerBoard.classList.add("player-board");

  const boardContainer = document.createElement("div");
  boardContainer.classList.add("board-container");
  playerBoard.appendChild(boardContainer);

  board.boardNodeArray().forEach((boardRow) => {
    boardRow.forEach((node) => {
      const cell = document.createElement("div");
      cell.classList.add("boardCell");
      cell.textContent = `${node.x} ${node.y}`;
      cell.boardNode = node;
      node.htmlElement = cell;

      _cellDragEvents(cell, board);

      boardContainer.appendChild(cell);
    });
  });

  const playerBoardShips = document.createElement("div");
  playerBoardShips.classList.add("player-ships");
  playerBoard.appendChild(playerBoardShips);
  // this.#playerShipsContainer = playerShips;

  document.body.appendChild(playerBoard);

  const addBoardShip = (name, width, length) => {
    const shipComponent = ShipComponent(name, width, length);
    playerBoardShips.appendChild(shipComponent.shipContainer);

    shipComponent.shipDraggable.addEventListener("click", () => {
      if (!board.shipNodes[name]) return;
      const shipMainNode = board.shipNodes[name][0];

      dragFunction(shipMainNode, board, shipComponent.shipObj, false, true);
    });
  };

  return { addBoardShip };
};

const isValidInsert = (node, width, len, board) => {
  let cycleNode = node;
  for (let y = 0; y < len; y++) {
    if (!cycleNode) return false;
    for (let x = 0; x < width; x++) {
      if (!cycleNode || cycleNode.ship) {
        return false;
      }
      cycleNode = cycleNode.right;
    }
    cycleNode = board.navigateNode([0, -y - 1], node);
  }
  return true;
};

const _clearDragShip = (ship, board) => {
  if (!board.shipNodes[ship.name]) return;
  let cycleNode = board.shipNodes[ship.name].pop();
  while (cycleNode) {
    cycleNode.ship = null;
    cycleNode = board.shipNodes[ship.name].pop();
  }
};

const dragFunction = (shipMainNode, board, ship, mode = true, drop = false) => {
  let [width, length] = [ship.width, ship.length];
  const shipDraggable = ship.draggableElement;
  _clearDragShip(ship, board);
  shipDraggable.style.position = "static";

  let isValidDrop = false;
  if (shipMainNode) {
    let cycleNode = shipMainNode;
    isValidDrop = isValidInsert(shipMainNode, width, length, board);
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        if (cycleNode) {
          if (mode) {
            cycleNode.htmlElement.classList.add(
              isValidDrop ? "highlight--green" : "highlight--red"
            );
          } else {
            cycleNode.htmlElement.classList.remove(
              isValidDrop ? "highlight--green" : "highlight--red"
            );
            if (drop && isValidDrop) {
              cycleNode.ship = ship;
              if (!board.shipNodes[ship.name]) board.shipNodes[ship.name] = [];
              board.shipNodes[ship.name].push(cycleNode);
            }
          }

          cycleNode = cycleNode.right;
        } else {
          x = width;
        }
      }
      cycleNode = board.navigateNode([0, -y - 1], shipMainNode);
      if (!cycleNode) y = length;
    }
  }

  if (drop && isValidDrop && shipDraggable) {
    shipDraggable.style.position = "absolute";
    shipDraggable.style.top = `${shipMainNode.htmlElement.offsetTop}px`;
    shipDraggable.style.left = `${shipMainNode.htmlElement.offsetLeft}px`;
    window.addEventListener("resize", () => {
      shipDraggable.style.top = `${shipMainNode.htmlElement.offsetTop}px`;
      shipDraggable.style.left = `${shipMainNode.htmlElement.offsetLeft}px`;
    });
  }

  return { shipMainNode, shipDraggable, isValidDrop };
};

const _cellDragEvents = (cell, board) => {
  //Drag events
  let shipData = null;
  pubsub.subscribe("ship-mousedown", (shipObj) => {
    shipData = shipObj;
  });

  cell.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!shipData) return;
    const { position, ship } = shipData;
    const shipMainNode = board.navigateNode(
      [+position[0], +position[1]],
      e.currentTarget.boardNode
    );
    dragFunction(shipMainNode, board, ship);
  });
  cell.addEventListener("dragleave", (e) => {
    if (!shipData) return;
    const { position, ship } = shipData;
    const shipMainNode = board.navigateNode(
      [+position[0], +position[1]],
      e.currentTarget.boardNode
    );
    dragFunction(shipMainNode, board, ship, false);
  });
  cell.addEventListener("drop", (e) => {
    if (!shipData) return;
    const { position, ship } = shipData;
    const shipMainNode = board.navigateNode(
      [+position[0], +position[1]],
      e.currentTarget.boardNode
    );

    dragFunction(shipMainNode, board, ship, false, true);
  });
};
