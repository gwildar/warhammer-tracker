# Deployment Screen Design

## Goal

Add a deployment screen between character assignment and turn choice. It always shows a deployment sequence explainer and lists any units with Scouts, Vanguard, or Ambushers. It also times deployment and surfaces that time as a row in the scoring table.

## Flow

```
setup → spell selection → unit assignment → deployment (NEW) → first turn → game
```

- `unit-assignment.js` "Save & Continue" navigates to `deploymentScreen` (currently goes to `firstTurnScreen`)
- `deployment.js` "Continue" navigates to `firstTurnScreen`
- Always shown — no skip logic

## Files changed

| Change               | File                             |
| -------------------- | -------------------------------- |
| New screen           | `src/screens/deployment.js`      |
| Register screen      | `src/main.js`                    |
| Update navigation    | `src/screens/unit-assignment.js` |
| New state            | `src/state.js`                   |
| Update scoring table | `src/screens/scoring.js`         |

---

## Screen: deployment.js

### Structure

Matches the unit-assignment screen layout:

```
Header
  army.name (left)                   [Continue] (right, wh-accent button)

Main
  [eyebrow]  Setup
  [title]    Deployment

  [Explainer card — always shown]
  [Units section — only if army has Scouts / Vanguard / Ambushers units]
```

### Explainer card

Inline card (no `<details>` / no summary toggle). Styled as `bg-wh-surface border border-wh-border rounded-lg p-4`.

Title: **Deployment sequence** (small, muted uppercase label)

Numbered list:

1. Roll off — higher result picks deployment zone and decides who deploys first
2. Alternate deploying one unit at a time. Characters may join a unit or deploy separately.
3. After all other units: **Scouts** deploy — must be placed >12" from all enemy models
4. After Scouts: **Vanguard** units make their Vanguard move — no march; cannot charge on turn 1
5. **Ambushers** are held in reserve and arrive from round 2 onwards

### Units section

Only rendered if `army.units` contains at least one unit whose `specialRules` includes a rule matching (case-insensitive) `"scouts"`, `"vanguard"`, `"ambushers"`, or `"ambush"`.

Title: `Deployment Rules` (small caps muted heading, same style as unit-assignment column headers)

One card per matching unit (`bg-wh-card border border-wh-border rounded p-2 mb-2`):

- Unit name (`text-sm font-semibold text-wh-text`)
- Rule badge per matching rule — small label showing `displayName` in `text-wh-accent` (or rule-colour equivalent)
- Description from `SPECIAL_RULES` data for that rule (`text-xs text-wh-muted mt-0.5`)

A unit may have more than one deployment rule (e.g. both Vanguard and Scouts) — show all matching rules on the same card.

### Timer

`startTime` is already running from page load (set by `resetStartTime()` in `main.js`). On "Continue" click:

1. `saveDeploymentTime(Date.now() - getStartTime())`
2. `resetStartTime()` (so the game timer starts fresh)
3. `navigate("firstTurnScreen", army)`

---

## State: state.js

### New key

```js
KEYS = {
  ...existing,
  deploymentTime: "tow-deployment-time",
};
```

### New functions

```js
export function getDeploymentTime() {
  return load(KEYS.deploymentTime, null);
}

export function saveDeploymentTime(ms) {
  save(KEYS.deploymentTime, ms);
}
```

### Reset

Clear `deploymentTime` in both `resetGame()` and `clearAll()`:

```js
save(KEYS.deploymentTime, null);
```

---

## Scoring table: scoring.js

### Remove

The existing `timingsHtml` block (the `<details>` per-round breakdown rendered below the table). It is replaced by the Time column.

### Add: Time column

The table gains a fifth column: **Time**.

New header row: `Rd | Turn | You | Opp | Time`

For each turn row, Time = sum of all `timings[round][turn][phaseIdx]` values (the existing per-sub-phase timing data). Formatted as `m:ss` using the existing `formatDuration`. Shows `—` if no timing data for that row.

### Add: Deployment row (Rd 0)

Shown only if `getDeploymentTime()` returns a non-null value. Rendered before round 1 rows:

```
Rd   Turn      You   Opp   Time
0    Deploy     —     —    20:00
```

- `Rd` cell: `0`
- `Turn` cell: `Deploy` (italic, muted, same style as other Turn cells)
- `You` / `Opp` cells: `—` (no scores for deployment)
- `Time` cell: `formatDuration(getDeploymentTime())`

Deployment row is not included in the You/Opp totals in `<tfoot>`.

---

## Detection logic (deployment.js)

```js
const DEPLOYMENT_RULE_IDS = new Set([
  "scouts",
  "vanguard",
  "ambushers",
  "ambush",
]);

function hasDeploymentRule(unit) {
  return (unit.specialRules || []).some((r) =>
    DEPLOYMENT_RULE_IDS.has(
      (r.displayName || "")
        .toLowerCase()
        .replace(/\s*\(.*$/, "")
        .trim(),
    ),
  );
}
```

Rule description lookup: use existing `SPECIAL_RULES` array from `src/data/special-rules.js`, matching by `id`.

---

## Navigation changes

### unit-assignment.js

Change "Save & Continue" handler:

```js
// Before:
navigate("firstTurnScreen", army);

// After:
navigate("deploymentScreen", army);
```

### main.js

Import and register:

```js
import { renderDeploymentScreen } from "./screens/deployment.js";
registerScreen("deploymentScreen", renderDeploymentScreen);
```
