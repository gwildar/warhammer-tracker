# Grail Vow Ward Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Units with "The Grail Vow" special rule always show a 6+ ward save in the combat screen.

**Architecture:** `computeWard` in `resolve.js` already checks special rules for "Blessings of the Lady" to return a 6+ ward, but has an id mismatch bug (`"blessings-of-the-lady"` vs actual id `"blessings of the lady"` with spaces). Fix that bug and add an equivalent check for "the grail vow". The ward flows through to `u.ward` on the canonical unit, which is already rendered in both the single-model and ridden-monster combat blocks in `combat-weapons.js` — no rendering changes required.

**Tech Stack:** Vanilla JS, Vitest

---

## File Structure

- Modify: `src/parsers/resolve.js` — fix `computeWard` (one function, ~15 lines)
- Create: `src/test/ward-computation.test.js` — new test file for `computeWard`

---

### Task 1: Fix `computeWard` to handle Grail Vow and fix the Blessings id bug

**Files:**

- Create: `src/test/ward-computation.test.js`
- Modify: `src/parsers/resolve.js:385-398`

- [ ] **Step 1: Write the failing tests**

Create `src/test/ward-computation.test.js`:

```js
import { describe, it, expect } from "vitest";
import { computeWard } from "../parsers/resolve.js";

describe("computeWard", () => {
  it("returns null when no ward sources", () => {
    expect(computeWard([], [])).toBeNull();
  });

  it("returns ward from magic item", () => {
    const magicItems = [{ ward: "5+" }];
    expect(computeWard(magicItems, [])).toBe("5+");
  });

  it("magic item ward takes precedence over special rules", () => {
    const magicItems = [{ ward: "5+" }];
    const specialRules = [
      { id: "blessings of the lady", displayName: "Blessings of the Lady" },
    ];
    expect(computeWard(magicItems, specialRules)).toBe("5+");
  });

  it("returns 6+ for Blessings of the Lady special rule", () => {
    const specialRules = [
      { id: "blessings of the lady", displayName: "Blessings of the Lady" },
    ];
    expect(computeWard([], specialRules)).toBe("6+");
  });

  it("returns 6+ for The Grail Vow special rule", () => {
    const specialRules = [
      { id: "the grail vow", displayName: "The Grail Vow" },
    ];
    expect(computeWard([], specialRules)).toBe("6+");
  });

  it("ignores unrelated special rules", () => {
    const specialRules = [{ id: "hatred", displayName: "Hatred (Undead)" }];
    expect(computeWard([], specialRules)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test -- ward-computation
```

Expected: the "Blessings of the Lady" and "Grail Vow" tests fail (current code has id mismatch and no grail vow check).

- [ ] **Step 3: Fix `computeWard` in `src/parsers/resolve.js`**

Replace the existing `computeWard` function (lines 382–398):

```js
/**
 * Compute ward save from magic items and special rules
 */
export function computeWard(magicItems, specialRules) {
  // Check magic items
  for (const item of magicItems) {
    if (item.ward) return item.ward;
  }

  // Check special rules — Blessings of the Lady and The Grail Vow both grant 6+
  const WARD_RULES = new Set(["blessings of the lady", "the grail vow"]);
  for (const rule of specialRules) {
    if (WARD_RULES.has(rule.id)) return "6+";
  }

  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npm test -- ward-computation
```

Expected: all 6 tests pass.

- [ ] **Step 5: Run full test suite**

```
npm test
```

Expected: all 228 tests pass (or more, counting the new ones).

- [ ] **Step 6: Commit**

```bash
git add src/test/ward-computation.test.js src/parsers/resolve.js
git commit -m "fix: grail vow and blessings of the lady always show 6+ ward in combat"
```
