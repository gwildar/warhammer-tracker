import { describe, it, expect } from "vitest";
import { deriveSpellSelectionMode } from "../parsers/resolve.js";

describe("deriveSpellSelectionMode", () => {
  it("returns defaults when no relevant items or rules", () => {
    expect(deriveSpellSelectionMode([], [])).toEqual({
      canChoose: false,
      multiLore: false,
      maxSpells: null,
    });
  });

  it("sets canChoose for Lore Familiar", () => {
    const result = deriveSpellSelectionMode(
      [{ name: "Lore Familiar", type: "arcane-item" }],
      [],
    );
    expect(result).toEqual({
      canChoose: true,
      multiLore: false,
      maxSpells: null,
    });
  });

  it("sets multiLore for Arcane Familiar", () => {
    const result = deriveSpellSelectionMode(
      [{ name: "Arcane Familiar", type: "arcane-item" }],
      [],
    );
    expect(result).toEqual({
      canChoose: false,
      multiLore: true,
      maxSpells: null,
    });
  });

  it("sets maxSpells to 1 for Cursed Coven", () => {
    const result = deriveSpellSelectionMode(
      [],
      [{ id: "cursed coven", displayName: "Cursed Coven" }],
    );
    expect(result).toEqual({
      canChoose: false,
      multiLore: false,
      maxSpells: 1,
    });
  });

  it("combines flags when multiple items are present", () => {
    const result = deriveSpellSelectionMode(
      [
        { name: "Lore Familiar", type: "arcane-item" },
        { name: "Arcane Familiar", type: "arcane-item" },
      ],
      [],
    );
    expect(result.canChoose).toBe(true);
    expect(result.multiLore).toBe(true);
    expect(result.maxSpells).toBeNull();
  });

  it("is case-insensitive for item names", () => {
    const result = deriveSpellSelectionMode(
      [{ name: "arcane familiar", type: "arcane-item" }],
      [],
    );
    expect(result.multiLore).toBe(true);
  });
});
