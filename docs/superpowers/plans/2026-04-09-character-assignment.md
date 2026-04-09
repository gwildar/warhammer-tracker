# Character Assignment & Combat Merging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a character assignment screen before turn selection so players can place characters inside units; on the combat screen, assigned characters merge into their host unit's card with aggregated MR, banner AP modifiers shown on weapon profiles, and conditional strength modifiers displayed inline with footnotes.

**Architecture:** A new `unit-assignment.js` screen uses native HTML5 drag-and-drop (no library) to assign characters to units, saving to a new `tow-character-assignments` localStorage key. `combat-weapons.js` loads these assignments before building entries, skips assigned characters from top-level rendering, merges their data into the host unit's card, and passes banner modifiers through to each `renderWeaponLine` call.

**Tech Stack:** Vanilla JS, native HTML5 Drag-and-Drop API, Tailwind CSS, Vitest + jsdom

---

## File Structure

| File                                       | Status | Purpose                                                                     |
| ------------------------------------------ | ------ | --------------------------------------------------------------------------- |
| `src/state.js`                             | Modify | Add `tow-character-assignments` key + CRUD; update `clearArmy`              |
| `src/screens/unit-assignment.js`           | Create | The new character assignment screen                                         |
| `src/test/screens/unit-assignment.test.js` | Create | Tests for the assignment screen                                             |
| `src/main.js`                              | Modify | Register `unitAssignmentScreen`                                             |
| `src/screens/setup.js`                     | Modify | Navigate to `unitAssignmentScreen` instead of `firstTurnScreen` on new game |
| `src/data/magic-items.js`                  | Modify | Add `apMod: -1` to Banner of Har Ganeth                                     |
| `src/context/combat-weapons.js`            | Modify | Major: skip assigned chars, merge into host, apply banner effects           |
| `src/test/screens/game.test.js`            | Modify | Tests for merged unit display and banner modifiers                          |

---

### Task 1: State layer — character assignments

**Files:**

- Modify: `src/state.js`

- [ ] **Step 1: Write failing tests**

Add to `src/test/screens/game.test.js` (or a new `src/test/state.test.js`):

```js
import { describe, it, expect, beforeEach } from "vitest";
import {
  saveCharacterAssignments,
  getCharacterAssignments,
  clearArmy,
  saveArmy,
} from "../../state.js";

describe("character assignments state", () => {
  it("defaults to empty object", () => {
    expect(getCharacterAssignments()).toEqual({});
  });

  it("saves and loads assignments", () => {
    saveCharacterAssignments({ "duke.abc": "knights.xyz" });
    expect(getCharacterAssignments()).toEqual({ "duke.abc": "knights.xyz" });
  });

  it("clearArmy removes assignments", () => {
    saveCharacterAssignments({ "duke.abc": "knights.xyz" });
    clearArmy();
    expect(getCharacterAssignments()).toEqual({});
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep -A3 "character assignments state"
```

Expected: FAIL — `saveCharacterAssignments is not a function`

- [ ] **Step 3: Add assignments to `src/state.js`**

In the `KEYS` object, add after `startTime`:

```js
assignments: "tow-character-assignments",
```

In `clearArmy()`, add the new key:

```js
export function clearArmy() {
  localStorage.removeItem(KEYS.army);
  localStorage.removeItem(KEYS.spellSelections);
  localStorage.removeItem(KEYS.assignments);
}
```

After `clearArmy`, add the new functions:

```js
// Character assignments: { [characterId]: unitId }
export function getCharacterAssignments() {
  return load(KEYS.assignments, {});
}

export function saveCharacterAssignments(assignments) {
  save(KEYS.assignments, assignments);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/state.js src/test/state.test.js
git commit -m "feat: add character assignments to localStorage state"
```

---

### Task 2: Unit assignment screen

**Files:**

- Create: `src/screens/unit-assignment.js`
- Create: `src/test/screens/unit-assignment.test.js`

The screen layout: characters on the left (draggable pool), units on the right (drop zones). Dropping a character onto a unit assigns it and saves to localStorage immediately. The "Save & Continue" button navigates to the first-turn screen.

- [ ] **Step 1: Write failing tests**

Create `src/test/screens/unit-assignment.test.js`:

