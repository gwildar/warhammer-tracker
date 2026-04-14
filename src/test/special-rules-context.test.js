import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveRound } from "../state.js";
import { PHASES } from "../phases.js";

// ── Test rule fixtures ────────────────────────────────────────────────────────

const SIMPLE_RULE = {
  id: "test simple",
  displayName: "Test Simple",
  description: "Do the thing.",
  phases: ["choose-fight"],
};

const SIMPLE_MULTI_RULE = {
  id: "test multi",
  displayName: "Test Multi",
  description: "Both phases.",
  phases: ["choose-fight", "break-test"],
};

const YOUR_TURN_RULE = {
  id: "your turn rule",
  displayName: "Your Turn Rule",
  description: "Your turn only.",
  phases: ["command"],
  yourTurnOnly: true,
};

const OPPONENT_RULE = {
  id: "opponent rule",
  displayName: "Opponent Rule",
  description: "Opponent only.",
  phases: ["declare-charges"],
  opponentOnly: true,
};

const FROM_ROUND_RULE = {
  id: "from round 2",
  displayName: "From Round 2",
  description: "Appears round 2+.",
  phases: ["start-of-turn"],
  fromRound: 2,
};

const COMPLEX_RULE = {
  id: "complex rule",
  displayName: "Complex Rule",
  phases: [
    {
      subPhaseId: "declare-charges",
      yourTurnOnly: true,
      description: "On declare.",
    },
    { subPhaseId: "pursuit", description: "On pursuit." },
  ],
};

const ALL_TEST_RULES = [
  SIMPLE_RULE,
  SIMPLE_MULTI_RULE,
  YOUR_TURN_RULE,
  OPPONENT_RULE,
  FROM_ROUND_RULE,
  COMPLEX_RULE,
];

// Mock SPECIAL_RULES so the rendering code finds our test rules
vi.mock("../data/special-rules.js", () => ({
  SPECIAL_RULES: ALL_TEST_RULES,
}));

// Import after mock is set up
const { renderSpecialRulesContext, renderSpecialRulesForPhase } =
  await import("../context/special-rules-context.js");

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeArmy(...rules) {
  return {
    units: rules.map((rule) => ({
      name: rule.displayName,
      specialRules: [{ displayName: rule.displayName, id: rule.id }],
      weapons: [],
      shootingWeapons: [],
    })),
  };
}

beforeEach(() => saveRound(1));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("simple format: phases as array of strings", () => {
  it("renders in the matching sub-phase", () => {
    const html = renderSpecialRulesContext(makeArmy(SIMPLE_RULE), {
      id: "choose-fight",
    });
    expect(html).toContain("Test Simple");
    expect(html).toContain("Do the thing.");
  });

  it("does not render in a non-matching sub-phase", () => {
    const html = renderSpecialRulesContext(makeArmy(SIMPLE_RULE), {
      id: "shoot",
    });
    expect(html).not.toContain("Test Simple");
  });

  it("renderSpecialRulesForPhase renders across all matching sub-phases", () => {
    const combatPhase = PHASES.find((p) => p.id === "combat");
    const html = renderSpecialRulesForPhase(
      makeArmy(SIMPLE_MULTI_RULE),
      combatPhase,
    );
    expect(html).toContain("Test Multi");
    expect(html).toContain("Both phases.");
  });
});

describe("simple format: yourTurnOnly at top level", () => {
  it("renderSpecialRulesContext shows it (no yourTurnOnly filter)", () => {
    const html = renderSpecialRulesContext(makeArmy(YOUR_TURN_RULE), {
      id: "command",
    });
    expect(html).toContain("Your Turn Rule");
  });

  it("renderSpecialRulesForPhase suppresses it", () => {
    const strategyPhase = PHASES.find((p) => p.id === "strategy");
    const html = renderSpecialRulesForPhase(
      makeArmy(YOUR_TURN_RULE),
      strategyPhase,
    );
    expect(html).not.toContain("Your Turn Rule");
  });
});

describe("simple format: opponentOnly at top level", () => {
  it("renderSpecialRulesContext suppresses opponentOnly", () => {
    const html = renderSpecialRulesContext(makeArmy(OPPONENT_RULE), {
      id: "declare-charges",
    });
    expect(html).not.toContain("Opponent Rule");
  });
});

describe("simple format: fromRound at top level", () => {
  it("does not render before fromRound", () => {
    saveRound(1);
    const html = renderSpecialRulesContext(makeArmy(FROM_ROUND_RULE), {
      id: "start-of-turn",
    });
    expect(html).not.toContain("From Round 2");
  });

  it("renders from fromRound onwards", () => {
    saveRound(2);
    const html = renderSpecialRulesContext(makeArmy(FROM_ROUND_RULE), {
      id: "start-of-turn",
    });
    expect(html).toContain("From Round 2");
  });
});

describe("complex object format still works", () => {
  it("renders correct description per sub-phase", () => {
    const html1 = renderSpecialRulesContext(makeArmy(COMPLEX_RULE), {
      id: "declare-charges",
    });
    expect(html1).toContain("On declare.");
    const html2 = renderSpecialRulesContext(makeArmy(COMPLEX_RULE), {
      id: "pursuit",
    });
    expect(html2).toContain("On pursuit.");
  });
});
