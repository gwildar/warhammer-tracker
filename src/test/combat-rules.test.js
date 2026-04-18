import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";
import {
  renderCombatWeaponsContext,
  renderCombatLeadershipContext,
} from "../context/combat-weapons.js";
import { saveCharacterAssignments } from "../state.js";
import { getCasters } from "../army.js";
import { fromOwb } from "../parsers/from-owb.js";
import chaosJson from "./fixtures/chaos.own.json";

beforeEach(() => {
  saveCharacterAssignments({});
});

describe("Cursed Coven — Doomfire Warlocks as casters", () => {
  it("Doomfire Warlocks are detected as casters", () => {
    const army = loadArmy("dark-elves");
    const warlocks = army.units.find((u) => u.name === "Doomfire Warlock");
    expect(warlocks).toBeDefined();
    expect(warlocks.isCaster).toBe(true);
  });

  it("Doomfire Warlocks have dark-magic and daemonology lores", () => {
    const army = loadArmy("dark-elves");
    const warlocks = army.units.find((u) => u.name === "Doomfire Warlock");
    expect(warlocks.lores).toContain("dark-magic");
    expect(warlocks.lores).toContain("daemonology");
  });

  it("Doomfire Warlocks appear in getCasters", () => {
    const army = loadArmy("dark-elves");
    const casters = getCasters(army);
    const warlocks = casters.find((u) => u.name === "Doomfire Warlock");
    expect(warlocks).toBeDefined();
  });

  it("Doomfire Warlocks have maxSpells 1 in spellSelectionMode", () => {
    const army = loadArmy("dark-elves");
    const warlocks = army.units.find((u) => u.name === "Doomfire Warlock");
    expect(warlocks.spellSelectionMode.maxSpells).toBe(1);
  });
});

describe("Elven Reflexes labelling", () => {
  it("Glade Riders (regular cavalry) show 'Elven Reflexes (rider)' — applies to rider not mount", () => {
    const army = loadArmy("wood-elves");
    const gladeRiders = army.units.find((u) => u.id.startsWith("glade-riders"));
    expect(gladeRiders).toBeDefined();
    const html = renderCombatWeaponsContext({ units: [gladeRiders] });
    expect(html).toContain("Elven Reflexes (rider)");
  });

  it("Spellsinger on Warhawk (character on cavalry mount) shows 'Elven Reflexes (rider)'", () => {
    const spellsingerArmy = {
      units: [
        {
          id: "spellsinger.t",
          name: "Spellsinger",
          category: "heroes",
          strength: 1,
          unitStrength: 3,
          points: 120,
          stats: [{ troopType: ["RI", "Ch"], Name: "Spellsinger" }],
          mount: { name: "Warhawk", troopType: "MCa", wBonus: 0 },
          specialRules: [
            { id: "elven-reflexes", displayName: "Elven Reflexes", phases: [] },
          ],
          weapons: [],
          magicItems: [],
          detachments: [],
          hasStandard: false,
          hasMusician: false,
        },
      ],
    };
    const html = renderCombatWeaponsContext(spellsingerArmy);
    expect(html).toContain("Elven Reflexes (rider)");
  });
});

describe("removesRules — magic item rule suppression", () => {
  it("Da Thinkin' Orc's 'At removes Impetuous from the unit's special rules", () => {
    const army = fromOwb({
      core: [
        {
          id: "orc-mob.test",
          name_en: "Orc Mob",
          points: 5,
          strength: 10,
          lores: [],
          specialRules: { name_en: "Close Order, Impetuous" },
          equipment: [],
          armor: [],
          options: [],
          mounts: [],
          items: [
            {
              selected: [
                {
                  name_en: "Da Thinkin' Orc's 'At",
                  type: "enchanted-item",
                  points: 25,
                },
              ],
            },
          ],
          command: [],
        },
      ],
    });

    const orcMob = army.units[0];
    expect(orcMob.specialRules.some((r) => r.id === "impetuous")).toBe(false);
  });

  it("removesRules does not affect other rules on the unit", () => {
    const army = fromOwb({
      core: [
        {
          id: "orc-mob.test",
          name_en: "Orc Mob",
          points: 5,
          strength: 10,
          lores: [],
          specialRules: { name_en: "Close Order, Impetuous" },
          equipment: [],
          armor: [],
          options: [],
          mounts: [],
          items: [
            {
              selected: [
                {
                  name_en: "Da Thinkin' Orc's 'At",
                  type: "enchanted-item",
                  points: 25,
                },
              ],
            },
          ],
          command: [],
        },
      ],
    });

    const orcMob = army.units[0];
    expect(orcMob.specialRules.some((r) => r.id === "close order")).toBe(true);
  });

  it("unit without the item retains Impetuous", () => {
    const army = fromOwb({
      core: [
        {
          id: "orc-mob.test",
          name_en: "Orc Mob",
          points: 5,
          strength: 10,
          lores: [],
          specialRules: { name_en: "Close Order, Impetuous" },
          equipment: [],
          armor: [],
          options: [],
          mounts: [],
          items: [],
          command: [],
        },
      ],
    });

    const orcMob = army.units[0];
    expect(orcMob.specialRules.some((r) => r.id === "impetuous")).toBe(true);
  });
});

