import { describe, it, expect } from "vitest";
import { loadArmy } from "./helpers.js";

describe("wood-elves fixture loads", () => {
  it("loadArmy('wood-elves') returns an army with units", () => {
    const army = loadArmy("wood-elves");
    expect(army.units.length).toBeGreaterThan(0);
  });
});

describe("Beast Pack points include detachment costs", () => {
  it("Beast Pack with 1 Deepwood Hound costs 19 pts (11 keeper + 8 hound)", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    expect(pack).toBeDefined();
    expect(pack.points).toBe(19);
  });
});
