import { describe, it, expect } from "vitest";
import { renderCombatWeaponsContext } from "../context/combat-weapons.js";
import { loadArmy } from "./helpers.js";

describe("banner highlight in combat card", () => {
  it("renders banner name inside a gold-bordered element", () => {
    // bretonnia-charge fixture: Pegasus Knights have Totem of Wrath (type: banner)
    const army = loadArmy("bretonnia-charge");
    const html = renderCombatWeaponsContext(army);
    expect(html).toContain("border-wh-accent");
    expect(html).toContain("Totem of Wrath");
    expect(html).toContain("text-wh-accent-dim");
  });

  it("does not include banner name in the plain muted items line", () => {
    const army = loadArmy("bretonnia-charge");
    const html = renderCombatWeaponsContext(army);
    // Plain items line looks like: class="text-xs text-wh-muted ...">Item, Item</div>
    // Banner name must not appear inside that pattern
    expect(html).not.toMatch(/text-wh-muted[^"]*">[^<]*Totem of Wrath/);
  });
});
