import { describe, it, expect, beforeEach } from "vitest";
import { renderGameScreen } from "../../screens/game.js";
import { loadArmy, startGame, getApp } from "../helpers.js";
import {
  savePhaseIndex,
  saveArmy,
  saveCharacterAssignments,
} from "../../state.js";

describe("Game Screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
    startGame(army);
  });

  it("shows round counter", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Round 1");
  });

  it("shows army name", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain(army.name);
  });

  it("shows first sub-phase heading", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Start of Turn");
  });

  it("shows phase name", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Strategy Phase");
  });

  it("shows step counter", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Step 1 of");
  });

  it("shows Previous and Next buttons", () => {
    renderGameScreen(army);
    expect(getApp().querySelector("#prev-btn")).toBeTruthy();
    expect(getApp().querySelector("#next-btn")).toBeTruthy();
  });

  it("disables Previous on first step", () => {
    renderGameScreen(army);
    expect(getApp().querySelector("#prev-btn").hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("shows New Game button", () => {
    renderGameScreen(army);
    expect(getApp().querySelector("#new-game-btn")).toBeTruthy();
  });

  it("New Game button navigates to setupScreen", async () => {
    const { registerScreen } = await import("../../navigate.js");
    let navigated = null;
    registerScreen("setupScreen", () => {
      navigated = "setupScreen";
    });
    registerScreen("render", () => {
      navigated = "render";
    });

    renderGameScreen(army);
    const origConfirm = window.confirm;
    window.confirm = () => true;
    document.getElementById("new-game-btn").click();
    window.confirm = origConfirm;

    expect(navigated).toBe("setupScreen");
  });

  it("shows Manage Army button", () => {
    renderGameScreen(army);
    expect(getApp().querySelector("#manage-army-btn")).toBeTruthy();
  });

  describe("shooting phase", () => {
    it("shows shooting units for armies with ranged weapons", () => {
      // Navigate to Choose Target sub-phase (shooting)
      savePhaseIndex(8); // shoot
      renderGameScreen(army);
      expect(getApp().textContent).toContain("Shooting");
    });

    it("shows Repeater Crossbow without also matching Crossbow", () => {
      savePhaseIndex(8);
      renderGameScreen(army);
      const panel = getApp().querySelector(".border-wh-phase-shooting\\/30");
      expect(panel.textContent).toContain("Repeater Crossbow");
      // Weapon name spans must not include a standalone "Crossbow" entry —
      // "repeater crossbows" in equipment must not also match the "crossbow" key.
      const weaponNameSpans = [
        ...panel.querySelectorAll(".text-wh-muted.text-sm"),
      ];
      const weaponNames = weaponNameSpans.map((el) => el.textContent.trim());
      expect(weaponNames).not.toContain("Crossbow");
    });
  });

  describe("combat phase", () => {
    it("shows combat phase heading", () => {
      savePhaseIndex(10); // choose-fight
      renderGameScreen(army);
      expect(getApp().textContent).toContain("Combat");
    });

    it("shows unit points on combat card", () => {
      savePhaseIndex(10); // choose-fight
      renderGameScreen(army);
      expect(getApp().textContent).toMatch(/\d+pts/);
    });

    it("shows Close Order in Special Rules on combat-result step", () => {
      savePhaseIndex(11); // combat-result
      renderGameScreen(army);
      const specialRulesPanel = getApp().querySelector(
        ".border-wh-accent\\/20",
      );
      expect(specialRulesPanel).toBeTruthy();
      expect(specialRulesPanel.textContent).toContain("Close Order");
    });
  });

  describe("last step", () => {
    it("shows End Turn on last step", () => {
      savePhaseIndex(14); // last step (Scoring)
      renderGameScreen(army);
      expect(getApp().querySelector("#next-btn").textContent).toContain(
        "End Turn",
      );
    });
  });
});

describe("Game Screen with Lizardmen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("lizardmen");
    startGame(army);
  });

  it("renders without errors", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Round 1");
    expect(getApp().textContent).toContain(army.name);
  });
});

describe("Shooting phase with Lizardmen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("lizardmen");
    startGame(army);
    savePhaseIndex(8); // shoot
  });

  it("shows Solar Engine in shooting units", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Solar Engine");
    expect(text).toContain("Bound Spell");
  });

  it("shows Engine of the Gods in shooting units", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Engine of the Gods");
  });

  it("shows Javelin alongside Engine for same unit", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Javelin");
  });
});

describe("Game Screen with Bretonnia", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnia");
    startGame(army);
  });

  it("renders without errors", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Round 1");
    expect(getApp().textContent).toContain(army.name);
  });
});

