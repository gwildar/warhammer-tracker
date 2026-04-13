# Bug Fixes: Two Banners / Opponent Turn Items

Date: 2026-04-13

## Summary

Three bugs, three surgical fixes.

---

## Bug 1 — Two banners: only one shows when BSB is assigned to a unit

### Symptom

Assigning the Paladin (BSB with Errantry Banner) to the Pegasus Knights unit (which has Banner of Châlons on its standard bearer) shows only the Errantry Banner in the combat card footer. Banner of Châlons is silently dropped.

### Root cause

`normaliseItemName()` in `src/parsers/resolve.js` strips the command-group suffix (e.g., `" (Standard bearer)"`) and lowercases, but does **not** strip diacritics. The OWB fixture stores the item name as `"Banner of Châlons"` (â with accent). After normalisation this becomes `"banner of châlons"`. However, `MAGIC_ITEM_MAP` is built from the source data in `magic-items.js`, which uses `"Banner of Chalons"` (no accent) — so the key in the map is `"banner of chalons"`. The lookup `MAGIC_ITEM_MAP["banner of châlons"]` returns `undefined`; the item is silently skipped; the unit ends up with `magicItems = []`; `filteredBannerNames` is empty; only the character's banner (Errantry Banner, unaffected) appears via `charBannerNames`.

### Fix

- In `normaliseItemName`: add NFD decomposition + combining-mark strip after lowercase, so `"châlons"` → `"chalons"`.
- In `buildMagicItemMap`: apply the same normalisation to map keys, so that any future accented names in `magic-items.js` also resolve correctly.

### Test

New test in `src/test/combat-banner.test.js`:

- Load `forest-goblins` fixture.
- Call `saveCharacterAssignments({ "paladin.altni": "pegasus-knights.ddysojsbrl" })`.
- Render `renderCombatWeaponsContext(army)`.
- Find the Pegasus Knights card.
- Assert both `"Banner of Chalons"` and `"Errantry Banner"` appear in the card.

Files touched: `src/parsers/resolve.js`, `src/test/combat-banner.test.js`.

---

## Bug 2 — Arch-Lightning Rod shows on opponent's turn

### Symptom

During the Strategy phase of the opponent's turn, Arch-Lightning Rod appears in the magic items block. It is a your-turn-only Command sub-phase item.

### Root cause

`renderMagicItemsContext` (called from `renderOpponentPhaseContext` with `subPhaseId = null`) only skips items when `!subPhaseId && item.yourTurnOnly`. Arch-Lightning Rod has no `yourTurnOnly` property.

### Fix

Add `yourTurnOnly: true` to the Arch-Lightning Rod entry in `src/data/magic-items.js`.

Files touched: `src/data/magic-items.js`.

---

## Bug 3 — Invocation of Nehek shows on opponent's turn

### Symptom

During the Strategy phase of the opponent's turn, Invocation of Nehek appears in the special rules block. It is a your-turn-only Command sub-phase ability.

### Root cause

`renderSpecialRulesForPhase` skips phase entries with `rulePhase.yourTurnOnly`. The Invocation of Nehek entry in `src/data/special-rules.js` has no such flag on its strategy/command phase.

### Fix

Add `yourTurnOnly: true` to the `{ phaseId: "strategy", subPhaseId: "command", ... }` entry for `invocation of nehek` in `src/data/special-rules.js`.

Files touched: `src/data/special-rules.js`.
