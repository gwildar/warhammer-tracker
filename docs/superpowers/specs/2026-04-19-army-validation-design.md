# Army Validation Design

## Goal

Surface data-quality and logical warnings to the user after uploading an army list, without blocking gameplay.

## Problem

OWB exports occasionally contain quirks (e.g. shield listed in multiple data arrays) or logical inconsistencies (e.g. magic weapon alongside a mundane weapon) that produce unexpected computed stats or confusing combat display. Currently these pass silently.

## Architecture

### New file: `src/army-validation.js`

Exports a single function:

```js
export function validateArmy(rawJson, army)
```

- `rawJson` — the raw OWB JSON object (needed for data-quality checks on equipment/armor/options arrays before parsing)
- `army` — the parsed army object (needed for logical checks on resolved unit data)
- Returns `Warning[]` — empty array if clean

A warning is `{ unitName: string, message: string }`.

Internally, validation runs a list of check functions. Each check function has the signature:

```js
function checkFn(rawJson, army): Warning[]
```

New checks are added by pushing to the checks array — no changes to the core runner. Example:

```js
const CHECKS = [
  checkShieldInMultipleArrays,
  checkBardingWithoutMount,
  checkMagicWeaponWithMundane,
  checkNoStatProfile,
];

export function validateArmy(rawJson, army) {
  return CHECKS.flatMap((check) => check(rawJson, army));
}
```

### Modified: `src/screens/setup.js`

After `parseArmyList`, before `saveArmy`:

```js
const army = parseArmyList(json);
const warnings = validateArmy(json, army);
saveArmy(army);
renderSetupScreen();
```

Warnings stored in a module-level variable. `renderArmySummary` reads it. A dismiss action clears the variable and re-renders.

## The Four Checks

All checks are OWB-format only (New Recruit format has no raw equipment arrays to inspect; checks that only use `army` work for both).

### 1. Shield in multiple data arrays (raw JSON)

For each unit, collect active entries from `equipment[]`, `armor[]`, and `options[]`. Count how many distinct arrays contain at least one entry whose `name_en` includes "shield" (case-insensitive). If count > 1, emit a warning. (Counting by array, not by entry, prevents a combined string like `"Hand weapon, Lances, Shields"` from double-counting within a single array.)

Message: `"Shield appears in multiple data fields — check your OWB export."`

### 2. Barding with no active mount (raw JSON)

Only applies to units that have at least one entry in `mounts[]` (i.e. mounting is optional for this unit). Fixed cavalry (Blood Knights, Knights Errant, etc.) have no `mounts[]` array and are skipped — their barding is part of their permanent equipment.

For units with `mounts[]`: if any active entry in `equipment[]`, `armor[]`, or `options[]` includes "barding" (case-insensitive), check `mounts[]` for an entry with `active: true` and `name_en` not equal to "On foot". If no such mount exists, emit a warning.

Message: `"Barding equipped but no mount is active."`

### 3. Magic weapon + non-hand mundane weapon (raw JSON)

Note: this check must use the raw JSON, not the parsed army. `resolveWeapons` in the parser already replaces mundane weapons with a magic weapon and returns early, so `unit.weapons` on the parsed army will never contain both simultaneously — the inconsistency is invisible from parsed data.

For each unit: find magic weapon items in `unit.items[n].selected[]` where `type === "weapon"`. If any exist, check `unit.equipment[]` for active entries (where `active === true`) whose `name_en` does not include "hand weapon" (case-insensitive). If any such entry exists, emit a warning per mundane weapon name.

Message: `"Magic weapon equipped alongside [name_en] — only the magic weapon is used in combat."`

### 4. No stat profile (parsed unit)

For each unit in `army.units`: if `!unit.stats?.length`, emit a warning.

Message: `"No stat profile found — combat display will be incomplete."`

### 5. Missing vow in Bretonnian Exiles army (raw JSON)

Only runs when `rawJson.armyComposition === "bretonnian-exiles"`.

For each unit across all categories: collect options whose `name_en` contains "Vow" (case-insensitive). If at least one such option exists (unit is vow-eligible) and none has `active: true`, emit a warning.

This naturally excludes non-vow units (Peasant Bowmen, Yeomen, Outcast Wizard, etc.) which have no vow options. It does not warn about units that deliberately took the Questing Vow — it only fires when no vow is active at all.

Message: `"No vow is active — is this correct?"`

## Warning Panel

Rendered in `renderArmySummary`, above the Start button. Only shown if warnings exist.

- Amber styling, consistent with existing UI
- Units with multiple warnings: one heading, multiple bullet points
- Dismiss button clears warnings and re-renders (no page reload)
- Does not block the Start button

```
⚠ 3 warnings — check before playing     [×]

Baron
  • Magic weapon (Sword of Heroes) equipped alongside Lance —
    only the magic weapon is used in combat

Peasant Bowmen
  • Shield appears in multiple data fields — check your OWB export

Knight Errant
  • Barding equipped but no mount is active
```

## Testing

- `validateArmy` is pure (no DOM, no localStorage) — unit-testable directly
- Test each check function in isolation with fixture data
- Test `validateArmy` returns empty array for clean fixtures (dark-elves, bretonnia, etc.)
- Test dismiss interaction in setup screen integration test

## What Doesn't Change

- Parser output — no new fields added to parsed units
- Existing tests — no changes needed
- Consumer imports — `validateArmy` is a new export, nothing else changes
