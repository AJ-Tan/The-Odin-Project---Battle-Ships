import { pubsub } from "../../classes/Pubsub";

const generateBoardCell = (board) => {
  const fragment = document.createDocumentFragment();
  board.boardNodeArray().forEach((boardRow) => {
    boardRow.forEach((node) => {
      const cell = document.createElement("div");
      cell.classList.add("board-cell");
      cell.boardNode = node;
      node.cellElement = cell;
      _cellDragEvents(cell, board);
      fragment.appendChild(cell);
    });
  });

  return fragment;
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
  let cycleNode = board.shipNodes[ship.name].nodes.pop();
  while (cycleNode) {
    cycleNode.ship = null;
    cycleNode = board.shipNodes[ship.name].nodes.pop();
  }
};

const dragFunction = (shipMainNode, board, ship, mode = true, drop = false) => {
  let [width, length] = [ship.width, ship.length];
  const shipDraggable = ship.draggableElement;
  _clearDragShip(ship, board);
  shipDraggable.style.top = "unset";
  shipDraggable.style.left = "unset";

  let isValidDrop = false;
  if (shipMainNode) {
    let cycleNode = shipMainNode;
    isValidDrop = isValidInsert(shipMainNode, width, length, board);
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        if (cycleNode) {
          if (mode) {
            cycleNode.cellElement.classList.add(
              isValidDrop ? "highlight--green" : "highlight--red"
            );
          } else {
            cycleNode.cellElement.classList.remove(
              isValidDrop ? "highlight--green" : "highlight--red"
            );
            if (drop && isValidDrop) {
              cycleNode.ship = ship;
              board.shipNodes[ship.name].nodes.push(cycleNode);
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
    shipDraggable.style.top = `${shipMainNode.cellElement.offsetTop}px`;
    shipDraggable.style.left = `${shipMainNode.cellElement.offsetLeft}px`;
    window.addEventListener("resize", () => {
      if (shipMainNode.ship === null || shipMainNode.ship !== ship) return;
      shipDraggable.style.top = `${shipMainNode.cellElement.offsetTop}px`;
      shipDraggable.style.left = `${shipMainNode.cellElement.offsetLeft}px`;
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

export { generateBoardCell, dragFunction };
