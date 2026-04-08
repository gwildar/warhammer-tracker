# mounts.js Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete `src/data/mounts.js` by deriving all mount data from unit profiles already in `src/data/units.js`, updating the single `findMount()` adapter in `src/parsers/resolve.js`, and inlining `TROOP_TYPE_RULES` into its only consumer.

**Architecture:** A new `findMount(name)` in `resolve.js` slugifies the name, looks up `UNIT_STATS`, and translates unit profile fields into the same mount object shape that all four consumers already expect. Five mounts have no suitable standalone unit profile yet and must be added to `units.js` first. Three more use faction-specific keys (e.g. `"griffon-empire"`) and are handled via a small name-to-key override map. `TROOP_TYPE_RULES` moves inline to `special-rules-context.js`, its only consumer.

**Tech Stack:** ES modules, Vitest

---

## File Map

| File                                     | Change                                                           |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `src/data/units.js`                      | Add 5 standalone mount profiles                                  |
| `src/parsers/resolve.js`                 | Replace mounts.js import with new `findMount` adapter; export it |
| `src/context/combat-weapons.js`          | Update `findMount` import path                                   |
| `src/helpers.js`                         | Update `findMount` import path                                   |
| `src/context/special-rules-context.js`   | Remove mounts.js import; inline `TROOP_TYPE_RULES`               |
| `src/test/unit-stats-resolution.test.js` | Add `findMount` adapter tests                                    |
| `src/data/mounts.js`                     | Delete                                                           |

---

## Background knowledge

**units.js unit profile shape** (flat, non-crewed example):

```js
"black-dragon": [
  {
    A: "6", I: "4", M: "6", S: "7", T: "(+3)", W: "(+6)",
    BS: "-", Ld: "-", WS: "6",
    Name: "Black Dragon",
    as: 4, Stomps: "D6", Fly: "10",
    rules: ["Close Order", "Fly (10)", "Large Target", "Stomp Attacks (D6)", "Swiftstride", "Terror"],
    equipment: ["Wicked claws", "serrated maw", "noxious breath", "full plate armour"],
    troopType: ["Be"], magic: [], optionalRules: [],
  },
],
```

**Current mount object shape** (what all four consumers expect):

```js
{
  name: "Black Dragon",
  m: 6,
  stomp: "D6",
  impactHits: null,
  tBonus: 3,    // parsed from T: "(+3)"
  wBonus: 6,    // parsed from W: "(+6)"
  ws: "6", s: "7", i: "4", a: "6",
  as: 4,
  weapons: ["wicked claws", "serrated maw", "noxious breath", "full plate armour"],
  swiftstride: true,   // "Swiftstride" in rules
  troopType: "Be",     // troopType[0]
  armourBane: null,    // no "Armour Bane" rule
}
```

**Field mapping** (unit profile → mount shape):

- `name` ← `profile.Name`
- `m` ← `parseInt(profile.M, 10)`
- `stomp` ← `profile.Stomps ?? null`
- `impactHits` ← `profile["Impact-Hits"] ?? null`
- `tBonus` ← parse `"(+N)"` from `profile.T`, else `0`
- `wBonus` ← parse `"(+N)"` from `profile.W`, else `0`
- `ws`, `s`, `i`, `a` ← `profile.WS`, `.S`, `.I`, `.A`
- `as` ← `profile.as ?? null`
- `weapons` ← `(profile.equipment ?? []).map(e => e.toLowerCase())`
- `swiftstride` ← `profile.rules?.some(r => r.toLowerCase() === "swiftstride") ?? false`
- `troopType` ← `profile.troopType?.[0] ?? null`
- `armourBane` ← extract from rules e.g. `"Armour Bane (1, Cold One only)"` → `1`, else `null`

**Three mounts use faction-specific keys** (handled via override map in Task 3):

- `"Griffon"` → `"griffon-empire"` (T:+1, W:+3 matching mounts.js)
- `"Manticore"` → `"manticore-dark-elves"` (T:+1, W:+4 matching mounts.js)
- `"Skeletal Steed"` → `"skeletal-steed-vampire-counts"` (M:7 matching mounts.js)