```js
import { describe, it, expect, beforeEach } from "vitest";
import { renderUnitAssignmentScreen } from "../../screens/unit-assignment.js";
import { getApp, loadArmy } from "../helpers.js";
import { getCharacterAssignments } from "../../state.js";

describe("Unit assignment screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnia");
  });

  it("renders a character pool and units list", () => {
    renderUnitAssignmentScreen(army);
    expect(getApp().querySelector("#char-pool")).toBeTruthy();
    expect(getApp().querySelector("#units-list")).toBeTruthy();
  });

  it("renders a card for each character unit", () => {
    renderUnitAssignmentScreen(army);
    const charCards = getApp().querySelectorAll("[data-char-id]");
    const charUnits = army.units.filter((u) =>
      ["characters", "lords", "heroes"].includes(u.category),
    );
    expect(charCards.length).toBe(charUnits.length);
  });

  it("renders a drop zone for each non-character unit", () => {
    renderUnitAssignmentScreen(army);
    const dropZones = getApp().querySelectorAll("[data-unit-id]");
    const regularUnits = army.units.filter(
      (u) => !["characters", "lords", "heroes"].includes(u.category),
    );
    expect(dropZones.length).toBe(regularUnits.length);
  });

  it("shows magic item names on character cards", () => {
    // Use a unit with known magic items
    const charWithItems = army.units.find(
      (u) =>
        ["characters", "lords", "heroes"].includes(u.category) &&
        u.magicItems?.length > 0,
    );
    if (!charWithItems) return; // skip if fixture has no chars with items
    renderUnitAssignmentScreen(army);
    const card = getApp().querySelector(`[data-char-id="${charWithItems.id}"]`);
    expect(card.textContent).toContain(charWithItems.magicItems[0].name);
  });

  it("save button exists", () => {
    renderUnitAssignmentScreen(army);
    expect(getApp().querySelector("#save-assignments-btn")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test src/test/screens/unit-assignment.test.js 2>&1 | head -20
```

Expected: FAIL — `Cannot find module`

- [ ] **Step 3: Create `src/screens/unit-assignment.js`**

```js
import { getCharacterAssignments, saveCharacterAssignments } from "../state.js";
import { navigate } from "../navigate.js";

const app = document.getElementById("app");

const CHARACTER_CATEGORIES = new Set(["characters", "lords", "heroes"]);

function isCharacter(unit) {
  return CHARACTER_CATEGORIES.has(unit.category);
}

function renderMagicItemNames(unit) {
  if (!unit.magicItems?.length) return "";
  const names = unit.magicItems.map((i) => i.name).join(", ");
  return `<div class="text-wh-muted text-[10px] mt-0.5">${names}</div>`;
}

function renderCharCard(char) {
  return `
    <div class="p-2 rounded bg-wh-card border border-wh-border cursor-grab active:cursor-grabbing mb-2"
      draggable="true"
      data-char-id="${char.id}">
      <div class="text-sm font-semibold text-wh-text">${char.name}</div>
      ${renderMagicItemNames(char)}
    </div>
  `;
}

function renderAssignedChar(char) {
  return `
    <div class="flex items-center justify-between mt-1 text-xs text-wh-accent"
      data-assigned-char="${char.id}">
      <span>${char.name}</span>
      <button class="remove-char-btn ml-2 text-wh-red hover:opacity-75" data-char-id="${char.id}">✕</button>
    </div>
  `;
}

function renderUnitCard(unit, assignedChars) {
  return `
    <div class="p-2 rounded border border-wh-border bg-wh-surface mb-2 unit-drop-zone"
      data-unit-id="${unit.id}">
      <div class="text-sm font-semibold text-wh-text">${unit.name}</div>
      ${renderMagicItemNames(unit)}
      <div class="assigned-chars min-h-[8px]">
        ${assignedChars.map(renderAssignedChar).join("")}
      </div>
    </div>
  `;
}

export function renderUnitAssignmentScreen(army) {
  const assignments = getCharacterAssignments(); // { charId: unitId }
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));

  // Build reverse map: unitId → assigned char objects
  const charsByUnitId = {};
  for (const unit of army.units.filter((u) => !isCharacter(u))) {
    charsByUnitId[unit.id] = [];
  }
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (unitId && charsByUnitId[unitId]) {
      const charUnit = unitById[charId];
      if (charUnit) charsByUnitId[unitId].push(charUnit);
    }
  }

  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );

  const characters = army.units.filter(isCharacter);
  const regularUnits = army.units.filter((u) => !isCharacter(u));
  const unassignedChars = characters.filter((c) => !assignedCharIds.has(c.id));

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-4xl mx-auto">
          <p class="text-sm text-wh-muted">Place characters in units (optional)</p>
          <h1 class="text-xl font-bold text-wh-accent">${army.name}</h1>
          <button id="save-assignments-btn"
            class="px-4 py-2 bg-wh-accent text-wh-bg rounded text-sm font-semibold hover:opacity-90">
            Save &amp; Continue
          </button>
        </div>
      </header>
      <main class="flex-1 p-4 max-w-4xl mx-auto w-full flex gap-4">
        <div class="w-1/3 shrink-0">
          <h2 class="text-xs font-bold text-wh-muted mb-2 uppercase tracking-wide">Characters</h2>
          <div id="char-pool"
            class="min-h-12 rounded border border-dashed border-wh-border p-2"
            data-pool="true">
            ${unassignedChars.map(renderCharCard).join("")}
          </div>
        </div>
        <div class="flex-1">
          <h2 class="text-xs font-bold text-wh-muted mb-2 uppercase tracking-wide">Units</h2>
          <div id="units-list">
            ${regularUnits
              .map((unit) => renderUnitCard(unit, charsByUnitId[unit.id] || []))
              .join("")}
          </div>
        </div>
      </main>
    </div>
  `;

  bindDragDrop(army);

  document
    .getElementById("save-assignments-btn")
    .addEventListener("click", () => {
      navigate("firstTurnScreen", army);
    });
}

