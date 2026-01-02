export class Ship {
  constructor(name = "default ship", len = 1) {
    this.shipName = name;
    this.shipLen = len;
    this.numHit = 0;
    this.sunk = false;
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
