import { describe, it, expect } from "vitest";
import { computeWard } from "../parsers/resolve.js";

describe("computeWard", () => {
  it("returns null when no ward sources", () => {
    expect(computeWard([], [])).toBeNull();
  });

  it("returns ward from magic item", () => {
    const magicItems = [{ ward: "5+" }];
    expect(computeWard(magicItems, [])).toBe("5+");
  });

  it("magic item ward takes precedence over special rules", () => {
    const magicItems = [{ ward: "5+" }];
    const specialRules = [
      { id: "blessings of the lady", displayName: "Blessings of the Lady" },
    ];
    expect(computeWard(magicItems, specialRules)).toBe("5+");
  });

  it("returns 6+ for Blessings of the Lady special rule", () => {
    const specialRules = [
      { id: "blessings of the lady", displayName: "Blessings of the Lady" },
    ];
    expect(computeWard([], specialRules)).toBe("6+");
  });

  it("returns 6+ for The Grail Vow special rule", () => {
    const specialRules = [
      { id: "the grail vow", displayName: "The Grail Vow" },
    ];
    expect(computeWard([], specialRules)).toBe("6+");
  });

  it("ignores unrelated special rules", () => {
    const specialRules = [{ id: "hatred", displayName: "Hatred (Undead)" }];
    expect(computeWard([], specialRules)).toBeNull();
  });
});
