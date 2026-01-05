import { pubsub } from "./Pubsub";
let i = 0;
export class Gameboard {
  constructor(boardSize = 8) {
    this.board = this.#_generateBoard(boardSize);
    this.boardSize = boardSize;
    this.shipNodes = {};
    this.allSunk = false;
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

  isAllSunk() {
    for (let i = 0; i < this.ships.length; i++) {
      if (this.ships[i].sunk === false) return false;
    }

    return true;
  }

  boardNodeArray() {
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
    this.htmlElement = null;
  }
}
