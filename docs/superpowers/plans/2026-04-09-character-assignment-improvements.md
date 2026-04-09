# Character Assignment Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the "New Game" navigation so the assignment screen is always reachable, move the assignment page title into the body, and redesign combat cards to show T/W/AS/MR/Ward/Regen per model rather than per unit.

**Architecture:** Three independent changes. Task 1 is a one-line navigation fix. Task 2 restructures the assignment screen header and adds a phase-style title. Task 3 extends `assignedCharProfiles` with per-model stat fields and rewrites the combat card template to conditionally render per-model blocks when characters are present.

**Tech Stack:** Vanilla JS, Tailwind CSS, Vitest + jsdom

---

## File Structure

| File                                       | Change | Purpose                                          |
| ------------------------------------------ | ------ | ------------------------------------------------ |
| `src/screens/game.js`                      | Modify | Fix New Game to route to `setupScreen`           |
| `src/screens/unit-assignment.js`           | Modify | Move title out of header into main body          |
| `src/context/combat-weapons.js`            | Modify | Add per-model stat fields; rewrite card template |
| `src/test/screens/game.test.js`            | Modify | Tests for navigation fix + per-model combat card |
| `src/test/screens/unit-assignment.test.js` | Modify | Tests for new title layout                       |

---

## Task 1: Navigation fix — New Game routes to setupScreen

**Files:**

- Modify: `src/screens/game.js`
- Modify: `src/test/screens/game.test.js`

### Background

`navigate(name)` looks up a registered screen function and calls it. In tests, `registerScreen` is used to wire up the screen functions. The "New Game" handler currently calls `navigate("render")` which doesn't reliably show the setup screen. The fix is to call `navigate("setupScreen")` instead.

- [ ] **Step 1: Write the failing test**

Add to the `"Game Screen"` describe block in `src/test/screens/game.test.js`, after the existing `"shows New Game button"` test:

```js
it("New Game button navigates to setupScreen", () => {
  const { renderSetupScreen } = await import("../../screens/setup.js");
  const { registerScreen } = await import("../../navigate.js");
  let navigated = null;
  registerScreen("setupScreen", () => { navigated = "setupScreen"; });
  registerScreen("render", () => { navigated = "render"; });

  renderGameScreen(army);
  document.getElementById("new-game-btn").click();
  // jsdom confirm() returns false by default — override it
  const origConfirm = window.confirm;
  window.confirm = () => true;
  document.getElementById("new-game-btn").click();
  window.confirm = origConfirm;

  expect(navigated).toBe("setupScreen");
});
```

Wait — `confirm` needs to be mocked before the click. Rewrite the test correctly:

```js
it("New Game button navigates to setupScreen", async () => {
  const { registerScreen } = await import("../../navigate.js");
  let navigated = null;
  registerScreen("setupScreen", () => {
    navigated = "setupScreen";
  });
  registerScreen("render", () => {
    navigated = "render";
  });

  renderGameScreen(army);
  window.confirm = () => true;
  document.getElementById("new-game-btn").click();
  window.confirm = undefined;

  expect(navigated).toBe("setupScreen");
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A5 "navigates to setupScreen"
```

Expected: FAIL — `navigated` is `"render"` not `"setupScreen"`

- [ ] **Step 3: Apply the fix**

In `src/screens/game.js`, find `bindGameActions` and change the "New Game" handler:

```js
// Before:
document.getElementById("new-game-btn")?.addEventListener("click", () => {
  if (confirm("Start a new game? This will reset the round counter.")) {
    resetGame();
    saveFirstTurn(null);
    navigate("render");
  }
});

// After:
document.getElementById("new-game-btn")?.addEventListener("click", () => {
  if (confirm("Start a new game? This will reset the round counter.")) {
    resetGame();
    saveFirstTurn(null);
    navigate("setupScreen");
  }
});
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A5 "navigates to setupScreen"
```

Expected: PASS

- [ ] **Step 5: Run the full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: all existing tests still pass

- [ ] **Step 6: Commit**

```bash
git add src/screens/game.js src/test/screens/game.test.js
git commit -m "fix: New Game navigates to setupScreen so assignment screen is reachable"
```

---

## Task 2: Assignment screen — page title in body

**Files:**

