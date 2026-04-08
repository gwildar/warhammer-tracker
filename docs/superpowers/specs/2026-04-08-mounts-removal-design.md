# mounts.js Removal Design

Date: 2026-04-08

## Problem

`src/data/mounts.js` (883 lines) duplicates data already present in `src/data/units.js`. Every ridden mount has a unit profile entry in `units.js`; `mounts.js` maintains a parallel flat array (`MOUNTS`) with the same stats in a different schema. This is dead weight that must be kept in sync manually.

## Goal

Delete `mounts.js`. Derive all mount data from `units.js` at runtime. No consumer behaviour changes.

---

## Section 1 — Data additions to units.js

Two mounts exist in `mounts.js` but have no unit profile entry in `units.js`:

- **Forest Dragon** — needs a standalone unit profile added
- **Rhinox (as mount)** — the Rhinox profile embedded in the Gnoblar Scraplauncher crewed unit is not a standalone entry; a separate `"rhinox"` key is needed

Both must be added as standard unit profile entries before the adapter can serve them.

---

## Section 2 — findMount() adapter

`findMount()` moves to `resolve.js` (already hosts `resolveMount()`). The `MOUNTS` array and the old `findMount()` in `mounts.js` are removed.

The new `findMount(name)`:

1. Slugifies the name: `"Black Dragon"` → `"black-dragon"`
2. Looks up `UNIT_STATS[slug]` via `resolveUnitEntry()`, takes the first profile
3. Translates unit profile fields to the current mount object shape

### Field mapping

| Mount field   | Source in unit profile                                   |
| ------------- | -------------------------------------------------------- |
| `name`        | `profile.Name`                                           |
| `m`           | `parseInt(profile.M)`                                    |
| `stomp`       | `profile.Stomps \|\| null`                               |
| `impactHits`  | `profile["Impact-Hits"] \|\| null`                       |
| `tBonus`      | parse `"(+N)"` from `profile.T`, else `0`                |
| `wBonus`      | parse `"(+N)"` from `profile.W`, else `0`                |
| `ws`          | `profile.WS`                                             |
| `s`           | `profile.S`                                              |
| `i`           | `profile.I`                                              |
| `a`           | `profile.A`                                              |
| `as`          | `profile.as`                                             |
| `weapons`     | `profile.equipment` filtered to known combat weapon keys |
| `swiftstride` | `profile.rules.includes("Swiftstride")`                  |
| `troopType`   | `profile.troopType[0]`                                   |
| `armourBane`  | extracted from rules e.g. `"Armour Bane (1)"` → `1`      |

Only fields consumed by existing code are included. `f` (fly), `breath`, `armourMod` are not read by any consumer and are omitted.

All 4 consumers (`resolve.js`, `combat-weapons.js`, `special-rules-context.js`, `helpers.js`) are unchanged — they continue reading `mount.m`, `mount.tBonus`, etc.

---

## Section 3 — TROOP_TYPE_RULES

`TROOP_TYPE_RULES` moves from `mounts.js` into `special-rules-context.js` as a module-local constant (it has no other consumer):

```js
const TROOP_TYPE_RULES = {
  MCa: ["Fear"],
  MCr: ["Fear", "Large Target"],
  Be: ["Terror", "Large Target", "Lumbering"],
};
```

`LCa` and `HCa` keys are dropped — they mapped to empty arrays and were never matched (unit profiles use `LC`/`HC`). No behaviour change.

---

## Section 4 — Tests & deletion

- `mounts.js` is deleted once the adapter and data additions are in place
- All four `mounts.js` imports are removed from their respective files
- Existing tests remain green — the adapter returns the same shaped object, so no consumer logic changes
- One new test: `findMount("Black Dragon")` returns correct `tBonus`, `stomp`, `swiftstride` values — confirms the adapter field mapping works

---

## Out of scope

- Changing consumer field access patterns
- Changing `TROOP_TYPE_RULES` logic or coverage
- Any display or UI changes