---

## Task 1: Add 5 missing standalone mount unit profiles to units.js

**Files:**

- Modify: `src/data/units.js`

These five mounts are referenced by name in OWB exports but have no clean standalone entry in units.js. Add each as a top-level key. Place them alphabetically among existing keys.

- [ ] **Step 1: Add `"forest-dragon"` entry**

Find the line containing `"forest-dragon"` — it doesn't exist yet. Add after `"forsaken"` (or wherever alphabetically appropriate):

```js
  "forest-dragon": [
    {
      A: "6",
      I: "4",
      M: "6",
      S: "7",
      T: "(+3)",
      W: "(+6)",
      BS: "-",
      Ld: "-",
      WS: "6",
      Name: "Forest Dragon",
      as: 4,
      Stomps: "D6",
      Fly: "10",
      rules: [
        "Close Order",
        "Fly (10)",
        "Large Target",
        "Soporific Breath",
        "Stomp Attacks (D6)",
        "Swiftstride",
        "Terror",
      ],
      equipment: ["wicked claws", "serrated maw"],
      troopType: ["Be"],
      magic: [],
      optionalRules: [],
    },
  ],
```

- [ ] **Step 2: Add `"cold-one"` entry**

Add after `"cold-one-riders"` or near the other cold-one keys:

```js
  "cold-one": [
    {
      A: "2",
      I: "2",
      M: "7",
      S: "4",
      T: "(+1)",
      W: "-",
      BS: "-",
      Ld: "-",
      WS: "3",
      Name: "Cold One",
      rules: [
        "Armour Bane (1, Cold One only)",
        "Armoured Hide (1)",
        "Fear",
        "First Charge",
        "Stupidity",
        "Swiftstride",
      ],
      equipment: ["hand weapon"],
      troopType: ["HC"],
      magic: [],
      optionalRules: [],
    },
  ],
```

- [ ] **Step 3: Add `rhinox` entry**

Add near `"gnoblar-scraplauncher"`:

```js
  rhinox: [
    {
      A: "3",
      I: "2",
      M: "6",
      S: "5",
      T: "-",
      W: "-",
      BS: "-",
      Ld: "-",
      WS: "3",
      Name: "Rhinox",
      rules: ["Armour Bane (2, Rhinox only)", "Fear", "Large Target"],
      equipment: ["monstrous tusks"],
      troopType: ["MCa"],
      magic: [],
      optionalRules: [],
    },
  ],
```

- [ ] **Step 4: Add `mournfang` entry**

Add near `"mournfang-cavalry"`:

```js
  mournfang: [
    {
      A: "3",
      I: "2",
      M: "8",
      S: "5",
      T: "-",
      W: "-",
      BS: "-",
      Ld: "-",
      WS: "3",
      Name: "Mournfang",
      rules: ["Fear"],
      equipment: ["monstrous tusks"],
      troopType: ["MCa"],
      magic: [],
      optionalRules: [],
    },
  ],
```

- [ ] **Step 5: Add `ariandir` entry**

Add near `"lady-élisse-duchaard"`:

```js
  ariandir: [
    {
      A: "2",
      I: "5",
      M: "10",
      S: "4",
      T: "-",
      W: "-",
      BS: "-",
      Ld: "-",
      WS: "4",
      Name: "Ariandir",
      rules: [
        "Armour Bane (2, Ariandir only)",
        "Counter Charge",
        "Fear",
        "Swiftstride",
      ],
      equipment: [],
      troopType: ["MCa"],
      magic: [],
      optionalRules: [],
    },
  ],
```

- [ ] **Step 6: Commit**

```bash
git add src/data/units.js
git commit -m "feat: add standalone unit profiles for 5 missing mounts"
```

---

## Task 2: Write failing findMount adapter tests

**Files:**

- Modify: `src/test/unit-stats-resolution.test.js`