function bindDragDrop(army) {
  // Draggable character cards
  document.querySelectorAll("[data-char-id][draggable]").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.charId);
      el.classList.add("opacity-50");
    });
    el.addEventListener("dragend", () => {
      el.classList.remove("opacity-50");
    });
  });

  // Drop zones: unit cards + the unassigned pool
  const dropTargets = [
    ...document.querySelectorAll(".unit-drop-zone"),
    document.getElementById("char-pool"),
  ];

  for (const zone of dropTargets) {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("border-wh-accent");
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("border-wh-accent");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("border-wh-accent");
      const charId = e.dataTransfer.getData("text/plain");
      if (!charId) return;
      const assignments = getCharacterAssignments();
      const unitId = zone.dataset.unitId || null;
      if (unitId) {
        assignments[charId] = unitId;
      } else {
        delete assignments[charId];
      }
      saveCharacterAssignments(assignments);
      renderUnitAssignmentScreen(army);
    });
  }

  // Remove buttons (un-assign a character)
  document.querySelectorAll(".remove-char-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const assignments = getCharacterAssignments();
      delete assignments[btn.dataset.charId];
      saveCharacterAssignments(assignments);
      renderUnitAssignmentScreen(army);
    });
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test src/test/screens/unit-assignment.test.js
```

Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/screens/unit-assignment.js src/test/screens/unit-assignment.test.js
git commit -m "feat: add character assignment screen with drag-and-drop"
```

---

### Task 3: Navigation wiring

**Files:**

- Modify: `src/main.js`
- Modify: `src/screens/setup.js`

- [ ] **Step 1: Write a failing test**

Add to `src/test/screens/setup.test.js`:

```js
it("start game navigates to unit assignment screen on new game", () => {
  const army = loadArmy("bretonnia");
  renderSetupScreen();
  // firstTurn is null (cleared in beforeEach), so clicking Start Game should
  // go to unitAssignmentScreen. We can verify by checking the DOM changes.
  const btn = getApp().querySelector("#start-game-btn");
  btn.click();
  // After click, app should show the assignment screen header
  expect(getApp().textContent).toContain("Place characters in units");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test src/test/screens/setup.test.js 2>&1 | grep -A5 "unit assignment screen"
```

Expected: FAIL — `unitAssignmentScreen` not registered

- [ ] **Step 3: Register the screen in `src/main.js`**

Add import after the first-turn import line:

```js
import { renderUnitAssignmentScreen } from "./screens/unit-assignment.js";
```

Add registration after the existing `registerScreen("firstTurnScreen", ...)` line:

```js
registerScreen("unitAssignmentScreen", renderUnitAssignmentScreen);
```

- [ ] **Step 4: Update `src/screens/setup.js` line 243**

In `bindArmyActions()`, change the navigation when `firstTurn` is null:

```js
// Before:
navigate("firstTurnScreen", getArmy());
// After:
navigate("unitAssignmentScreen", getArmy());
```

The full `bindArmyActions` function after the change (lines 239-255):

```js
function bindArmyActions() {
  document.getElementById("start-game-btn").addEventListener("click", () => {
    const firstTurn = getFirstTurn();
    if (!firstTurn) {
      navigate("unitAssignmentScreen", getArmy());
    } else if (getIsOpponentTurn()) {
      navigate("opponentTurnScreen", getArmy());
    } else {
      navigate("gameScreen", getArmy());
    }
  });

  document.getElementById("replace-army-btn").addEventListener("click", () => {
    clearArmy();
    navigate("render");
  });
}
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/main.js src/screens/setup.js
git commit -m "feat: wire unit assignment screen into navigation flow"
```

---

### Task 4: Banner data — add apMod field

**Files:**

- Modify: `src/data/magic-items.js`