- Modify: `src/screens/unit-assignment.js`
- Modify: `src/test/screens/unit-assignment.test.js`

### Background

The current header has three columns: left `<p>` with "Place characters in units (optional)", centre army name `<h1>`, right Save & Continue button. The `<p>` text needs to move into the main content area as a styled page title. The phase heading style (from `game.js`) is:

```html
<span class="text-xs uppercase tracking-wider text-wh-muted">PHASE</span>
<h2 class="text-2xl font-bold text-wh-text">Sub-phase name</h2>
```

- [ ] **Step 1: Write the failing tests**

Add to `src/test/screens/unit-assignment.test.js`, inside the existing `"Unit assignment screen"` describe block:

```js
it("shows page title in main content, not in header", () => {
  renderUnitAssignmentScreen(army);
  const header = getApp().querySelector("header");
  const main = getApp().querySelector("main");
  expect(header.textContent).not.toContain("Place Characters in Units");
  expect(main.querySelector("h2").textContent).toContain(
    "Place Characters in Units",
  );
});

it("shows Optional subtitle below the h2 title", () => {
  renderUnitAssignmentScreen(army);
  const main = getApp().querySelector("main");
  expect(main.textContent).toContain("Optional");
});

it("header still contains Save and Continue button and army name", () => {
  renderUnitAssignmentScreen(army);
  const header = getApp().querySelector("header");
  expect(header.querySelector("#save-assignments-btn")).toBeTruthy();
  expect(header.textContent).toContain(army.name);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A5 "page title in main"
```

Expected: FAIL — `main.querySelector("h2")` is null

- [ ] **Step 3: Update the screen template**

In `src/screens/unit-assignment.js`, replace the `app.innerHTML = ...` inside `renderUnitAssignmentScreen`. The header changes from three columns (text + army name + button) to two columns (army name + button). A new title block is added before the two-column layout in `<main>`.

```js
app.innerHTML = `
  <div class="min-h-dvh flex flex-col">
    <header class="p-4 border-b border-wh-border">
      <div class="flex justify-between items-center max-w-4xl mx-auto">
        <h1 class="text-xl font-bold text-wh-accent">${army.name}</h1>
        <button id="save-assignments-btn"
          class="px-4 py-2 bg-wh-accent text-wh-bg rounded text-sm font-semibold hover:opacity-90">
          Save &amp; Continue
        </button>
      </div>
    </header>
    <main class="flex-1 p-4 max-w-4xl mx-auto w-full">
      <div class="mb-4">
        <span class="text-xs uppercase tracking-wider text-wh-muted">Setup</span>
        <h2 class="text-2xl font-bold text-wh-text">Place Characters in Units</h2>
        <span class="text-xs text-wh-muted">Optional</span>
      </div>
      <div class="flex gap-4">
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
      </div>
    </main>
  </div>
`;
```

Note: the `<main>` has changed from `flex flex-col` to just holding the title block + a nested `flex gap-4` div for the two columns.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A3 "unit assignment screen"
```

Expected: all unit assignment tests PASS

- [ ] **Step 5: Run the full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/screens/unit-assignment.js src/test/screens/unit-assignment.test.js
git commit -m "feat: move assignment screen title into main body as phase-style heading"
```

---

## Task 3: Combat card — per-model T/W/AS/MR/Ward/Regen

**Files:**

- Modify: `src/context/combat-weapons.js`
- Modify: `src/test/screens/game.test.js`

### Background

`renderCombatWeaponsContext` builds an `entries` array. Each entry has `assignedCharProfiles` — currently containing `{ name, i, ws, s, a, weapons, tags }`. The entry also has top-level `t`, `w`, `as`, `mr`, `ward`, `regen` for the unit. These need to become the unit body's stats and each char profile needs its own copy.

The `mr` field currently accumulates MR from both unit and all assigned chars (`unitMRNum + charMRNum`). Since MR is now per-model, the entry-level `mr` should only reflect the unit's own MR.

The rendering template currently shows one stat row per card. When `assignedCharProfiles.length > 0`, the stat row needs to become per-model blocks: unit model block first, then a divider + model block per character.

Characters are currently rendered as labelled weapon lines (`ch.name` is passed as the label). In per-model blocks, the name goes in the model header, not on each weapon line — so pass `null` as the label to `renderWeaponLine`.

