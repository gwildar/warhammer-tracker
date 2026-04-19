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

describe("checkShieldInMultipleArrays", () => {
  it("warns when shield appears in both equipment and options arrays (both active)", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [{ name_en: "Shield", active: true }],
          armor: [{ name_en: "Heavy armour", active: true }],
          options: [{ name_en: "Shield", active: true }],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    const warnings = validateArmy(rawJson, { units: [] });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].unitName).toBe("Baron");
    expect(warnings[0].message).toContain(
      "Shield appears in multiple data fields",
    );
  });

  it("does not warn when shield is only in one array", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [],
          armor: [{ name_en: "Heavy armour", active: true }],
          options: [{ name_en: "Shield", active: true }],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });

  it("does not count inactive equipment entries as a shield array", () => {
    // 'Great weapons (replace shields)' with active: null should not count
    const rawJson = {
      game: "the-old-world",
      core: [
        {
          name_en: "Grave Guard",
          equipment: [
            { name_en: "Great weapons (replace shields)", active: null },
          ],
          armor: [],
          options: [{ name_en: "Shields", active: true }],
        },
      ],
      characters: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });
});