describe("Shooting phase with Bretonnia charge army", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnia-charge");
    startGame(army);
    savePhaseIndex(8); // shoot
  });

  it("shows merged squires with BS from rules-index", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Squire");
    expect(text).toContain("BS3");
    expect(text).toContain("Longbow");
  });

  it("does not show unit count for merged units", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    // 3 squire units merged — should not show x10 or x30
    expect(text).not.toMatch(/Squire\s*x\d/);
  });
});

describe("Combat phase with Bretonnia charge army", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnia-charge");
    startGame(army);
    savePhaseIndex(10); // choose-fight
  });

  it("shows combat units with stats ordered by initiative", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Combat Units");
    expect(text).toContain("I5");
    expect(text).toContain("T:4");
  });

  it("shows ridden monster with combined wounds and mount name", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    // Baron on Hippogryph: W3 + (+3) = W6, T4 + (+1) = T5
    expect(text).toContain("(Hippogryph)");
    expect(text).toContain("W:6");
    expect(text).toContain("T:5");
  });

  it("shows attacks next to weapon line", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("A4");
    expect(text).toContain("Lance");
  });

  it("calculates armour save for Baron with heavy armour + shield + barding", () => {
    renderGameScreen(army);
    // Baron: heavy armour (5+) + shield (-1) + barding (-1) = 3+
    const text = getApp().textContent;
    expect(text).toContain("AS:3+");
  });

  it("does not show unit count for merged Knights Errant", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).not.toMatch(/Knights Errant\s*x\d/);
  });

  it("shows lance weapon under combat units", () => {
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Lance");
  });

  it("shows The Grail Vow and Magical on ridden monster character card", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const baronCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Baron Guy de Bastille"),
    );
    expect(baronCard).toBeTruthy();
    expect(baronCard.textContent).toContain("The Grail Vow");
    expect(baronCard.textContent).toContain("Magical");
  });

  it("shows The Grail Vow from special rules in footer", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const dukeCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Duke Gerard"),
    );
    expect(dukeCard).toBeTruthy();
    expect(dukeCard.textContent).toContain("The Grail Vow");
  });
});

describe("Combat phase with Dark Elves", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
    startGame(army);
    savePhaseIndex(10); // choose-fight
  });

  it("shows champion magic weapon replacing mundane weapon", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Cold One Knight"),
    );
    expect(knightsCard).toBeTruthy();
    expect(knightsCard.textContent).toContain("Spelleater Axe");
    expect(knightsCard.textContent).toContain("Dread Knight");
  });

  it("shows MR from champion magic items on unit card", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Cold One Knight"),
    );
    expect(knightsCard).toBeTruthy();
    expect(knightsCard.textContent).toContain("MR:-2");
  });

  it("only shows Magical on champion weapon line, not rank-and-file", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Cold One Knight"),
    );
    expect(knightsCard).toBeTruthy();
    const weaponLines = [...knightsCard.querySelectorAll(".text-xs")];
    const champLine = weaponLines.find((el) =>
      el.textContent.includes("Spelleater Axe"),
    );
    const lanceLine = weaponLines.find((el) =>
      el.textContent.includes("Lance"),
    );
    expect(champLine.textContent).toContain("Magical");
    expect(lanceLine.textContent).not.toContain("Magical");
  });

  it("stacks Armoured Hide with armour for Cold One Knights", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Cold One Knight"),
    );
    expect(knightsCard).toBeTruthy();
    // Full plate (4+) + Armoured Hide 1 (-1) + shield (-1) = 2+
    expect(knightsCard.textContent).toContain("AS:2+");
  });

  it("includes magic shield in armour save calculation", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const dreadlordCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Dark Elf Dreadlord"),
    );
    expect(dreadlordCard).toBeTruthy();
    // Full plate (4+) + Shield of Ghrond (-1) = 3+
    expect(dreadlordCard.textContent).toContain("AS:3+");
  });

  it("does not show Magical Attacks for shooting-only weapons like Sword of Sorrow", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const masterCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Dark Elf Master"),
    );
    expect(masterCard).toBeTruthy();
    expect(masterCard.textContent).not.toContain("Magical");
  });

  it("shows mount armour save (AS:4+) for Supreme Sorceress on Black Dragon", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const sorceressCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Supreme Sorceress"),
    );
    expect(sorceressCard).toBeTruthy();
    // Sorceress has no armour — should inherit Black Dragon's natural AS:4+
    expect(sorceressCard.textContent).toContain("AS:4+");
  });
});