The test imports `findMount` from `resolve.js`. That export does not exist yet, so the test fails at import time — the expected failure mode.

- [ ] **Step 1: Add findMount import to the test file**

At the top of `src/test/unit-stats-resolution.test.js`, add:

```js
import { findMount } from "../parsers/resolve.js";
```

- [ ] **Step 2: Add findMount describe block**

Append to the end of the file (after the closing `});` of the `resolveUnitEntry` describe block):

```js
describe("findMount", () => {
  it("returns null for null or missing name", () => {
    expect(findMount(null)).toBeNull();
    expect(findMount("")).toBeNull();
    expect(findMount("unknown beast that does not exist")).toBeNull();
  });

  it("returns object passthrough when given an object", () => {
    const obj = { name: "existing", m: 5 };
    expect(findMount(obj)).toBe(obj);
  });

  it("resolves a clean slug — Black Dragon tBonus/wBonus/stomp/swiftstride", () => {
    const mount = findMount("Black Dragon");
    expect(mount).not.toBeNull();
    expect(mount.name).toBe("Black Dragon");
    expect(mount.m).toBe(6);
    expect(mount.tBonus).toBe(3);
    expect(mount.wBonus).toBe(6);
    expect(mount.stomp).toBe("D6");
    expect(mount.swiftstride).toBe(true);
    expect(mount.troopType).toBe("Be");
    expect(mount.armourBane).toBeNull();
  });

  it("extracts armourBane from rules — Cold One", () => {
    const mount = findMount("Cold One");
    expect(mount).not.toBeNull();
    expect(mount.m).toBe(7);
    expect(mount.tBonus).toBe(1);
    expect(mount.armourBane).toBe(1);
    expect(mount.swiftstride).toBe(true);
  });

  it("uses MOUNT_KEY_OVERRIDES for faction-variant mounts — Griffon", () => {
    const mount = findMount("Griffon");
    expect(mount).not.toBeNull();
    expect(mount.name).toBe("Griffon");
    expect(mount.m).toBe(6);
    expect(mount.tBonus).toBe(1);
    expect(mount.swiftstride).toBe(true);
    expect(mount.troopType).toBe("MCr");
  });

  it("resolves Rhinox standalone entry", () => {
    const mount = findMount("Rhinox");
    expect(mount).not.toBeNull();
    expect(mount.m).toBe(6);
    expect(mount.tBonus).toBe(0);
    expect(mount.swiftstride).toBe(false);
    expect(mount.armourBane).toBe(2);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

```bash
npm test
```

Expected: tests fail with `SyntaxError` or `"findMount" is not exported by "src/parsers/resolve.js"`.

---

## Task 3: Implement findMount adapter in resolve.js

**Files:**

- Modify: `src/parsers/resolve.js`

Replace the `import { findMount } from "../data/mounts.js"` line with the full adapter implementation. The new `findMount` is exported so consumers can import it from `resolve.js`.

- [ ] **Step 1: Replace the mounts.js import and add the adapter**

Find line 4 in `src/parsers/resolve.js`:

```js
import { findMount } from "../data/mounts.js";
```

Replace it with:

```js
import { UNIT_STATS } from "../data/units.js";

// Maps canonical mount name (lowercase) → units.js key.
// Used for mounts whose slug doesn't directly match a units.js key.
const MOUNT_KEY_OVERRIDES = {
  griffon: "griffon-empire",
  manticore: "manticore-dark-elves",
  "skeletal steed": "skeletal-steed-vampire-counts",
};

function resolveMountProfile(entry) {
  return Array.isArray(entry)
    ? entry
    : entry.stats.map((s) => ({ ...entry.shared, ...s }));
}

function parseBonusInt(val) {
  return parseInt(String(val ?? "").match(/\(\+(\d+)\)/)?.[1] ?? "0", 10);
}

