import { describe, it, expect } from "vitest";
import { computeUnitStrength } from "../parsers/resolve.js";
import { loadArmy } from "./helpers.js";

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
