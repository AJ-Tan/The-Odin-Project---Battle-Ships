import { pubsub } from "./Pubsub";

export class GameState {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.#pubPlayerTurn();
    this.#subPlayerTurn();
    this.#subGameState();
    this.#subTogglePlayerBoard();
    this.#subAnnounceWinner();
  }

  #subAnnounceWinner() {
    const btnNew = document.querySelector(".btn-new");

    pubsub.subscribe("announceWinner", () => {
      const gameArea = document.querySelector(".game-area");
      if (gameArea.dataset.turn === "player 1") {
        pubsub.publish("displayGameStatus", [
          `Winner: ${this.player1.name}`,
          `${this.player2.name}'s ships has all been sunk.`,
        ]);
      } else {
        pubsub.publish("displayGameStatus", [
          `Winner: ${this.player2.name}`,
          `${this.player1.name}'s ships has all been sunk.`,
        ]);
      }

      btnNew.classList.add("show");
    });
  }

  #subTogglePlayerBoard() {
    pubsub.subscribe("setPlayerPlacement", (player) => {
      this.player1.boardComponent.playerBoard.classList.add("hide");
      this.player2.boardComponent.playerBoard.classList.add("hide");
      if (player === "player 1") {
        this.player1.boardComponent.playerBoard.classList.remove("hide");
        pubsub.publish("displayGameStatus", [
          this.player1.name,
          "Place your ships",
        ]);
      } else if (player === "player 2") {
        this.player2.boardComponent.playerBoard.classList.remove("hide");
        pubsub.publish("displayGameStatus", [
          this.player2.name,
          "Place your ships",
        ]);
      }
    });
  }

  #subGameState() {
    pubsub.subscribe("setGameState", (state) => {
      this.changeGameState(state);
    });
  }

  #pubPlayerTurn(turnBoard = this.player1.board) {
    const gameArea = document.querySelector(".game-area");
    if (turnBoard === this.player1.board) {
      gameArea.dataset.turn = "player 1";
    } else {
      gameArea.dataset.turn = "player 2";
    }

    pubsub.publish("playerTurn", turnBoard);
  }

  #subPlayerTurn() {
    pubsub.subscribe("changePlayerTurn", (board) => {
      let turnPlayerBoard = null;
      if (this.player1.board === board) {
        turnPlayerBoard = this.player1.board;
        pubsub.publish("displayGameStatus", [
          `Turn: ${this.player1.name}`,
          "Select a cell to attack.",
        ]);
      } else {
        turnPlayerBoard = this.player2.board;
        pubsub.publish("displayGameStatus", [
          `Turn: ${this.player2.name}`,
          this.player2.isComputer
            ? "Computer is thinking."
            : "Select a cell to attack.",
        ]);
        if (this.player2.isComputer) {
          this.#computerAttack();
        }
      }
      this.#pubPlayerTurn(turnPlayerBoard);
    });
  }
  #computerHit = [];
  #cleanComputerHit = () => {
    const newComputerHit = [];
    this.#computerHit.forEach((computerMove) => {
      if (computerMove.node.ship.sunk === false) {
        newComputerHit.push(computerMove);
      }
    });

    this.#computerHit = newComputerHit;
  };

  #computerAttack() {
    const playerBoardNodes = this.player1.board.boardNodeArray();
    this.#cleanComputerHit();
    let randomNode = null;
    let randomIndex;
    if (this.#computerHit.length === 0) {
      while (!randomNode) {
        randomIndex = Math.floor(Math.random() * playerBoardNodes.length);

        if (
          playerBoardNodes[randomIndex].fogElement.dataset.targeted === "false"
        ) {
          randomNode = playerBoardNodes[randomIndex];
        }
      }

      if (randomNode.ship) {
        this.#computerHit.push({
          node: randomNode,
          possibleMoves: randomNode.possibleMoves(),
          suggestMove: null,
        });
      }
    } else {
      let counter = 1;
      let lastHitMove = this.#computerHit.slice(-counter)[0];
      let computerMove;
      let moveIndex;
      let tempMove;

      while (!computerMove) {
        if (lastHitMove.suggestMove) {
          moveIndex = lastHitMove.possibleMoves.findIndex(
            (moveObj) => moveObj.direction === lastHitMove.suggestMove,
          );
        } else {
          moveIndex = Math.floor(
            Math.random() * lastHitMove.possibleMoves.length,
          );
        }
        tempMove = lastHitMove.possibleMoves.splice(moveIndex, 1)[0];

        if (tempMove.node.fogElement.dataset.targeted === "false") {
          computerMove = tempMove;
        }

        if (lastHitMove.possibleMoves.length === 0) {
          this.#computerHit.splice(-1);
          lastHitMove = this.#computerHit.slice(-1)[0];
        }
      }
      console.log(computerMove);

      randomNode = computerMove.node;
      const computerPossibleMoves = randomNode.possibleMoves();
      if (randomNode.ship) {
        this.#computerHit.push({
          node: randomNode,
          possibleMoves: computerPossibleMoves,
          suggestMove: computerPossibleMoves.find(
            (moveObj) => moveObj.direction === computerMove.direction,
          )
            ? computerMove.direction
            : null,
        });
      } else {
        lastHitMove.suggestMove = null;
      }
    }

    setTimeout(() => {
      console.log(this.#computerHit);
      randomNode.fogElement.click();
    }, 1000);
  }

  changeGameState(state) {
    const gameArea = document.querySelector(".game-area");

    if (state) {
      gameArea.dataset.mode = state;
    } else {
      gameArea.dataset.mode =
        gameArea.dataset.mode === "placement" ? "game" : "placement";
    }

    if (gameArea.dataset.mode === "game") {
      this.player1.boardComponent.playerBoard.classList.remove("hide");
      this.player2.boardComponent.playerBoard.classList.remove("hide");
      pubsub.publish("displayGameStatus", [
        "Turn: Player 1",
        "Select a cell to attack.",
      ]);
    }

    pubsub.publish("changedGameState", gameArea.dataset.mode);
  }

  resetBoard() {
    this.player1.boardComponent.resetBoard();
    this.player2.boardComponent.resetBoard();
    this.#pubPlayerTurn(); //reset player turn
  }
}
