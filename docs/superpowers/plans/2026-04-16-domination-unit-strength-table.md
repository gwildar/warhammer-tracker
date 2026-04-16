# Domination Unit Strength Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On the game-over screen, move the Domination section to the bottom and add a unit strength table inside it.

**Architecture:** Two changes to `src/screens/game-over.js` — reorder the conditional scenario sections (Domination moves after Baggage Trains and Special Features), then append a unit strength table inside the Domination card, built from `army.units` sorted by `unitStrength` descending.

**Tech Stack:** Vanilla JS, Tailwind CSS, Vitest

---

### Task 1: Write failing tests

**Files:**

- Modify: `src/test/screens/game-over.test.js`

- [ ] **Step 1: Add `saveScenarioOptions` to imports**

In `src/test/screens/game-over.test.js`, update the import from `../../state.js`:

```javascript
import {
  saveIsOpponentTurn,
  saveDeploymentTime,
  saveScenarioOptions,
  getRound,
  getFirstTurn,
  updateScore,
} from "../../state.js";
```

- [ ] **Step 2: Add a `afterEach` to reset scenario options**

After the existing `beforeEach` block (after line 19), add:

```javascript
afterEach(() => {
  saveScenarioOptions({
    domination: false,
    baggageTrains: false,
    strategicLocations: { enabled: false, count: 3 },
    specialFeatures: false,
  });
});
```

- [ ] **Step 3: Add test — domination section is last when multiple scenario sections are active**

Append inside the `describe("Game Over Screen", ...)` block:

```javascript
it("domination section appears after baggage trains when both enabled", () => {
  saveScenarioOptions({
    domination: true,
    baggageTrains: true,
    strategicLocations: { enabled: false, count: 3 },
    specialFeatures: false,
  });
  renderGameOverScreen(army);
  const html = getApp().innerHTML;
  expect(html.indexOf("Baggage Trains")).toBeLessThan(
    html.indexOf("Domination"),
  );
});
```

- [ ] **Step 4: Add test — unit strength table renders units sorted by US descending**

The dark-elves fixture has "Repeater Crossbowman" (US 25) and "Dark Rider" (US 12). Highest US unit should appear first in the HTML.

```javascript
it("shows unit strength table sorted by US descending in domination section", () => {
  saveScenarioOptions({
    domination: true,
    baggageTrains: false,
    strategicLocations: { enabled: false, count: 3 },
    specialFeatures: false,
  });
  renderGameOverScreen(army);
  const html = getApp().innerHTML;
  expect(html).toContain("Repeater Crossbowman");
  expect(html.indexOf("Repeater Crossbowman")).toBeLessThan(
    html.indexOf("Dark Rider"),
  );
});
```

- [ ] **Step 5: Run tests to confirm both new tests fail**

```bash
cd /Users/gjohnston/Projects/warhammer-tracker
npx vitest run src/test/screens/game-over.test.js
```

Expected: 2 new tests FAIL. All pre-existing tests still pass.

---

### Task 2: Move Domination section to the bottom

**Files:**

- Modify: `src/screens/game-over.js`

- [ ] **Step 1: Reorder the three conditional section blocks**

In `src/screens/game-over.js`, the template currently renders: Domination → Baggage Trains → Special Features (lines 123–179).

Replace the entire block (lines 123–179) so the order becomes: Baggage Trains → Special Features → Domination.

The new order (keep all existing HTML unchanged, just swap positions):

