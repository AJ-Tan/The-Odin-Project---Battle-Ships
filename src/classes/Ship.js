export class Ship {
  constructor(name = "default ship", length = 3, width = 2) {
    this.name = name;
    this.length = length;
    this.width = width;
    this.numHit = 0;
    this.sunk = false;
    this.position = "horizontal";
    this.draggableElement = null;
  }

  hit() {
    this.numHit++;
    return this;
  }

  isSunk() {
    if (this.numHit >= this.shipLen) {
      this.sunk = true;
    }
    return this.sunk;
  }
}