The Banner of Har Ganeth improves all combat weapon AP by 1 (unconditionally). Add `apMod: -1` to its data. (`apMod` is negative because AP values are negative — -1 means "improve AP by 1", making -1 become -2, and "—" become "-1".)

- [ ] **Step 1: Write a failing test**

Add to `src/test/screens/game.test.js` in a suitable describe block — create a minimal army inline:

```js
describe("Banner of Har Ganeth AP modifier", () => {
  it("banner apMod field exists on Banner of Har Ganeth", async () => {
    const { MAGIC_ITEMS } = await import("../../data/magic-items.js");
    const banner = MAGIC_ITEMS.find((i) => i.name === "Banner of Har Ganeth");
    expect(banner).toBeTruthy();
    expect(banner.apMod).toBe(-1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test 2>&1 | grep -A5 "Banner of Har Ganeth AP"
```

Expected: FAIL — `expect(undefined).toBe(-1)`

- [ ] **Step 3: Add `apMod` to Banner of Har Ganeth in `src/data/magic-items.js`**

Find the Banner of Har Ganeth entry (around line 764) and add `apMod: -1`:

```js
{
  name: "Banner of Har Ganeth",
  type: "banner",
  points: 25,
  effect:
    "The unit improves the Armour Piercing characteristic of its combat weapons by 1.",
  phases: ["combat"],
  apMod: -1,
},
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/data/magic-items.js
git commit -m "feat: add apMod field to Banner of Har Ganeth"
```

---

### Task 5: Combat screen — character merging and banner effects

**Files:**

- Modify: `src/context/combat-weapons.js`
- Modify: `src/test/screens/game.test.js`

This is the largest task. The changes are:

1. Add helper functions: `isCharacter`, `applyApMod`
2. Modify `detectItemBonuses` to accept an array of units and return `apMod`, `conditionalStrengthMods`, `unconditionalStrengthMods`
3. Update `buildRiderTags` to use the new signature
4. Extend `renderWeaponLine` with an optional `options` param for `apMod` and `conditionalSMods`
5. Modify `renderCombatWeaponsContext` to load assignments, skip assigned chars, add them to their host's entry, aggregate MR, and pass banner effects through

- [ ] **Step 1: Write failing tests**

Add a describe block to `src/test/screens/game.test.js`:

