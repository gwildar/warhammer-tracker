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

describe("checkBardingWithoutMount", () => {
  it("warns when barding is active but no non-foot mount is selected", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [],
          armor: [],
          options: [{ name_en: "Barding", active: true }],
          mounts: [
            { name_en: "On foot", active: true },
            { name_en: "Barded Warhorse", active: false },
          ],
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
      "Barding equipped but no mount is active",
    );
  });

  it("does not warn when barding is active and a mount is selected", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [],
          armor: [],
          options: [{ name_en: "Barding", active: true }],
          mounts: [
            { name_en: "On foot", active: false },
            { name_en: "Barded Warhorse", active: true },
          ],
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

  it("does not warn for fixed cavalry with no mounts[] array", () => {
    // Blood Knights, Knights Errant, etc. have barding in armor but no mounts[] choice
    const rawJson = {
      game: "the-old-world",
      core: [
        {
          name_en: "Blood Knights",
          equipment: [],
          armor: [{ name_en: "Full plate armour, Barding", active: true }],
          options: [],
          mounts: [],
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

describe("checkMagicWeaponWithMundane", () => {
  it("warns when magic weapon is equipped alongside an active non-hand mundane weapon", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [
            { name_en: "Hand weapon", active: true },
            { name_en: "Lance", active: true },
          ],
          armor: [],
          options: [],
          items: [{ selected: [{ type: "weapon", name_en: "Frontier Axe" }] }],
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
    expect(warnings[0].message).toContain("Lance");
    expect(warnings[0].message).toContain(
      "only the magic weapon is used in combat",
    );
  });

  it("does not warn when magic weapon is alongside only a hand weapon", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [{ name_en: "Hand weapon", active: true }],
          armor: [],
          options: [],
          items: [{ selected: [{ type: "weapon", name_en: "Frontier Axe" }] }],
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

  it("does not warn when unit has no magic weapon", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [{ name_en: "Lance", active: true }],
          armor: [],
          options: [],
          items: [{ selected: [{ type: "talisman", name_en: "Lucky Charm" }] }],
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
});
