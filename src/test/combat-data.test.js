import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";
import { buildCombatEntries } from "../context/combat-data.js";
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
    const rows = buildCombatEntries(army);
    // Use the same key shape as buildCombatEntries to verify no duplicates survive
    const keys = rows.map((r) => {
      const riderWKey = r.riderWeapons
        .map((w) => w.name)
        .sort()
        .join(",");
      const mountWKey = r.mountWeapons
        .map((w) => w.name)
        .sort()
        .join(",");
      const itemKey = [...r.itemNames, ...r.singleUseItems.map((i) => i.name)]
        .sort()
        .join(",");
      return `${r.unitName}||${r.riderI}||${r.riderA}||${r.t}||${r.w}||${r.as}||${riderWKey}||${mountWKey}||${itemKey}`;
    });
    expect(new Set(keys).size).toBe(keys.length);
  });
});
