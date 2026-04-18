import { describe, it, expect } from "vitest";
import { RANGED_WEAPONS, COMBAT_WEAPONS } from "../data/weapons.js";

describe("weapon rules are arrays", () => {
  it("RANGED_WEAPONS longbow rules is an array", () => {
    expect(Array.isArray(RANGED_WEAPONS.longbow.rules)).toBe(true);
  });

  it("RANGED_WEAPONS longbow rules contains individual rule names", () => {
    expect(RANGED_WEAPONS.longbow.rules).toEqual([
      "Armour Bane (1)",
      "Volley Fire",
    ]);
  });

  it("COMBAT_WEAPONS great weapon rules is an array", () => {
    expect(Array.isArray(COMBAT_WEAPONS["great weapon"].rules)).toBe(true);
  });

  it("COMBAT_WEAPONS hand weapon rules is an empty array", () => {
    expect(COMBAT_WEAPONS["hand weapon"].rules).toEqual([]);
  });

  it("every RANGED_WEAPONS entry has rules as an array", () => {
    for (const [key, weapon] of Object.entries(RANGED_WEAPONS)) {
      expect(Array.isArray(weapon.rules), `${key}.rules should be array`).toBe(
        true,
      );
    }
  });

  it("every COMBAT_WEAPONS entry has rules as an array", () => {
    for (const [key, weapon] of Object.entries(COMBAT_WEAPONS)) {
      expect(Array.isArray(weapon.rules), `${key}.rules should be array`).toBe(
        true,
      );
    }
  });
});
