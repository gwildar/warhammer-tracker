# combat-weapons.js Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `src/context/combat-weapons.js` (1480 lines, 4 exports) into `combat-data.js` (pure logic) and a leaner `combat-weapons.js` (rendering only) to improve navigability, testability, and reduce blast radius.

**Architecture:** Create `src/context/combat-data.js` containing all data helpers and four new exported build functions (`buildCombatEntries`, `buildCombatResultEntries`, `buildCombatLeadershipData`, `buildDefensiveStatsEntries`). Strip `combat-weapons.js` down to rendering only — it imports the build functions from `combat-data.js`, and its six previously-nested helper functions are hoisted to module level. All four export names and all consumer imports are unchanged.

**Tech Stack:** Vanilla JS (ES modules), Vitest

---

## File Map

- **Create:** `src/context/combat-data.js` — data helpers + 4 build functions
- **Modify:** `src/context/combat-weapons.js` — remove data helpers, import from `combat-data.js`, hoist 6 nested render helpers
- **Create:** `src/test/combat-data.test.js` — unit tests for the 4 new build functions

**Consumers (unchanged — no edits needed):**

- `src/screens/game.js` — imports `renderCombatWeaponsContext`, `renderCombatResultContext`, `renderCombatLeadershipContext`
- `src/screens/opponent-turn.js` — imports `renderCombatWeaponsContext`, `renderDefensiveStatsContext`
- `src/test/combat-banner.test.js`, `combat-rules.test.js`, `unit-strength.test.js` — all import from `../context/combat-weapons.js` (unchanged)

---

### Task 1: Create `combat-data.js` — weapon-matching helpers

Move the first group of data helpers out of `combat-weapons.js` into the new file. No new tests needed — existing 406 tests verify behaviour is unchanged.

**Files:**

- Create: `src/context/combat-data.js`
- Modify: `src/context/combat-weapons.js`

- [ ] **Step 1: Create `src/context/combat-data.js`**

Create the file. Copy the following functions verbatim from `combat-weapons.js`, adding `export` to each declaration (except `CHARACTER_CATEGORIES` which stays internal):

Functions to copy (in order, near the top of `combat-weapons.js`):

- `HAND_WEAPON` constant
- `CHARACTER_CATEGORIES` constant (no export — only used internally by `isCharacter`)
- `isCharacter(unit)`
- `findVirtueAttacks(unit)`
- `findMagicWeapon(unit)`
- `matchRiderWeapons(unit)`
- `matchMountWeapons(unit, alreadyMatched)`

```js
import { COMBAT_WEAPONS, getWeapon } from "../data/weapons.js";
import { findMount } from "../parsers/resolve.js";
import { getCharacterAssignments } from "../state.js";

export const HAND_WEAPON = { name: "Hand Weapon", s: "S", ap: "—", rules: [] };

const CHARACTER_CATEGORIES = new Set(["characters", "lords", "heroes"]);

export function isCharacter(unit) {
  return CHARACTER_CATEGORIES.has(unit.category);
}

// paste findVirtueAttacks, findMagicWeapon, matchRiderWeapons, matchMountWeapons
// verbatim from combat-weapons.js, each prefixed with `export`
```

- [ ] **Step 2: Update `combat-weapons.js` imports and remove moved functions**

At the top of `combat-weapons.js`, replace the existing imports and delete the 7 functions you just copied. The new imports block:

```js
import { COMBAT_WEAPONS, getWeapon } from "../data/weapons.js";
import { findMount } from "../parsers/resolve.js";
import { getCharacterAssignments } from "../state.js";
import { displayUnitName } from "../utils/unit-name.js";
import {
  HAND_WEAPON,
  isCharacter,
  matchRiderWeapons,
  matchMountWeapons,
} from "./combat-data.js";
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all 406 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/context/combat-data.js src/context/combat-weapons.js
git commit -m "refactor: create combat-data.js with weapon-matching helpers"
```

---

### Task 2: Move tag/bonus helpers to `combat-data.js`

**Files:**

- Modify: `src/context/combat-data.js`
- Modify: `src/context/combat-weapons.js`

