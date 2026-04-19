import { describe, it, expect } from "vitest";
import { validateArmy } from "../army-validation.js";
import { loadArmy } from "./helpers.js";

describe("validateArmy", () => {
  it("returns empty array for a clean dark-elves army", () => {
    const army = loadArmy("dark-elves");
    const rawJson = {
      game: "the-old-world",
      characters: [],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, army)).toEqual([]);
  });
});
