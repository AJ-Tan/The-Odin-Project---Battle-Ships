import { pubsub } from "./Pubsub";
let i = 0;
export class Gameboard {
  constructor(boardSize = 8) {
    this.board = this.#_generateBoard(boardSize);
    this.boardSize = boardSize;
    this.shipNodes = {};
    this.targetHistory = [];
  }

  #_generateBoard(boardSize) {
    let board = null;
    if (boardSize <= 0) return board;

    let currentRows;
    let previousRows = [];
    for (let y = 0; y < boardSize; y++) {
      currentRows = [];

      for (let x = 0; x < boardSize; x++) {
        let node = new boardNode(x, y);

        if (!board) {
          board = node;
        } else {
          let previousNode = currentRows.slice(-1)[0];

          if (previousNode) {
            node.left = previousNode;
            previousNode.right = node;
          }

          if (previousRows[x]) {
            node.down = previousRows[x];
            previousRows[x].up = node;
          }
        }
        currentRows.push(node);
      }

      previousRows = [...currentRows];
    }

    return board;
  }

  navigateNode([xVal, yVal], node = this.board) {
    let cycleNode = node;
    let whichNode;
    for (let x = xVal; x !== 0; x = x < 0 ? x + 1 : x - 1) {
      if (!cycleNode) return false;
      whichNode = x < 0 ? "left" : "right";
      cycleNode = cycleNode[whichNode];
    }

    for (let y = yVal; y !== 0; y = y < 0 ? y + 1 : y - 1) {
      if (!cycleNode) return false;
      whichNode = y < 0 ? "down" : "up";
      cycleNode = cycleNode[whichNode];
    }

    return cycleNode;
  }

  isAllShipInBoard() {
    for (let key in this.shipNodes) {
      if (this.shipNodes[key].nodes.length === 0) {
        return false;
      }
    }

    return true;
  }

  isAllSunk() {
    for (let key in this.shipNodes) {
      if (!this.shipNodes[key].ship.sunk) {
        return false;
      }
    }

    return true;
  }

  boardNodeArray() {
    const nodeArr = [];
    let prevStartNode = null;
    let previousNode = null;
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        if (x === 0) {
          const currentNode = prevStartNode ? prevStartNode.up : this.board;
          nodeArr.push(currentNode);
          prevStartNode = currentNode;
          previousNode = currentNode;
        } else {
          const currentNode = previousNode?.right;
          nodeArr.push(currentNode);
          previousNode = currentNode;
        }
      }
    }

    return nodeArr;
  }

  boardNodeArrayRows() {
    const nodeArr = [];
    let prevStartNode = null;
    let rowArr;
    for (let y = 0; y < this.boardSize; y++) {
      rowArr = [];
      for (let x = 0; x < this.boardSize; x++) {
        if (x === 0) {
          rowArr.push(prevStartNode ? prevStartNode.up : this.board);
          prevStartNode = rowArr.slice(-1)[0];
        } else {
          const currentNode = rowArr.slice(-1)[0]?.right;
          rowArr.push(currentNode);
        }
      }
      nodeArr.unshift(rowArr);
    }

    return nodeArr;
  }
}

class boardNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.up = null;
    this.down = null;
    this.left = null;
    this.right = null;
    this.ship = null;
  }

  possibleMoves(exclude = "") {
    const moves = [];
    if (this.up) {
      if (this.up.fogElement.dataset.targeted === "false" || exclude !== "up") {
        moves.push({ node: this.up, direction: "up" });
      }
    }

    if (this.down) {
      if (
        this.down.fogElement.dataset.targeted === "false" ||
        exclude !== "down"
      ) {
        moves.push({
          node: this.down,
          direction: "down",
        });
      }
    }

    if (this.left) {
      if (
        this.left.fogElement.dataset.targeted === "false" ||
        exclude !== "left"
      ) {
        moves.push({
          node: this.left,
          direction: "left",
        });
      }
    }

    if (this.right) {
      if (
        this.right.fogElement.dataset.targeted === "false" ||
        exclude !== "right"
      ) {
        moves.push({
          node: this.right,
          direction: "right",
        });
      }
    }

    return moves;
  }
}
