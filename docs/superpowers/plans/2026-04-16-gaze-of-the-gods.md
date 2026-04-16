# Gaze of the Gods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Gaze of the Gods as a command-phase D6 table special rule in `src/data/special-rules.js`.

**Architecture:** A single data entry following the existing `table` pattern (used by Giant Attacks / Bonegrinder Giant Attacks). No UI changes needed — the rendering layer already handles this format. A separate test file verifies the rule exists in the real data with the correct structure (the existing special-rules-context tests mock `SPECIAL_RULES` so can't be used for data-integrity checks).

**Tech Stack:** JavaScript (ES modules), Vitest

---

### Task 1: Write failing data-integrity test

**Files:**

- Create: `src/test/special-rules-data.test.js`

The existing `special-rules-context.test.js` mocks `SPECIAL_RULES` entirely, so it cannot verify real data entries. This new file imports from the real data module.

- [ ] **Step 1: Create the test file**

```js
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
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
npm test -- special-rules-data
```

Expected: 5 tests FAIL with `rule` being `undefined` (rule doesn't exist yet).

---

### Task 2: Add the rule to special-rules.js

**Files:**

- Modify: `src/data/special-rules.js` (insert before the closing `];` at line 2015)

- [ ] **Step 1: Insert the rule**

In `src/data/special-rules.js`, insert before the closing `];` of `SPECIAL_RULES` (currently line 2015, after the `wrath-of-the-storm` entry):

```js
  {
    id: "gaze of the gods",
    displayName: "Gaze of the Gods",
    phases: [
      {
        subPhaseId: "command",
        yourTurnOnly: true,
        description:
          "May roll on the Gaze of the Gods table. Applies to the Champion only, not any mount:",
        table: [
          {
            roll: "1",
            result: "Damned by Chaos",
            effect:
              "Gains Stupidity for the remainder of the game. If already affected, suffers -1 Leadership (minimum 2).",
          },
          {
            roll: "2",
            result: "Unnatural Quickness",
            effect:
              "+1 Initiative until the next Start of Turn sub-phase (maximum 10).",
          },
          {
            roll: "3",
            result: "Iron Skin",
            effect:
              "+1 Toughness until the next Start of Turn sub-phase (maximum 10).",
          },
          {
            roll: "4",
            result: "Murderous Mutation",
            effect:
              "+1 Weapon Skill for the remainder of the game (maximum 10).",
          },
          {
            roll: "5",
            result: "Dark Fury",
            effect: "+1 Attacks for the remainder of the game (maximum 10).",
          },
          {
            roll: "6",
            result: "Apotheosis",
            effect:
              "+1 Strength and +1 Leadership for the remainder of the game (maximum 10).",
          },
        ],
      },
    ],
  },
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: all tests PASS, including the 5 new ones in `special-rules-data.test.js`.

- [ ] **Step 3: Commit**

```bash
git add src/data/special-rules.js src/test/special-rules-data.test.js
git commit -m "feat: add Gaze of the Gods special rule with D6 table"
```
