import { describe, it, expect } from "vitest";
import { renderCombatWeaponsContext } from "../context/combat-weapons.js";
import { loadArmy } from "./helpers.js";
import { saveCharacterAssignments } from "../state.js";

describe("banner highlight in combat card", () => {
  it("renders banner name inside a gold-bordered element", () => {
    // bretonnia-charge fixture: Pegasus Knights have Totem of Wrath (type: banner)
    const army = loadArmy("bretonnia-charge");
    const html = renderCombatWeaponsContext(army);
    // Verify banner name appears inside the gold-highlighted row
    expect(html).toMatch(
      /border-l-2 border-wh-accent[^<]*<span[^>]*text-wh-accent-dim[^>]*>Banner<\/span><span[^>]*text-wh-accent[^>]*>Totem of Wrath<\/span>/,
    );
  });

  it("does not include banner name in the plain muted items line", () => {
    const army = loadArmy("bretonnia-charge");
    const html = renderCombatWeaponsContext(army);
    // Plain items line looks like: class="text-xs text-wh-muted ...">Item, Item</div>
    // Banner name must not appear inside that pattern
    expect(html).not.toMatch(/text-wh-muted[^"]*">[^<]*Totem of Wrath/);
  });
});

describe("two banners: unit banner + BSB character banner both show", () => {
  it("shows both Banner of Chalons (unit) and Errantry Banner (BSB) in Pegasus Knights card", () => {
    // forest-goblins fixture:
    //   Pegasus Knights (id: pegasus-knights.ddysojsbrl) has Banner of Châlons on its standard bearer
    //   Paladin (id: paladin.altni) is BSB with Errantry Banner via Battle Standard Bearer command
    const army = loadArmy("forest-goblins");
    saveCharacterAssignments({
      "paladin.altni": "pegasus-knights.ddysojsbrl",
    });
    const html = renderCombatWeaponsContext(army);
    // Both banners must appear as highlighted banner rows in the same rendered output
    expect(html).toContain("Banner of Chalons");
    expect(html).toContain("Errantry Banner");
  });
});
