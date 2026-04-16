# Gaze of the Gods — Design Spec

**Date:** 2026-04-16

## Overview

Add the Gaze of the Gods special rule to `src/data/special-rules.js`. The rule is used by Champions of Chaos during the Command sub-phase and involves rolling on a D6 table for a random effect.

## Source

https://tow.whfb.app/special-rules/gaze-of-the-gods

## Data Structure

Follows the existing `table` pattern used by Giant Attacks and Bonegrinder Giant Attacks — a phase object with `subPhaseId`, `yourTurnOnly`, `description`, and a `table` array of `{ roll, result, effect }` entries.

```js
{
  id: "gaze of the gods",
  displayName: "Gaze of the Gods",
  phases: [
    {
      subPhaseId: "command",
      yourTurnOnly: true,
      description: "May roll on the Gaze of the Gods table. Applies to the Champion only, not any mount:",
      table: [
        { roll: "1", result: "Damned by Chaos", effect: "Gains Stupidity for the remainder of the game. If already affected, suffers -1 Leadership (minimum 2)." },
        { roll: "2", result: "Unnatural Quickness", effect: "+1 Initiative until the next Start of Turn sub-phase (maximum 10)." },
        { roll: "3", result: "Iron Skin", effect: "+1 Toughness until the next Start of Turn sub-phase (maximum 10)." },
        { roll: "4", result: "Murderous Mutation", effect: "+1 Weapon Skill for the remainder of the game (maximum 10)." },
        { roll: "5", result: "Dark Fury", effect: "+1 Attacks for the remainder of the game (maximum 10)." },
        { roll: "6", result: "Apotheosis", effect: "+1 Strength and +1 Leadership for the remainder of the game (maximum 10)." },
      ],
    },
  ],
}
```

## Placement

Insert into `src/data/special-rules.js` in an appropriate location (near other Chaos-related or command-phase rules).

## Affected Units

17 units in `src/data/units.js` already reference `"Gaze of the Gods"` by string. No changes needed there — the rule lookup will match automatically once the entry exists.

## Out of Scope

- No changes to `src/data/units.js`
- No changes to `src/data/magic-items.js` (Favour of the Gods already references the table correctly)
- No UI changes required — the existing table rendering handles this format