```js
describe("Combat screen with assigned characters", () => {
  // Build a minimal army: one character (with MR and Banner of Har Ganeth)
  // assigned to one regular unit. Verify:
  // 1. Character does not appear as a separate card
  // 2. Host unit shows character's name in its card
  // 3. Host unit shows aggregated MR
  // 4. Weapon AP reflects the banner modifier

  function buildMinimalArmy() {
    return {
      name: "Test",
      armySlug: "test",
      faction: "Test",
      points: 100,
      composition: null,
      units: [
        {
          id: "char.001",
          name: "Lord Alaric",
          category: "characters",
          strength: 1,
          points: 200,
          stats: [
            {
              M: "4",
              WS: "6",
              BS: "3",
              S: "4",
              T: "3",
              W: "3",
              I: "5",
              A: "3",
              Ld: "9",
              Name: "Lord Alaric",
            },
          ],
          weapons: [
            {
              name: "Hand Weapon",
              s: "S",
              ap: "—",
              rules: "",
              magical: false,
              attacks: null,
              reservedAttacks: null,
            },
          ],
          shootingWeapons: [],
          magicItems: [
            {
              name: "Banner of Har Ganeth",
              type: "banner",
              points: 25,
              effect: "",
              phases: ["combat"],
              apMod: -1,
            },
          ],
          specialRules: [],
          mount: null,
          armourSave: null,
          ward: null,
          regen: null,
          magicResistance: "-1",
          poisonedAttacks: false,
          stomp: null,
          impactHits: null,
          isGeneral: false,
          isBSB: false,
          hasStandard: false,
          hasMusician: false,
          isCaster: false,
          lores: [],
          activeLore: null,
          factionLores: [],
          champions: [],
          crew: [],
        },
        {
          id: "knights.002",
          name: "Knights Errant",
          category: "core",
          strength: 5,
          points: 150,
          stats: [
            {
              M: "8",
              WS: "3",
              BS: "3",
              S: "3",
              T: "3",
              W: "1",
              I: "3",
              A: "1",
              Ld: "7",
              Name: "Knight Errant",
            },
          ],
          weapons: [
            {
              name: "Lance",
              s: "S+2",
              ap: "-2",
              rules: "Armour Bane (1). Charge turn only.",
              magical: false,
              attacks: null,
              reservedAttacks: null,
            },
          ],
          shootingWeapons: [],
          magicItems: [],
          specialRules: [],
          mount: null,
          armourSave: "2+",
          ward: null,
          regen: null,
          magicResistance: null,
          poisonedAttacks: false,
          stomp: null,
          impactHits: null,
          isGeneral: false,
          isBSB: false,
          hasStandard: false,
          hasMusician: false,
          isCaster: false,
          lores: [],
          activeLore: null,
          factionLores: [],
          champions: [],
          crew: [],
        },
      ],
    };
  }

  beforeEach(() => {
    const army = buildMinimalArmy();
    saveArmy(army);
    saveCharacterAssignments({ "char.001": "knights.002" });
    startGame(army);
    savePhaseIndex(0); // combat phase
  });

  it("assigned character does not appear as a standalone combat card", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const cards = [...combatPanel.querySelectorAll(".bg-wh-card")];
    const charCards = cards.filter(
      (c) =>
        c.textContent.includes("Lord Alaric") &&
        !c.textContent.includes("Knights Errant"),
    );
    expect(charCards.length).toBe(0);
  });

  it("host unit card contains the assigned character's name", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    expect(knightsCard.textContent).toContain("Lord Alaric");
  });

  it("aggregates MR from assigned character onto host unit", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    expect(knightsCard.textContent).toContain("MR:");
  });

  it("shows modified AP on Lance when Banner of Har Ganeth is in unit", () => {
    const army = buildMinimalArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    // Lance base AP is -2; with banner apMod -1 → should display AP-3
    expect(knightsCard.textContent).toContain("AP-3");
    expect(knightsCard.textContent).not.toContain("AP-2");
  });
});

describe("Errantry Banner conditional strength display", () => {
  function buildErrantryArmy() {
    return {
      name: "Test",
      armySlug: "test",
      faction: "Test",
      points: 100,
      composition: null,
      units: [
        {
          id: "knights.003",
          name: "Knights Errant",
          category: "core",
          strength: 5,
          points: 180,
          stats: [
            {
              M: "8",
              WS: "3",
              BS: "3",
              S: "3",
              T: "3",
              W: "1",
              I: "3",
              A: "1",
              Ld: "7",
              Name: "Knight Errant",
            },
          ],
          weapons: [
            {
              name: "Lance",
              s: "S+2",
              ap: "-2",
              rules: "Armour Bane (1). Charge turn only.",
              magical: false,
              attacks: null,
              reservedAttacks: null,
            },
          ],
          shootingWeapons: [],
          magicItems: [
            {
              name: "Errantry Banner",
              type: "banner",
              points: 30,
              effect: "",
              phases: ["combat"],
              strengthMod: "+1 on charge",
            },
          ],
          specialRules: [],
          mount: null,
          armourSave: "2+",
          ward: null,
          regen: null,
          magicResistance: null,
          poisonedAttacks: false,
          stomp: null,
          impactHits: null,
          isGeneral: false,
          isBSB: false,
          hasStandard: false,
          hasMusician: false,
          isCaster: false,
          lores: [],
          activeLore: null,
          factionLores: [],
          champions: [],
          crew: [],
        },
      ],
    };
  }

  beforeEach(() => {
    const army = buildErrantryArmy();
    saveArmy(army);
    saveCharacterAssignments({});
    startGame(army);
    savePhaseIndex(0);
  });

  it("shows conditional strength asterisk on Lance weapon line", () => {
    const army = buildErrantryArmy();
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const knightsCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (c) => c.textContent.includes("Knights Errant"),
    );
    // Lance with S+2 at unit S3: display is "S3+2+1*"
    expect(knightsCard.textContent).toContain("3+2+1*");
    // Footnote appears
    expect(knightsCard.textContent).toContain("Errantry Banner");
  });
});
```

Note: `saveCharacterAssignments` and `saveArmy` must be imported at the top of `game.test.js`.

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep -E "FAIL|assigned character|aggregates MR|modified AP|conditional strength"
```

Expected: multiple FAIL

- [ ] **Step 3: Add helper functions near the top of `src/context/combat-weapons.js`**

After the `HAND_WEAPON` const (line 4), add:

```js
const CHARACTER_CATEGORIES = new Set(["characters", "lords", "heroes"]);

function isCharacter(unit) {
  return CHARACTER_CATEGORIES.has(unit.category);
}

