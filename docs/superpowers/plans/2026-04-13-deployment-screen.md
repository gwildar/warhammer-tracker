# Deployment Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deployment screen between character assignment and first-turn choice, showing a deployment sequence explainer and any units with Scouts/Vanguard/Ambushers; time deployment and show it as row 0 in the scoring table alongside per-turn times.

**Architecture:** Four independent tasks — state, scoring, new screen, wiring. The state task must complete first (Tasks 2–4 depend on it). Tasks 2 and 3 can then run in either order. Task 4 wires everything together last.

**Tech Stack:** Vanilla JS, Tailwind CSS v4, Vitest. Run `npm test` after each task.

---

## Files changed

| Task | Files                                                                          |
| ---- | ------------------------------------------------------------------------------ |
| 1    | `src/state.js`, `src/test/state.test.js`                                       |
| 2    | `src/screens/scoring.js`, `src/test/screens/game.test.js`                      |
| 3    | `src/screens/deployment.js` (new), `src/test/screens/deployment.test.js` (new) |
| 4    | `src/screens/unit-assignment.js`, `src/main.js`                                |

---

## Task 1: Add `deploymentTime` to state

**Files:**

- Modify: `src/state.js`
- Modify: `src/test/state.test.js`

- [ ] **Step 1: Write the failing tests**

Add a new `describe` block at the bottom of `src/test/state.test.js`:

```js
import {
  saveCharacterAssignments,
  getCharacterAssignments,
  clearArmy,
  getDeploymentTime,
  saveDeploymentTime,
  resetGame,
} from "../state.js";

// ... existing describe blocks unchanged ...

describe("deployment time state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to null", () => {
    expect(getDeploymentTime()).toBeNull();
  });

  it("saves and loads deployment time", () => {
    saveDeploymentTime(72000);
    expect(getDeploymentTime()).toBe(72000);
  });

  it("resetGame clears deployment time", () => {
    saveDeploymentTime(72000);
    resetGame();
    expect(getDeploymentTime()).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep "deployment time"
```

Expected: `getDeploymentTime is not a function`

- [ ] **Step 3: Add `deploymentTime` to `src/state.js`**

Add `deploymentTime: "tow-deployment-time"` to `KEYS`:

```js
const KEYS = {
  army: "tow-army",
  spellSelections: "tow-spell-selections",
  phaseIndex: "tow-phase-index",
  round: "tow-round",
  opponentTurn: "tow-opponent-turn",
  firstTurn: "tow-first-turn",
  scores: "tow-scores",
  timings: "tow-timings",
  startTime: "tow-start-time",
  assignments: "tow-character-assignments",
  schemaVersion: "tow-schema-version",
  deploymentTime: "tow-deployment-time",
};
```

Add the two functions after `recordCurrentPhaseTime`:

```js
// Deployment time (ms elapsed during deployment screen)
export function getDeploymentTime() {
  return load(KEYS.deploymentTime, null);
}

export function saveDeploymentTime(ms) {
  save(KEYS.deploymentTime, ms);
}
```

Add `save(KEYS.deploymentTime, null)` to `resetGame()`:

```js
export function resetGame() {
  save(KEYS.phaseIndex, 0);
  save(KEYS.round, 1);
  save(KEYS.opponentTurn, false);
  save(KEYS.scores, {});
  save(KEYS.timings, {});
  save(KEYS.startTime, null);
  save(KEYS.deploymentTime, null);
}
```

Note: `clearAll()` iterates `Object.values(KEYS)` so it already clears `deploymentTime` automatically — no change needed there.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | grep "deployment time"
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/state.js src/test/state.test.js
git commit -m "feat: add deploymentTime state for tracking deployment duration"
```

---

## Task 2: Update scoring table — Time column + deployment row

Remove the existing `<details>` per-turn timing breakdown. Add a Time column to the scoring table and a Rd 0 Deploy row.

**Files:**

- Modify: `src/screens/scoring.js`
- Modify: `src/test/screens/game.test.js`

**Context:** `src/screens/scoring.js` exports `renderScoringUI()` and `bindScoringEvents()`. The scoring sub-phase is index 14 in the game phase list (dark-elves fixture).

- [ ] **Step 1: Write the failing tests**

Add to the scoring describe block in `src/test/screens/game.test.js`. Find the existing scoring tests (around `describe` block containing `savePhaseIndex(14)`) and add these tests inside the same describe:

```js
import {
  savePhaseIndex,
  saveFirstTurn,
  saveIsOpponentTurn,
  saveRound,
  saveTimings,
  saveDeploymentTime,
} from "../../state.js";
// saveDeploymentTime will need to be added to the import at the top of game.test.js