### Step 3a: Extend `assignedCharProfiles` and fix MR computation

- [ ] **Step 1: Write failing tests**

Add a new describe block to `src/test/screens/game.test.js`:

```js
describe("Combat phase — character assignment", () => {
  let army;

  beforeEach(() => {
    saveCharacterAssignments({});
    army = loadArmy("bretonnia");
    startGame(army);
    savePhaseIndex(10); // choose-fight
  });

  function assignFirstCharToFirstUnit(a) {
    const chars = ["characters", "lords", "heroes"];
    const char = a.units.find((u) => chars.includes(u.category));
    const unit = a.units.find((u) => !chars.includes(u.category));
    saveCharacterAssignments({ [char.id]: unit.id });
    return { char, unit };
  }

  it("shows character name as a model label inside the host unit card", () => {
    const { char, unit } = assignFirstCharToFirstUnit(army);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const hostCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes(unit.name),
    );
    expect(hostCard).toBeTruthy();
    expect(hostCard.textContent).toContain(char.name);
  });

  it("shows character points inside the host unit card", () => {
    const { char, unit } = assignFirstCharToFirstUnit(army);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const hostCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes(unit.name),
    );
    expect(hostCard.textContent).toContain(`${char.points}pts`);
  });

  it("shows character T and W in the host unit card", () => {
    const { char, unit } = assignFirstCharToFirstUnit(army);
    const charT = char.stats?.[0]?.T;
    const charW = char.stats?.[0]?.W;
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const hostCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) => el.textContent.includes(unit.name),
    );
    if (charT) expect(hostCard.textContent).toContain(`T:${charT}`);
    if (charW) expect(hostCard.textContent).toContain(`W:${charW}`);
  });

  it("does not show assigned character as a standalone combat card", () => {
    const { char } = assignFirstCharToFirstUnit(army);
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const cards = [...combatPanel.querySelectorAll(".bg-wh-card")];
    // The character should not appear as its own top-level card
    const standalone = cards.find(
      (el) =>
        el.querySelector(".text-wh-text.font-semibold")?.textContent.trim() ===
        char.name,
    );
    expect(standalone).toBeFalsy();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A5 "character assignment"
```

Expected: FAIL — character name label not found / points not shown

- [ ] **Step 3: Extend `assignedCharProfiles` builder in `combat-weapons.js`**

Locate the `assignedCharProfiles` builder (around line 495–507). Replace it:

```js
// Before:
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

// After:
const assignedCharProfiles = assignedChars.map((char) => {
  const cStats = char.stats?.[0];
  const { weapons: charWeapons } = matchRiderWeapons(char);
  return {
    name: char.name,
    points: char.points,
    i: cStats?.I || "?",
    ws: cStats?.WS || "?",
    s: cStats?.S || "?",
    a: cStats?.A || "?",
    t: cStats?.T || "?",
    w: cStats?.W || "?",
    as: char.armourSave ?? null,
    mr: char.magicResistance ? parseInt(char.magicResistance) : null,
    ward: char.ward ?? null,
    regen: char.regen ?? null,
    weapons: charWeapons.length > 0 ? charWeapons : [HAND_WEAPON],
    tags: buildRiderTags(char),
  };
});
```

- [ ] **Step 4: Fix the MR computation to use unit-only MR**

Locate the `mergedMR` line (around line 492). Change:

```js
// Before:
const mergedMR =
  unitMRNum + charMRNum !== 0 ? `${unitMRNum + charMRNum}` : null;

// After:
const mergedMR = unitMRNum !== 0 ? `${unitMRNum}` : null;
```

The `charMRNum` variable is no longer needed. Remove the line that computes it:

```js
// Remove this line:
const charMRNum = assignedChars.reduce(
  (sum, c) => sum + (c.magicResistance ? parseInt(c.magicResistance) : 0),
  0,
);
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A5 "character assignment"
```

Expected: all 4 new tests PASS (the template still renders char names in weapon lines via the label arg — the "model label" test may or may not pass yet; the points test will fail until the template is updated in step 3b)

### Step 3b: Rewrite the combat card template for per-model blocks

- [ ] **Step 6: Locate the card rendering template**