```javascript
          ${
            scenarioOpts.baggageTrains
              ? `
          <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
            <h3 class="text-sm font-bold text-wh-text mb-2">Baggage Trains</h3>
            <table class="w-full text-xs">
              <thead><tr class="text-left text-wh-muted">
                <th class="pb-1 pr-2 font-medium">Condition</th>
                <th class="pb-1 font-medium text-right">VP</th>
              </tr></thead>
              <tbody>
                <tr><td class="py-0.5 pr-2 text-wh-text">Control your supply train</td><td class="py-0.5 font-mono text-wh-accent text-right">100</td></tr>
                <tr><td class="py-0.5 pr-2 text-wh-text">Destroy opponent's supply train</td><td class="py-0.5 font-mono text-wh-accent text-right">250</td></tr>
              </tbody>
            </table>
          </div>`
              : ""
          }

          ${
            scenarioOpts.specialFeatures
              ? `
          <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
            <h3 class="text-sm font-bold text-wh-text mb-2">Special Features</h3>
            <table class="w-full text-xs">
              <thead><tr class="text-left text-wh-muted">
                <th class="pb-1 pr-2 font-medium">Condition</th>
                <th class="pb-1 font-medium text-right">VP</th>
              </tr></thead>
              <tbody>
                <tr><td class="py-0.5 pr-2 text-wh-text">Control the feature at game end</td><td class="py-0.5 font-mono text-wh-accent text-right">200</td></tr>
              </tbody>
            </table>
          </div>`
              : ""
          }

          ${
            scenarioOpts.domination
              ? `
          <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
            <h3 class="text-sm font-bold text-wh-text mb-2">Domination</h3>
            <p class="text-wh-muted text-xs mb-2">Score each board quarter separately. Winner = higher Unit Strength (fleeing units don't count).</p>
            <table class="w-full text-xs">
              <thead><tr class="text-left text-wh-muted">
                <th class="pb-1 pr-2 font-medium">Condition</th>
                <th class="pb-1 font-medium text-right">VP</th>
              </tr></thead>
              <tbody>
                <tr><td class="py-0.5 pr-2 text-wh-text">Control a quarter</td><td class="py-0.5 font-mono text-wh-accent text-right">100</td></tr>
                <tr><td class="py-0.5 pr-2 text-wh-text">2:1 US advantage in a quarter</td><td class="py-0.5 font-mono text-wh-accent text-right">+50</td></tr>
                <tr><td class="py-0.5 pr-2 text-wh-text">Opponent has 0 US in a quarter</td><td class="py-0.5 font-mono text-wh-accent text-right">+100</td></tr>
              </tbody>
            </table>
          </div>`
              : ""
          }
```

- [ ] **Step 2: Run tests — first test should now pass, second still fails**

```bash
npx vitest run src/test/screens/game-over.test.js
```

Expected: "domination section appears after baggage trains" PASSES. "shows unit strength table" still FAILS.

---

### Task 3: Add the unit strength table

**Files:**

- Modify: `src/screens/game-over.js`

- [ ] **Step 1: Replace the Domination card with the version that includes the unit strength table**

In `src/screens/game-over.js`, replace the domination conditional block (the one ending with the `</div>\`` you just placed at the bottom) with this version that appends the unit strength table after the VP reference table:

```javascript
          ${
            scenarioOpts.domination
              ? `
          <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
            <h3 class="text-sm font-bold text-wh-text mb-2">Domination</h3>
            <p class="text-wh-muted text-xs mb-2">Score each board quarter separately. Winner = higher Unit Strength (fleeing units don't count).</p>
            <table class="w-full text-xs">
              <thead><tr class="text-left text-wh-muted">
                <th class="pb-1 pr-2 font-medium">Condition</th>
                <th class="pb-1 font-medium text-right">VP</th>
              </tr></thead>
              <tbody>
                <tr><td class="py-0.5 pr-2 text-wh-text">Control a quarter</td><td class="py-0.5 font-mono text-wh-accent text-right">100</td></tr>
                <tr><td class="py-0.5 pr-2 text-wh-text">2:1 US advantage in a quarter</td><td class="py-0.5 font-mono text-wh-accent text-right">+50</td></tr>
                <tr><td class="py-0.5 pr-2 text-wh-text">Opponent has 0 US in a quarter</td><td class="py-0.5 font-mono text-wh-accent text-right">+100</td></tr>
              </tbody>
            </table>
            <div class="border-t border-wh-border mt-3 pt-3">
              <table class="w-full text-xs">
                <thead><tr class="text-left text-wh-muted">
                  <th class="pb-1 pr-2 font-medium">Unit</th>
                  <th class="pb-1 font-medium text-right">US</th>
                </tr></thead>
                <tbody>
                  ${army.units
                    .slice()
                    .sort((a, b) => b.unitStrength - a.unitStrength)
                    .map(
                      (u) =>
                        `<tr><td class="py-0.5 pr-2 text-wh-text">${u.name}</td><td class="py-0.5 font-mono text-wh-accent text-right">${u.unitStrength}</td></tr>`,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>`
              : ""
          }
```

- [ ] **Step 2: Run the full test suite**

```bash
npx vitest run src/test/screens/game-over.test.js
```

Expected: all tests pass including both new tests.

- [ ] **Step 3: Run full suite to confirm no regressions**

```bash
npx vitest run
```

Expected: all tests pass.

---

### Task 4: Commit

- [ ] **Commit**

```bash
git add src/screens/game-over.js src/test/screens/game-over.test.js
git commit -m "feat: add unit strength table to domination section on game over screen"
```