describe("Combat phase with Bretonnian Exiles", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnian-exiles");
    startGame(army);
    savePhaseIndex(10); // choose-fight
  });

  it("shows Frontier Axe on Baron combat card", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const baronCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Baron"),
    );
    expect(baronCard).toBeTruthy();
    expect(baronCard.textContent).toContain("Frontier Axe");
  });

  it("shows +D3 attacks from Virtue of Knightly Temper on Baron combat card", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const baronCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Baron"),
    );
    expect(baronCard).toBeTruthy();
    expect(baronCard.textContent).toContain("+D3");
  });

  it("shows both Dolorous Blade profiles on Green Knight combat card", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Green Knight"),
    );
    expect(knightCard).toBeTruthy();
    expect(knightCard.textContent).toContain("Rapid Strikes");
    expect(knightCard.textContent).toContain("Deadly Blows");
  });

  it("shows MR on Outcast Wizard combat card", () => {
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const wizardCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Outcast Wizard"),
    );
    expect(wizardCard).toBeTruthy();
    expect(wizardCard.textContent).toContain("MR:");
  });
});

describe("Vampire Counts army", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("vampire-counts");
    startGame(army);
  });

  it("shows Blood Knights with embedded Nightmare mount attacks", () => {
    savePhaseIndex(10); // choose-fight
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Nightmare");
    expect(text).toContain("Blood Knight");
  });

  it("shows Wailing Dirge in shooting phase", () => {
    savePhaseIndex(8); // shoot
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Wailing Dirge");
    expect(text).toContain('8"');
  });
});

describe("Ogre Kingdoms army", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("ogre-kingdoms");
    startGame(army);
  });

  it("renders without errors", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Round 1");
    expect(getApp().textContent).toContain(army.name);
  });

  it("shows Ironguts with AS:5+ from innate heavy armour", () => {
    savePhaseIndex(10); // choose-fight
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const irongutCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Irongut"),
    );
    expect(irongutCard).toBeTruthy();
    expect(irongutCard.textContent).toContain("AS:5+");
  });

  it("shows Thundertusk Riders with AS:5+ from frozen pelt", () => {
    savePhaseIndex(10);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const ttCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find((el) =>
      el.textContent.includes("Thundertusk"),
    );
    expect(ttCard).toBeTruthy();
    expect(ttCard.textContent).toContain("AS:5+");
  });

  it("shows Cackling Blade extra attacks on Tyrant card", () => {
    savePhaseIndex(10);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const tyrantCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Tyrant"),
    );
    expect(tyrantCard).toBeTruthy();
    expect(tyrantCard.textContent).toContain("A5+D6");
    expect(tyrantCard.textContent).toContain("Cackling Blade");
  });

  it("shows Cannibal Totem in combat phase magic items", () => {
    savePhaseIndex(10); // choose-fight
    renderGameScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Cannibal Totem");
    expect(text).toContain("Regeneration");
  });

  it("shows Regen on Ironguts from Cannibal Totem", () => {
    savePhaseIndex(10);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const irongutCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes("Irongut"),
    );
    expect(irongutCard).toBeTruthy();
    expect(irongutCard.textContent).toContain("Regen:5+");
  });

  it("shows Ironblaster Rhinox with Monstrous Tusks exactly once", () => {
    savePhaseIndex(10);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const ironblasterCard = [
      ...combatPanel.querySelectorAll(".bg-wh-card"),
    ].find((el) => el.textContent.includes("Ironblaster"));
    expect(ironblasterCard).toBeTruthy();
    const matches = ironblasterCard.textContent.match(/Monstrous Tusks/g);
    expect(matches).toHaveLength(1);
  });

  it("shows Thundertusk Great Tusks exactly once", () => {
    savePhaseIndex(10);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const ttCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find((el) =>
      el.textContent.includes("Thundertusk"),
    );
    expect(ttCard).toBeTruthy();
    const matches = ttCard.textContent.match(/Great Tusks/g);
    expect(matches).toHaveLength(1);
  });

  it("shows Stonehorn Horns of Stone exactly once", () => {
    savePhaseIndex(10);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const shCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find((el) =>
      el.textContent.includes("Stonehorn"),
    );
    expect(shCard).toBeTruthy();
    const matches = shCard.textContent.match(/Horns of Stone/g);
    expect(matches).toHaveLength(1);
  });

  it("shows Ironblaster Leadbelcher crew with Hand Weapon", () => {
    savePhaseIndex(10);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const ironblasterCard = [
      ...combatPanel.querySelectorAll(".bg-wh-card"),
    ].find((el) => el.textContent.includes("Ironblaster"));
    expect(ironblasterCard).toBeTruthy();
    expect(ironblasterCard.textContent).toContain("Hand Weapon");
    expect(ironblasterCard.textContent).toContain("Leadbelcher");
  });

  it("shows crew Ld for Ironblaster on break test", () => {
    savePhaseIndex(12); // break-test
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const ironblasterCard = [
      ...combatPanel.querySelectorAll(".bg-wh-card"),
    ].find((el) => el.textContent.includes("Ironblaster"));
    expect(ironblasterCard).toBeTruthy();
    expect(ironblasterCard.textContent).toContain("Ld7");
  });
});

