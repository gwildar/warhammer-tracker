# Army Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface data-quality and logical warnings to the user after uploading an army list, without blocking gameplay.

**Architecture:** New `src/army-validation.js` exports `validateArmy(rawJson, army)` — a pure function that runs a list of check functions and returns `{ unitName, message }[]`. `setup.js` calls it after `parseArmyList`, stores the result in a module-level variable, and passes it to `renderArmySummary` which renders a dismissible amber panel above the Start button.

**Tech Stack:** Vanilla JS, Vitest, existing fixture JSON files.

---

## File Map

- **Create:** `src/army-validation.js` — validation runner + 5 check functions
- **Create:** `src/test/army-validation.test.js` — unit tests for all checks
- **Modify:** `src/screens/setup.js` — call `validateArmy`, store result, render panel, handle dismiss

---

### Task 1: `validateArmy` skeleton — runner with no checks

**Files:**

- Create: `src/army-validation.js`
- Create: `src/test/army-validation.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/test/army-validation.test.js
import { describe, it, expect } from "vitest";
import { validateArmy } from "../army-validation.js";
import { loadArmy } from "./helpers.js";

describe("validateArmy", () => {
  it("returns empty array for a clean dark-elves army", () => {
    const army = loadArmy("dark-elves");
    const rawJson = {
      game: "the-old-world",
      characters: [],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, army)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: FAIL with "Cannot find module '../army-validation.js'"

- [ ] **Step 3: Create `src/army-validation.js`**

```js
function getRawUnits(rawJson) {
  if (rawJson.game !== "the-old-world") return [];
  return [
    ...(rawJson.characters || []),
    ...(rawJson.core || []),
    ...(rawJson.special || []),
    ...(rawJson.rare || []),
    ...(rawJson.mercenaries || []),
    ...(rawJson.allies || []),
  ];
}

const CHECKS = [];

