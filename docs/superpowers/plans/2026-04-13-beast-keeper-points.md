# Beast Keeper Detachment Points Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Beast Pack point calculation to include the cost of attached beasts (detachments), and add detachment data to the canonical unit schema so beast stats are available to the rest of the app.

**Architecture:** The OWB JSON for Beast Packs contains a `detachments` array alongside the keeper unit — each detachment has its own `points`, `strength`, `equipment`, and `specialRules`. The parser's `calculateUnitPoints` ignores this array entirely. The fix adds detachment point summing there, and `parseCanonicalUnit` is extended to parse each detachment into a canonical sub-unit shape (name, strength, stats, weapons, specialRules) stored on `unit.detachments`.

**Tech Stack:** Vanilla JS, Vitest — no new dependencies.

---

## File Structure

- **Modify:** `src/parsers/from-owb.js` — two changes: `calculateUnitPoints` adds detachment summing; `parseCanonicalUnit` builds a `detachments` array on the canonical unit
- **Modify:** `src/test/helpers.js` — register `wood-elves` fixture
- **Create:** `src/test/beast-keeper.test.js` — tests for points and schema

---

### Task 1: Register the wood-elves fixture in test helpers

**Files:**

- Modify: `src/test/helpers.js`

The fixture file `src/test/fixtures/wood-elves.owb.json` already exists but is not registered in `loadArmy`. Add it the same way as `mc-skeleton-horde` was added.

- [ ] **Step 1: Write the failing test**

Create `src/test/beast-keeper.test.js`:

```js
import { describe, it, expect } from "vitest";
import { loadArmy } from "./helpers.js";

describe("wood-elves fixture loads", () => {
  it("loadArmy('wood-elves') returns an army with units", () => {
    const army = loadArmy("wood-elves");
    expect(army.units.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/test/beast-keeper.test.js --reporter=verbose
```

Expected: FAIL — `Cannot find module` or `wood-elves` not in `jsonMap`.

- [ ] **Step 3: Add wood-elves to helpers.js**

In `src/test/helpers.js`, add the import at the top alongside the other fixture imports:

```js
import woodElvesJson from "./fixtures/wood-elves.owb.json";
```

And add it to `jsonMap` inside `loadArmy`:

```js
"wood-elves": woodElvesJson,
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/test/beast-keeper.test.js --reporter=verbose
```

Expected: PASS

- [ ] **Step 5: Run full suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/test/helpers.js src/test/beast-keeper.test.js
git commit -m "test: register wood-elves fixture in loadArmy helper"
```

---

### Task 2: Fix Beast Pack point calculation to include detachment costs

**Files:**

- Modify: `src/parsers/from-owb.js` (lines 54–107, `calculateUnitPoints`)
- Modify: `src/test/beast-keeper.test.js`

The OWB fixture for `wood-elf-beast-pack.jpyafkrs` looks like this (abridged):

```json
{
  "id": "wood-elf-beast-pack.jpyafkrs",
  "points": 11,
  "strength": 1,
  "detachments": [
    {
      "id": "deepwood-hounds.klifrac",
      "name_en": "Deepwood Hound",
      "points": 8,
      "strength": 1,
      "scaleWithUnit": true,
      "equipment": [
        {
          "name_en": "Hand weapons (Claws, fangs, tusks, teeth)",
          "active": true,
          "points": 0
        }
      ],
      "armor": [],
      "options": [],
      "specialRules": {
        "name_en": "Motley Crew, Run with the Pack, Skirmishers, Warband"
      }
    }
  ]
}
```

Expected unit points: `11 × 1 (keeper) + 8 × 1 (hound) = 19`.

Currently `calculateUnitPoints` returns `11` because it never touches `raw.detachments`.

- [ ] **Step 1: Write the failing test**

Add to `src/test/beast-keeper.test.js`:

```js
import { parseArmyList } from "../army.js";
import woodElvesJson from "./fixtures/wood-elves.owb.json";

