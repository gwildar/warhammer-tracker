# Character Assignment Improvements — Design Spec

**Date:** 2026-04-09
**Branch:** feature/character-assignment

---

## Overview

Three targeted improvements to the character assignment feature:

1. Fix navigation so the assignment screen is reachable on every new game
2. Move the assignment screen title out of the header into the page body
3. Redesign the combat card to show T/W/AS/MR/Ward/Regen per model rather than per unit

---

## Change 1 — Navigation fix

### Problem

Once a game is in progress (`firstTurn` is set), pressing "New Game" calls `navigate("render")` which does not reliably land on the setup screen. The user cannot reach the assignment screen again without clearing the army.

### Design

In `game.js`, change the "New Game" handler:

```
// Before
navigate("render");

// After
navigate("setupScreen");
```

`resetGame()` and `saveFirstTurn(null)` are already called, so landing on the setup screen with `firstTurn === null` means "Start Game" routes to `unitAssignmentScreen` as it already does for a fresh army load.

**Spell selections and character assignments are preserved** — the assignment screen shows pre-filled with previous choices so the user can tweak before continuing.

**Replace army flow** is unchanged — uploading a new army resets `firstTurn` and generates new unit IDs, so old assignments won't match and the screen will appear effectively empty.

### Files

- `src/screens/game.js` — `bindGameActions`: `navigate("render")` → `navigate("setupScreen")`

---

## Change 2 — Assignment screen page title

### Problem

The prompt "Place characters in units (optional)" sits in the page header alongside the army name, giving it no visual hierarchy. There is no clear page title.

### Design

**Header** (simplified):

- Left: army name
- Right: "Save & Continue" button
- Remove the `<p>` tag containing "Place characters in units (optional)"

**Main content** (new title block, before the two-column layout):

```
SETUP                            ← text-xs uppercase tracking-wider text-wh-muted
Place Characters in Units        ← text-2xl font-bold text-wh-text
Optional                         ← text-xs text-wh-muted (subtitle line)
```

This matches the phase heading style used in the game screen (`<span>` label + `<h2>`).

### Files

- `src/screens/unit-assignment.js` — `renderUnitAssignmentScreen`: update header and add title block in main

---

## Change 3 — Combat card per-model stats

### Problem

T, W, AS, MR, Ward, and Regen are currently shown once in a single stat row at the top of each combat card. These are per-model stats — when a character is merged into a host unit, only the unit's stats are shown and the character's are invisible.

### Design

**Units with no assigned characters:** unchanged — stat row remains at card level.

**Units with assigned characters:** the card-level stat row is replaced with per-model blocks. Each model gets:

```
[Model name]                     [points — characters only]
T:3  W:1  AS:1+  MR:2  Ward:4+  Regen:—
I4 WS4 S4  Hand Weapon
```

Layout rules:

- Unit body block appears first (no points shown — unit points remain on the card header)
- Each assigned character appears below, separated by a divider, with their points shown on the right of the label
- Stats shown on each model's row: T, W, AS (if any), MR (if any), Ward (if any), Regen (if any)
- MR is shown per-model using the model's own value — no aggregation or stacking

**Banner and virtue effects** (`apMod`, `conditionalStrengthMods`) remain card-level — computed from `[unit, ...assignedChars]` and passed to every `renderWeaponLine` call regardless of which model it belongs to. This is correct: a banner in the unit affects all models fighting within it. The footnote for conditional strength mods (e.g. `* Banner of Har Ganeth`) stays at the bottom of the card, unchanged.

### Data changes

`assignedCharProfiles` entries (built in `renderCombatWeaponsContext`) gain additional fields per character:

| Field    | Source                                                         |
| -------- | -------------------------------------------------------------- |
| `t`      | `char.stats?.[0]?.T`                                           |
| `w`      | `char.stats?.[0]?.W`                                           |
| `as`     | `char.armourSave ?? null`                                      |
| `mr`     | `char.magicResistance ? parseInt(char.magicResistance) : null` |
| `ward`   | `char.ward ?? null`                                            |
| `regen`  | `char.regen ?? null`                                           |
| `points` | `char.points`                                                  |

The entry-level `mr`, `ward`, `regen`, `t`, `w`, `as` fields remain and become the unit body's stats shown in its model block.

### Rendering logic

```
if assignedCharProfiles.length === 0:
  // existing stat row at card level (unchanged)
else:
  // unit model block
  <label> [unit name]
  <stats> T W AS MR Ward Regen   (from entry-level fields)
  <weapons> ... (existing rider weapon lines)

  for each char in assignedCharProfiles:
    <divider>
    <label> [char.name]   [char.points]pts
    <stats> T W AS MR Ward Regen   (from char profile fields)
    <weapons> ... (existing char weapon lines)
```

### Files

- `src/context/combat-weapons.js`:
  - `assignedCharProfiles` builder: add `t`, `w`, `as`, `mr`, `ward`, `regen`, `points`
  - `renderCombatWeaponsContext` template: split stat rendering by `assignedCharProfiles.length`

---

## Out of scope

- Clearing assignments or spell selections on new game (user wants these remembered)
- Any changes to the opponent turn screen or scoring
- Changes to units without assigned characters