describe("Scoring UI", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
    startGame(army);
  });

  it("shows scoring section", () => {
    savePhaseIndex(14); // Scoring
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Strategic Objectives");
    expect(getApp().querySelector("#score-you")).toBeTruthy();
    expect(getApp().querySelector("#score-opponent")).toBeTruthy();
  });

  it("shows total scores", () => {
    savePhaseIndex(14); // Scoring
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Total");
  });

  it("hides magic items in scoring sub-phase", () => {
    savePhaseIndex(14); // Scoring
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Strategic Objectives");
    // Should NOT contain any magic items (e.g. Spelleater Axe)
    expect(getApp().textContent).not.toContain("Spelleater Axe");
  });
});

describe("Movement phase", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
    startGame(army);
  });

  it("shows movement stats table with march values on remaining-moves", () => {
    savePhaseIndex(7); // remaining-moves
    renderGameScreen(army);
    const panel = getApp().querySelector(".border-wh-phase-movement\\/30");
    expect(panel).toBeTruthy();
    expect(panel.textContent).toContain("Movement");
    expect(panel.textContent).toContain("March");
  });

  it("does not show random movers panel when army has no random movers", () => {
    savePhaseIndex(6); // compulsory-moves
    renderGameScreen(army);
    expect(getApp().textContent).not.toContain("Random Movers");
  });
});

describe("Shooting phase with Bretonnian Exiles (war machines)", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnian-exiles");
    startGame(army);
    savePhaseIndex(8); // shoot
  });

  it("shows Bombard in shooting units", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Bombard");
  });

  it("shows Grapeshot alt profile alongside Bombard", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Grapeshot");
  });

  it("shows Bombard misfire table", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Bombard Misfire Table");
  });
});

describe("Shooting phase with exiles-correct (war machines without weapon in equipment)", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("exiles-correct");
    startGame(army);
    savePhaseIndex(8); // shoot
  });

  it("shows Bombard in shooting units", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Bombard");
  });

  it("shows Grapeshot alt profile alongside Bombard", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Grapeshot");
  });

  it("shows Bombard misfire table", () => {
    renderGameScreen(army);
    expect(getApp().textContent).toContain("Bombard Misfire Table");
  });
});

describe("Movement phase with Bretonnia charge army", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnia-charge");
    startGame(army);
    savePhaseIndex(4); // declare-charges
    renderGameScreen(army);
  });

  it("shows fly charge distance for Baron on Hippogryph", () => {
    // Hippogryph: f=9, swiftstride (+3) → fly charge = 9 + 6 + 3 = 18"
    expect(getApp().textContent).toContain("Fly");
    expect(getApp().textContent).toContain('18"');
  });
});

describe("Banner of Har Ganeth AP modifier", () => {
  it("banner apMod field exists on Banner of Har Ganeth", async () => {
    const { MAGIC_ITEMS } = await import("../../data/magic-items.js");
    const banner = MAGIC_ITEMS.find((i) => i.name === "Banner of Har Ganeth");
    expect(banner).toBeTruthy();
    expect(banner.apMod).toBe(-1);
  });
});

