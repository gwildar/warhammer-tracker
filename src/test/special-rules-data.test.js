import { describe, it, expect, beforeEach } from "vitest";
import { findRule } from "../data/special-rules.js";
import {
  renderSpecialRulesContext,
  renderSpecialRulesForPhase,
} from "../context/special-rules-context.js";
import { PHASES } from "../phases.js";
import { loadArmy } from "./helpers.js";

function makeVeteranArmy() {
  return {
    units: [
      {
        name: "Dark Elf Warriors",
        specialRules: [{ id: "veteran", displayName: "Veteran" }],
        weapons: [],
        shootingWeapons: [],
      },
    ],
  };
}

describe("weapon rules appear in special rules section — bretonnian-exiles", () => {
  it("Volley Fire appears at shoot sub-phase (Peasant Bowmen have Longbows)", () => {
    const army = loadArmy("bretonnian-exiles");
    const html = renderSpecialRulesContext(army, { id: "shoot" });
    expect(html).toContain("Volley Fire");
  });

  it("Quick Shot appears at shoot sub-phase (Yeomen Guard have Shortbows)", () => {
    const army = loadArmy("bretonnian-exiles");
    const html = renderSpecialRulesContext(army, { id: "shoot" });
    expect(html).toContain("Quick Shot");
  });
});

describe("Cumbersome — appears in special rules at shoot sub-phase", () => {
  it("appears in special rules for the shoot sub-phase", () => {
    const army = {
      units: [
        {
          name: "Test Unit",
          specialRules: [{ id: "cumbersome", displayName: "Cumbersome" }],
          weapons: [],
          shootingWeapons: [],
        },
      ],
    };
    const html = renderSpecialRulesContext(army, { id: "shoot" });
    expect(html).toContain("Cumbersome");
  });
});

describe("Veteran rule — shoot phase visibility", () => {
  it("does not appear on your shoot sub-phase", () => {
    const html = renderSpecialRulesContext(makeVeteranArmy(), { id: "shoot" });
    expect(html).not.toContain("Veteran");
  });

  it("does appear on opponent's shooting phase", () => {
    const shootingPhase = PHASES.find((p) => p.id === "shooting");
    const html = renderSpecialRulesForPhase(makeVeteranArmy(), shootingPhase);
    expect(html).toContain("Veteran");
  });
});

describe("Gaze of the Gods rule data", () => {
  let rule;
  let phase;

  beforeEach(() => {
    rule = findRule("gaze of the gods");
    phase = rule?.phases?.find((p) => p.subPhaseId === "command");
  });

  it("exists in SPECIAL_RULES", () => {
    expect(rule).toBeDefined();
  });

  it("has a command phase with yourTurnOnly", () => {
    expect(phase).toBeDefined();
    expect(phase?.yourTurnOnly).toBe(true);
  });

  it("has a D6 table with 6 entries", () => {
    expect(phase?.table).toHaveLength(6);
  });

  it("table covers rolls 1 through 6", () => {
    const rolls = phase?.table?.map((entry) => entry.roll);
    expect(rolls).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("all table entries have result and effect", () => {
    for (const entry of phase?.table ?? []) {
      expect(entry.result).toBeTruthy();
      expect(entry.effect).toBeTruthy();
    }
  });
});
