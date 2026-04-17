import { describe, it, expect } from "vitest";
import { subPhaseToIndex } from "../phases.js";

describe("subPhaseToIndex", () => {
  it("returns 0 for strategy/start-of-turn (first subphase)", () => {
    expect(subPhaseToIndex("strategy", "start-of-turn")).toBe(0);
  });

  it("returns 10 for combat/choose-fight", () => {
    // strategy: 4 subs (0-3), movement: 4 subs (4-7), shooting: 2 subs (8-9)
    // combat/choose-fight is index 10
    expect(subPhaseToIndex("combat", "choose-fight")).toBe(10);
  });

  it("returns 14 for scoring/scoring (last subphase)", () => {
    expect(subPhaseToIndex("scoring", "scoring")).toBe(14);
  });

  it("returns -1 for unknown phase/subphase combination", () => {
    expect(subPhaseToIndex("unknown", "unknown")).toBe(-1);
  });

  it("returns -1 for valid phase but wrong subphase", () => {
    expect(subPhaseToIndex("strategy", "choose-fight")).toBe(-1);
  });
});