- [ ] **Step 1: Copy tag/bonus helpers into `combat-data.js`**

Append these functions verbatim from `combat-weapons.js` to the end of `combat-data.js`, with `export` where noted:

- `detectSingleUseItems(unit)` — `export function`
- `hasRiderMagicalAttacks(unit)` — plain `function` (only used by `buildRiderTags`)
- `detectItemBonuses(units)` — `export function`
- `isWeaponMagical(w)` — `export function`
- `buildRiderTags(unit, externalGrantedRules)` — `export function`
- `buildMountWeaponTags(w)` — `export function`
- `weaponPoisonTags(w)` — `export function`
- `mergeTagParts(t1, t2)` — `export function`
- `COMBAT_VOWS` array constant — plain `const` (no export)
- `buildItemNames(unit)` — plain `function` (only used by `buildFilteredItems`)
- `buildFilteredItems(u)` — `export function`

- [ ] **Step 2: Delete these functions from `combat-weapons.js` and extend the import**

Delete the 11 functions/constants above from `combat-weapons.js`. Update the import from `./combat-data.js`:

```js
import {
  HAND_WEAPON,
  isCharacter,
  matchRiderWeapons,
  matchMountWeapons,
  detectSingleUseItems,
  detectItemBonuses,
  isWeaponMagical,
  buildRiderTags,
  buildMountWeaponTags,
  weaponPoisonTags,
  mergeTagParts,
  buildFilteredItems,
} from "./combat-data.js";
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all 406 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/context/combat-data.js src/context/combat-weapons.js
git commit -m "refactor: move tag/bonus helpers to combat-data.js"
```

---

### Task 3: Move structure/rules helpers to `combat-data.js`

**Files:**

- Modify: `src/context/combat-data.js`
- Modify: `src/context/combat-weapons.js`

- [ ] **Step 1: Copy structure/rules helpers into `combat-data.js`**

Append these verbatim from `combat-weapons.js`, with `export` where noted:

- `findChampions(unit)` — `export function`
- `getChampionWeapons(unit)` — `export function`
- `findCrewProfiles(unit)` — `export function`
- `findEmbeddedMount(unit)` — `export function`
- `COMBAT_RELEVANT_RULES` array — plain `const`
- `RIDER_ONLY_RULES` Set — plain `const`
- `CAVALRY_TROOP_TYPES` Set — plain `const`
- `extractCombatRules(unit)` — `export function`
- `getUnitLd(u)` — `export function` (this sits between `renderCombatResultContext` and `renderCombatLeadershipContext` in `combat-weapons.js` — search for `function getUnitLd`)

- [ ] **Step 2: Delete these from `combat-weapons.js` and extend the import**

Delete all 9 functions/constants from `combat-weapons.js`. Update the import from `./combat-data.js`:

```js
import {
  HAND_WEAPON,
  isCharacter,
  matchRiderWeapons,
  matchMountWeapons,
  detectSingleUseItems,
  detectItemBonuses,
  isWeaponMagical,
  buildRiderTags,
  buildMountWeaponTags,
  weaponPoisonTags,
  mergeTagParts,
  buildFilteredItems,
  findChampions,
  getChampionWeapons,
  findCrewProfiles,
  findEmbeddedMount,
  extractCombatRules,
  getUnitLd,
} from "./combat-data.js";
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all 406 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/context/combat-data.js src/context/combat-weapons.js
git commit -m "refactor: move structure/rules helpers to combat-data.js"
```

---

### Task 4: Extract `buildCombatEntries` + unit test

**Files:**

- Modify: `src/context/combat-data.js`
- Modify: `src/context/combat-weapons.js`
- Create: `src/test/combat-data.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/test/combat-data.test.js`:

