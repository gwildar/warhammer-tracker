import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy, startGame } from "./helpers.js";
import { saveCharacterAssignments, saveRound } from "../state.js";
import { renderSpecialRulesContext } from "../context/special-rules-context.js";

describe("optional rules parsed from unit options", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("mc-skeleton-horde");
    saveCharacterAssignments({});
  });

  it("Tomb Scorpion has Ambushers in specialRules", () => {
    const scorpion = army.units.find((u) => u.id.startsWith("tomb-scorpion"));
    expect(scorpion).toBeDefined();
    const ruleIds = scorpion.specialRules.map((r) => r.id);
    expect(ruleIds).toContain("ambushers");
  });

  it("Tomb Scorpion has The Terrors Below in specialRules", () => {
    const scorpion = army.units.find((u) => u.id.startsWith("tomb-scorpion"));
    expect(scorpion).toBeDefined();
    const ruleIds = scorpion.specialRules.map((r) => r.id);
    expect(ruleIds).toContain("the terrors below");
  });

  it("Ambushers appears in strategy start-of-turn render from round 2", () => {
    startGame(army);
    // Round 2 so fromRound: 2 filter passes
    saveRound(2);
    const html = renderSpecialRulesContext(army, {
      id: "start-of-turn",
      label: "Start of Turn",
    });
    expect(html).toContain("Ambushers");
    expect(html).toContain("Tomb Scorpion");
  });

  it("The Terrors Below appears in movement compulsory-moves render", () => {
    startGame(army);
    const html = renderSpecialRulesContext(army, {
      id: "compulsory-moves",
      label: "Compulsory Moves",
    });
    expect(html).toContain("The Terrors Below");
    expect(html).toContain("Tomb Scorpion");
  });
});

describe("From Beneath the Sands shows on your turn command sub-phase", () => {
  it("renders in command sub-phase for army with High Priest", () => {
    const army = loadArmy("mc-skeleton-horde");
    startGame(army);
    const html = renderSpecialRulesContext(army, { id: "command" });
    expect(html).toContain("From Beneath the Sands");
  });
});

describe("optional rules: Shield option does not pollute special rules display", () => {
  it("Skeleton Warriors shield option still grants armour save bonus without appearing as displayed rule", () => {
    const army = loadArmy("mc-skeleton-horde");
    const skeletons = army.units.find((u) =>
      u.id.startsWith("skeleton-warriors"),
    );
    expect(skeletons).toBeDefined();
    // Shield option should contribute to armour save (via equipment)
    expect(skeletons.armourSave).toBeTruthy();
    // "Shields" should not be a recognised special rule (id null = bare entry only)
    const shieldRule = skeletons.specialRules.find(
      (r) => r.displayName?.toLowerCase() === "shields",
    );
    expect(shieldRule?.id).toBeNull();
  });
});