function applyApMod(ap, mod) {
  if (!mod) return ap;
  if (!ap || ap === "—") return `${mod}`;
  const result = parseInt(ap, 10) + mod;
  return result >= 0 ? "—" : `${result}`;
}
```

- [ ] **Step 4: Modify `detectItemBonuses` to accept an array and return new fields**

Replace the existing `detectItemBonuses` function (lines 203-212):

```js
function detectItemBonuses(units) {
  let armourBane = 0;
  let apMod = 0;
  const conditionalStrengthMods = []; // {numeric, condition, source} — shown as S+1* with footnote
  const unconditionalStrengthMods = []; // "+1" strings — shown as inline tags

  for (const unit of units) {
    for (const item of unit.magicItems || []) {
      if (item.championOnly) continue;
      if (item.armourBane) armourBane += item.armourBane;
      if (item.apMod) apMod += item.apMod;
      if (item.strengthMod) {
        const m = item.strengthMod.match(/^([+-]\d+)\s*(.*)$/);
        if (m && m[2].trim()) {
          conditionalStrengthMods.push({
            numeric: m[1],
            condition: m[2].trim(),
            source: item.name,
          });
        } else {
          unconditionalStrengthMods.push(item.strengthMod);
        }
      }
    }
  }
  return {
    armourBane,
    apMod,
    conditionalStrengthMods,
    unconditionalStrengthMods,
  };
}
```

- [ ] **Step 5: Update `buildRiderTags` to use the new signature**

Replace the existing `buildRiderTags` function (lines 214-245). It now takes the primary unit only (magical attacks and poison stay per-unit); banner bonuses are computed separately at the entry level:

```js
function buildRiderTags(unit) {
  const inlineParts = [];
  const subSpans = [];
  if (hasRiderMagicalAttacks(unit)) {
    inlineParts.push(
      '<span class="text-wh-phase-combat font-mono ml-1">\u2728</span>',
    );
    subSpans.push('<span class="text-violet-400">Magical Attacks</span>');
  }
  if (unit.poisonedAttacks ?? false) {
    inlineParts.push(
      '<span class="text-wh-phase-combat font-mono ml-1">\u2620\uFE0F</span>',
    );
    subSpans.push('<span class="text-green-400">Poisoned Attacks</span>');
  }
  // Note: armourBane and strengthMods are now sourced from detectItemBonuses([unit, ...assignedChars])
  // and applied at the entry level. unconditionalStrengthMods still show as inline tags here.
  const { armourBane, unconditionalStrengthMods } = detectItemBonuses([unit]);
  if (armourBane > 0)
    inlineParts.push(
      `<span class="text-wh-phase-combat font-mono ml-1">AB(${armourBane})</span>`,
    );
  for (const sm of unconditionalStrengthMods)
    inlineParts.push(
      `<span class="text-wh-phase-combat font-mono ml-1">S${sm}</span>`,
    );
  return {
    inline: inlineParts.join(""),
    sub:
      subSpans.length > 0
        ? `<div class="text-xs mt-0.5">${subSpans.join('<span class="text-wh-muted">, </span>')}</div>`
        : "",
  };
}
```

- [ ] **Step 6: Extend `renderWeaponLine` with an options parameter**

Replace the existing `renderWeaponLine` function (lines 156-176):

```js
function renderWeaponLine(
  initiative,
  ws,
  s,
  attacks,
  w,
  label,
  tags,
  options = {},
) {
  const { apMod = 0, conditionalSMods = [] } = options;

  let displayS = mergeStrength(s, w.s);
  for (const mod of conditionalSMods) {
    displayS += `${mod.numeric}*`;
  }

  const displayA = w.attacks ? `${attacks}${w.attacks}` : attacks;
  const displayRules = stripRedundantRules(w.rules, w);
  const effectiveAP = applyApMod(w.ap, apMod);

  const inlineTags =
    typeof tags === "object" && tags !== null ? tags.inline || "" : tags || "";
  const subLine =
    typeof tags === "object" && tags !== null ? tags.sub || "" : "";

  return `<div class="text-xs mb-1">
    <span class="text-wh-phase-combat font-mono">I${initiative}</span>
    <span class="text-wh-phase-combat font-mono ml-1">A${displayA}</span>
    <span class="text-wh-muted font-mono ml-1">WS${ws}</span>
    <span class="text-wh-muted font-mono ml-1">S${displayS}</span>
    ${label ? `<span class="text-wh-accent text-xs ml-1">${label}</span>` : ""}
    <span class="text-wh-text ml-1">${w.name}</span>
    ${effectiveAP && effectiveAP !== "—" ? `<span class="text-wh-muted font-mono ml-1">AP${effectiveAP}</span>` : ""}
    ${inlineTags}
    ${displayRules ? `<div class="text-wh-muted">${displayRules}</div>` : ""}
    ${subLine}
  </div>`;
}
```

- [ ] **Step 7: Add the import for `getCharacterAssignments` in `combat-weapons.js`**

At the top of the file, after the existing imports (line 2):

```js
import { getCharacterAssignments } from "../state.js";
```

- [ ] **Step 8: Modify `renderCombatWeaponsContext` — add assignment loading and character skipping**

At the start of `renderCombatWeaponsContext(army)` (line 393), after the empty-check, add:

```js
export function renderCombatWeaponsContext(army) {
  if (army.units.length === 0) return "";

  // Load character assignments: { charId: unitId }
  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );
  // Reverse map: unitId → array of assigned char unit objects
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
    // Skip characters that are assigned to a host unit
    if (isCharacter(u) && assignedCharIds.has(u.id)) continue;

    const assignedChars = charsByUnitId[u.id] || [];
    const allUnitsForBonuses = [u, ...assignedChars];

    // ... rest of existing processing follows unchanged ...
