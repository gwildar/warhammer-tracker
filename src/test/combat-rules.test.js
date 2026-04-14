import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";
import { renderCombatWeaponsContext } from "../context/combat-weapons.js";
import { saveCharacterAssignments } from "../state.js";
import { getCasters } from "../army.js";

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

  it("Doomfire Warlocks have hasCursedCoven flag", () => {
    const army = loadArmy("dark-elves");
    const warlocks = army.units.find((u) => u.name === "Doomfire Warlock");
    expect(warlocks.hasCursedCoven).toBe(true);
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
