import { describe, it, expect } from "vitest";
import { findRule } from "../data/special-rules.js";

describe("Gaze of the Gods rule data", () => {
  it("exists in SPECIAL_RULES", () => {
    const rule = findRule("gaze of the gods");
    expect(rule).toBeDefined();
  });

  it("has a command phase with yourTurnOnly", () => {
    const rule = findRule("gaze of the gods");
    const phase = rule.phases.find((p) => p.subPhaseId === "command");
    expect(phase).toBeDefined();
    expect(phase.yourTurnOnly).toBe(true);
  });

  it("has a D6 table with 6 entries", () => {
    const rule = findRule("gaze of the gods");
    const phase = rule.phases.find((p) => p.subPhaseId === "command");
    expect(phase.table).toHaveLength(6);
  });

  it("table covers rolls 1 through 6", () => {
    const rule = findRule("gaze of the gods");
    const phase = rule.phases.find((p) => p.subPhaseId === "command");
    const rolls = phase.table.map((entry) => entry.roll);
    expect(rolls).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("all table entries have result and effect", () => {
    const rule = findRule("gaze of the gods");
    const phase = rule.phases.find((p) => p.subPhaseId === "command");
    for (const entry of phase.table) {
      expect(entry.result).toBeTruthy();
      expect(entry.effect).toBeTruthy();
    }
  });
});
