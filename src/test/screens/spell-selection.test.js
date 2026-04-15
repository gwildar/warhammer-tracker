import { describe, it, expect, beforeEach } from "vitest";
import { renderSpellSelection } from "../../screens/spell-selection.js";
import { saveSpellSelections } from "../../state.js";
import { loadArmy } from "../helpers.js";
import { getCasters } from "../../army.js";

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

  it("does not show Lore Familiar badge", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).not.toContain("Lore Familiar");
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

  it("does not show Arcane Familiar badge", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).not.toContain("Arcane Familiar");
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

describe("renderSpellSelection — multi-lore with no renderable lores", () => {
  const caster = {
    id: "weird.t",
    name: "Weird Wizard",
    lores: [],
    factionLores: [],
    activeLore: null,
    spellSelectionMode: { canChoose: false, multiLore: true, maxSpells: null },
  };

  it("renders the section with a no-spells message", () => {
    const html = renderSpellSelection({ units: [] }, [caster]);
    expect(html).toContain("Arcane Familiar");
    expect(html).toContain("No spells available.");
  });
});

describe("renderSpellSelection — Lore Familiar with many lore options (Supreme Sorceress)", () => {
  let html;

  beforeEach(() => {
    const army = loadArmy("dark-elves");
    const casters = getCasters(army);
    const sorceress = casters.find((c) => c.name === "Supreme Sorceress");
    html = renderSpellSelection(army, [sorceress]);
  });

  it("shows Lore Familiar badge", () => {
    expect(html).toContain("Lore Familiar");
  });

  it("does not show Arcane Familiar badge", () => {
    expect(html).not.toContain("Arcane Familiar");
  });

  it("shows a lore selector dropdown, not all lores at once", () => {
    expect(html).toContain('class="lore-select');
  });

  it("shows spell checkboxes for the selected lore", () => {
    expect(html).toContain('class="spell-checkbox');
  });
});
