import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";
import {
  buildCombatEntries,
  buildCombatResultEntries,
} from "../context/combat-data.js";
import { saveCharacterAssignments } from "../state.js";

describe("buildCombatEntries", () => {
  let army;
  beforeEach(() => {
    army = loadArmy("dark-elves");
    saveCharacterAssignments({});
  });

  it("returns entries sorted by initiative descending", () => {
    const rows = buildCombatEntries(army);
    expect(rows.length).toBeGreaterThan(0);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].iNum).toBeLessThanOrEqual(rows[i - 1].iNum);
    }
  });

  it("each entry has required shape", () => {
    const rows = buildCombatEntries(army);
    const entry = rows[0];
    expect(entry).toHaveProperty("unitName");
    expect(Array.isArray(entry.riderWeapons)).toBe(true);
    expect(Array.isArray(entry.mountWeapons)).toBe(true);
    expect(Array.isArray(entry.combatRules)).toBe(true);
    expect(entry).toHaveProperty("iNum");
    expect(entry).toHaveProperty("riderI");
    expect(entry).toHaveProperty("riderA");
  });

  it("deduplicates identical units", () => {
    army = loadArmy("bretonnia");
    // Bretonnia fixture has 2 identical Peasant Bowmen units that should be deduplicated
    const rows = buildCombatEntries(army);
    const peasant = rows.find((r) => r.unitName === "Peasant Bowman");
    expect(peasant).toBeDefined();
    expect(peasant.merged).toBe(true);
  });
});

describe("buildCombatResultEntries", () => {
  it("returns entries with static bonus shape", () => {
    const army = loadArmy("bretonnia");
    const rows = buildCombatResultEntries(army);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r).toHaveProperty("name");
      expect(r).toHaveProperty("total");
      expect(r).toHaveProperty("bonuses");
      expect(Array.isArray(r.bonuses)).toBe(true);
    }
  });

  it("excludes units with neither standard nor musician", () => {
    const army = loadArmy("dark-elves");
    const rows = buildCombatResultEntries(army);
    for (const r of rows) {
      const hasAny =
        r.total > 0 || r.bonuses.some((b) => b.includes("Musician"));
      expect(hasAny).toBe(true);
    }
  });
});