describe("Troll Vomit — weapon resolution", () => {
  let troll;

  beforeEach(() => {
    const army = loadArmy("trolls");
    troll = army.units.find((u) => u.name === "Stone Troll");
  });

  it("Stone Troll has both Hand Weapon and Troll Vomit", () => {
    expect(troll.weapons.some((w) => w.name === "Hand Weapon")).toBe(true);
    expect(troll.weapons.some((w) => w.name === "Troll Vomit")).toBe(true);
  });

  it("Troll Vomit has correct stats (S3, AP-2)", () => {
    const vomit = troll.weapons.find((w) => w.name === "Troll Vomit");
    expect(vomit.s).toBe("3");
    expect(vomit.ap).toBe("-2");
  });
});

describe("Additional Hand Weapon — attack bonus display", () => {
  it("shows +1 attacks on the weapon line for an Orc Boy with Additional Hand Weapon", () => {
    const army = fromOwb({
      core: [
        {
          id: "orc-mob.test",
          name_en: "Orc Mob",
          points: 5,
          strength: 10,
          lores: [],
          specialRules: { name_en: "Close Order" },
          equipment: [{ active: true, name_en: "Additional Hand Weapon" }],
          armor: [],
          options: [],
          mounts: [],
          items: [],
          command: [],
        },
      ],
    });
    const html = renderCombatWeaponsContext(army);
    expect(html).toContain("A1+1");
  });
});

describe("perModel items in slots — points scale with unit size", () => {
  it("7-model Marauder Horsemen with Unnatural Fortitude (2pts/model) total 124pts", () => {
    const army = fromOwb(chaosJson);
    const unit = army.units.find(
      (u) => u.id === "marauder-horsemen.hfahidnnqet",
    );
    expect(unit.points).toBe(124);
  });

  it("6-model Marauder Horsemen with Unnatural Fortitude (2pts/model) total 108pts", () => {
    const army = fromOwb(chaosJson);
    const unit = army.units.find((u) => u.id === "marauder-horsemen.ygvvm");
    expect(unit.points).toBe(108);
  });
});

describe("renderCombatLeadershipContext — character assignment grouping", () => {
  it("character assigned to unit shows no separate Ld row for the character", () => {
    const army = loadArmy("bretonnian-exiles");
    const baron = army.units.find((u) => u.name === "Baron");
    const knights = army.units.find((u) => u.name === "Knight of the Realm");
    expect(baron).toBeDefined();
    expect(knights).toBeDefined();
    saveCharacterAssignments({ [baron.id]: knights.id });
    const html = renderCombatLeadershipContext(army);
    // Baron must not appear as its own unit row (text-wh-text span contains the unit name)
    expect(html).not.toContain('<span class="text-wh-text">Baron</span>');
  });

  it("unit shows Baron's Ld 9 (higher than Knights Ld 8) when assigned", () => {
    const army = loadArmy("bretonnian-exiles");
    const baron = army.units.find((u) => u.name === "Baron");
    const knights = army.units.find((u) => u.name === "Knight of the Realm");
    saveCharacterAssignments({ [baron.id]: knights.id });
    const html = renderCombatLeadershipContext(army);
    expect(html).toContain("Knight of the Realm");
    expect(html).toContain("Ld9");
  });

  it("unassigned character shows as its own row", () => {
    const army = loadArmy("bretonnian-exiles");
    saveCharacterAssignments({});
    const html = renderCombatLeadershipContext(army);
    expect(html).toContain("Baron");
    expect(html).toContain("Ld9");
  });
});

describe("combat screen deduplication — units with different magic items are not merged", () => {
  it("both Exalted Champions appear separately when they have different magic items", () => {
    const army = fromOwb(chaosJson);
    const html = renderCombatWeaponsContext(army);
    // Champion uzqecv has Talisman of the Carrion Crow; Champion lcqequnzw has Crown of Everlasting Conquest
    // Both must appear — if they were merged only one would be shown
    expect(html).toContain("Talisman of the Carrion Crow");
    expect(html).toContain("Crown of Everlasting Conquest");
  });
});