// Inside the scoring describe block:

it("shows Time column header in scoring table", () => {
  savePhaseIndex(14);
  renderGameScreen(army);
  const header = getApp().querySelector("thead");
  expect(header.textContent).toContain("Time");
});

it("shows deployment row when deploymentTime is set", () => {
  saveDeploymentTime(1200000); // 20 minutes
  savePhaseIndex(14);
  renderGameScreen(army);
  expect(getApp().textContent).toContain("Deploy");
  expect(getApp().textContent).toContain("20:00");
});

it("does not show deployment row when deploymentTime is null", () => {
  savePhaseIndex(14);
  renderGameScreen(army);
  expect(getApp().textContent).not.toContain("Deploy");
});

it("shows turn time in table when timings are set", () => {
  saveTimings({ 1: { you: { 0: 900000, 1: 600000 } } }); // 15 minutes total
  savePhaseIndex(14);
  renderGameScreen(army);
  expect(getApp().textContent).toContain("15:00");
});

it("does not show the Turn Timings details section", () => {
  saveTimings({ 1: { you: { 0: 900000 } } });
  savePhaseIndex(14);
  renderGameScreen(army);
  expect(getApp().textContent).not.toContain("Turn Timings");
});
```

Also add `saveDeploymentTime` to the `beforeEach` cleanup — set it to null:

```js
beforeEach(() => {
  saveDeploymentTime(null); // reset between tests
  army = loadArmy("dark-elves");
  startGame(army);
});
```

Find the existing scoring `beforeEach` in the file and add `saveDeploymentTime(null)` there, and add `saveDeploymentTime` to the import list at the top of the file.

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -E "Time column|deployment row|Turn Timings|turn time"
```

Expected: new tests fail.

- [ ] **Step 3: Update `src/screens/scoring.js`**

Add `getDeploymentTime` to the import:

```js
import {
  getScores,
  updateScore,
  getRound,
  getIsOpponentTurn,
  getFirstTurn,
  getTimings,
  getDeploymentTime,
} from "../state.js";
```

Replace the entire `renderScoringUI` function body with:

