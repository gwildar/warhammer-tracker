# combat-weapons.js Split Design

## Goal

Split `src/context/combat-weapons.js` (1400+ lines) into two focused files — one for data assembly, one for rendering — to improve navigability, testability, and reduce blast radius when editing.

## Problem

`combat-weapons.js` does two distinct jobs in one file:

- Assembles plain data objects (weapon lists, stats, tags, combat rules) from army units
- Renders that data to HTML strings

The data assembly and rendering are entangled inside a single 650-line function (`renderCombatWeaponsContext`), with six helper functions defined inside it (untestable, hard to navigate). The other two exports follow the same pattern.

## Architecture

### `src/context/combat-data.js`

Pure logic — no HTML output (tag fragments like `{ inline: string, sub: string }` are acceptable as display data embedded in entry objects).

**Moves here (existing helpers):**

- `HAND_WEAPON`, `CHARACTER_CATEGORIES`, `isCharacter`
- `findVirtueAttacks`, `findMagicWeapon`, `matchRiderWeapons`, `matchMountWeapons`
- `isWeaponMagical`, `hasRiderMagicalAttacks`
- `detectItemBonuses`, `detectSingleUseItems`
- `buildRiderTags`, `buildMountWeaponTags`, `weaponPoisonTags`, `mergeTagParts`
- `buildItemNames`, `buildFilteredItems`
- `findChampions`, `getChampionWeapons`, `findCrewProfiles`, `findEmbeddedMount`
- `COMBAT_RELEVANT_RULES`, `RIDER_ONLY_RULES`, `CAVALRY_TROOP_TYPES`, `extractCombatRules`
- `getUnitLd`

**New exported functions (extracted from render functions):**

- `buildCombatEntries(army)` → sorted `rows[]` array — the data currently assembled in the first ~375 lines of `renderCombatWeaponsContext`
- `buildCombatResultEntries(army)` → deduped entries array for Static Combat Bonuses
- `buildCombatLeadershipData(army)` → `{ rows, general, generalLd, generalRange, bsb, bsbRange }` for Break Test

### `src/context/combat-render.js`

HTML rendering only. Imports data functions from `combat-data.js`.

**Moves here (existing render helpers):**

- `applyApMod`, `mergeStrength`, `REDUNDANT_RULE_PATTERNS`, `stripRedundantRules`
- `renderWeaponLine`, `renderMountWeapons`

**Hoisted from inside `renderCombatWeaponsContext` to module level:**

- `statRow`, `renderSingleUseItems`, `renderUnitWeapons`, `renderCombatRulesHtml`, `renderBanners`, `renderFooter`

**Three thin export wrappers (unchanged signatures):**

```js
export function renderCombatWeaponsContext(army) {
  const rows = buildCombatEntries(army);
  if (!rows.length) return "";
  return `...HTML...`;
}

export function renderCombatResultContext(army) {
  const rows = buildCombatResultEntries(army);
  if (!rows.length) return "";
  return `...HTML...`;
}

export function renderCombatLeadershipContext(army, title = "Break Test") {
  const data = buildCombatLeadershipData(army);
  if (!data.rows.length) return "";
  return `...HTML...`;
}
```

## Data Flow

```
army
 └─ buildCombatEntries(army)        [combat-data.js]
     ├─ matchRiderWeapons
     ├─ matchMountWeapons
     ├─ detectItemBonuses
     ├─ buildRiderTags
     ├─ buildFilteredItems
     ├─ extractCombatRules
     └─ findChampions / findCrewProfiles / findEmbeddedMount
         └─ rows[]                  [plain data, no HTML]
             └─ renderCombatWeaponsContext(army)  [combat-render.js]
                 ├─ statRow
                 ├─ renderUnitWeapons
                 │   └─ renderWeaponLine
                 └─ ...
                     └─ HTML string
```

## What Doesn't Change

- The three exported function names — all consumers are untouched
- The shape of the rendered HTML — identical output
- Test fixtures and helpers — no changes needed

## Testing

`buildCombatEntries`, `buildCombatResultEntries`, and `buildCombatLeadershipData` are now directly testable: pass an army, assert on the returned array without parsing HTML.

Existing render-level tests continue to work unchanged since export signatures are the same.

New tests can assert on data shape, e.g.:

- correct weapon names and stats in `rows`
- correct `mountWeapons` for units with embedded mounts
- correct `combatRules` for units with special rules
- correct `assignedCharProfiles` when characters are assigned

## File Size Estimate

- `combat-data.js`: ~700 lines (helpers + three build functions)
- `combat-render.js`: ~700 lines (render helpers + three thin export wrappers)

Down from one 1400-line file to two ~700-line focused files.
