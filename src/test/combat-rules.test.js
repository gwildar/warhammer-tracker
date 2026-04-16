import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";
import { renderCombatWeaponsContext } from "../context/combat-weapons.js";
import { saveCharacterAssignments } from "../state.js";
import { getCasters } from "../army.js";
import { fromOwb } from "../parsers/from-owb.js";

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