```

- [ ] **Step 9: Aggregate MR and compute banner modifiers in the entry builder**

In the normal-stats path, just before `entries.push({...})` (around line 583), add the computation:

```js
// Aggregate MR from unit + assigned chars
const unitMRNum = u.magicResistance ? parseInt(u.magicResistance) : 0;
const charMRNum = assignedChars.reduce(
  (sum, c) => sum + (c.magicResistance ? parseInt(c.magicResistance) : 0),
  0,
);
const totalMR = unitMRNum + charMRNum;
const mergedMR = totalMR !== 0 ? `${totalMR}` : null;

// Banner modifiers from unit + all assigned chars
const { apMod, conditionalStrengthMods } =
  detectItemBonuses(allUnitsForBonuses);

// Build assigned char profiles for rendering (like champion rows)
const assignedCharProfiles = assignedChars.map((char) => {
  const cStats = char.stats?.[0];
  const { weapons: charWeapons } = matchRiderWeapons(char);
  return {
    name: char.name,
    i: cStats?.I || "?",
    ws: cStats?.WS || "?",
    s: cStats?.S || "?",
    a: cStats?.A || "?",
    weapons: charWeapons.length > 0 ? charWeapons : [HAND_WEAPON],
    tags: buildRiderTags(char),
  };
});
```

Then in `entries.push({...})`, replace:

- `mr: u.magicResistance ?? null,` → `mr: mergedMR,`
- Add after `riderTags: buildRiderTags(u),`:
  ```js
  apMod,
  conditionalStrengthMods,
  assignedCharProfiles,
  ```

Do the same for the no-stats path (around line 403): add `apMod`, `conditionalStrengthMods`, `assignedCharProfiles` with zero/empty defaults, and aggregate MR.

For the no-stats path, add before `entries.push`:

```js
const unitMRNum = u.magicResistance ? parseInt(u.magicResistance) : 0;
const charMRNum = assignedChars.reduce(
  (sum, c) => sum + (c.magicResistance ? parseInt(c.magicResistance) : 0),
  0,
);
const totalMR = unitMRNum + charMRNum;
const mergedMR = totalMR !== 0 ? `${totalMR}` : null;
const { apMod, conditionalStrengthMods } =
  detectItemBonuses(allUnitsForBonuses);
