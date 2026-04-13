import { describe, it, expect } from "vitest";
import { loadArmy } from "./helpers.js";

describe("wood-elves fixture loads", () => {
  it("loadArmy('wood-elves') returns an army with units", () => {
    const army = loadArmy("wood-elves");
    expect(army.units.length).toBeGreaterThan(0);
  });
});
