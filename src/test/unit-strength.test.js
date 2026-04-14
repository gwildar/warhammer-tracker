import { describe, it, expect, beforeEach } from "vitest";
import { computeUnitStrength } from "../parsers/resolve.js";
import { loadArmy } from "./helpers.js";
import {
  renderCombatWeaponsContext,
  renderCombatResultContext,
} from "../context/combat-weapons.js";
import { saveCharacterAssignments } from "../state.js";
import { renderArmySummary } from "../screens/setup.js";

function makeUnit(troopTypes, strength, mount = null) {
  return {
    strength,
    stats: troopTypes.length > 0 ? [{ troopType: troopTypes }] : [],
    mount,
  };
}

describe("computeUnitStrength", () => {
  it("RI unit of 20 has US 20", () => {
    expect(computeUnitStrength(makeUnit(["RI"], 20))).toBe(20);
  });
  it("HI unit of 10 has US 10", () => {
    expect(computeUnitStrength(makeUnit(["HI"], 10))).toBe(10);
  });
  it("MI unit of 3 has US 6", () => {
    expect(computeUnitStrength(makeUnit(["MI"], 3))).toBe(6);
  });
  it("MCa unit of 5 has US 15", () => {
    expect(computeUnitStrength(makeUnit(["MCa"], 5))).toBe(15);
  });
  it("Be unit of 2 has US 6", () => {
    expect(computeUnitStrength(makeUnit(["Be"], 2))).toBe(6);
  });
  it("HCh (heavy chariot) of 1 has US 3", () => {
    expect(computeUnitStrength(makeUnit(["HCh"], 1))).toBe(3);
  });
  it("LCh (light chariot) of 1 has US 3", () => {
    expect(computeUnitStrength(makeUnit(["LCh"], 1))).toBe(3);
  });
  it("MCr (monster) of 1 has US 5", () => {
    expect(computeUnitStrength(makeUnit(["MCr"], 1))).toBe(5);
  });
  it("WM (war machine) has US 0", () => {
    expect(computeUnitStrength(makeUnit(["WM"], 1))).toBe(0);
  });
  it("character [RI, Ch] has US 1", () => {
    expect(computeUnitStrength(makeUnit(["RI", "Ch"], 1))).toBe(1);
  });
  it("character [MI, Ch] has US 2", () => {
    expect(computeUnitStrength(makeUnit(["MI", "Ch"], 1))).toBe(2);
  });
  it("NCh marker is ignored, primary type used", () => {
    expect(computeUnitStrength(makeUnit(["HI", "NCh"], 1))).toBe(1);
  });
  it("character on monster mount (wBonus > 0, MCr) has US 6", () => {
    const mount = { troopType: "MCr", wBonus: 3 };
    expect(computeUnitStrength(makeUnit(["RI", "Ch"], 1, mount))).toBe(6);
  });
  it("character on horse (wBonus 0, HC) has US 1", () => {
    const mount = { troopType: "HC", wBonus: 0 };
    expect(computeUnitStrength(makeUnit(["RI", "Ch"], 1, mount))).toBe(1);
  });
  it("unit with no stats defaults to 1 per model", () => {
    const unit = { strength: 5, stats: [], mount: null };
    expect(computeUnitStrength(unit)).toBe(5);
  });
});

describe("unit.unitStrength on canonical units from loadArmy", () => {
  it("each unit in mc-skeleton-horde has a numeric unitStrength >= 0", () => {
    const army = loadArmy("mc-skeleton-horde");
    for (const u of army.units) {
      expect(typeof u.unitStrength).toBe("number");
      expect(u.unitStrength).toBeGreaterThanOrEqual(0);
    }
  });
  it("Skeleton Warriors (RI) have unitStrength equal to their model count", () => {
    const army = loadArmy("mc-skeleton-horde");
    const skeletons = army.units.find((u) =>
      u.id.startsWith("skeleton-warriors"),
    );
    expect(skeletons).toBeDefined();
    expect(skeletons.unitStrength).toBe(skeletons.strength);
  });
});

