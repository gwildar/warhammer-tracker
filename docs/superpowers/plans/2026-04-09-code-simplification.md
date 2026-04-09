# Code Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three independent refactors that reduce duplication and improve readability with zero behaviour change.

**Architecture:** Each task is self-contained — any can be skipped or done in isolation. All changes are pure renames/extractions with no logic changes. Tests must stay green throughout.

**Tech Stack:** Vanilla JS, Vitest. Run `npm test` to verify after each task.

---

## Files changed

| Task | Files touched                                                        |
| ---- | -------------------------------------------------------------------- |
| 1    | `src/helpers.js`, `src/context/charge.js`, `src/context/movement.js` |
| 2    | `src/screens/game.js`                                                |
| 3    | `src/parsers/from-owb.js`                                            |

---

## Task 1: Extract duplicated fly/baseMv helpers into helpers.js

The fly-movement detection block (4 lines) and `resolveBaseMv` (1 line) are copied verbatim in both `charge.js` and `movement.js`.

**Files:**

- Modify: `src/helpers.js`
- Modify: `src/context/charge.js:78-105`
- Modify: `src/context/movement.js:8-17`

- [ ] **Step 1: Write the failing tests**

Add to the bottom of `src/test/screens/game.test.js` — imports already exist for this file:

```js
// In a new import at top of game.test.js, add to existing helpers import:
// import { extractFlyMovement, resolveBaseMv } from "../../helpers.js";
// (but helpers.js isn't imported there — add a separate import block)
```

Better: add a dedicated test file `src/test/helpers.test.js`:

```js
import { describe, it, expect } from "vitest";
import { extractFlyMovement, resolveBaseMv } from "../helpers.js";

describe("extractFlyMovement", () => {
  it("returns fly value from Fly (N) special rule", () => {
    const unit = { specialRules: [{ displayName: "Fly (9)" }] };
    expect(extractFlyMovement(unit, null)).toBe(9);
  });

  it("falls back to mount.f when no fly rule", () => {
    const unit = { specialRules: [] };
    expect(extractFlyMovement(unit, { f: 12 })).toBe(12);
  });

  it("returns null when no fly at all", () => {
    const unit = { specialRules: [] };
    expect(extractFlyMovement(unit, null)).toBeNull();
  });
});

describe("resolveBaseMv", () => {
  it("uses mountData.m when mount present", () => {
    expect(resolveBaseMv({ m: 8 }, "4")).toBe(8);
  });

  it("uses mv when no mount", () => {
    expect(resolveBaseMv(null, "6")).toBe(6);
  });

  it("returns null when neither available", () => {
    expect(resolveBaseMv(null, null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep "extractFlyMovement\|resolveBaseMv"
```

Expected: `extractFlyMovement is not a function` / `resolveBaseMv is not a function`

- [ ] **Step 3: Add the two helpers to src/helpers.js**

Append to the bottom of `src/helpers.js`:

```js
/**
 * Extract fly movement value from a unit's specialRules or mount data.
 * Returns the numeric fly distance, or null if the unit cannot fly.
 */
export function extractFlyMovement(unit, mountData) {
  const flyRuleStr = (unit.specialRules || [])
    .map((r) => r.displayName || "")
    .find((d) => /^fly\s*\(/i.test(d.trim()));
  const flyMatch = flyRuleStr ? flyRuleStr.match(/\((\d+)\)/) : null;
  return flyMatch ? Number(flyMatch[1]) : (mountData?.f ?? null);
}

/**
 * Resolve the base movement value (in inches) for charge/movement calculation.
 * Prefers mount.m; falls back to the unit's own M stat; returns null if unknown.
 */
export function resolveBaseMv(mountData, mv) {
  return mountData ? mountData.m : mv != null ? Number(mv) : null;
}
```

- [ ] **Step 4: Run tests to confirm helpers pass**

```bash
npm test -- --reporter=verbose 2>&1 | grep "extractFlyMovement\|resolveBaseMv"
```

Expected: all 6 new tests pass.

- [ ] **Step 5: Update charge.js to use the helpers**

In `src/context/charge.js`, add to the import at line 2:

```js
import {
  resolveMovement,
  normaliseRuleName,
  extractFlyMovement,
  resolveBaseMv,
} from "../helpers.js";
```

Replace lines 81–87 (fly detection block):

```js
// REMOVE:
const flyRuleStr = (u.specialRules || [])
  .map((r) => r.displayName || "")
  .find((d) => /^fly\s*\(/i.test(d.trim()));
const flyMatch = flyRuleStr ? flyRuleStr.match(/\((\d+)\)/) : null;
const flyMv = flyMatch ? Number(flyMatch[1]) : (mountData?.f ?? null);
const hasFly = flyMv != null;

// REPLACE WITH:
const flyMv = extractFlyMovement(u, mountData);
const hasFly = flyMv != null;
```

Replace line 105 (baseMv):

```js
// REMOVE:
const baseMv = mountData ? mountData.m : mv != null ? Number(mv) : null;

// REPLACE WITH:
const baseMv = resolveBaseMv(mountData, mv);
```

- [ ] **Step 6: Update movement.js to use the helpers**

In `src/context/movement.js`, update the import at line 1:

```js
import {
  resolveMovement,
  extractFlyMovement,
  resolveBaseMv,
} from "../helpers.js";
```

Replace lines 9 and 13–17:

