# Browser Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hash-based browser navigation to every screen so the back/forward buttons work across phases and setup flow.

**Architecture:** Install Navigo for hash routing. Replace the screen-name registry in `navigate.js` with a Navigo instance. Route handlers in `main.js` read URL params, sync localStorage, and call existing render functions unchanged. Every `navigate("screenName", army)` call in screens becomes a `navigate('/path')` call; the army arg is dropped since route handlers always call `getArmy()`.

**Tech Stack:** Navigo 9 (hash routing), Vite, Vitest, vanilla JS.

> **Spec note:** The opponent-turn screen navigates through `PHASES` (5 items), not subphases. Its URL is `#/opponent/:round/:phase` — no subphase segment. This corrects a minor inaccuracy in the spec.

---

### Task 1: Install Navigo and rewrite navigate.js

**Files:**

- Modify: `package.json`
- Modify: `src/navigate.js`

- [ ] **Step 1: Install Navigo**

```bash
cd /Users/gjohnston/Projects/warhammer-tracker
npm install navigo
```

Expected output: navigo added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Rewrite navigate.js**

Replace the entire contents of `src/navigate.js` with:

```js
import Navigo from "navigo";
export const router = new Navigo("/", { hash: true });
export function navigate(path) {
  router.navigate(path);
}
```