```js
import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";
import { buildCombatEntries } from "../context/combat-data.js";
import { saveCharacterAssignments } from "../state.js";

describe("buildCombatEntries", () => {
  let army;
  beforeEach(() => {
    army = loadArmy("dark-elves");
    saveCharacterAssignments({});
  });

  it("returns entries sorted by initiative descending", () => {
    const rows = buildCombatEntries(army);
    expect(rows.length).toBeGreaterThan(0);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].iNum).toBeLessThanOrEqual(rows[i - 1].iNum);
    }
  });

  it("each entry has required shape", () => {
    const rows = buildCombatEntries(army);
    const entry = rows[0];
    expect(entry).toHaveProperty("unitName");
    expect(Array.isArray(entry.riderWeapons)).toBe(true);
    expect(Array.isArray(entry.mountWeapons)).toBe(true);
    expect(Array.isArray(entry.combatRules)).toBe(true);
    expect(entry).toHaveProperty("iNum");
    expect(entry).toHaveProperty("riderI");
    expect(entry).toHaveProperty("riderA");
  });

  it("deduplicates identical units", () => {
    army = loadArmy("bretonnia");
    const rows = buildCombatEntries(army);
    const keys = rows.map(
      (r) => `${r.unitName}||${r.riderI}||${r.riderA}||${r.t}||${r.w}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test src/test/combat-data.test.js
```

Expected: FAIL — `buildCombatEntries` is not exported from `combat-data.js`.

- [ ] **Step 3: Extract `buildCombatEntries` into `combat-data.js`**

In `combat-weapons.js`, `renderCombatWeaponsContext` starts with an early return for empty armies, then builds `entries` in a big `for` loop over `army.units`, then deduplicates into `deduped`, then sorts into `rows`. Extract everything up to and including the sort — that becomes `buildCombatEntries`. Add to `combat-data.js`:

```js
export function buildCombatEntries(army) {
  if (army.units.length === 0) return [];

  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));
  const charsByUnitId = {};
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (!unitId) continue;
    if (!charsByUnitId[unitId]) charsByUnitId[unitId] = [];
    const charUnit = unitById[charId];
    if (charUnit) charsByUnitId[unitId].push(charUnit);
  }

  const entries = [];

  for (const u of army.units) {
    // paste the full body of the for loop from renderCombatWeaponsContext verbatim here —
    // everything from `if (isCharacter(u) && assignedCharIds.has(u.id)) continue;`
    // through to the closing `});` of entries.push({...}) and `continue;` of the no-stats path
  }

  // Deduplicate — paste the dedup block verbatim:
  const deduped = {};
  for (const e of entries) {
    const riderWKey = e.riderWeapons
      .map((w) => w.name)
      .sort()
      .join(",");
    const mountWKey = e.mountWeapons
      .map((w) => w.name)
      .sort()
      .join(",");
    const itemKey = [...e.itemNames, ...e.singleUseItems.map((i) => i.name)]
      .sort()
      .join(",");
    const key = `${e.unitName}||${e.riderI}||${e.riderA}||${e.t}||${e.w}||${e.as}||${riderWKey}||${mountWKey}||${itemKey}`;
    if (!deduped[key]) {
      deduped[key] = { ...e, merged: false };
    } else {
      deduped[key].merged = true;
    }
  }

  return Object.values(deduped).sort((a, b) => b.iNum - a.iNum);
}
```

The for-loop body is the largest part (~350 lines). Copy it unchanged from `renderCombatWeaponsContext` — it contains no HTML, only plain data object construction.

- [ ] **Step 4: Update `renderCombatWeaponsContext` to use `buildCombatEntries`**

Replace the data-assembly portion of `renderCombatWeaponsContext` (everything before the `function renderSingleUseItems` nested helper) with a single call:

```js
export function renderCombatWeaponsContext(army) {
  const rows = buildCombatEntries(army);
  if (rows.length === 0) return "";

  function renderSingleUseItems(r) { ... }   // nested helpers unchanged for now
  function statRow(t, w, as_, mr, ward, regen) { ... }
  function renderUnitWeapons(r) { ... }
  function renderCombatRulesHtml(rules) { ... }
  function renderBanners(r) { ... }
  function renderFooter(r) { ... }

  return `...`; // HTML template unchanged
}
```

Add `buildCombatEntries` to the import from `./combat-data.js`.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all tests pass, including the new `buildCombatEntries` tests.

- [ ] **Step 6: Commit**

```bash
git add src/context/combat-data.js src/context/combat-weapons.js src/test/combat-data.test.js
git commit -m "refactor: extract buildCombatEntries from renderCombatWeaponsContext"
```

---

### Task 5: Extract `buildCombatResultEntries` + unit test

**Files:**

- Modify: `src/context/combat-data.js`
- Modify: `src/context/combat-weapons.js`
- Modify: `src/test/combat-data.test.js`

- [ ] **Step 1: Write the failing test**

Add to `src/test/combat-data.test.js` (update the import line too):

```js
import {
  buildCombatEntries,
  buildCombatResultEntries,
} from "../context/combat-data.js";

