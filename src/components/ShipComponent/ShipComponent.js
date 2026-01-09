import { pubsub } from "../../classes/Pubsub";
import { Ship } from "../../classes/Ship";
import "./shipComponent.css";

export const ShipComponent = (name, width, length, board) => {
  const ship = new Ship(name, length, width);

  const shipContainer = document.createElement("div");
  shipContainer.classList.add("ship-container");

  const shipDraggable = document.createElement("div");
  shipDraggable.classList.add("ship-draggable", "horizontal");
  shipDraggable.draggable = true;
  shipDraggable.ship = ship;

  shipDraggable.resetRotation = () => {
    if (ship.position === "vertical") {
      generateShipDraggable(shipDraggable, true);
    }
  };

  shipContainer.appendChild(shipDraggable);
  ship.shipDraggable = shipDraggable;
  generateShipDraggable(shipDraggable, false);

  const shipPlacementBg = document.createElement("div");
  shipPlacementBg.classList.add("ship-placement-bg");
  generateShipBlock(shipPlacementBg, ship.width, ship.length);
  shipContainer.appendChild(shipPlacementBg);

  // shipDraggable.addEventListener("click", () => {
  //   generateShipBlock(shipPlacementBg, ship.width, ship.length);
  // });

  ship.draggableElement = shipDraggable;

  return { shipContainer, shipDraggable, shipObj: ship };
};

const generateShipBlock = (parentElement, width, length) => {
  const fragment = document.createDocumentFragment();
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < width; x++) {
      const shipCell = document.createElement("div");
      shipCell.classList.add("ship-cell");
      shipCell.dataset.x = -x;
      shipCell.dataset.y = y;
      fragment.appendChild(shipCell);

      if (x === 0 && y === 0 && parentElement.ship) {
        const rotateButton = document.createElement("button");
        rotateButton.classList.add("btn-ship-rotate");
        rotateButton.addEventListener("click", () => {
          if (
            parentElement.ship.board.shipNodes[parentElement.ship.name].nodes
              .length === 0
          )
            return;
          generateShipDraggable(parentElement, true);
        });
        shipCell.appendChild(rotateButton);

        const rotateIcon = new DOMParser().parseFromString(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>rotate-right</title><path d="M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z" /></svg>`,
          "image/svg+xml"
        ).documentElement;
        rotateButton.appendChild(rotateIcon);
      }
    }
  }

  const boardCell = document.querySelector(".board-cell");
  parentElement.style.gridTemplateColumns = `repeat(${width}, ${boardCell.offsetWidth}px)`;

  window.addEventListener("resize", () => {
    parentElement.style.gridTemplateColumns = `repeat(${width}, ${boardCell.offsetWidth}px)`;
  });

  parentElement.replaceChildren(fragment);
};

const generateShipDraggable = (shipDraggable, rotate = false) => {
  const ship = shipDraggable.ship;
  if (rotate) {
    shipDraggable.classList.remove(ship.position);
    ship.position = ship.position === "horizontal" ? "vertical" : "horizontal";
    shipDraggable.classList.add(ship.position);
    [ship.width, ship.length] = [ship.length, ship.width];
  }

  generateShipBlock(shipDraggable, ship.width, ship.length);

  const shipDraggableDisplay = document.createElement("div");
  shipDraggableDisplay.classList.add("ship-draggable-display");
  shipDraggable.appendChild(shipDraggableDisplay);

  const shipDisplayText = document.createElement("span");
  shipDisplayText.textContent = ship.name;
  shipDraggableDisplay.appendChild(shipDisplayText);

  shipDraggable.childNodes.forEach((childNodes) => {
    childNodes.addEventListener("mousedown", (e) => {
      const data = e.currentTarget.dataset;
      pubsub.publish("ship-mousedown", {
        position: [data.x, data.y],
        shipDraggable,
        ship: ship,
      });
      shipDraggable.dragShip = true;
    });
  });

  shipDraggable.addEventListener("mouseup", (e) => {
    shipDraggable.dragShip = false;
    if (ship.board.shipNodes[ship.name].nodes.length === 0) {
      shipDraggable.resetRotation();
    }
  });

  shipDraggable.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  shipDraggable.addEventListener("dragenter", (e) => {
    if (shipDraggable.dragShip) e.currentTarget.style.visibility = "hidden";
  });

  shipDraggable.addEventListener("dragend", (e) => {
    e.currentTarget.style.visibility = "visible";
    pubsub.publish("ship-mousedown", null);
    shipDraggable.dragShip = false;
    if (ship.board.shipNodes[ship.name].nodes.length === 0) {
      shipDraggable.resetRotation();
    }
  });

  return shipDraggable;
};