The old `screens` registry and `registerScreen` export are deleted entirely.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/navigate.js
git commit -m "feat: install navigo and replace screen registry with hash router"
```

---

### Task 2: Add subPhaseToIndex helper to phases.js (TDD)

**Files:**

- Modify: `src/phases.js`
- Create: `src/test/phases.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/test/phases.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npm test -- src/test/phases.test.js
```

Expected: FAIL — `subPhaseToIndex is not a function` (or similar).

- [ ] **Step 3: Add subPhaseToIndex to phases.js**

At the bottom of `src/phases.js`, after `getAllSubPhases`, add:

```js
export function subPhaseToIndex(phaseId, subPhaseId) {
  return getAllSubPhases().findIndex(
    (s) => s.phase.id === phaseId && s.subPhase.id === subPhaseId,
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npm test -- src/test/phases.test.js
```

Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add src/phases.js src/test/phases.test.js
git commit -m "feat: add subPhaseToIndex helper to phases.js"
```

---

### Task 3: Update test setup — remove registerScreen no-ops

**Files:**

- Modify: `src/test/setup.js`

- [ ] **Step 1: Remove registerScreen imports and calls**

In `src/test/setup.js`, delete these lines:

```js
import { registerScreen } from "../navigate.js";
```

```js
// Register no-op screens so navigate() calls don't throw during binding
const noop = () => {};
registerScreen("render", noop);
registerScreen("setupScreen", noop);
registerScreen("gameScreen", noop);
registerScreen("firstTurnScreen", noop);
registerScreen("unitAssignmentScreen", noop);
registerScreen("opponentTurnScreen", noop);
registerScreen("aboutScreen", noop);
registerScreen("gameOverScreen", noop);
```

Leave all other content (HTMLDialogElement polyfill, `#app` creation, `beforeEach` cleanup) unchanged.

With Navigo, calling `navigate('/setup')` in tests simply changes `window.location.hash`; no routes are registered in the test environment, so nothing renders. No replacement is needed.

- [ ] **Step 2: Run all tests to check baseline (expect many failures — that's OK)**

```bash
npm test
```

Note which tests fail and why. Most failures will be "registerScreen is not a function" in test files — those will be fixed in Task 11.

- [ ] **Step 3: Commit**

```bash
git add src/test/setup.js
git commit -m "test: remove registerScreen no-ops from test setup"
```

---

### Task 4: Rewrite main.js with Navigo route definitions

**Files:**

- Modify: `src/main.js`

- [ ] **Step 1: Replace main.js entirely**

```js
import "./style.css";
import {
  getArmy,
  clearAll,
  getFirstTurn,
  getIsOpponentTurn,
  getSchemaVersion,
  saveSchemaVersion,
  SCHEMA_VERSION,
  resetStartTime,
  getRound,
  getPhaseIndex,
  saveRound,
  savePhaseIndex,
  saveIsOpponentTurn,
} from "./state.js";
import { getAllSubPhases, PHASES, subPhaseToIndex } from "./phases.js";
import { router, navigate } from "./navigate.js";

import { renderSetupScreen } from "./screens/setup.js";
import { renderGameScreen } from "./screens/game.js";
import { renderFirstTurnScreen } from "./screens/first-turn.js";
import { renderOpponentTurnScreen } from "./screens/opponent-turn.js";
import { renderAboutScreen } from "./screens/about.js";
import { renderUnitAssignmentScreen } from "./screens/unit-assignment.js";
import { renderDeploymentScreen } from "./screens/deployment.js";
import { renderGameOverScreen } from "./screens/game-over.js";
import { renderSpellSelectionScreen } from "./screens/spell-selection-screen.js";
import { renderScenarioSetupScreen } from "./screens/scenario-setup.js";

const allSubPhases = getAllSubPhases();

function guardArmy(fn) {
  const army = getArmy();
  if (!army) {
    navigate("/setup");
    return;
  }
  fn(army);
}

router
  .on("/setup", () => renderSetupScreen())
  .on("/unit-assignment", () => guardArmy(renderUnitAssignmentScreen))
  .on("/spell-selection", () => guardArmy(renderSpellSelectionScreen))
  .on("/scenario-setup", () => guardArmy(renderScenarioSetupScreen))
  .on("/deployment", () => guardArmy(renderDeploymentScreen))
  .on("/first-turn", () => guardArmy(renderFirstTurnScreen))
  .on("/about", () => renderAboutScreen())
  .on("/game-over", () => guardArmy(renderGameOverScreen))
  .on("/game/:round/:phase/:subphase", ({ data }) => {
    guardArmy((army) => {
      const idx = subPhaseToIndex(data.phase, data.subphase);
      if (idx === -1) {
        navigate("/setup");
        return;
      }
      saveRound(Number(data.round));
      saveIsOpponentTurn(false);
      savePhaseIndex(idx);
      renderGameScreen(army);
    });
  })
  .on("/opponent/:round/:phase", ({ data }) => {
    guardArmy((army) => {
      const idx = PHASES.findIndex((p) => p.id === data.phase);
      if (idx === -1) {
        navigate("/setup");
        return;
      }
      saveRound(Number(data.round));
      saveIsOpponentTurn(true);
      savePhaseIndex(idx);
      renderOpponentTurnScreen(army);
    });
  })
  .notFound(() => {
    const army = getArmy();
    if (!army || !getFirstTurn()) {
      navigate("/setup");
    } else if (getIsOpponentTurn()) {
      const phase = PHASES[getPhaseIndex()];
      navigate(`/opponent/${getRound()}/${phase.id}`);
    } else {
      const { phase, subPhase } = allSubPhases[getPhaseIndex()];
      navigate(`/game/${getRound()}/${phase.id}/${subPhase.id}`);
    }
  });

// ─── Init ───────────────────────────────────────────────────────────────────

if (getSchemaVersion() !== SCHEMA_VERSION) {
  clearAll();
  saveSchemaVersion(SCHEMA_VERSION);
}

resetStartTime();

try {
  router.resolve();
} catch {
  clearAll();
  saveSchemaVersion(SCHEMA_VERSION);
  sessionStorage.setItem("tow-recovered", "1");
  navigate("/setup");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: replace screen registry with navigo route definitions in main.js"
```

---

### Task 5: Update game.js — recordAndNavigate builds URL

**Files:**

- Modify: `src/screens/game.js`

The key change: `recordAndNavigate` builds a URL and calls `navigate()` instead of saving state directly and calling render. State saves move to the route handler in main.js.

- [ ] **Step 1: Update imports**

In the state import block at the top of `src/screens/game.js`, remove `savePhaseIndex`, `saveRound`, `saveIsOpponentTurn` (these now happen in the route handler):

```js
import {
  getPhaseIndex,
  getRound,
  getFirstTurn,
  saveFirstTurn,
  resetGame,
  canGoBackToPreviousTurn,
  getStartTime,
  resetStartTime,
  recordCurrentPhaseTime,
  getDisplayMode,
  getScenarioOptions,
} from "../state.js";
```

- [ ] **Step 2: Replace recordAndNavigate**

Find the existing `recordAndNavigate` function (around line 241) and replace it:

```js
function recordAndNavigate(army, newPhaseIdx, isOpponentTurn, isPrev) {
  recordCurrentPhaseTime(false);
  const newRound =
    isOpponentTurn && !isPrev && getFirstTurn() === "opponent"
      ? getRound() + 1
      : isOpponentTurn && isPrev && getFirstTurn() === "you"
        ? getRound() - 1
        : getRound();
  if (isOpponentTurn) {
    navigate(`/opponent/${newRound}/${PHASES[newPhaseIdx].id}`);
  } else {
    const { phase, subPhase } = allSubPhases[newPhaseIdx];
    navigate(`/game/${newRound}/${phase.id}/${subPhase.id}`);
  }
}
```

- [ ] **Step 3: Update manage-army-btn and new-game-btn navigate calls**

In `bindGameActions`, find:

```js
document.getElementById("manage-army-btn")?.addEventListener("click", () => {
  navigate("setupScreen");
});

document.getElementById("new-game-btn")?.addEventListener("click", () => {
  if (confirm("Start a new game? This will reset the round counter.")) {
    resetGame();
    saveFirstTurn(null);
    navigate("setupScreen");
  }
});
```

Replace with:

```js
document.getElementById("manage-army-btn")?.addEventListener("click", () => {
  navigate("/setup");
});

document.getElementById("new-game-btn")?.addEventListener("click", () => {
  if (confirm("Start a new game? This will reset the round counter.")) {
    resetGame();
    saveFirstTurn(null);
    navigate("/setup");
  }
});
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/game.js
git commit -m "feat: update game.js to navigate by URL path"
```

---

### Task 6: Update opponent-turn.js — recordAndNavigate builds URL

**Files:**

- Modify: `src/screens/opponent-turn.js`

- [ ] **Step 1: Update imports**

In the state import block, remove `savePhaseIndex`, `saveRound`, `saveIsOpponentTurn`:

```js
import {
  getPhaseIndex,
  getRound,
  getFirstTurn,
  saveFirstTurn,
  resetGame,
  canGoBackToPreviousTurn,
  getStartTime,
  resetStartTime,
  recordCurrentPhaseTime,
  getDisplayMode,
  getScenarioOptions,
} from "../state.js";
```

- [ ] **Step 2: Add allSubPhases at module level**

Near the top of the file (after imports, before `renderOpponentTurnScreen`), add:

```js
const allSubPhases = getAllSubPhases();
```

(The file already imports `getAllSubPhases` — this hoists its usage to module scope.)

- [ ] **Step 3: Replace recordAndNavigate**

Find the existing `recordAndNavigate` (around line 149) and replace it:

```js
function recordAndNavigate(army, newPhaseIdx, isOpponentTurn, isPrev) {
  recordCurrentPhaseTime(true);
  if (!isOpponentTurn) {
    const newRound =
      isPrev && getFirstTurn() === "opponent"
        ? getRound() - 1
        : !isPrev && getFirstTurn() === "you"
          ? getRound() + 1
          : getRound();
    const { phase, subPhase } = allSubPhases[newPhaseIdx];
    navigate(`/game/${newRound}/${phase.id}/${subPhase.id}`);
  } else {
    navigate(`/opponent/${getRound()}/${PHASES[newPhaseIdx].id}`);
  }
}
```

- [ ] **Step 4: Update prev-btn handler — remove local allSubPhases**

Find the prev-btn click handler:

```js
document.getElementById("prev-btn")?.addEventListener("click", () => {
  const idx = getPhaseIndex();
  if (idx > 0) {
    recordAndNavigate(army, idx - 1, true, true);
  } else if (canGoBackToPreviousTurn()) {
    const allSubPhases = getAllSubPhases();
    recordAndNavigate(army, allSubPhases.length - 1, false, true);
  }
});
```

Replace with (remove the inner `const allSubPhases` since it's now module-level):

```js
document.getElementById("prev-btn")?.addEventListener("click", () => {
  const idx = getPhaseIndex();
  if (idx > 0) {
    recordAndNavigate(army, idx - 1, true, true);
  } else if (canGoBackToPreviousTurn()) {
    recordAndNavigate(army, allSubPhases.length - 1, false, true);
  }
});
```

- [ ] **Step 5: Update manage-army-btn and new-game-btn**

Find:

```js
document.getElementById("manage-army-btn")?.addEventListener("click", () => {
  navigate("setupScreen");
});

document.getElementById("new-game-btn")?.addEventListener("click", () => {
  if (confirm("Start a new game? This will reset the round counter.")) {
    resetGame();
    saveFirstTurn(null);
    navigate("render");
  }
});
```

Replace with:

```js
document.getElementById("manage-army-btn")?.addEventListener("click", () => {
  navigate("/setup");
});

document.getElementById("new-game-btn")?.addEventListener("click", () => {
  if (confirm("Start a new game? This will reset the round counter.")) {
    resetGame();
    saveFirstTurn(null);
    navigate("/setup");
  }
});
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/opponent-turn.js
git commit -m "feat: update opponent-turn.js to navigate by URL path"
```

---

### Task 7: Update game-over.js — back button builds URL from state

**Files:**

- Modify: `src/screens/game-over.js`

The back button needs to build the URL from current localStorage state since it can go back to either the game screen or the opponent turn screen.

- [ ] **Step 1: Add missing imports**

Add `getPhaseIndex` to the state import block (it isn't currently imported):

```js
import {
  getScores,
  getRound,
  getPhaseIndex,
  getIsOpponentTurn,
  getFirstTurn,
  getTimings,
  getDeploymentTime,
  resetGame,
  saveFirstTurn,
  getScenarioOptions,
} from "../state.js";
```

Add a phases import after the state import:

```js
import { getAllSubPhases, PHASES } from "../phases.js";
```

Add a module-level constant after the import block:

```js
const allSubPhases = getAllSubPhases();
```

- [ ] **Step 2: Replace bindGameOverActions**

Find `bindGameOverActions` (around line 221) and replace it:

```js
function bindGameOverActions(army) {
  const goBack = () => {
    const round = getRound();
    const phaseIdx = getPhaseIndex();
    if (getIsOpponentTurn()) {
      navigate(`/opponent/${round}/${PHASES[phaseIdx].id}`);
    } else {
      const { phase, subPhase } = allSubPhases[phaseIdx];
      navigate(`/game/${round}/${phase.id}/${subPhase.id}`);
    }
  };

  document.getElementById("back-btn")?.addEventListener("click", goBack);
  document.getElementById("back-btn-footer")?.addEventListener("click", goBack);

  document.getElementById("new-game-btn")?.addEventListener("click", () => {
    resetGame();
    saveFirstTurn(null);
    navigate("/setup");
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/game-over.js
git commit -m "feat: update game-over.js to navigate by URL path"
```

---

### Task 8: Update first-turn.js

**Files:**

- Modify: `src/screens/first-turn.js`

- [ ] **Step 1: Update imports**

Remove `saveIsOpponentTurn` and `savePhaseIndex` from state imports (now done by route handler). Add phases import:

```js
import { saveFirstTurn } from "../state.js";
import { PHASES, getAllSubPhases } from "../phases.js";
import { navigate } from "../navigate.js";
import { renderSetupHeader, bindSetupHeaderEvents } from "./setup-header.js";
```

Add a module-level constant:

```js
const allSubPhases = getAllSubPhases();
```

- [ ] **Step 2: Replace button handlers**

Find the three event listeners in `renderFirstTurnScreen` and replace them:

```js
document.getElementById("first-you-btn").addEventListener("click", () => {
  saveFirstTurn("you");
  const { phase, subPhase } = allSubPhases[0];
  navigate(`/game/1/${phase.id}/${subPhase.id}`);
});

document.getElementById("first-opponent-btn").addEventListener("click", () => {
  saveFirstTurn("opponent");
  navigate(`/opponent/1/${PHASES[0].id}`);
});

bindSetupHeaderEvents();

document.getElementById("prev-btn").addEventListener("click", () => {
  navigate("/deployment");
});
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/first-turn.js
git commit -m "feat: update first-turn.js to navigate by URL path"
```

---

### Task 9: Update setup.js

**Files:**

- Modify: `src/screens/setup.js`

setup.js has 6 navigate calls across two functions and one file-level callback.

- [ ] **Step 1: Add missing imports**

Add to the state import block: `getRound`, `getPhaseIndex`. Add phases import:

```js
import { getAllSubPhases, PHASES } from "../phases.js";
```

Add module-level constant near top of file (after imports):

```js
const allSubPhases = getAllSubPhases();
```

- [ ] **Step 2: Update the about button navigate call (line ~71)**

Find:

```js
navigate("aboutScreen");
```

Replace with:

```js
navigate("/about");
```

- [ ] **Step 3: Update the file-upload navigate call (line ~278)**

Find:

```js
resetGame();
navigate("render");
```

Replace with:

```js
resetGame();
navigate("/setup");
```

- [ ] **Step 4: Update bindArmyActions — start-game button**

Find `bindArmyActions` and replace the `start-game-btn` handler:

```js
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
```

- [ ] **Step 5: Update replace-army button navigate call**

Find:

```js
clearArmy();
navigate("render");
```

Replace with:

```js
clearArmy();
navigate("/setup");
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/setup.js
git commit -m "feat: update setup.js to navigate by URL path"
```

---

### Task 10: Update remaining screens

**Files:**

- Modify: `src/screens/setup-header.js`
- Modify: `src/screens/about.js`
- Modify: `src/screens/spell-selection-screen.js`
- Modify: `src/screens/unit-assignment.js`
- Modify: `src/screens/scenario-setup.js`
- Modify: `src/screens/deployment.js`

These are all simple navigate call replacements.

- [ ] **Step 1: Update setup-header.js**

Two calls, both `navigate("setupScreen")` → `navigate("/setup")`:

```js
export function bindSetupHeaderEvents() {
  document.getElementById("setup-army-btn")?.addEventListener("click", () => {
    navigate("/setup");
  });
  document
    .getElementById("setup-new-game-btn")
    ?.addEventListener("click", () => {
      if (confirm("Start a new game? This will reset the round counter.")) {
        resetGame();
        saveFirstTurn(null);
        navigate("/setup");
      }
    });
}
```

- [ ] **Step 2: Update about.js**

Find `navigate("render")` → `navigate("/setup")`:

```js
document.getElementById("back-btn").addEventListener("click", () => {
  navigate("/setup");
});
```

- [ ] **Step 3: Update spell-selection-screen.js**

```js
document.getElementById("prev-btn").addEventListener("click", () => {
  navigate("/setup");
});

document.getElementById("next-btn").addEventListener("click", () => {
  navigate("/unit-assignment");
});
```

- [ ] **Step 4: Update unit-assignment.js**

Find the three navigate calls. The prev-btn navigates to spell-selection if army has casters, otherwise setup. The next-btn navigates to scenario-setup.

```js
document.getElementById("prev-btn")?.addEventListener("click", () => {
  const casters = getCasters(army);
  navigate(casters.length > 0 ? "/spell-selection" : "/setup");
});

document.getElementById("next-btn")?.addEventListener("click", () => {
  navigate("/scenario-setup");
});
```

- [ ] **Step 5: Update scenario-setup.js**

```js
// prev-btn
navigate("/unit-assignment");

// next-btn
navigate("/deployment");
```

- [ ] **Step 6: Update deployment.js**

```js
// prev-btn
navigate("/scenario-setup");

// next-btn
navigate("/first-turn");
```

- [ ] **Step 7: Update scoring.js**

Find the single navigate call in `src/screens/scoring.js`:

```js
navigate("gameOverScreen", army);
```

Replace with:

```js
navigate("/game-over");
```

- [ ] **Step 8: Commit**

```bash
git add src/screens/setup-header.js src/screens/about.js src/screens/spell-selection-screen.js src/screens/unit-assignment.js src/screens/scenario-setup.js src/screens/deployment.js src/screens/scoring.js
git commit -m "feat: update remaining screens to navigate by URL path"
```

---

### Task 11: Update test files

All test files that use `registerScreen` to check navigation need to be updated to spy on the `navigate` export instead.

**Files:**

- Modify: `src/test/screens/game-over.test.js`
- Modify: `src/test/screens/game.test.js`
- Modify: `src/test/screens/setup.test.js`
- Modify: `src/test/screens/scenario-setup.test.js`
- Modify: `src/test/screens/first-turn.test.js`
- Modify: `src/test/screens/unit-assignment.test.js`
- Modify: `src/test/screens/deployment.test.js`

**Pattern for all files:**

1. Remove `import { registerScreen } from "../../navigate.js"` and any real-screen imports only used for navigation
2. Add `import { vi, afterEach } from 'vitest'` (add `afterEach` to existing import if needed) and `import * as Nav from '../../navigate.js'`
3. Add `afterEach(() => { vi.restoreAllMocks(); })` if not already present
4. Replace `registerScreen("screenName", fn)` + variable tracking with `vi.spyOn(Nav, 'navigate').mockImplementation(() => {})`
5. Replace `expect(navigated).toBe("screenName")` with `expect(Nav.navigate).toHaveBeenCalledWith('/path')`

---

**game-over.test.js** — replace the 4 navigation tests:

Remove `import { registerScreen } from "../../navigate.js"`. Add to imports:

```js
import { vi, afterEach } from "vitest";
import * as Nav from "../../navigate.js";
```

Add after `beforeEach`:

```js
afterEach(() => {
  vi.restoreAllMocks();
});
```

Replace the 4 navigation tests:

```js
it("header Back navigates to game screen when not opponent turn", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderGameOverScreen(army);
  getApp().querySelector("#back-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/game/1/strategy/start-of-turn");
});

it("footer Back navigates to game screen when not opponent turn", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderGameOverScreen(army);
  getApp().querySelector("#back-btn-footer").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/game/1/strategy/start-of-turn");
});

it("Back navigates to opponent screen when on opponent turn", () => {
  saveIsOpponentTurn(true);
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderGameOverScreen(army);
  getApp().querySelector("#back-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/opponent/1/strategy");
});

it("New Game resets state and navigates to setup", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderGameOverScreen(army);
  getApp().querySelector("#new-game-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/setup");
  expect(getRound()).toBe(1);
  expect(getFirstTurn()).toBeNull();
});
```

---

**game.test.js** — replace the New Game navigation test:

Remove the `registerScreen` dynamic import. Add to the top-level imports:

```js
import { vi } from "vitest";
import * as Nav from "../../navigate.js";
```

Replace the `"New Game button navigates to setupScreen"` test:

```js
it("New Game button navigates to setup", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderGameScreen(army);
  const origConfirm = window.confirm;
  window.confirm = () => true;
  document.getElementById("new-game-btn").click();
  window.confirm = origConfirm;
  expect(Nav.navigate).toHaveBeenCalledWith("/setup");
  vi.restoreAllMocks();
});
```

---

**scenario-setup.test.js** — replace navigation tests:

Remove `import { registerScreen } from "../../navigate.js"` and the screen imports used only for navigation. Add:

```js
import { vi, afterEach } from "vitest";
import * as Nav from "../../navigate.js";
```

Add `afterEach(() => { vi.restoreAllMocks(); })`.

Replace the two navigation tests:

```js
it("prev-btn navigates back to unit assignment", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderScenarioSetupScreen(army);
  getApp().querySelector("#prev-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/unit-assignment");
});

it("next-btn navigates to deployment", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderScenarioSetupScreen(army);
  getApp().querySelector("#next-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/deployment");
});
```

---

**first-turn.test.js** — replace the navigation test:

Remove `import { registerScreen } from "../../navigate.js"` and `import { renderDeploymentScreen } from "../../screens/deployment.js"`. Add:

```js
import { vi } from "vitest";
import * as Nav from "../../navigate.js";
```

Replace the prev-btn test:

```js
it("has a prev-btn that navigates back to deployment", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderFirstTurnScreen(army);
  getApp().querySelector("#prev-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/deployment");
  vi.restoreAllMocks();
});
```

---

**unit-assignment.test.js** — replace navigation tests:

Remove `import { registerScreen } from "../../navigate.js"` and any screen imports used only for navigation. Add:

```js
import { vi, afterEach } from "vitest";
import * as Nav from "../../navigate.js";
```

Add `afterEach(() => { vi.restoreAllMocks(); })`. Replace the three navigation tests with:

```js
it("prev-btn navigates to spell selection when army has casters", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderUnitAssignmentScreen(army); // dark-elves has casters
  getApp().querySelector("#prev-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/spell-selection");
});

it("prev-btn navigates to setup screen when army has no casters", () => {
  const noCasterArmy = loadArmy("bretonnia");
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderUnitAssignmentScreen(noCasterArmy);
  getApp().querySelector("#prev-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/setup");
});

it("next-btn navigates to scenario setup", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderUnitAssignmentScreen(army);
  getApp().querySelector("#next-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/scenario-setup");
});
```

---

**deployment.test.js** — replace navigation tests:

Remove `import { registerScreen } from "../../navigate.js"` and screen imports used only for navigation. Add:

```js
import { vi, afterEach } from "vitest";
import * as Nav from "../../navigate.js";
```

Add `afterEach(() => { vi.restoreAllMocks(); })`. Replace the two navigation tests:

```js
it("prev-btn navigates back to scenario setup", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderDeploymentScreen(army);
  getApp().querySelector("#prev-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/scenario-setup");
});

it("next-btn navigates to first turn", () => {
  vi.spyOn(Nav, "navigate").mockImplementation(() => {});
  renderDeploymentScreen(army);
  getApp().querySelector("#next-btn").click();
  expect(Nav.navigate).toHaveBeenCalledWith("/first-turn");
});
```

---

**setup.test.js** — replace navigation tests:

Find all `registerScreen(...)` calls and replace with spy pattern. Replace any test that uses `navigated` variable. The exact replacements depend on what setup.test.js tests currently assert; apply the same pattern: spy on `Nav.navigate`, click, assert path.

---

- [ ] **Step 1: Update game-over.test.js** (as above)
- [ ] **Step 2: Update game.test.js** (as above)
- [ ] **Step 3: Update scenario-setup.test.js** (as above)
- [ ] **Step 4: Update first-turn.test.js** (as above)
- [ ] **Step 5: Update unit-assignment.test.js** (as above)
- [ ] **Step 6: Update deployment.test.js** (as above)
- [ ] **Step 7: Update setup.test.js** (same spy pattern — find each `registerScreen` call and replace)

- [ ] **Step 8: Run all tests**

```bash
npm test
```

Expected: all tests passing. If any fail:

- "registerScreen is not a function" → that test file wasn't updated yet
- "navigate is not a function" → check the import path in the test file
- Assertion failures → check the expected path matches the actual navigate call

- [ ] **Step 9: Commit**

```bash
git add src/test/screens/
git commit -m "test: update navigation assertions to use navigate spy"
```

---

### Task 12: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify each flow**

- Upload an army on `/turner-overdrive/#/setup`
- Progress through spell selection → unit assignment → scenario setup → deployment → first turn
- Confirm the URL hash updates at each step
- Click through several game phases and confirm the URL shows e.g. `#/game/1/movement/declare-charges`
- Press the browser back button and confirm it goes to the previous phase
- Confirm the browser forward button works
- Open the app at `#/` (no hash) and confirm it redirects to the correct screen based on localStorage state
- Confirm the opponent turn URL uses `#/opponent/1/strategy` format (no subphase)

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: no errors, bundle output in `dist/`.