describe("buildCombatResultEntries", () => {
  it("returns entries with static bonus shape", () => {
    const army = loadArmy("bretonnia");
    const rows = buildCombatResultEntries(army);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r).toHaveProperty("name");
      expect(r).toHaveProperty("total");
      expect(r).toHaveProperty("bonuses");
      expect(Array.isArray(r.bonuses)).toBe(true);
    }
  });

  it("excludes units with neither standard nor musician", () => {
    const army = loadArmy("dark-elves");
    const rows = buildCombatResultEntries(army);
    for (const r of rows) {
      const hasAny =
        r.total > 0 || r.bonuses.some((b) => b.includes("Musician"));
      expect(hasAny).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test src/test/combat-data.test.js
```

Expected: FAIL — `buildCombatResultEntries` not exported.

- [ ] **Step 3: Extract `buildCombatResultEntries` into `combat-data.js`**

In `combat-weapons.js`, `renderCombatResultContext` builds `entries`, deduplicates, and sorts. Extract that data portion into `combat-data.js`:

```js
export function buildCombatResultEntries(army) {
  if (army.units.length === 0) return [];

  const entries = [];
  for (const u of army.units) {
    const bonuses = [];
    let total = 0;

    const hasCloseOrder = (u.specialRules || []).some((r) =>
      r.displayName?.toLowerCase().includes("close order"),
    );
    const primaryTroopType = u.stats?.[0]?.troopType?.find(
      (t) => !["Ch", "NCh"].includes(t),
    );
    const isMonsterOrRiddenMonster =
      ["MCr", "Be"].includes(primaryTroopType) || u.mount?.wBonus > 0;
    const isCharacterUnit = ["characters", "lords", "heroes"].includes(
      u.category,
    );
    const closeOrderBlocked =
      (isMonsterOrRiddenMonster || isCharacterUnit) &&
      (u.unitStrength ?? 1) < 10;
    if (hasCloseOrder && !closeOrderBlocked) {
      bonuses.push("Close Order +1");
      total += 1;
    }
    if (u.hasStandard) {
      bonuses.push("Standard +1");
      total += 1;
    }
    if (u.hasMusician) {
      bonuses.push("Musician");
    }

    if (total === 0 && !u.hasMusician) continue;

    entries.push({ name: u.name, strength: u.strength, total, bonuses });
  }

  const deduped = {};
  for (const e of entries) {
    const key = `${e.name}||${e.total}||${e.bonuses.join(",")}`;
    if (!deduped[key]) deduped[key] = { ...e, merged: false };
    else deduped[key].merged = true;
  }

  return Object.values(deduped).sort((a, b) => b.total - a.total);
}
```

- [ ] **Step 4: Update `renderCombatResultContext`**

```js
export function renderCombatResultContext(army) {
  const rows = buildCombatResultEntries(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Static Combat Bonuses</h3>
      <div class="space-y-1">
        ${rows
          .map(
            (r) => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <div class="flex items-center gap-2">
              <span class="text-wh-text">${r.name}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ""}</span>
              <span class="text-wh-phase-combat font-mono text-xs ml-auto">+${r.total}</span>
            </div>
            ${r.bonuses.length > 0 ? `<p class="text-xs text-wh-muted mt-0.5">${r.bonuses.join(", ")}</p>` : ""}
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
```

Add `buildCombatResultEntries` to the import from `./combat-data.js`.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/context/combat-data.js src/context/combat-weapons.js src/test/combat-data.test.js
git commit -m "refactor: extract buildCombatResultEntries from renderCombatResultContext"
```

---

### Task 6: Extract `buildCombatLeadershipData` + unit test

**Files:**

- Modify: `src/context/combat-data.js`
- Modify: `src/context/combat-weapons.js`
- Modify: `src/test/combat-data.test.js`

- [ ] **Step 1: Write the failing test**

Add to `src/test/combat-data.test.js` (update import):

```js
import {
  buildCombatEntries,
  buildCombatResultEntries,
  buildCombatLeadershipData,
} from "../context/combat-data.js";

describe("buildCombatLeadershipData", () => {
  beforeEach(() => {
    saveCharacterAssignments({});
  });

  it("returns rows sorted by leadership descending", () => {
    const army = loadArmy("dark-elves");
    const { rows } = buildCombatLeadershipData(army);
    expect(rows.length).toBeGreaterThan(0);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].ldNum).toBeLessThanOrEqual(rows[i - 1].ldNum);
    }
  });

  it("returns the expected data shape", () => {
    const army = loadArmy("dark-elves");
    const data = buildCombatLeadershipData(army);
    expect(data).toHaveProperty("rows");
    expect(data).toHaveProperty("general");
    expect(data).toHaveProperty("generalLd");
    expect(data).toHaveProperty("generalRange");
    expect(data).toHaveProperty("bsb");
    expect(data).toHaveProperty("bsbRange");
  });

  it("returns empty rows for empty army", () => {
    const { rows } = buildCombatLeadershipData({ units: [] });
    expect(rows).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test src/test/combat-data.test.js
```

Expected: FAIL — `buildCombatLeadershipData` not exported.

- [ ] **Step 3: Extract `buildCombatLeadershipData` into `combat-data.js`**

In `combat-weapons.js`, `renderCombatLeadershipContext` has a data portion (assignment loading, building rows, finding general/bsb) before its return template. Extract it:

```js
export function buildCombatLeadershipData(army) {
  if (army.units.length === 0) {
    return {
      rows: [],
      general: null,
      generalLd: null,
      generalRange: 12,
      bsb: null,
      bsbRange: 12,
    };
  }

  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));
  const charsByUnitId = {};
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (!unitId) continue;
    const charUnit = unitById[charId];
    if (charUnit) {
      if (!charsByUnitId[unitId]) charsByUnitId[unitId] = [];
      charsByUnitId[unitId].push(charUnit);
    }
  }

  const deduped = {};
  for (const u of army.units) {
    if (isCharacter(u) && assignedCharIds.has(u.id)) continue;

    const assignedChars = charsByUnitId[u.id] || [];
    const allLds = [u, ...assignedChars]
      .map((x) => parseInt(getUnitLd(x)) || 0)
      .filter((x) => x > 0);
    const maxLd = allLds.length > 0 ? String(Math.max(...allLds)) : "?";

    const key = `${u.name}||${maxLd}`;
    if (!deduped[key])
      deduped[key] = {
        name: u.name,
        ld: maxLd,
        ldNum: parseInt(maxLd) || 0,
        chars: assignedChars.map((c) => c.name),
      };
  }

  const rows = Object.values(deduped).sort((a, b) => b.ldNum - a.ldNum);

  const general = army.units.find((u) => u.isGeneral) ?? null;
  const bsb = army.units.find((u) => u.isBSB) ?? null;

  let generalLd = null;
  let generalRange = 12;
  if (general) {
    if (general.stats) {
      for (const profile of general.stats) {
        if (profile.Ld && profile.Ld !== "-") {
          generalLd = profile.Ld;
          break;
        }
      }
    }
    const hasLargeTarget =
      (general.specialRules || []).some((r) =>
        r.displayName?.toLowerCase().includes("large target"),
      ) || !!general.mount?.largeTarget;
    if (hasLargeTarget) generalRange = 18;
  }

  let bsbRange = 12;
  if (bsb) {
    const hasLargeTarget =
      (bsb.specialRules || []).some((r) =>
        r.displayName?.toLowerCase().includes("large target"),
      ) || !!bsb.mount?.largeTarget;
    if (hasLargeTarget) bsbRange = 18;
  }

  return { rows, general, generalLd, generalRange, bsb, bsbRange };
}
```

- [ ] **Step 4: Update `renderCombatLeadershipContext`**

```js
export function renderCombatLeadershipContext(army, title = "Break Test") {
  const { rows, general, generalLd, generalRange, bsb, bsbRange } =
    buildCombatLeadershipData(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">${title}</h3>
      ${
        general
          ? `
        <div class="p-2 rounded bg-wh-card mb-2">
          <p class="text-xs"><span class="font-semibold text-wh-text">Inspiring Presence:</span> <span class="text-wh-muted">Units within ${generalRange}" of ${general.name} (Ld${generalLd}) may use their Ld.</span></p>
          ${bsb ? `<p class="text-xs mt-1"><span class="font-semibold text-wh-text">Hold Your Ground:</span> <span class="text-wh-muted">Units within ${bsbRange}" of ${bsb.name} may re-roll Break tests.</span></p>` : ""}
        </div>
      `
          : ""
      }
      <div class="space-y-1">
        ${rows
          .map(
            (r) => `
          <div class="flex items-center gap-2 p-2 rounded bg-wh-card text-sm">
            <div>
              <span class="text-wh-text">${r.name}</span>
              ${r.chars.map((c) => `<div class="text-wh-muted text-xs">${c}</div>`).join("")}
            </div>
            <span class="text-wh-phase-combat font-mono text-xs ml-auto self-start">Ld${r.ld}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
```

Add `buildCombatLeadershipData` to the import from `./combat-data.js`.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/context/combat-data.js src/context/combat-weapons.js src/test/combat-data.test.js
git commit -m "refactor: extract buildCombatLeadershipData from renderCombatLeadershipContext"
```

---

### Task 7: Extract `buildDefensiveStatsEntries` + unit test

**Files:**

- Modify: `src/context/combat-data.js`
- Modify: `src/context/combat-weapons.js`
- Modify: `src/test/combat-data.test.js`

- [ ] **Step 1: Write the failing test**

Add to `src/test/combat-data.test.js` (update import):

```js
import {
  buildCombatEntries,
  buildCombatResultEntries,
  buildCombatLeadershipData,
  buildDefensiveStatsEntries,
} from "../context/combat-data.js";

describe("buildDefensiveStatsEntries", () => {
  it("returns entries with defensive stat shape", () => {
    const army = loadArmy("dark-elves");
    const rows = buildDefensiveStatsEntries(army);
    expect(rows.length).toBeGreaterThan(0);
    const entry = rows[0];
    expect(entry).toHaveProperty("name");
    expect(entry).toHaveProperty("t");
    expect(entry).toHaveProperty("w");
    expect(entry).toHaveProperty("ld");
    expect(entry).toHaveProperty("ldNum");
  });

  it("sorts by leadership descending", () => {
    const army = loadArmy("dark-elves");
    const rows = buildDefensiveStatsEntries(army);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].ldNum).toBeLessThanOrEqual(rows[i - 1].ldNum);
    }
  });

  it("returns empty array for empty army", () => {
    expect(buildDefensiveStatsEntries({ units: [] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test src/test/combat-data.test.js
```

Expected: FAIL — `buildDefensiveStatsEntries` not exported.

- [ ] **Step 3: Extract `buildDefensiveStatsEntries` into `combat-data.js`**

`renderDefensiveStatsContext` is the last function in `combat-weapons.js`. The data portion builds `deduped` and sorts. Add to `combat-data.js`:

```js
export function buildDefensiveStatsEntries(army) {
  if (army.units.length === 0) return [];

  const deduped = {};
  for (const u of army.units) {
    const stats = u.stats?.[0];
    const mount = u.mount ?? null;
    const isRiddenMonster = mount && mount.wBonus > 0;

    const baseT = parseInt(stats?.T) || 0;
    const baseW = parseInt(stats?.W) || 0;
    const t = isRiddenMonster ? `${baseT + mount.tBonus}` : stats?.T || "?";
    const w = isRiddenMonster ? `${baseW + mount.wBonus}` : stats?.W || "?";
    const as = u.armourSave ?? null;
    const ward = u.ward ?? null;
    const regen = u.regen ?? null;

    let ld = "?";
    if (u.stats) {
      for (const profile of u.stats) {
        if (profile.Ld && profile.Ld !== "-") {
          ld = profile.Ld;
          break;
        }
      }
    }

    const hasEvasive = (u.specialRules || []).some((r) =>
      r.displayName?.toLowerCase().includes("evasive"),
    );

    const key = `${u.name}||${t}||${w}||${as}`;
    if (!deduped[key]) {
      deduped[key] = {
        name: u.name,
        strength: u.strength,
        mount: isRiddenMonster ? mount.name : null,
        t,
        w,
        as,
        ward,
        regen,
        ld,
        ldNum: parseInt(ld) || 0,
        hasEvasive,
        merged: false,
      };
    } else {
      deduped[key].merged = true;
    }
  }

  return Object.values(deduped).sort((a, b) => b.ldNum - a.ldNum);
}
```

- [ ] **Step 4: Update `renderDefensiveStatsContext`**

```js
export function renderDefensiveStatsContext(army) {
  const rows = buildDefensiveStatsEntries(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-shooting/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-shooting mb-3">Your Units</h3>
      <div class="space-y-1">
        ${rows
          .map(
            (r) => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex items-center gap-2 flex-wrap text-sm">
              <span class="text-wh-text font-semibold">${r.name}${r.mount ? ` (${r.mount})` : ""}${!r.merged && r.strength > 1 ? ` <span class="text-wh-muted font-normal">x${r.strength}</span>` : ""}</span>
              <span class="text-wh-muted font-mono text-xs">T:${r.t}</span>
              <span class="text-wh-muted font-mono text-xs">W:${r.w}</span>
              ${r.as ? `<span class="text-blue-400 font-mono text-xs">\u{1F6E1}\uFE0FAS:${r.as}</span>` : ""}
              ${r.ward ? `<span class="text-purple-400 font-mono text-xs">\u{1F52E}Ward:${r.ward}</span>` : ""}
              ${r.regen ? `<span class="text-green-400 font-mono text-xs">\u{1F49A}Regen:${r.regen}</span>` : ""}
              ${r.hasEvasive ? '<span class="text-green-400 font-mono text-xs">\u{1F3C3}\u200D\u2640\uFE0FEvasive</span>' : ""}
              <span class="text-wh-muted font-mono text-xs ml-auto">Ld${r.ld}</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
```

Add `buildDefensiveStatsEntries` to the import from `./combat-data.js`.

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/context/combat-data.js src/context/combat-weapons.js src/test/combat-data.test.js
git commit -m "refactor: extract buildDefensiveStatsEntries from renderDefensiveStatsContext"
```

---

### Task 8: Hoist nested render helpers to module level

The six helpers currently defined inside `renderCombatWeaponsContext` become module-level functions in `combat-weapons.js`, making them independently navigable.

**Files:**

- Modify: `src/context/combat-weapons.js`

- [ ] **Step 1: Cut the six nested functions out of `renderCombatWeaponsContext`**

Inside `renderCombatWeaponsContext`, find and cut these six function declarations:

- `function renderSingleUseItems(r)`
- `function statRow(t, w, as_, mr, ward, regen)`
- `function renderUnitWeapons(r)`
- `function renderCombatRulesHtml(rules)`
- `function renderBanners(r)`
- `function renderFooter(r)`

All six take explicit parameters and reference only module-level functions (`renderWeaponLine`, `mergeTagParts`, `weaponPoisonTags`, `renderMountWeapons`) — no closure variables need updating.

- [ ] **Step 2: Paste them as module-level functions before `renderCombatWeaponsContext`**

Insert the six functions immediately before the `export function renderCombatWeaponsContext` line. After this, `renderCombatWeaponsContext` should look like:

```js
export function renderCombatWeaponsContext(army) {
  const rows = buildCombatEntries(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      ...
    </div>
  `;
}
```

No nested function declarations remain inside it.

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/context/combat-weapons.js
git commit -m "refactor: hoist nested render helpers to module level in combat-weapons.js"
```
