import { pubsub } from "../../classes/Pubsub";
import { Ship } from "../../classes/Ship";
import "./shipComponent.css";

export const ShipComponent = (name, width, length) => {
  const ship = new Ship(name, length, width);

  const shipContainer = document.createElement("div");
  shipContainer.classList.add("ship-container");

  const shipDraggable = document.createElement("div");
  shipDraggable.classList.add("ship-draggable");
  shipDraggable.draggable = true;
  shipContainer.appendChild(shipDraggable);
  generateShipDraggable(shipDraggable, ship, false);

  shipDraggable.addEventListener("click", () => {
    generateShipDraggable(shipDraggable, ship, true);
  });

  ship.draggableElement = shipDraggable;

  return { shipContainer, shipDraggable, shipObj: ship };
};

const generateShipBlock = (width, length) => {
  const fragment = document.createDocumentFragment();
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < width; x++) {
      const shipBlock = document.createElement("div");
      shipBlock.textContent = `${x} ${y}`;
      shipBlock.dataset.x = -x;
      shipBlock.dataset.y = y;
      fragment.appendChild(shipBlock);
    }
  }

  return fragment;
};

const generateShipDraggable = (shipDraggable, ship, rotate = false) => {
  const boardCell = document.querySelector(".boardCell");
  shipDraggable.replaceChildren();

  if (rotate) {
    ship.position = ship.position === "horizontal" ? "vertical" : "horizontal";
    [ship.width, ship.length] = [ship.length, ship.width];
  }

  let [width, length] = [ship.width, ship.length];
  shipDraggable.style.gridTemplateColumns = `repeat(${width}, ${boardCell.offsetWidth}px)`;
  window.addEventListener("resize", () => {
    shipDraggable.style.gridTemplateColumns = `repeat(${width}, ${boardCell.offsetWidth}px)`;
  });

  // const shipDisplay = document.querySelector("div");
  // shipDisplay.classList.add("ship-display");

  shipDraggable.appendChild(generateShipBlock(width, length));

  let dragShip = false;
  shipDraggable.addEventListener("mousedown", (e) => {
    const data = e.target.dataset;
    pubsub.publish("ship-mousedown", {
      position: [data.x, data.y],
      shipDraggable,
      ship: ship,
    });
    dragShip = true;
  });

  shipDraggable.addEventListener("mouseup", (e) => {
    dragShip = false;
  });

  shipDraggable.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  shipDraggable.addEventListener("dragenter", (e) => {
    if (dragShip) e.currentTarget.style.visibility = "hidden";
  });

  shipDraggable.addEventListener("dragend", (e) => {
    e.currentTarget.style.visibility = "visible";
    pubsub.publish("ship-mousedown", null);
    dragShip = false;
  });

  return shipDraggable;
};