export function validateArmy(rawJson, army) {
  return CHECKS.flatMap((check) => check(rawJson, army));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/army-validation.js src/test/army-validation.test.js
git commit -m "feat: add validateArmy skeleton with extensible checks runner"
```

---

### Task 2: Check 1 — Shield in multiple data arrays

**Files:**

- Modify: `src/army-validation.js`
- Modify: `src/test/army-validation.test.js`

- [ ] **Step 1: Write failing tests**

```js
// Add to src/test/army-validation.test.js

describe("checkShieldInMultipleArrays", () => {
  it("warns when shield appears in both equipment and options arrays (both active)", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [{ name_en: "Shield", active: true }],
          armor: [{ name_en: "Heavy armour", active: true }],
          options: [{ name_en: "Shield", active: true }],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    const warnings = validateArmy(rawJson, { units: [] });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].unitName).toBe("Baron");
    expect(warnings[0].message).toContain(
      "Shield appears in multiple data fields",
    );
  });

  it("does not warn when shield is only in one array", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [],
          armor: [{ name_en: "Heavy armour", active: true }],
          options: [{ name_en: "Shield", active: true }],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });

  it("does not count inactive equipment entries as a shield array", () => {
    // 'Great weapons (replace shields)' with active: null should not count
    const rawJson = {
      game: "the-old-world",
      core: [
        {
          name_en: "Grave Guard",
          equipment: [
            { name_en: "Great weapons (replace shields)", active: null },
          ],
          armor: [],
          options: [{ name_en: "Shields", active: true }],
        },
      ],
      characters: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: FAIL — `checkShieldInMultipleArrays` not implemented, check not in CHECKS

- [ ] **Step 3: Implement `checkShieldInMultipleArrays` and add to CHECKS**

```js
// Add to src/army-validation.js, before the CHECKS array

function checkShieldInMultipleArrays(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const hasShieldInArray = (arr) =>
      (arr || []).some(
        (e) => e.active === true && e.name_en?.toLowerCase().includes("shield"),
      );
    const count = [unit.equipment, unit.armor, unit.options].filter(
      hasShieldInArray,
    ).length;
    if (count > 1) {
      warnings.push({
        unitName: unit.name_en,
        message:
          "Shield appears in multiple data fields — check your OWB export.",
      });
    }
  }
  return warnings;
}
```

Update CHECKS:

```js
const CHECKS = [checkShieldInMultipleArrays];
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/army-validation.js src/test/army-validation.test.js
git commit -m "feat: add shield-in-multiple-arrays validation check"
```

---

### Task 3: Check 2 — Barding with no active mount

**Files:**

- Modify: `src/army-validation.js`
- Modify: `src/test/army-validation.test.js`

- [ ] **Step 1: Write failing tests**

```js
// Add to src/test/army-validation.test.js

describe("checkBardingWithoutMount", () => {
  it("warns when barding is active but no non-foot mount is selected", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [],
          armor: [],
          options: [{ name_en: "Barding", active: true }],
          mounts: [
            { name_en: "On foot", active: true },
            { name_en: "Barded Warhorse", active: false },
          ],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    const warnings = validateArmy(rawJson, { units: [] });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].unitName).toBe("Baron");
    expect(warnings[0].message).toContain(
      "Barding equipped but no mount is active",
    );
  });

  it("does not warn when barding is active and a mount is selected", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [],
          armor: [],
          options: [{ name_en: "Barding", active: true }],
          mounts: [
            { name_en: "On foot", active: false },
            { name_en: "Barded Warhorse", active: true },
          ],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });

  it("does not warn for fixed cavalry with no mounts[] array", () => {
    // Blood Knights, Knights Errant, etc. have barding in armor but no mounts[] choice
    const rawJson = {
      game: "the-old-world",
      core: [
        {
          name_en: "Blood Knights",
          equipment: [],
          armor: [{ name_en: "Full plate armour, Barding", active: true }],
          options: [],
          mounts: [],
        },
      ],
      characters: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: FAIL — `checkBardingWithoutMount` not implemented

- [ ] **Step 3: Implement `checkBardingWithoutMount` and add to CHECKS**

```js
// Add to src/army-validation.js, before the CHECKS array

function checkBardingWithoutMount(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const mounts = unit.mounts || [];
    if (mounts.length === 0) continue; // fixed cavalry — always mounted, skip

    const hasBarding = [
      ...(unit.equipment || []),
      ...(unit.armor || []),
      ...(unit.options || []),
    ].some(
      (e) => e.active === true && e.name_en?.toLowerCase().includes("barding"),
    );
    if (!hasBarding) continue;

    const hasActiveMount = mounts.some(
      (m) => m.active === true && m.name_en?.toLowerCase() !== "on foot",
    );
    if (!hasActiveMount) {
      warnings.push({
        unitName: unit.name_en,
        message: "Barding equipped but no mount is active.",
      });
    }
  }
  return warnings;
}
```

Update CHECKS:

```js
const CHECKS = [checkShieldInMultipleArrays, checkBardingWithoutMount];
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/army-validation.js src/test/army-validation.test.js
git commit -m "feat: add barding-without-mount validation check"
```

---

### Task 4: Check 3 — Magic weapon + active non-hand mundane weapon

**Files:**

- Modify: `src/army-validation.js`
- Modify: `src/test/army-validation.test.js`

**Context:** The parser's `resolveWeapons` returns early on magic weapons, so `unit.weapons` on the parsed army never contains both simultaneously. This check must inspect raw JSON: `items[n].selected[]` for weapon-type magic items vs `equipment[]` for active non-hand entries.

- [ ] **Step 1: Write failing tests**

```js
// Add to src/test/army-validation.test.js

describe("checkMagicWeaponWithMundane", () => {
  it("warns when magic weapon is equipped alongside an active non-hand mundane weapon", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [
            { name_en: "Hand weapon", active: true },
            { name_en: "Lance", active: true },
          ],
          armor: [],
          options: [],
          items: [{ selected: [{ type: "weapon", name_en: "Frontier Axe" }] }],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    const warnings = validateArmy(rawJson, { units: [] });
    expect(warnings).toHaveLength(1);
    expect(warnings[0].unitName).toBe("Baron");
    expect(warnings[0].message).toContain("Lance");
    expect(warnings[0].message).toContain(
      "only the magic weapon is used in combat",
    );
  });

  it("does not warn when magic weapon is alongside only a hand weapon", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [{ name_en: "Hand weapon", active: true }],
          armor: [],
          options: [],
          items: [{ selected: [{ type: "weapon", name_en: "Frontier Axe" }] }],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });

  it("does not warn when unit has no magic weapon", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [
        {
          name_en: "Baron",
          equipment: [{ name_en: "Lance", active: true }],
          armor: [],
          options: [],
          items: [{ selected: [{ type: "talisman", name_en: "Lucky Charm" }] }],
        },
      ],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    expect(validateArmy(rawJson, { units: [] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: FAIL — `checkMagicWeaponWithMundane` not implemented

- [ ] **Step 3: Implement `checkMagicWeaponWithMundane` and add to CHECKS**

```js
// Add to src/army-validation.js, before the CHECKS array

function checkMagicWeaponWithMundane(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const hasMagicWeapon = (unit.items || []).some((slot) =>
      (slot.selected || []).some((item) => item.type === "weapon"),
    );
    if (!hasMagicWeapon) continue;

    const mundaneWeapons = (unit.equipment || []).filter(
      (e) =>
        e.active === true && !e.name_en?.toLowerCase().includes("hand weapon"),
    );
    for (const w of mundaneWeapons) {
      warnings.push({
        unitName: unit.name_en,
        message: `Magic weapon equipped alongside ${w.name_en} — only the magic weapon is used in combat.`,
      });
    }
  }
  return warnings;
}
```

Update CHECKS:

```js
const CHECKS = [
  checkShieldInMultipleArrays,
  checkBardingWithoutMount,
  checkMagicWeaponWithMundane,
];
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/army-validation.js src/test/army-validation.test.js
git commit -m "feat: add magic-weapon-with-mundane validation check"
```

---

### Task 5: Check 4 — No stat profile

**Files:**

- Modify: `src/army-validation.js`
- Modify: `src/test/army-validation.test.js`

- [ ] **Step 1: Write failing tests**

```js
// Add to src/test/army-validation.test.js

describe("checkNoStatProfile", () => {
  it("warns for a parsed unit with no stats", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    const army = { units: [{ name: "Mysterious Unit", stats: [] }] };
    const warnings = validateArmy(rawJson, army);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].unitName).toBe("Mysterious Unit");
    expect(warnings[0].message).toContain("No stat profile found");
  });

  it("does not warn for units with stats", () => {
    const rawJson = {
      game: "the-old-world",
      characters: [],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    const army = loadArmy("dark-elves");
    const warnings = validateArmy(rawJson, army);
    const statWarnings = warnings.filter((w) =>
      w.message.includes("No stat profile"),
    );
    expect(statWarnings).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: FAIL — `checkNoStatProfile` not implemented

- [ ] **Step 3: Implement `checkNoStatProfile` and add to CHECKS**

```js
// Add to src/army-validation.js, before the CHECKS array

function checkNoStatProfile(rawJson, army) {
  const warnings = [];
  for (const unit of army.units) {
    if (!unit.stats?.length) {
      warnings.push({
        unitName: unit.name,
        message: "No stat profile found — combat display will be incomplete.",
      });
    }
  }
  return warnings;
}
```

Update CHECKS:

```js
const CHECKS = [
  checkShieldInMultipleArrays,
  checkBardingWithoutMount,
  checkMagicWeaponWithMundane,
  checkNoStatProfile,
];
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/army-validation.js src/test/army-validation.test.js
git commit -m "feat: add no-stat-profile validation check"
```

---

### Task 6: Check 5 — Missing vow in Bretonnian Exiles army

**Files:**

- Modify: `src/army-validation.js`
- Modify: `src/test/army-validation.test.js`

**Context:** `bretonnian-exiles.owb.json` has "Knights of the Realm on Foot" with vow options but no active vow — this is a real trigger. The Baron in the same fixture has "The Exile's Vow" active — this should not warn. Non-exiles armies (dark-elves) should never trigger this check.

- [ ] **Step 1: Write failing tests**

```js
// Add to src/test/army-validation.test.js
import bretonnianExilesJson from "./fixtures/bretonnian-exiles.owb.json";
import { parseArmyList } from "../army.js";

describe("checkExilesMissingVow", () => {
  it("warns for vow-eligible units in an Exiles army with no active vow", () => {
    const army = parseArmyList(bretonnianExilesJson);
    const warnings = validateArmy(bretonnianExilesJson, army);
    const vowWarnings = warnings.filter((w) =>
      w.message.includes("No vow is active"),
    );
    // "Knights of the Realm on Foot" has vow options but none active
    expect(
      vowWarnings.some((w) => w.unitName === "Knights of the Realm on Foot"),
    ).toBe(true);
  });

  it("does not warn for vow-eligible units that have an active vow", () => {
    const army = parseArmyList(bretonnianExilesJson);
    const warnings = validateArmy(bretonnianExilesJson, army);
    const vowWarnings = warnings.filter((w) =>
      w.message.includes("No vow is active"),
    );
    // Baron has "The Exile's Vow" active — should not warn
    expect(vowWarnings.some((w) => w.unitName === "Baron")).toBe(false);
  });

  it("does not warn for non-vow units in the Exiles army", () => {
    const army = parseArmyList(bretonnianExilesJson);
    const warnings = validateArmy(bretonnianExilesJson, army);
    const vowWarnings = warnings.filter((w) =>
      w.message.includes("No vow is active"),
    );
    // Peasant Bowmen have no vow options — must not appear
    expect(vowWarnings.some((w) => w.unitName === "Peasant Bowmen")).toBe(
      false,
    );
  });

  it("does not warn for non-Exiles armies", () => {
    const army = loadArmy("dark-elves");
    const rawJson = {
      game: "the-old-world",
      armyComposition: "dark-elves",
      characters: [],
      core: [],
      special: [],
      rare: [],
      mercenaries: [],
      allies: [],
    };
    const warnings = validateArmy(rawJson, army);
    const vowWarnings = warnings.filter((w) =>
      w.message.includes("No vow is active"),
    );
    expect(vowWarnings).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: FAIL — `checkExilesMissingVow` not implemented

- [ ] **Step 3: Implement `checkExilesMissingVow` and add to CHECKS**

```js
// Add to src/army-validation.js, before the CHECKS array

function checkExilesMissingVow(rawJson) {
  if (rawJson.armyComposition !== "bretonnian-exiles") return [];
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const vowOptions = (unit.options || []).filter((o) =>
      o.name_en?.toLowerCase().includes("vow"),
    );
    if (vowOptions.length === 0) continue; // not vow-eligible
    const hasActiveVow = vowOptions.some((o) => o.active === true);
    if (!hasActiveVow) {
      warnings.push({
        unitName: unit.name_en,
        message: "No vow is active — is this correct?",
      });
    }
  }
  return warnings;
}
```

Update CHECKS:

```js
const CHECKS = [
  checkShieldInMultipleArrays,
  checkBardingWithoutMount,
  checkMagicWeaponWithMundane,
  checkNoStatProfile,
  checkExilesMissingVow,
];
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/test/army-validation.test.js
```

Expected: PASS

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all tests pass (417 + new army-validation tests)

- [ ] **Step 6: Commit**

```bash
git add src/army-validation.js src/test/army-validation.test.js
git commit -m "feat: add exiles-missing-vow validation check"
```

---

### Task 7: Warning panel in `renderArmySummary`

**Files:**

- Modify: `src/screens/setup.js`
- Modify: `src/test/screens/setup.test.js`

**Context:** `renderArmySummary` currently at line 145 of `src/screens/setup.js`. It's exported and takes one argument `(army)`. Change signature to `(army, warnings = [])`. Add a `renderWarningPanel` helper and insert the panel between the unit list and the Start/Replace buttons.

- [ ] **Step 1: Write failing tests**

`renderArmySummary` returns an HTML string — write it to `getApp().innerHTML` to query it.

```js
// Add to the "with Dark Elves army" describe block in src/test/screens/setup.test.js

it("shows warning panel when warnings are provided", () => {
  getApp().innerHTML = renderArmySummary(army, [
    { unitName: "Dreadlord", message: "test warning" },
  ]);
  const panel = getApp().querySelector("#validation-warnings");
  expect(panel).toBeTruthy();
  expect(panel.textContent).toContain("Dreadlord");
  expect(panel.textContent).toContain("test warning");
  expect(panel.textContent).toContain("1 warning");
});

it("does not show warning panel when no warnings", () => {
  getApp().innerHTML = renderArmySummary(army, []);
  expect(getApp().querySelector("#validation-warnings")).toBeFalsy();
});
```

Add this import at the top of the test file:

```js
import { renderArmySummary } from "../../screens/setup.js";
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/screens/setup.test.js
```

Expected: FAIL — `renderArmySummary` doesn't accept warnings, no panel rendered

- [ ] **Step 3: Add `renderWarningPanel` and update `renderArmySummary` signature**

In `src/screens/setup.js`, add `renderWarningPanel` just before `renderArmySummary`:

```js
function renderWarningPanel(warnings) {
  const byUnit = {};
  for (const w of warnings) {
    if (!byUnit[w.unitName]) byUnit[w.unitName] = [];
    byUnit[w.unitName].push(w.message);
  }
  const unitHtml = Object.entries(byUnit)
    .map(
      ([name, messages]) => `
      <div class="mb-2 last:mb-0">
        <div class="font-semibold text-sm text-amber-200">${name}</div>
        ${messages.map((m) => `<div class="text-sm text-wh-muted ml-2">• ${m}</div>`).join("")}
      </div>`,
    )
    .join("");
  const count = warnings.length;
  return `
    <div id="validation-warnings" class="mb-4 p-3 rounded-lg border border-amber-400/40 bg-amber-400/10">
      <div class="flex justify-between items-start">
        <span class="text-amber-400 text-sm font-semibold">&#9888; ${count} warning${count !== 1 ? "s" : ""} — check before playing</span>
        <button id="dismiss-warnings-btn" class="text-wh-muted hover:text-wh-text transition-colors text-sm ml-3 leading-none">&#215;</button>
      </div>
      <div class="mt-2">${unitHtml}</div>
    </div>`;
}
```

Change `renderArmySummary` signature and insert panel:

```js
export function renderArmySummary(army, warnings = []) {
  const totalPts = army.units.reduce((sum, u) => sum + u.points, 0);
  const totalUS = army.units.reduce((sum, u) => sum + (u.unitStrength ?? 0), 0);

  return `
    <div class="mt-4">
      <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h2 class="text-xl font-bold text-wh-accent">${army.name}</h2>
            <p class="text-wh-muted text-sm">${army.faction}${army.composition ? " — " + formatSlug(army.composition) : ""}</p>
            <p class="text-wh-muted text-sm">Total Army Unit Strength ${totalUS}</p>
          </div>
          <div class="text-right">
            <div class="text-wh-accent font-mono text-lg">${totalPts} pts</div>
          </div>
        </div>

        <div class="space-y-1 mb-4">
          ${renderUnitList(army)}
        </div>

        ${warnings.length > 0 ? renderWarningPanel(warnings) : ""}

        <div class="flex gap-2">
          <button id="start-game-btn"
            class="flex-1 bg-wh-accent text-wh-bg py-3 rounded-lg font-bold text-lg
                   hover:bg-wh-accent-dim transition-colors">
            Start Game
          </button>
          <button id="replace-army-btn"
            class="bg-wh-card text-wh-muted px-4 py-3 rounded-lg border border-wh-border
                   hover:text-wh-text hover:border-wh-accent transition-colors">
            Replace
          </button>
        </div>
      </div>

    </div>
  `;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/test/screens/setup.test.js
```

Expected: PASS

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/screens/setup.js src/test/screens/setup.test.js
git commit -m "feat: add warning panel to army summary screen"
```

---

### Task 8: Wire `validateArmy` in `setup.js` — upload, storage, and dismiss

**Files:**

- Modify: `src/screens/setup.js`
- Modify: `src/test/screens/setup.test.js`

**Context:** `handleFile` is at line 271. `renderSetupScreen` calls `renderArmySummary(army)` at line 48 (inside the template string). `bindArmyActions` is at line 294. Add `currentWarnings` module-level variable, `setCurrentWarnings` export for testing, call `validateArmy` in `handleFile`, pass `currentWarnings` to `renderArmySummary`, bind dismiss in `bindArmyActions`, clear on replace.

- [ ] **Step 1: Write failing tests**

```js
// Add to src/test/screens/setup.test.js
import { setCurrentWarnings } from "../../screens/setup.js";

describe("warning panel integration", () => {
  beforeEach(() => {
    loadArmy("dark-elves");
  });

  it("shows warning panel when currentWarnings has entries", () => {
    setCurrentWarnings([{ unitName: "Dreadlord", message: "test warning" }]);
    renderSetupScreen();
    expect(getApp().querySelector("#validation-warnings")).toBeTruthy();
    expect(getApp().textContent).toContain("test warning");
  });

  it("hides warning panel after dismiss is clicked", () => {
    setCurrentWarnings([{ unitName: "Dreadlord", message: "test warning" }]);
    renderSetupScreen();
    getApp().querySelector("#dismiss-warnings-btn").click();
    expect(getApp().querySelector("#validation-warnings")).toBeFalsy();
  });

  it("does not show warning panel when warnings are empty", () => {
    setCurrentWarnings([]);
    renderSetupScreen();
    expect(getApp().querySelector("#validation-warnings")).toBeFalsy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/test/screens/setup.test.js
```

Expected: FAIL — `setCurrentWarnings` not exported, `currentWarnings` not wired

- [ ] **Step 3: Add `validateArmy` import and `currentWarnings` to `setup.js`**

Add import at top of `src/screens/setup.js` (after existing imports):

```js
import { validateArmy } from "../army-validation.js";
```

Add module-level variable and export just after the `const allSubPhases = getAllSubPhases();` line:

```js
let currentWarnings = [];

export function setCurrentWarnings(w) {
  currentWarnings = w;
}
```

- [ ] **Step 4: Wire `validateArmy` in `handleFile` and pass warnings to `renderArmySummary`**

In `handleFile`, change:

```js
const army = parseArmyList(json);
saveArmy(army);
```

to:

```js
const army = parseArmyList(json);
currentWarnings = validateArmy(json, army);
saveArmy(army);
```

In `renderSetupScreen`, change:

```js
${army ? renderArmySummary(army) : renderUploadSection()}
```

to:

```js
${army ? renderArmySummary(army, currentWarnings) : renderUploadSection()}
```

- [ ] **Step 5: Bind dismiss and clear on replace in `bindArmyActions`**

In `bindArmyActions`, add the dismiss handler and update the replace handler:

```js
function bindArmyActions() {
  document.getElementById("start-game-btn").addEventListener("click", () => {
    const firstTurn = getFirstTurn();
    if (!firstTurn) {
      const army = getArmy();
      const casters = getCasters(army);
      navigate(casters.length > 0 ? "/spell-selection" : "/unit-assignment");
    } else if (getIsOpponentTurn()) {
      navigate(`/opponent/${getRound()}/${PHASES[getPhaseIndex()].id}`);
    } else {
      const { phase, subPhase } = allSubPhases[getPhaseIndex()];
      navigate(`/game/${getRound()}/${phase.id}/${subPhase.id}`);
    }
  });

  document.getElementById("replace-army-btn").addEventListener("click", () => {
    clearArmy();
    currentWarnings = [];
    renderSetupScreen();
  });

  document
    .getElementById("dismiss-warnings-btn")
    ?.addEventListener("click", () => {
      currentWarnings = [];
      renderSetupScreen();
    });
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx vitest run src/test/screens/setup.test.js
```

Expected: PASS

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
git add src/screens/setup.js src/test/screens/setup.test.js
git commit -m "feat: wire army validation warnings into setup screen with dismiss"
```
