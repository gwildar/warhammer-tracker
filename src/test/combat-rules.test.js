import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";
import { renderCombatWeaponsContext } from "../context/combat-weapons.js";
import { saveCharacterAssignments } from "../state.js";

beforeEach(() => {
  saveCharacterAssignments({});
});

describe("Elven Reflexes labelling", () => {
  it("Glade Riders (regular cavalry) show 'Elven Reflexes' without '(rider)' suffix", () => {
    const army = loadArmy("wood-elves");
    const gladeRiders = army.units.find((u) => u.id.startsWith("glade-riders"));
    expect(gladeRiders).toBeDefined();
    // Render just this unit in isolation
    const html = renderCombatWeaponsContext({ units: [gladeRiders] });
    expect(html).toContain("Elven Reflexes");
    // Regular cavalry unit — no (rider) suffix needed
    expect(html).not.toContain("Elven Reflexes (rider)");
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