```js
// REMOVE:
const baseMv = mountData ? mountData.m : mv != null ? Number(mv) : null;
// ...
const flyRuleStr = (u.specialRules || [])
  .map((r) => r.displayName || "")
  .find((d) => /^fly\s*\(/i.test(d.trim()));
const flyMatch = flyRuleStr ? flyRuleStr.match(/\((\d+)\)/) : null;
const flyMv = flyMatch ? Number(flyMatch[1]) : (mountData?.f ?? null);

// REPLACE WITH:
const baseMv = resolveBaseMv(mountData, mv);
// ...
const flyMv = extractFlyMovement(u, mountData);
```

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

Expected: all tests pass (count unchanged from before).

- [ ] **Step 8: Commit**

```bash
git add src/helpers.js src/context/charge.js src/context/movement.js src/test/helpers.test.js
git commit -m "refactor: extract extractFlyMovement and resolveBaseMv into helpers.js"
```

---

## Task 2: Replace renderPhaseContext if-chain with a dispatch map in game.js

`renderPhaseContext` in `src/screens/game.js` has 9 consecutive `if (subPhase.id === "...")` checks. A map is easier to scan and extend.

**Files:**

- Modify: `src/screens/game.js:154-199`

No new tests needed — existing game screen tests cover all phase rendering paths. Just verify nothing regresses.

- [ ] **Step 1: Replace the if-chain with a PHASE_RENDERERS map**

In `src/screens/game.js`, find `function renderPhaseContext` (currently lines 154–199) and replace its body entirely:

```js
const PHASE_RENDERERS = {
  rally: [(a) => renderCombatLeadershipContext(a, "Rally Leadership")],
  "declare-charges": [renderChargeContext],
  "compulsory-moves": [renderRandomMoverContext],
  shoot: [(a) => renderCasterContext(a, ["magic-missile", "magical-vortex"])],
  "remaining-moves": [
    (a) => renderCasterContext(a, ["conveyance"]),
    renderMovementStatsContext,
  ],
  "choose-fight": [
    renderCombatWeaponsContext,
    (a) => renderCasterContext(a, ["assailment"]),
  ],
  "combat-result": [renderCombatResultContext],
  "break-test": [renderCombatLeadershipContext],
};

function renderPhaseContext(army, phase, subPhase) {
  let html = "";

  if (subPhase.showCasters)
    html += renderCasterContext(army, ["enchantment", "hex"]);
  if (subPhase.showShooting) html += renderShootingContext(army);

  for (const renderer of PHASE_RENDERERS[subPhase.id] || []) {
    html += renderer(army);
  }

  if (subPhase.id !== "remove-casualties" && subPhase.id !== "scoring") {
    html += renderMagicItemsContext(army, phase.id, subPhase.id);
    html += renderVirtuesContext(army, phase.id, subPhase.id);
  }
  if (subPhase.id === "scoring") {
    html += renderScoringUI();
  }
  html += renderSpecialRulesContext(army, subPhase);
  if (
    subPhase.id === "command" &&
    army.units.some((u) =>
      (u.specialRules || []).some((r) =>
        r.displayName?.toLowerCase().includes("rallying cry"),
      ),
    )
  )
    html += renderCombatLeadershipContext(army, "Rally Leadership");

  return html;
}
```

Place `PHASE_RENDERERS` just above the `renderPhaseContext` function definition.

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all tests pass (no count change).

- [ ] **Step 3: Commit**

```bash
git add src/screens/game.js
git commit -m "refactor: replace renderPhaseContext if-chain with PHASE_RENDERERS dispatch map"
```

---

## Task 3: Extract collectActive helper in from-owb.js

Three identical `if (Array.isArray) → for → if (active) → push(name_en)` loops can be replaced with a one-liner.

**Files:**

- Modify: `src/parsers/from-owb.js:108-128`

- [ ] **Step 1: Add collectActive as a local helper near the top of the file**

In `src/parsers/from-owb.js`, add this function after the import block (before `calculateUnitPoints`):

```js
/** Returns name_en values for all active items in an array (safe if arr is not an array). */
function collectActive(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item) => item.active).map((item) => item.name_en);
}
```

- [ ] **Step 2: Replace the three loops in parseCanonicalUnit**

Find lines 108–128 (the equipment/armor/options gathering block) and replace:

```js
// REMOVE:
if (Array.isArray(raw.equipment)) {
  for (const e of raw.equipment) {
    if (e.active) equipment.push(e.name_en);
  }
}
if (Array.isArray(raw.armor)) {
  for (const a of raw.armor) {
    if (a.active) armour.push(a.name_en);
  }
}
if (Array.isArray(raw.options)) {
  for (const opt of raw.options) {
    if (opt.active) equipment.push(opt.name_en);
  }
}

// REPLACE WITH:
const equipment = [
  ...collectActive(raw.equipment),
  ...collectActive(raw.options),
];
const armour = collectActive(raw.armor);
```

Note: `equipment` and `armour` were previously declared with `const equipment = []` and `const armour = []` before these loops — remove those declarations and use the direct assignment above.

- [ ] **Step 3: Run the full test suite**

```bash
npm test
```

Expected: all tests pass (no count change).

- [ ] **Step 4: Commit**

```bash
git add src/parsers/from-owb.js
git commit -m "refactor: extract collectActive helper in from-owb.js to replace three identical loops"
```

---

## Verification

After all three tasks:

```bash
npm test
```

All tests pass with the same count as before. No behaviour change — purely structural.

Tasks are independent: any can be done without the others.