describe("combat panel displays unit strength", () => {
  beforeEach(() => {
    saveCharacterAssignments({});
  });

  it("shows 'US:' in the combat panel HTML", () => {
    const army = loadArmy("mc-skeleton-horde");
    const html = renderCombatWeaponsContext(army);
    expect(html).toContain("US:");
  });

  it("Skeleton Warriors unit strength matches their model count", () => {
    const army = loadArmy("mc-skeleton-horde");
    const skeletons = army.units.find((u) =>
      u.id.startsWith("skeleton-warriors"),
    );
    const html = renderCombatWeaponsContext(army);
    expect(html).toContain(`US:${skeletons.unitStrength}`);
  });
});

describe("Close Order restriction: monsters and characters (US < 10)", () => {
  it("MCr monster (US 5) with Close Order does NOT get the bonus", () => {
    const army = {
      units: [
        {
          id: "zombie-dragon.t",
          name: "Zombie Dragon",
          category: "rare",
          strength: 1,
          unitStrength: 5,
          stats: [{ troopType: ["MCr"], Name: "Zombie Dragon" }],
          mount: null,
          specialRules: [
            { id: "close order", displayName: "Close Order", phases: [] },
          ],
          hasStandard: false,
          hasMusician: false,
        },
      ],
    };
    expect(renderCombatResultContext(army)).not.toContain("Close Order");
  });

  it("character (category characters, US 1) with Close Order does NOT get the bonus", () => {
    const army = {
      units: [
        {
          id: "vampire.t",
          name: "Vampire",
          category: "characters",
          strength: 1,
          unitStrength: 1,
          stats: [{ troopType: ["RI", "Ch"], Name: "Vampire" }],
          mount: null,
          specialRules: [
            { id: "close order", displayName: "Close Order", phases: [] },
          ],
          hasStandard: false,
          hasMusician: false,
        },
      ],
    };
    expect(renderCombatResultContext(army)).not.toContain("Close Order");
  });

  it("ridden monster (mount.wBonus > 0, US 6) with Close Order does NOT get the bonus", () => {
    const army = {
      units: [
        {
          id: "char-on-dragon.t",
          name: "Vampire on Zombie Dragon",
          category: "characters",
          strength: 1,
          unitStrength: 6,
          stats: [{ troopType: ["RI", "Ch"], Name: "Vampire" }],
          mount: { wBonus: 3, troopType: "MCr", name: "Zombie Dragon" },
          specialRules: [
            { id: "close order", displayName: "Close Order", phases: [] },
          ],
          hasStandard: false,
          hasMusician: false,
        },
      ],
    };
    expect(renderCombatResultContext(army)).not.toContain("Close Order");
  });

  it("RI infantry (US 20) with Close Order DOES get the bonus", () => {
    const army = {
      units: [
        {
          id: "skeletons.t",
          name: "Skeleton Warriors",
          category: "core",
          strength: 20,
          unitStrength: 20,
          stats: [{ troopType: ["RI"], Name: "Skeleton Warriors" }],
          mount: null,
          specialRules: [
            { id: "close order", displayName: "Close Order", phases: [] },
          ],
          hasStandard: false,
          hasMusician: false,
        },
      ],
    };
    expect(renderCombatResultContext(army)).toContain("Close Order");
  });
});

describe("army list displays unit strength", () => {
  it("unit rows show 'US:' in the rendered HTML", () => {
    const army = loadArmy("mc-skeleton-horde");
    const html = renderArmySummary(army);
    expect(html).toContain("US:");
  });

  it("army header shows total unit strength", () => {
    const army = loadArmy("mc-skeleton-horde");
    const totalUS = army.units.reduce((sum, u) => sum + u.unitStrength, 0);
    const html = renderArmySummary(army);
    expect(html).toContain(`US: ${totalUS}`);
  });

  it("unit points appear on their own line (not the flex row containing the name)", () => {
    const army = loadArmy("mc-skeleton-horde");
    const html = renderArmySummary(army);
    // Points span is the sole child of its own <div>, not inside the flex header
    expect(html).toMatch(/pts<\/span>\s*<\/div>\s*<\/div>/);
  });
});