export function findMount(name) {
  if (!name) return null;
  if (typeof name === "object") return name;

  const lower = name.toLowerCase();
  const key = MOUNT_KEY_OVERRIDES[lower] ?? lower.replace(/\s+/g, "-");
  const entry = UNIT_STATS[key];
  if (!entry) return null;

  const profile = resolveMountProfile(entry)[0];
  if (!profile) return null;

  const armourBaneRule = profile.rules?.find((r) => /^Armour Bane/i.test(r));
  const armourBane = armourBaneRule
    ? parseInt(armourBaneRule.match(/\((\d+)/)?.[1] ?? "0", 10)
    : null;

  return {
    name: profile.Name,
    m: parseInt(profile.M, 10),
    stomp: profile.Stomps ?? null,
    impactHits: profile["Impact-Hits"] ?? null,
    tBonus: parseBonusInt(profile.T),
    wBonus: parseBonusInt(profile.W),
    ws: profile.WS,
    s: profile.S,
    i: profile.I,
    a: profile.A,
    as: profile.as ?? null,
    weapons: (profile.equipment ?? []).map((e) => e.toLowerCase()),
    swiftstride:
      profile.rules?.some((r) => r.toLowerCase() === "swiftstride") ?? false,
    troopType: profile.troopType?.[0] ?? null,
    armourBane,
  };
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests pass, including the new `findMount` describe block.

- [ ] **Step 3: Commit**

```bash
git add src/parsers/resolve.js src/test/unit-stats-resolution.test.js
git commit -m "feat: replace findMount with units.js adapter in resolve.js"
```

---

## Task 4: Update combat-weapons.js import

**Files:**

- Modify: `src/context/combat-weapons.js`

`combat-weapons.js` currently imports `findMount` from `mounts.js`. Change it to import from `resolve.js`.

- [ ] **Step 1: Update the import line**

Find line 2 in `src/context/combat-weapons.js`:

```js
import { findMount } from "../data/mounts.js";
```

Replace with:

```js
import { findMount } from "../parsers/resolve.js";
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/context/combat-weapons.js
git commit -m "refactor: import findMount from resolve.js"
```

---

## Task 5: Update helpers.js import

**Files:**

- Modify: `src/helpers.js`

`helpers.js` currently imports `findMount` from `mounts.js`. Change it to import from `resolve.js`.

- [ ] **Step 1: Update the import line**

Find line 1 in `src/helpers.js`:

```js
import { findMount } from "./data/mounts.js";
```

Replace with:

```js
import { findMount } from "./parsers/resolve.js";
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/helpers.js
git commit -m "refactor: import findMount from resolve.js in helpers"
```

---

## Task 6: Inline TROOP_TYPE_RULES into special-rules-context.js

**Files:**

- Modify: `src/context/special-rules-context.js`

`TROOP_TYPE_RULES` has no other consumer. Remove the mounts.js import and declare it as a module-local constant. The keys `LCa`/`HCa` are dropped — they mapped to empty arrays and units.js uses `LC`/`HC`, so they were never matched anyway.

- [ ] **Step 1: Remove import and add inline constant**

Find line 2 in `src/context/special-rules-context.js`:

```js
import { TROOP_TYPE_RULES } from "../data/mounts.js";
```

Delete that line. Then add the constant immediately after the remaining imports (after the last `import` line):

```js
const TROOP_TYPE_RULES = {
  MCa: ["Fear"],
  MCr: ["Fear", "Large Target"],
  Be: ["Terror", "Large Target", "Lumbering"],
};
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/context/special-rules-context.js
git commit -m "refactor: inline TROOP_TYPE_RULES, remove mounts.js import"
```

---

## Task 7: Delete mounts.js

**Files:**

- Delete: `src/data/mounts.js`

All consumers have been updated. No imports of `mounts.js` remain.

- [ ] **Step 1: Verify no remaining imports**

```bash
grep -r "from.*mounts\.js\|require.*mounts" src/
```

Expected: no output.

- [ ] **Step 2: Delete the file**

```bash
rm src/data/mounts.js
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: all 107+ tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: delete mounts.js — mount data now derived from units.js"
```