```js
export function renderScoringUI() {
  const scores = getScores();
  const round = getRound();
  const isOpponentTurn = getIsOpponentTurn();
  const turnKey = isOpponentTurn ? "opponent" : "you";
  const firstTurn = getFirstTurn();
  const timings = getTimings();
  const deploymentTime = getDeploymentTime();

  const currentTurnScores = (scores[round] && scores[round][turnKey]) || {
    you: 0,
    opponent: 0,
  };

  const rounds = [];
  for (let i = 1; i <= round; i++) {
    rounds.push(i);
  }

  const turnsInOrder =
    firstTurn === "opponent" ? ["opponent", "you"] : ["you", "opponent"];

  let totalYou = 0;
  let totalOpponent = 0;

  const deploymentRow =
    deploymentTime !== null
      ? `
    <tr>
      <td class="px-3 py-2 text-wh-muted font-mono">0</td>
      <td class="px-3 py-2 text-wh-muted italic text-xs">Deploy</td>
      <td class="px-3 py-2 text-wh-text">—</td>
      <td class="px-3 py-2 text-wh-text">—</td>
      <td class="px-3 py-2 font-mono text-xs">${formatDuration(deploymentTime)}</td>
    </tr>
  `
      : "";

  return `
    <div class="mt-8 border-t border-wh-border pt-6 pb-4">
      <h3 class="text-lg font-bold text-wh-text mb-4">Strategic Objectives</h3>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Your Score</label>
          <select id="score-you" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${[0, 1, 2, 3, 4].map((v) => `<option value="${v}" ${currentTurnScores.you === v ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Opponent Score</label>
          <select id="score-opponent" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${[0, 1, 2, 3, 4].map((v) => `<option value="${v}" ${currentTurnScores.opponent === v ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="overflow-hidden border border-wh-border rounded-lg">
        <table class="w-full text-sm text-left">
          <thead class="bg-wh-card text-wh-muted uppercase tracking-wider border-b border-wh-border">
            <tr>
              <th class="px-3 py-2 font-semibold">Rd</th>
              <th class="px-3 py-2 font-semibold">Turn</th>
              <th class="px-3 py-2 font-semibold text-wh-accent">You</th>
              <th class="px-3 py-2 font-semibold text-wh-red">Opp</th>
              <th class="px-3 py-2 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-wh-border">
            ${deploymentRow}
            ${rounds
              .map((r) => {
                return turnsInOrder
                  .map((turn) => {
                    const s = (scores[r] && scores[r][turn]) || {
                      you: 0,
                      opponent: 0,
                    };
                    totalYou += s.you;
                    totalOpponent += s.opponent;
                    const isCurrent = r === round && turn === turnKey;
                    const turnMs = Object.values(
                      (timings[r] && timings[r][turn]) || {},
                    ).reduce((a, b) => a + b, 0);
                    const timeCell = turnMs > 0 ? formatDuration(turnMs) : "—";
                    return `
                  <tr class="${isCurrent ? "bg-wh-accent/5" : ""}">
                    <td class="px-3 py-2 text-wh-muted font-mono">${turn === turnsInOrder[0] ? r : ""}</td>
                    <td class="px-3 py-2 text-wh-muted italic text-xs capitalize">${turn === "you" ? "Yours" : "Opponents"}</td>
                    <td class="px-3 py-2 text-wh-text font-bold">${s.you}</td>
                    <td class="px-3 py-2 text-wh-text font-bold">${s.opponent}</td>
                    <td class="px-3 py-2 font-mono text-xs">${timeCell}</td>
                  </tr>
                `;
                  })
                  .join("");
              })
              .join("")}
          </tbody>
          <tfoot class="bg-wh-card border-t border-wh-border font-bold">
            <tr>
              <td class="px-3 py-2 text-wh-muted" colspan="2">Total</td>
              <td class="px-3 py-2 text-wh-accent">${totalYou}</td>
              <td class="px-3 py-2 text-wh-red">${totalOpponent}</td>
              <td class="px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: all tests pass (count increased by 5).

- [ ] **Step 5: Commit**

```bash
git add src/screens/scoring.js src/test/screens/game.test.js
git commit -m "feat: add Time column and Deploy row to scoring table"
```

---

## Task 3: Create deployment screen

**Files:**

- Create: `src/screens/deployment.js`
- Create: `src/test/screens/deployment.test.js`

**Context:** The screen matches `src/screens/unit-assignment.js` in layout. It imports `SPECIAL_RULES` from `../data/special-rules.js` to look up rule descriptions. `startTime` is already running when this screen loads (set in `main.js` via `resetStartTime()`).

- [ ] **Step 1: Write the failing tests**

Create `src/test/screens/deployment.test.js`:

```js
import { describe, it, expect, beforeEach } from "vitest";
import { renderDeploymentScreen } from "../../screens/deployment.js";
import { getApp, loadArmy } from "../helpers.js";
import { saveArmy } from "../../state.js";

describe("Deployment screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  it("renders Deployment heading", () => {
    renderDeploymentScreen(army);
    expect(getApp().querySelector("h2").textContent).toContain("Deployment");
  });

  it("shows Setup eyebrow", () => {
    renderDeploymentScreen(army);
    expect(getApp().textContent).toContain("Setup");
  });

  it("shows army name in header", () => {
    renderDeploymentScreen(army);
    const header = getApp().querySelector("header");
    expect(header.textContent).toContain(army.name);
  });

  it("shows Continue button", () => {
    renderDeploymentScreen(army);
    expect(getApp().querySelector("#continue-btn")).toBeTruthy();
  });

  it("shows deployment sequence explainer", () => {
    renderDeploymentScreen(army);
    expect(getApp().textContent).toContain("Deployment sequence");
    expect(getApp().textContent).toContain("Roll off");
    expect(getApp().textContent).toContain("Alternate deploying");
  });

  it("does not show Deployment Rules section when no relevant units", () => {
    renderDeploymentScreen(army);
    expect(getApp().textContent).not.toContain("Deployment Rules");
  });

  it("shows unit card with Scouts rule when unit has Scouts", () => {
    const armyWithScouts = {
      name: "Test Army",
      units: [
        {
          id: "scouts-unit",
          name: "Shadow Warriors",
          category: "core",
          specialRules: [{ displayName: "Scouts" }],
          magicItems: [],
        },
      ],
    };
    saveArmy(armyWithScouts);
    renderDeploymentScreen(armyWithScouts);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Shadow Warriors");
    expect(getApp().textContent).toContain("Scouts");
  });

  it("shows unit card with Vanguard rule when unit has Vanguard", () => {
    const armyWithVanguard = {
      name: "Test Army",
      units: [
        {
          id: "vanguard-unit",
          name: "Outriders",
          category: "core",
          specialRules: [{ displayName: "Vanguard" }],
          magicItems: [],
        },
      ],
    };
    saveArmy(armyWithVanguard);
    renderDeploymentScreen(armyWithVanguard);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Outriders");
    expect(getApp().textContent).toContain("Vanguard");
  });

  it("shows unit card with Ambushers rule when unit has Ambush alias", () => {
    const armyWithAmbush = {
      name: "Test Army",
      units: [
        {
          id: "ambush-unit",
          name: "Night Goblins",
          category: "core",
          specialRules: [{ displayName: "Ambush" }],
          magicItems: [],
        },
      ],
    };
    saveArmy(armyWithAmbush);
    renderDeploymentScreen(armyWithAmbush);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Night Goblins");
    expect(getApp().textContent).toContain("Ambush");
  });

  it("does not show units without deployment rules", () => {
    const mixedArmy = {
      name: "Test Army",
      units: [
        {
          id: "scouts-unit",
          name: "Shadow Warriors",
          category: "core",
          specialRules: [{ displayName: "Scouts" }],
          magicItems: [],
        },
        {
          id: "normal-unit",
          name: "Spearmen",
          category: "core",
          specialRules: [{ displayName: "Killing Blow" }],
          magicItems: [],
        },
      ],
    };
    saveArmy(mixedArmy);
    renderDeploymentScreen(mixedArmy);
    expect(getApp().textContent).toContain("Shadow Warriors");
    expect(getApp().textContent).not.toContain("Spearmen");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep "Deployment screen"
```

Expected: `Cannot find module '../../screens/deployment.js'`

- [ ] **Step 3: Create `src/screens/deployment.js`**

```js
import { SPECIAL_RULES } from "../data/special-rules.js";
import { getStartTime, saveDeploymentTime, resetStartTime } from "../state.js";
import { navigate } from "../navigate.js";

const app = document.getElementById("app");

const DEPLOYMENT_RULE_IDS = new Set([
  "scouts",
  "vanguard",
  "ambushers",
  "ambush",
]);

function normaliseRuleId(displayName) {
  return (displayName || "")
    .toLowerCase()
    .replace(/\s*\(.*$/, "")
    .trim();
}

function getDeploymentRules(unit) {
  return (unit.specialRules || []).filter((r) =>
    DEPLOYMENT_RULE_IDS.has(normaliseRuleId(r.displayName)),
  );
}

function ruleDescription(displayName) {
  const id = normaliseRuleId(displayName);
  const rule = SPECIAL_RULES.find((sr) => sr.id === id);
  return rule?.phases?.[0]?.description ?? "";
}

function renderExplainer() {
  return `
    <div class="bg-wh-surface border border-wh-border rounded-lg p-4 mb-4">
      <div class="text-xs uppercase tracking-wider text-wh-muted mb-2">Deployment sequence</div>
      <ol class="space-y-1.5 text-sm text-wh-text list-decimal list-inside">
        <li>Roll off — higher result picks deployment zone and decides who deploys first</li>
        <li>Alternate deploying one unit at a time. Characters may join a unit or deploy separately.</li>
        <li>After all other units: <span class="font-semibold">Scouts</span> deploy — must be placed >12" from all enemy models</li>
        <li>After Scouts: <span class="font-semibold">Vanguard</span> units make their Vanguard move — no march; cannot charge on turn 1</li>
        <li><span class="font-semibold">Ambushers</span> are held in reserve and arrive from round 2 onwards</li>
      </ol>
    </div>
  `;
}

function renderUnitCard(unit) {
  const rules = getDeploymentRules(unit);
  return `
    <div class="p-2 rounded border border-wh-border bg-wh-card mb-2">
      <div class="text-sm font-semibold text-wh-text">${unit.name}</div>
      ${rules
        .map((r) => {
          const desc = ruleDescription(r.displayName);
          return `
          <div class="mt-1">
            <span class="text-xs text-wh-accent font-semibold">${r.displayName}</span>
            ${desc ? `<div class="text-xs text-wh-muted mt-0.5">${desc}</div>` : ""}
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

function renderDeploymentUnits(army) {
  const units = army.units.filter((u) => getDeploymentRules(u).length > 0);
  if (units.length === 0) return "";
  return `
    <div>
      <h3 class="text-xs font-bold text-wh-muted mb-2 uppercase tracking-wide">Deployment Rules</h3>
      ${units.map(renderUnitCard).join("")}
    </div>
  `;
}

export function renderDeploymentScreen(army) {
  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-4xl mx-auto">
          <h1 class="text-xl font-bold text-wh-accent">${army.name}</h1>
          <button id="continue-btn"
            class="px-4 py-2 bg-wh-accent text-wh-bg rounded text-sm font-semibold hover:opacity-90">
            Continue
          </button>
        </div>
      </header>
      <main class="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div class="mb-4">
          <span class="text-xs uppercase tracking-wider text-wh-muted">Setup</span>
          <h2 class="text-2xl font-bold text-wh-text">Deployment</h2>
        </div>
        ${renderExplainer()}
        ${renderDeploymentUnits(army)}
      </main>
    </div>
  `;

  document.getElementById("continue-btn").addEventListener("click", () => {
    const startTime = getStartTime();
    if (startTime) {
      saveDeploymentTime(Date.now() - startTime);
    }
    resetStartTime();
    navigate("firstTurnScreen", army);
  });
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: all tests pass (count increased by 9).

- [ ] **Step 5: Commit**

```bash
git add src/screens/deployment.js src/test/screens/deployment.test.js
git commit -m "feat: add deployment screen with explainer and deployment-rule unit cards"
```

---

## Task 4: Wire up navigation and registration

**Files:**

- Modify: `src/screens/unit-assignment.js:122-125`
- Modify: `src/main.js`

No new tests needed — existing screens navigate via the `navigate()` registry; navigation targets are not tested directly. The deployment screen tests already cover the screen itself.

- [ ] **Step 1: Update `src/screens/unit-assignment.js`**

Change the "Save & Continue" click handler (line 124):

```js
// Before:
navigate("firstTurnScreen", army);

// After:
navigate("deploymentScreen", army);
```

- [ ] **Step 2: Update `src/main.js`**

Add the import after the existing screen imports:

```js
import { renderDeploymentScreen } from "./screens/deployment.js";
```

Add the registration after the existing `registerScreen` calls:

```js
registerScreen("deploymentScreen", renderDeploymentScreen);
```

The full updated imports + registrations block in `main.js`:

```js
import { renderSetupScreen } from "./screens/setup.js";
import { renderGameScreen } from "./screens/game.js";
import { renderFirstTurnScreen } from "./screens/first-turn.js";
import { renderOpponentTurnScreen } from "./screens/opponent-turn.js";
import { renderAboutScreen } from "./screens/about.js";
import { renderUnitAssignmentScreen } from "./screens/unit-assignment.js";
import { renderDeploymentScreen } from "./screens/deployment.js";

registerScreen("render", render);
registerScreen("setupScreen", renderSetupScreen);
registerScreen("gameScreen", renderGameScreen);
registerScreen("firstTurnScreen", renderFirstTurnScreen);
registerScreen("unitAssignmentScreen", renderUnitAssignmentScreen);
registerScreen("deploymentScreen", renderDeploymentScreen);
registerScreen("opponentTurnScreen", renderOpponentTurnScreen);
registerScreen("aboutScreen", renderAboutScreen);
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: all tests pass (same count as after Task 3).

- [ ] **Step 4: Commit**

```bash
git add src/screens/unit-assignment.js src/main.js
git commit -m "feat: wire deployment screen into pre-game flow"
```

---

## Verification

After all four tasks:

```bash
npm test
```

All tests pass. The deployment screen appears between character assignment and first-turn choice. Scoring table shows a Time column with per-turn totals and a Deploy row (Rd 0) when deployment time is recorded.
