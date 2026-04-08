// src/test/unit-stats-resolution.test.js
import { describe, it, expect } from "vitest";
import { resolveUnitEntry } from "../parsers/from-owb.js";

describe("resolveUnitEntry", () => {
  it("returns array unchanged for non-crewed units", () => {
    const entry = [{ Name: "Swordsman", A: "1", rules: ["Close Order"] }];
    expect(resolveUnitEntry(entry)).toBe(entry);
  });

  it("merges shared fields into each profile for crewed units", () => {
    const entry = {
      shared: {
        crewed: true,
        rules: ["Close Order", "Impact Hits (D6+1)"],
        troopType: ["HCh"],
        magic: [],
        optionalRules: ["Mark of Khorne"],
      },
      stats: [
        { Name: "Chariot", A: "-", equipment: [] },
        { Name: "Crew", A: "1", equipment: ["Hand weapons"] },
      ],
    };
    const resolved = resolveUnitEntry(entry);
    expect(resolved).toHaveLength(2);
    expect(resolved[0]).toMatchObject({
      crewed: true,
      rules: ["Close Order", "Impact Hits (D6+1)"],
      troopType: ["HCh"],
      Name: "Chariot",
      equipment: [],
    });
    expect(resolved[1]).toMatchObject({
      crewed: true,
      rules: ["Close Order", "Impact Hits (D6+1)"],
      Name: "Crew",
      equipment: ["Hand weapons"],
    });
  });

  it("per-profile equipment overrides shared (spread order)", () => {
    const entry = {
      shared: {
        crewed: true,
        rules: ["Skirmishers"],
        troopType: ["WM"],
        magic: [],
        optionalRules: [],
      },
      stats: [
        { Name: "Cannon", A: "-", equipment: ["Cannon"] },
        { Name: "Crew", A: "3", equipment: ["hand weapons", "light armour"] },
      ],
    };
    const resolved = resolveUnitEntry(entry);
    expect(resolved[0].equipment).toEqual(["Cannon"]);
    expect(resolved[1].equipment).toEqual(["hand weapons", "light armour"]);
  });
});
