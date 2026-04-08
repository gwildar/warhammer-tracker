// src/test/unit-stats-resolution.test.js
import { describe, it, expect } from "vitest";
import { resolveUnitEntry } from "../parsers/from-owb.js";
import { findMount } from "../parsers/resolve.js";

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

describe("findMount", () => {
  it("returns null for null or missing name", () => {
    expect(findMount(null)).toBeNull();
    expect(findMount("")).toBeNull();
    expect(findMount("unknown beast that does not exist")).toBeNull();
  });

  it("returns object passthrough when given an object", () => {
    const obj = { name: "existing", m: 5 };
    expect(findMount(obj)).toBe(obj);
  });

  it("resolves a clean slug — Black Dragon tBonus/wBonus/stomp/swiftstride", () => {
    const mount = findMount("Black Dragon");
    expect(mount).not.toBeNull();
    expect(mount.name).toBe("Black Dragon");
    expect(mount.m).toBe(6);
    expect(mount.tBonus).toBe(3);
    expect(mount.wBonus).toBe(6);
    expect(mount.stomp).toBe("D6");
    expect(mount.swiftstride).toBe(true);
    expect(mount.troopType).toBe("Be");
    expect(mount.armourBane).toBeNull();
    expect(mount.f).toBe(10);
  });

  it("returns breath weapon from equipment — Black Dragon", () => {
    const mount = findMount("Black Dragon");
    expect(mount.breath).toBe("noxious breath");
  });

  it("extracts armourBane from rules — Cold One", () => {
    const mount = findMount("Cold One");
    expect(mount).not.toBeNull();
    expect(mount.m).toBe(7);
    expect(mount.tBonus).toBe(1);
    expect(mount.armourBane).toBe(1);
    expect(mount.swiftstride).toBe(true);
  });

  it("uses MOUNT_KEY_OVERRIDES for faction-variant mounts — Griffon", () => {
    const mount = findMount("Griffon");
    expect(mount).not.toBeNull();
    expect(mount.name).toBe("Griffon");
    expect(mount.m).toBe(6);
    expect(mount.tBonus).toBe(1);
    expect(mount.swiftstride).toBe(true);
    expect(mount.troopType).toBe("MCr");
  });

  it("resolves Rhinox standalone entry", () => {
    const mount = findMount("Rhinox");
    expect(mount).not.toBeNull();
    expect(mount.m).toBe(6);
    expect(mount.tBonus).toBe(0);
    expect(mount.swiftstride).toBe(false);
    expect(mount.armourBane).toBe(2);
  });
});
