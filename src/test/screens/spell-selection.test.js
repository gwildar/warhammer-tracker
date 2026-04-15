import { describe, it, expect, beforeEach } from "vitest";
import { renderSpellSelection } from "../../screens/spell-selection.js";
import { saveSpellSelections } from "../../state.js";

beforeEach(() => {
  saveSpellSelections({});
});

describe("renderSpellSelection — Arcane Familiar (multiLore)", () => {
  const caster = {
    id: "wizard.t",
    name: "Battle Wizard",
    lores: ["elementalism", "dark-magic"],
    factionLores: [],
    activeLore: null,
    spellSelectionMode: { canChoose: false, multiLore: true, maxSpells: null },
  };

  it("shows Arcane Familiar badge", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain("Arcane Familiar");
  });

  it("shows spells from all lores", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain("Elementalism");
    expect(html).toContain("Dark Magic");
  });

  it("does not show a lore selector dropdown", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).not.toContain('class="lore-select');
  });

  it("renders spell checkboxes", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain('class="spell-checkbox');
  });
});

describe("renderSpellSelection — Lore Familiar with multiple lores (Ogdruz)", () => {
  const caster = {
    id: "ogdruz.t",
    name: "Ogdruz Swampdigga",
    lores: ["elementalism", "troll-magic"],
    factionLores: [],
    activeLore: null,
    spellSelectionMode: { canChoose: true, multiLore: false, maxSpells: null },
  };

  it("shows Lore Familiar badge", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain("Lore Familiar");
  });

  it("shows spells from all lores without a selector dropdown", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain("Elementalism");
    expect(html).toContain("Lore of Troll Magic");
    expect(html).not.toContain('class="lore-select');
  });

  it("renders spell checkboxes for each lore", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain('class="spell-checkbox');
  });
});

describe("renderSpellSelection — Lore Familiar with single lore", () => {
  const caster = {
    id: "mage.t",
    name: "Battle Mage",
    lores: ["elementalism"],
    factionLores: [],
    activeLore: "elementalism",
    spellSelectionMode: { canChoose: true, multiLore: false, maxSpells: null },
  };

  it("shows Lore Familiar badge", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain("Lore Familiar");
  });

  it("shows all spells as checkboxes (no signature/numbered split)", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).not.toContain("Signature Spells:");
    expect(html).toContain('class="spell-checkbox');
  });
});
