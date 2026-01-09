import "./style.css";
import { GameBoardComponent } from "./components/Gameboard/GameBoardComponent";

const player1Board = GameBoardComponent();
player1Board.addBoardShip("Aircraft Carrier", 3, 2);
player1Board.addBoardShip("Dreadnought", 3, 1);
