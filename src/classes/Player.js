import { GameBoardComponent } from "../components/GameboardComponent/GameBoardComponent";

let playerCounter = 1;

export class Player {
  constructor(name, isComputer = false) {
    this.name = name;
    this.playerNumber = playerCounter++;
    this.isComputer = isComputer;
    this.boardComponent = GameBoardComponent();
    this.board = this.boardComponent.board;
    this.#_populateShip();
    this.#_displayPlayerName();

    if (isComputer) {
      this.boardComponent.randomPlacement();
      this.boardComponent.playerBoard.dataset.player = "computer";
    } else {
      this.boardComponent.playerBoard.dataset.player = "human";
    }
  }

  #_displayPlayerName() {
    const playerNameElement = document.createElement("h2");
    playerNameElement.classList.add("player-name");
    playerNameElement.textContent = this.name;
    this.boardComponent.playerBoard.prepend(playerNameElement);
  }

  #_populateShip() {
    this.boardComponent.addBoardShip("Carrier", 4, 1);
    this.boardComponent.addBoardShip("Cruiser", 3, 1);
    this.boardComponent.addBoardShip("Submarine", 3, 1);
    this.boardComponent.addBoardShip("Destroyer", 2, 1);
    this.boardComponent.addBoardShip("Dreadnought", 3, 2);
  }
}