In `src/context/combat-weapons.js`, find the `rows.map((r) => ...)` template inside `renderCombatWeaponsContext`. The card body currently starts (after the unit name/pts header) with a stat row div:

```js
<div class="flex items-center gap-2 flex-wrap mt-0.5">
  <span class="text-wh-muted font-mono text-xs">T:${r.t}</span>
  ...
</div>
```

And the weapon block starts with:

```js
<div class="mt-1">
  ${(r.assignedCharProfiles || [])
    .flatMap((ch) =>
      ch.weapons.map((w) =>
        renderWeaponLine(ch.i, ch.ws, ch.s, ch.a, w, ch.name, ch.tags, { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods })
      )
    )
    .join("")}
  ${...champions...}
  ${...riderWeapons...}
  ...
```

- [ ] **Step 7: Extract a reusable stat row snippet**

Add this helper function near the top of `renderCombatWeaponsContext` (before the `return` statement, after `const rows = ...`):

```js
function statRow(t, w, as_, mr, ward, regen) {
  return `<div class="flex items-center gap-2 flex-wrap mt-0.5">
    <span class="text-wh-muted font-mono text-xs">T:${t}</span>
    <span class="text-wh-muted font-mono text-xs">W:${w}</span>
    ${as_ ? `<span class="text-blue-400 font-mono text-xs">\u{1F6E1}\uFE0FAS:${as_}</span>` : ""}
    ${mr ? `<span class="text-wh-phase-combat font-mono text-xs">\u2728MR:${mr}</span>` : ""}
    ${ward ? `<span class="text-purple-400 font-mono text-xs">\u{1F52E}Ward:${ward}</span>` : ""}
    ${regen ? `<span class="text-green-400 font-mono text-xs">\u{1F49A}Regen:${regen}</span>` : ""}
  </div>`;
}
```

Note: use the same Unicode escapes already present in the file for the emoji characters.

- [ ] **Step 8: Rewrite the card body**

Replace the section from the `<div class="flex items-center gap-2 flex-wrap mt-0.5">` stat row down through the closing `</div>` of the weapon block (ending just before `</div>` that closes `<div class="p-2 rounded bg-wh-card">`).

The new template for the card body (inside `<div class="p-2 rounded bg-wh-card">`), after the unit name/pts header:

```js
${(r.assignedCharProfiles || []).length === 0
  ? /* --- no characters: existing layout unchanged --- */ `
      ${statRow(r.t, r.w, r.as, r.mr, r.ward, r.regen)}
      ${
        r.singleUseItems.length > 0
          ? `<div class="mt-1">${r.singleUseItems.map((item) => `<div class="text-xs"><span class="text-wh-accent">\u{1F6E1} ${item.name}</span> <span class="text-wh-muted">(single use)</span></div>`).join("")}</div>`
          : ""
      }
      <div class="mt-1">
        ${renderUnitWeapons(r)}
        ${renderFooter(r)}
      </div>
    `
  : /* --- characters assigned: per-model blocks --- */ `
      ${
        r.singleUseItems.length > 0
          ? `<div class="mt-1">${r.singleUseItems.map((item) => `<div class="text-xs"><span class="text-wh-accent">\u{1F6E1} ${item.name}</span> <span class="text-wh-muted">(single use)</span></div>`).join("")}</div>`
          : ""
      }
      <div class="mt-1">
        <div class="text-[9px] uppercase tracking-wide text-wh-muted mb-0.5">${r.unitName}</div>
        ${statRow(r.t, r.w, r.as, r.mr, r.ward, r.regen)}
        ${renderUnitWeapons(r)}
        ${(r.assignedCharProfiles || []).map((ch) => `
          <div class="border-t border-wh-border mt-1.5 pt-1.5">
            <div class="flex justify-between items-center">
              <div class="text-[9px] uppercase tracking-wide text-wh-muted">${ch.name}</div>
              <div class="text-[9px] text-wh-muted font-mono">${ch.points}pts</div>
            </div>
            ${statRow(ch.t, ch.w, ch.as, ch.mr, ch.ward, ch.regen)}
            ${ch.weapons.map((w) =>
              renderWeaponLine(ch.i, ch.ws, ch.s, ch.a, w, null, ch.tags, {
                apMod: r.apMod,
                conditionalSMods: r.conditionalStrengthMods,
              })
            ).join("")}
          </div>
        `).join("")}
        ${renderFooter(r)}
      </div>
    `
}
```

