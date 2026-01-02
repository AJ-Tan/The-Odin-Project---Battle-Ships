import { Ship } from "../Ship";

test("Testing ship functions", () => {
  const ship1 = new Ship("Destroyer", 2);
  expect(ship1.hit().numHit).toBe(1);
  expect(ship1.isSunk()).toBe(false);
  expect(ship1.hit().isSunk()).toBe(true);
});
