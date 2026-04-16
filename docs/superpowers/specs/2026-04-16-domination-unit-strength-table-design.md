# Domination Unit Strength Table — Design

**Date:** 2026-04-16
**File affected:** `src/screens/game-over.js`

## Overview

Two changes to the game-over screen when Domination mode is active:

1. Move the Domination section to the bottom of the screen (after Baggage Trains and Special Features).
2. Add a unit strength reference table inside the Domination card, listing all army units sorted by unit strength descending.

## Changes

### Section reorder

Current order of conditional sections:

1. Domination
2. Baggage Trains
3. Special Features

New order:

1. Baggage Trains
2. Special Features
3. Domination

### Unit strength table

Appended inside the existing Domination card, below the VP conditions reference table. Separated by a `border-t border-wh-border mt-3 pt-3` divider.

**Columns:** Unit (left-aligned) | US (right-aligned)

**Data source:** `army.units`, sorted by `unitStrength` descending. `army` is already passed to `renderGameOverScreen(army)`.

**Styling:** Matches existing reference table pattern — `text-xs`, `py-0.5`, `text-wh-text` for unit names, `font-mono text-wh-accent text-right` for US values.

**No total row.**

## Example output (Domination card)

```
Domination
Score each board quarter separately. Winner = higher Unit Strength (fleeing units don't count).

Condition                        VP
Control a quarter               100
2:1 US advantage in a quarter   +50
Opponent has 0 US in a quarter  +100

─────────────────────────────────────
Unit                             US
Chaos Warriors                   20
Marauder Horsemen                20
Chosen                           15
...
```

## No-ops

- No total row.
- No filtering — all units shown including WM (US 0).
- No interactivity.