const assignedCharProfiles = assignedChars.map((char) => {
  const cStats = char.stats?.[0];
  const { weapons: charWeapons } = matchRiderWeapons(char);
  return {
    name: char.name,
    i: cStats?.I || "?",
    ws: cStats?.WS || "?",
    s: cStats?.S || "?",
    a: cStats?.A || "?",
    weapons: charWeapons.length > 0 ? charWeapons : [HAND_WEAPON],
    tags: buildRiderTags(char),
  };
});
```

And add to the no-stats `entries.push({...})`:

```js
mr: mergedMR,
apMod,
conditionalStrengthMods,
assignedCharProfiles,
```

- [ ] **Step 10: Update the render template to use the new fields**

In the HTML template (around lines 715-794), update the weapon rendering section.

The `options` object to pass to every `renderWeaponLine` call within a card:

```js
const weaponOpts = {
  apMod: r.apMod,
  conditionalSMods: r.conditionalStrengthMods,
};
```

Replace the weapon rendering block (the `<div class="mt-1">` section) with:

```js
<div class="mt-1">
  $
  {(r.assignedCharProfiles || [])
    .flatMap((ch) =>
      ch.weapons.map((w) =>
        renderWeaponLine(ch.i, ch.ws, ch.s, ch.a, w, ch.name, ch.tags, {
          apMod: r.apMod,
          conditionalSMods: r.conditionalStrengthMods,
        }),
      ),
    )
    .join("")}
  $
  {(r.champions || [])
    .flatMap((ch) =>
      ch.weapons.map((w) =>
        renderWeaponLine(
          ch.i,
          ch.ws,
          ch.s,
          ch.a,
          w,
          ch.name,
          ch.tags !== null ? ch.tags : r.riderTags,
          { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
        ),
      ),
    )
    .join("")}
  $
  {r.riderWeapons
    .map((w) =>
      renderWeaponLine(
        r.riderI,
        r.riderWS,
        r.riderS,
        r.riderA,
        w,
        r.riderName,
        r.riderTags,
        { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
      ),
    )
    .join("")}
  $
  {r.crew
    .map((c) =>
      c.weapons.length > 0
        ? c.weapons
            .map((w) =>
              renderWeaponLine(c.i, c.ws, c.s, c.a, w, c.name, null, {
                apMod: r.apMod,
                conditionalSMods: r.conditionalStrengthMods,
              }),
            )
            .join("")
        : renderWeaponLine(c.i, c.ws, c.s, c.a, HAND_WEAPON, c.name, null, {
            apMod: r.apMod,
            conditionalSMods: r.conditionalStrengthMods,
          }),
    )
    .join("")}
  $
  {r.mountWeapons.length > 0
    ? renderMountWeapons(
        r.mountWeapons,
        r.mountA,
        r.mountS,
        r.mountI || r.riderI,
        r.mountWS || r.riderWS,
        { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
      )
    : r.mountA
      ? renderWeaponLine(
          r.mountI || r.riderI,
          r.mountWS || r.riderWS,
          r.mountS,
          r.mountA,
          {
            name: r.mountName || "Mount",
            s: "",
            ap: "—",
            rules: r.mountArmourBane
              ? `Armour Bane (${r.mountArmourBane})`
              : "",
          },
          null,
          null,
          { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
        )
      : ""}
  $
  {r.stomp || r.impactHits
    ? `<div class="text-xs text-wh-phase-combat">...</div>`
    : ""}
  $
  {(r.conditionalStrengthMods || []).length > 0
    ? r.conditionalStrengthMods
        .map(
          (m) => `<div class="text-[10px] text-wh-muted">* ${m.source}</div>`,
        )
        .join("")
    : ""}
  $
  {r.itemNames.length > 0
    ? `<div class="text-xs text-wh-muted mt-0.5">${r.itemNames.join(", ")}</div>`
    : ""}
  $
  {r.combatRules.length > 0
    ? `<div class="text-xs text-wh-accent mt-0.5">${r.combatRules.join(", ")}</div>`
    : ""}
</div>
```

Also update `renderMountWeapons` signature to accept and pass through the options:

```js
function renderMountWeapons(
  weapons,
  mountA,
  mountS,
  mountI,
  mountWS,
  options = {},
) {
  // ... existing logic, but pass options to each renderWeaponLine call
  return [
    ...remaining.map((w) =>
      renderWeaponLine(
        mountI,
        mountWS,
        mountS,
        remaining.length === 1 ? freeA : "?",
        w,
        null,
        buildMountWeaponTags(w),
        options,
      ),
    ),
    ...reserved.map((w) =>
      renderWeaponLine(
        mountI,
        mountWS,
        mountS,
        w.reservedAttacks,
        w,
        null,
        buildMountWeaponTags(w),
        options,
      ),
    ),
  ].join("");
}
```

- [ ] **Step 11: Run all tests**

```bash
npm test
```

Expected: all pass. If any test fails, read the error carefully — check that:

- `getCharacterAssignments` is imported in `combat-weapons.js`
- `apMod` and `conditionalStrengthMods` are set in both the stats path and no-stats path of the entry builder
- `assignedCharProfiles` is in both entry paths
- The template renders `r.assignedCharProfiles` before champions/riders

- [ ] **Step 12: Commit**

```bash
git add src/context/combat-weapons.js src/test/screens/game.test.js
git commit -m "feat: merge assigned characters into host unit combat card with MR and banner effects"
```

---

## Verification

```bash
npm test
```

Manual checks:

1. Load any army → "Start Game" → **character assignment screen** appears with characters on left, units on right
2. Drag a character onto a unit → character appears in the unit card; drag it back to the pool → character returns
3. Click "Save & Continue" → proceeds to first-turn selection as before
4. In the combat phase, the host unit card contains the character's name and weapons
5. If the assigned character has MR and the host unit has MR, the card shows the sum
6. Load a Dark Elves army with Banner of Har Ganeth → on the combat card, weapon AP values are 1 higher in magnitude than their base (e.g. Lance -2 → AP-3)
7. Load a Bretonnia army with Errantry Banner → on the combat card, the Lance shows `S3+2+1*` and a `* Errantry Banner` footnote below the weapons

## Scope note

This plan covers characters, lords, and heroes (all assigned to units). War machine crew and champion profiles remain unchanged — they are already handled by existing crew/champion logic and are not in `CHARACTER_CATEGORIES`.