describe("Combat screen with assigned characters", () => {
  function buildMinimalArmy() {
    return {
      name: "Test",
      armySlug: "test",
      faction: "Test",
      points: 100,
      composition: null,
      units: [
        {
          id: "char.001",
          name: "Lord Alaric",
          category: "characters",
          strength: 1,
          points: 200,
          stats: [
            {
              M: "4",
              WS: "6",
              BS: "3",
              S: "4",
              T: "3",
              W: "3",
              I: "5",
              A: "3",
              Ld: "9",
              Name: "Lord Alaric",
            },
          ],
          weapons: [
            {
              name: "Hand Weapon",
              s: "S",
              ap: "—",
              rules: "",
              magical: false,
              attacks: null,
              reservedAttacks: null,
            },
          ],
          shootingWeapons: [],
          magicItems: [
            {
              name: "Banner of Har Ganeth",
              type: "banner",
              points: 25,
              effect: "",
              phases: ["combat"],
              apMod: -1,
            },
          ],
          specialRules: [],
          mount: null,
          armourSave: null,
          ward: null,
          regen: null,
          magicResistance: "-1",
          poisonedAttacks: false,
          stomp: null,
          impactHits: null,
          isGeneral: false,
          isBSB: false,
          hasStandard: false,
          hasMusician: false,
          isCaster: false,
          lores: [],
          activeLore: null,
          factionLores: [],
          champions: [],
          crew: [],
        },
        {
          id: "knights.002",
          name: "Knights Errant",
          category: "core",
          strength: 5,
          points: 150,
          stats: [
            {
              M: "8",
              WS: "3",
              BS: "3",
              S: "3",
              T: "3",
              W: "1",
              I: "3",
              A: "1",
              Ld: "7",
              Name: "Knight Errant",
            },
          ],
          weapons: [
            {
              name: "Lance",
              s: "S+2",
              ap: "-2",
              rules: "Armour Bane (1). Charge turn only.",
              magical: false,
              attacks: null,
              reservedAttacks: null,
            },
          ],
          shootingWeapons: [],
          magicItems: [],
          specialRules: [],
          mount: null,
          armourSave: "2+",
          ward: null,
          regen: null,
          magicResistance: null,
          poisonedAttacks: false,
          stomp: null,
          impactHits: null,
          isGeneral: false,
          isBSB: false,
          hasStandard: false,
          hasMusician: false,
          isCaster: false,
          lores: [],
          activeLore: null,
          factionLores: [],
          champions: [],
          crew: [],
        },
      ],
    };
  }

  beforeEach(() => {
    const army = buildMinimalArmy();
    saveArmy(army);
    saveCharacterAssignments({ "char.001": "knights.002" });
    startGame(army);
    savePhaseIndex(10); // choose-fight (combat phase)
  });

  it("assigned character does not appear as a standalone combat card", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const cards = [...combatPanel.querySelectorAll(".bg-wh-card")];
    const charCards = cards.filter(
      (c) =>
        c.textContent.includes("Lord Alaric") &&
        !c.textContent.includes("Knights Errant"),
    );
    expect(charCards.length).toBe(0);
  });

  it("host unit card contains the assigned character's name", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    expect(knightsCard.textContent).toContain("Lord Alaric");
  });

  it("aggregates MR from assigned character onto host unit", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    expect(knightsCard.textContent).toContain("MR:-1");
  });

  it("shows modified AP on Lance when Banner of Har Ganeth is in unit", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    // Lance base AP is -2; with banner apMod -1 → should display AP-3
    expect(knightsCard.textContent).toContain("AP-3");
    expect(knightsCard.textContent).not.toContain("AP-2");
  });
});

describe("Errantry Banner conditional strength display", () => {
  function buildErrantryArmy() {
    return {
      name: "Test",
      armySlug: "test",
      faction: "Test",
      points: 100,
      composition: null,
      units: [
        {
          id: "knights.003",
          name: "Knights Errant",
          category: "core",
          strength: 5,
          points: 180,
          stats: [
            {
              M: "8",
              WS: "3",
              BS: "3",
              S: "3",
              T: "3",
              W: "1",
              I: "3",
              A: "1",
              Ld: "7",
              Name: "Knight Errant",
            },
          ],
          weapons: [
            {
              name: "Lance",
              s: "S+2",
              ap: "-2",
              rules: "Armour Bane (1). Charge turn only.",
              magical: false,
              attacks: null,
              reservedAttacks: null,
            },
          ],
          shootingWeapons: [],
          magicItems: [
            {
              name: "Errantry Banner",
              type: "banner",
              points: 30,
              effect: "",
              phases: ["combat"],
              strengthMod: "+1 on charge",
            },
          ],
          specialRules: [],
          mount: null,
          armourSave: "2+",
          ward: null,
          regen: null,
          magicResistance: null,
          poisonedAttacks: false,
          stomp: null,
          impactHits: null,
          isGeneral: false,
          isBSB: false,
          hasStandard: false,
          hasMusician: false,
          isCaster: false,
          lores: [],
          activeLore: null,
          factionLores: [],
          champions: [],
          crew: [],
        },
      ],
    };
  }

  beforeEach(() => {
    const army = buildErrantryArmy();
    saveArmy(army);
    saveCharacterAssignments({});
    startGame(army);
    savePhaseIndex(10); // choose-fight (combat phase)
  });

  it("shows conditional strength asterisk on Lance weapon line", () => {
    const army = buildErrantryArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    // Lance with S+2 at unit S3: display is "S3+2+1*"
    expect(knightsCard.textContent).toContain("3+2+1*");
    // Footnote appears
    expect(knightsCard.textContent).toContain("Errantry Banner");
  });
});