Extract two helpers immediately before the `return` statement in `renderCombatWeaponsContext` (these keep the template readable):

```js
function renderUnitWeapons(r) {
  return [
    ...(r.champions || []).flatMap((ch) =>
      ch.weapons.map((w) =>
        renderWeaponLine(
          ch.i,
          ch.ws,
          ch.s,
          ch.a,
          w,
          ch.name,
          ch.tags !== null ? ch.tags : r.riderTags,
          {
            apMod: r.apMod,
            conditionalSMods: r.conditionalStrengthMods,
          },
        ),
      ),
    ),
    ...r.riderWeapons.map((w) =>
      renderWeaponLine(
        r.riderI,
        r.riderWS,
        r.riderS,
        r.riderA,
        w,
        r.riderName,
        r.riderTags,
        {
          apMod: r.apMod,
          conditionalSMods: r.conditionalStrengthMods,
        },
      ),
    ),
    ...r.crew.map((c) =>
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
    ),
    r.mountWeapons.length > 0
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
        : "",
    r.stomp || r.impactHits
      ? `<div class="text-xs text-wh-phase-combat">${r.impactHits ? `\u{1F4A5} Impact ${r.impactHits}` : ""}${r.stomp && r.impactHits ? " | " : ""}${r.stomp ? `\u{1F9B6} Stomp ${r.stomp}` : ""}</div>`
      : "",
  ].join("");
}

function renderFooter(r) {
  return [
    (r.conditionalStrengthMods || []).length > 0
      ? r.conditionalStrengthMods
          .map(
            (m) => `<div class="text-[10px] text-wh-muted">* ${m.source}</div>`,
          )
          .join("")
      : "",
    r.itemNames.length > 0
      ? `<div class="text-xs text-wh-muted mt-0.5">${r.itemNames.join(", ")}</div>`
      : "",
    r.combatRules.length > 0
      ? `<div class="text-xs text-wh-accent mt-0.5">${r.combatRules.join(", ")}</div>`
      : "",
  ].join("");
}
```

Note: `statRow`, `renderUnitWeapons`, and `renderFooter` are all defined inside `renderCombatWeaponsContext` as local functions (using `function` declarations, which are hoisted), immediately before the `return` statement.

- [ ] **Step 9: Run all tests**

```bash
npm test 2>&1 | tail -20
```

Expected: all tests pass, including the 4 new character assignment tests

If any existing test fails, check:

- `renderUnitWeapons` correctly replicates the original champion/rider/crew/mount rendering
- `renderFooter` correctly replicates the original item names and combat rules rendering
- `statRow` uses the same emoji Unicode escapes as the original (copy from the original template)

- [ ] **Step 10: Commit**

```bash
git add src/context/combat-weapons.js src/test/screens/game.test.js
git commit -m "feat: show T/W/AS/MR/Ward/Regen per model on combat card when characters are assigned"
```

---

## Self-Review

**Spec coverage:**

- ✅ Change 1 (navigation fix): Task 1 covers `navigate("setupScreen")` change and test
- ✅ Change 2 (page title): Task 2 covers header simplification and body title block
- ✅ Change 3 (per-model stats): Task 3a extends `assignedCharProfiles`, fixes MR; Task 3b rewrites template
- ✅ Banner/virtue effects: `apMod` and `conditionalSMods` still passed to all `renderWeaponLine` calls
- ✅ No-character units unchanged: conditional on `assignedCharProfiles.length === 0`
- ✅ Character points shown: `ch.points` in the model label row

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**

- `statRow(t, w, as_, mr, ward, regen)` — called with `(r.t, r.w, r.as, r.mr, r.ward, r.regen)` for unit block and `(ch.t, ch.w, ch.as, ch.mr, ch.ward, ch.regen)` for char block — consistent
- `assignedCharProfiles` fields added in Task 3a are consumed in Task 3b — consistent
- `renderUnitWeapons(r)` and `renderFooter(r)` both receive the full entry `r` — consistent with how data is structured