describe("Beast Pack points include detachment costs", () => {
  it("Beast Pack with 1 Deepwood Hound costs 19 pts (11 keeper + 8 hound)", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    expect(pack).toBeDefined();
    expect(pack.points).toBe(19);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/test/beast-keeper.test.js --reporter=verbose
```

Expected: FAIL — `Expected 11 to be 19`

- [ ] **Step 3: Add detachment summing to calculateUnitPoints**

In `src/parsers/from-owb.js`, inside `calculateUnitPoints`, add after the `raw.items` block (around line 104, before `return pts`):

```js
// Detachments (e.g. beasts in a Wood Elf Beast Pack)
for (const det of raw.detachments || []) {
  pts += (det.points || 0) * (det.strength || 1);
}
```

The full function after the change (showing only the new block in context):

```js
if (Array.isArray(raw.items)) {
  for (const slot of raw.items) {
    if (Array.isArray(slot.selected)) {
      for (const item of slot.selected) {
        pts += (item.points || 0) * (item.amount || 1);
      }
    }
  }
}

// Detachments (e.g. beasts in a Wood Elf Beast Pack)
for (const det of raw.detachments || []) {
  pts += (det.points || 0) * (det.strength || 1);
}

return pts;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/test/beast-keeper.test.js --reporter=verbose
```

Expected: PASS

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/parsers/from-owb.js src/test/beast-keeper.test.js
git commit -m "fix: include detachment points in Beast Pack point calculation"
```

---

### Task 3: Add detachments to the canonical unit schema

**Files:**

- Modify: `src/parsers/from-owb.js` (`parseCanonicalUnit`, around lines 112–297)
- Modify: `src/test/beast-keeper.test.js`

The canonical unit currently has no `detachments` field. Adding it allows the combat card and other contexts to access beast stats (name, strength, stats, weapons, specialRules) without re-parsing the raw OWB JSON.

Each parsed detachment has this shape:

```js
{
  id: "deepwood-hounds.klifrac",
  name: "Deepwood Hound",
  strength: 1,
  points: 8,
  stats: [...],     // resolveStats result — same shape as unit.stats
  weapons: [...],   // resolveWeapons result
  specialRules: [...], // resolveSpecialRules result
}
```

`resolveStats` resolves "deepwood-hounds.klifrac" → base id `"deepwood-hounds"` → tries singular `"deepwood-hound"` → finds the entry in `units.js` (line 5203). The weapons resolve from `"Hand weapons (Claws, fangs, tusks, teeth)"` → matches `"hand weapon"` key in COMBAT_WEAPONS → `{ name: "Hand Weapon", s: "S", ap: "—" }`.

- [ ] **Step 1: Write the failing test**

Add to `src/test/beast-keeper.test.js`:

```js
describe("Beast Pack canonical unit has parsed detachments", () => {
  it("unit.detachments contains one Deepwood Hound entry", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    expect(pack.detachments).toHaveLength(1);
    const hound = pack.detachments[0];
    expect(hound.id).toBe("deepwood-hounds.klifrac");
    expect(hound.name).toBe("Deepwood Hound");
    expect(hound.strength).toBe(1);
    expect(hound.points).toBe(8);
  });

  it("detachment has resolved stats from units.js", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    const hound = pack.detachments[0];
    expect(hound.stats).toHaveLength(1);
    expect(hound.stats[0].Name).toBe("Deepwood Hound");
    expect(hound.stats[0].M).toBe("9");
    expect(hound.stats[0].A).toBe("1");
  });

  it("detachment has resolved weapons", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    const hound = pack.detachments[0];
    expect(hound.weapons.length).toBeGreaterThan(0);
    expect(hound.weapons[0].name).toBe("Hand Weapon");
  });

  it("detachment has resolved specialRules", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    const hound = pack.detachments[0];
    const ruleIds = hound.specialRules.map((r) => r.id);
    expect(ruleIds).toContain("skirmishers");
  });

  it("units without detachments have an empty detachments array", () => {
    const army = loadArmy("wood-elves");
    const gladeLord = army.units.find((u) => u.id.startsWith("glade-lord"));
    expect(gladeLord.detachments).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/test/beast-keeper.test.js --reporter=verbose
```

Expected: FAIL — `Cannot read properties of undefined (reading 'length')` on `pack.detachments`

- [ ] **Step 3: Add detachment parsing to parseCanonicalUnit**

In `src/parsers/from-owb.js`, inside `parseCanonicalUnit`, add a detachment parsing block before the `const unit = {` line (around line 266):

```js
// Parse detachments (e.g. beasts in a Wood Elf Beast Pack)
const detachments = (raw.detachments || []).map((det) => {
  const detEquipment = collectActive(det.equipment);
  const detStats = resolveStats(det.id, det.name_en);
  const detWeapons = resolveWeapons(detEquipment, []);
  const detSpecialRules = resolveSpecialRules(det.specialRules?.name_en || "");
  return {
    id: det.id,
    name: det.name_en,
    strength: det.strength || 1,
    points: det.points || 0,
    stats: detStats,
    weapons: detWeapons,
    specialRules: detSpecialRules,
  };
});
```

Then add `detachments` to the `unit` object (alongside the other fields):

```js
const unit = {
  id,
  name: displayName,
  category,
  strength,
  points: calculateUnitPoints(raw),
  stats,
  weapons,
  shootingWeapons,
  magicItems,
  specialRules,
  mount: mount || null,
  armourSave,
  ward,
  regen,
  magicResistance,
  poisonedAttacks,
  stomp,
  impactHits,
  detachments, // ← add this line
  champions: [],
  crew: [],
  isGeneral,
  isBSB,
  hasStandard,
  hasMusician,
  isCaster,
  lores,
  activeLore: raw.activeLore || null,
  factionLores,
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/test/beast-keeper.test.js --reporter=verbose
```

Expected: all 6 tests in `beast-keeper.test.js` PASS

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/parsers/from-owb.js src/test/beast-keeper.test.js
git commit -m "feat: add detachments to canonical unit schema with parsed beast stats"
```

---

## Self-Review

**Spec coverage:**

- ✅ Points bug fixed (Task 2)
- ✅ Schema updated with detachments field (Task 3)
- ✅ Fixture registered so tests can run (Task 1)
- ✅ Tests cover points, schema shape, stats resolution, weapons, specialRules, and the empty-array default

**Placeholder scan:** None found — all code blocks are complete.

**Type consistency:** `detachments` is written the same in `calculateUnitPoints` (as `raw.detachments`) and `parseCanonicalUnit` (as `unit.detachments`). The parsed shape (`id`, `name`, `strength`, `points`, `stats`, `weapons`, `specialRules`) is consistent across the test assertions and the implementation.
