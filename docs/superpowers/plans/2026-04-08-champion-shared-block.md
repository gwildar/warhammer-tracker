# Champion Shared Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce `units.js` size by hoisting shared fields (`rules`, `troopType`, `magic`, `optionalRules`, `equipment`) into a `shared` block for all 203 multi-profile array units (units with troop + champion profiles).

**Architecture:** Same `{ shared, stats }` format already used for 88 crewed units. `resolveUnitEntry` in `from-owb.js` already handles both formats — no code changes needed. Work is entirely in `src/data/units.js`, driven by a conversion script.

**Tech Stack:** Node.js (ESM), existing test suite (vitest), prettier

---

## File Map

| File                                    | Change                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/data/units.js`                     | Convert 203 multi-profile array units to `{ shared, stats }` format                        |
| `scripts/verify-champion-invariants.js` | Scratch script — verify shared fields are identical across all profiles (delete after use) |
| `scripts/convert-champions.js`          | Scratch script — generate new units.js content (delete after use)                          |

No changes to `from-owb.js`, `army.js`, or any test files.

---

## Background

`resolveUnitEntry` (from-owb.js:34) already handles both formats:

```js
export function resolveUnitEntry(entry) {
  if (Array.isArray(entry)) return entry;
  return entry.stats.map((s) => ({ ...entry.shared, ...s }));
}
```

The `{ ...shared, ...s }` spread means per-profile fields override shared ones, so the resolved output is identical to what consumers see today.

## Target Format

```js
// Before (current)
"chaos-warriors": [
  {
    A: "1", I: "4", M: "4", S: "4", T: "4", W: "1", BS: "3", Ld: "8", WS: "5",
    Name: "Chaos Warrior", as: 5,
    rules: ["Close Order", "Ensorcelled Weapons", "Mark of Chaos Undivided"],
    equipment: ["Hand weapons", "heavy armour"],
    troopType: ["HI"],
    magic: [],
    optionalRules: ["Mark of Khorne", "Mark of Nurgle", "Mark of Slaanesh", "Mark of Tzeentch"],
  },
  {
    A: "2", I: "4", M: "4", S: "4", T: "4", W: "1", BS: "3", Ld: "8", WS: "5",
    Name: "Champion", as: 5,
    rules: ["Close Order", "Ensorcelled Weapons", "Mark of Chaos Undivided"],
    equipment: ["Hand weapons", "heavy armour"],
    troopType: ["HI"],
    magic: [],
    optionalRules: ["Mark of Khorne", "Mark of Nurgle", "Mark of Slaanesh", "Mark of Tzeentch"],
  },
],

// After
"chaos-warriors": {
  shared: {
    rules: ["Close Order", "Ensorcelled Weapons", "Mark of Chaos Undivided"],
    equipment: ["Hand weapons", "heavy armour"],
    troopType: ["HI"],
    magic: [],
    optionalRules: ["Mark of Khorne", "Mark of Nurgle", "Mark of Slaanesh", "Mark of Tzeentch"],
  },
  stats: [
    { Name: "Chaos Warrior", A: "1", I: "4", M: "4", S: "4", T: "4", W: "1", BS: "3", Ld: "8", WS: "5", as: 5 },
    { Name: "Champion",      A: "2", I: "4", M: "4", S: "4", T: "4", W: "1", BS: "3", Ld: "8", WS: "5", as: 5 },
  ],
},
```

Shared fields: `rules`, `equipment`, `troopType`, `magic`, `optionalRules` — when identical across all profiles
Per-profile fields: everything else — `Name`, all stats, `as`, `Regen`, `Fly`, `Stomps`, etc. Any field not identical across all profiles stays per-profile.

---

## Task 1: Verify shared-field invariant

Before converting, confirm that `rules`, `troopType`, `magic`, `optionalRules` are always byte-identical across all profiles in every multi-profile array unit. Any exceptions need manual review before conversion.

**Files:**

- Create: `scripts/verify-champion-invariants.js`

- [ ] **Step 1: Create the verification script**

```js
// scripts/verify-champion-invariants.js
import { UNIT_STATS } from "../src/data/units.js";

const SHARED_FIELDS = [
  "rules",
  "equipment",
  "troopType",
  "magic",
  "optionalRules",
];
let violations = 0;
let multiCount = 0;

for (const [key, val] of Object.entries(UNIT_STATS)) {
  if (!Array.isArray(val) || val.length < 2) continue;
  multiCount++;
  const first = val[0];
  for (let i = 1; i < val.length; i++) {
    for (const field of SHARED_FIELDS) {
      const a = JSON.stringify(first[field]);
      const b = JSON.stringify(val[i][field]);
      if (a !== b) {
        console.log(`VIOLATION: ${key} profile[${i}].${field} differs`);
        console.log(`  profile[0]: ${a}`);
        console.log(`  profile[${i}]: ${b}`);
        violations++;
      }
    }
  }
}

console.log(`\nChecked ${multiCount} multi-profile units.`);
console.log(
  violations === 0
    ? "✓ All invariants hold."
    : `✗ ${violations} violation(s) found — fix before converting.`,
);
```

- [ ] **Step 2: Run it**

```bash
node --input-type=module scripts/verify-champion-invariants.js
```

Expected output:

```
Checked 203 multi-profile units.
✓ All invariants hold.
```

If violations are reported: inspect each one manually. If a unit legitimately has different rules between profiles (e.g. champion gets an extra rule), exclude it from the conversion by adding its key to a `SKIP` set in the conversion script (Task 2). Do not convert units where the invariant doesn't hold.

---

## Task 2: Write the conversion script

**Files:**

- Create: `scripts/convert-champions.js`

The script imports UNIT_STATS, transforms multi-profile array units, serialises the result to JS source, and writes a new `src/data/units.js`.

- [ ] **Step 1: Create the conversion script**

```js
// scripts/convert-champions.js
import { UNIT_STATS } from "../src/data/units.js";
import { writeFileSync } from "fs";

// Add keys here if verify-champion-invariants.js reported violations for them
const SKIP = new Set([]);

const SHARED_FIELDS = [
  "rules",
  "equipment",
  "troopType",
  "magic",
  "optionalRules",
];

function transform(key, val) {
  // Already in shared format, or single-profile, or skipped
  if (!Array.isArray(val) || val.length < 2 || SKIP.has(key)) return val;

  const first = val[0];
  const shared = {};
  for (const field of SHARED_FIELDS) {
    shared[field] = first[field];
  }

  const stats = val.map((profile) => {
    const stat = {};
    for (const [k, v] of Object.entries(profile)) {
      if (!SHARED_FIELDS.includes(k)) stat[k] = v;
    }
    return stat;
  });

  return { shared, stats };
}

// ── Serialiser ──────────────────────────────────────────────────────────────
// Produces JS source (not JSON) with unquoted simple keys, quoted hyphenated keys.

function isSimpleKey(k) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k);
}

function serializeKey(k) {
  return isSimpleKey(k) ? k : JSON.stringify(k);
}

function serialize(val, depth = 0) {
  const pad = "  ".repeat(depth);
  const ipad = "  ".repeat(depth + 1);

  if (val === null || val === undefined) return String(val);
  if (typeof val === "boolean") return String(val);
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return JSON.stringify(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    // Compact form for short string arrays (rules can be long — use multiline when needed)
    if (val.every((v) => typeof v === "string")) {
      const inline = `[${val.map((v) => JSON.stringify(v)).join(", ")}]`;
      if (inline.length <= 80) return inline;
      return `[\n${val.map((v) => `${ipad}${JSON.stringify(v)}`).join(",\n")},\n${pad}]`;
    }
    return `[\n${val.map((v) => `${ipad}${serialize(v, depth + 1)}`).join(",\n")},\n${pad}]`;
  }

  if (typeof val === "object") {
    const entries = Object.entries(val).map(
      ([k, v]) => `${ipad}${serializeKey(k)}: ${serialize(v, depth + 1)}`,
    );
    return `{\n${entries.join(",\n")},\n${pad}}`;
  }

  return String(val);
}

// ── Generate output ──────────────────────────────────────────────────────────

const transformed = {};
for (const [key, val] of Object.entries(UNIT_STATS)) {
  transformed[key] = transform(key, val);
}

const entries = Object.entries(transformed)
  .map(([k, v]) => `  ${serializeKey(k)}: ${serialize(v, 1)}`)
  .join(",\n");

const output = `export const UNIT_STATS = {\n${entries},\n};\n`;

writeFileSync("src/data/units.js", output, "utf8");
console.log("Written src/data/units.js");
```

- [ ] **Step 2: Dry-run check — inspect the serialiser on a small sample**

Before running the full conversion, verify the serialiser handles edge cases correctly:

```bash
node --input-type=module - << 'EOF'
import { UNIT_STATS } from './src/data/units.js';

// Pick one unit with a champion and one crewed unit to verify both survive
const samples = ['chaos-warriors', 'ancient-stegadon', 'black-knights'];
for (const key of samples) {
  const val = UNIT_STATS[key];
  console.log(key, Array.isArray(val) ? `array(${val.length})` : 'shared-format');
}
EOF
```

Expected: `chaos-warriors array(2)`, `ancient-stegadon shared-format`, `black-knights array(3)`

---

## Task 3: Run conversion and verify output

**Files:**

- Modify: `src/data/units.js`

- [ ] **Step 1: Record current file size**

```bash
wc -l src/data/units.js
```

Note the line count.

- [ ] **Step 2: Run the conversion script**

```bash
node --input-type=module scripts/convert-champions.js
```

Expected: `Written src/data/units.js`

- [ ] **Step 3: Run prettier**

```bash
npm run prettier
```

- [ ] **Step 4: Verify file still parses and unit counts are correct**

```bash
node --input-type=module - << 'EOF'
import { UNIT_STATS } from './src/data/units.js';
const total = Object.keys(UNIT_STATS).length;
const arr = Object.values(UNIT_STATS).filter(Array.isArray).length;
const shared = Object.values(UNIT_STATS).filter(v => !Array.isArray(v)).length;
const multiArr = Object.values(UNIT_STATS).filter(v => Array.isArray(v) && v.length > 1).length;
console.log(`Total: ${total}, array: ${arr} (${multiArr} multi-profile), shared-format: ${shared}`);
EOF
```

Expected: `Total: 600, array: 309, (0 multi-profile), shared-format: 291`

- Total unit count unchanged from before
- Zero remaining multi-profile arrays (all converted)
- Shared-format count = 88 crewed + 203 champion = 291

- [ ] **Step 5: Record new file size and compare**

```bash
wc -l src/data/units.js
```

---

## Task 4: Run the test suite

**Files:** none

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all tests pass (same count as before conversion). If any fail, the resolved unit data no longer matches what consumers expect — inspect the failing test to identify which unit is affected and check if it was in the SKIP set or needs manual attention.

---

## Task 5: Clean up and commit

- [ ] **Step 1: Delete the scratch scripts**

```bash
rm scripts/verify-champion-invariants.js scripts/convert-champions.js
rmdir scripts 2>/dev/null || true
```

- [ ] **Step 2: Stage and commit**

```bash
git add src/data/units.js
git commit -m "$(cat <<'EOF'
refactor: hoist shared fields into shared block for champion units

203 multi-profile array units converted to { shared, stats } format,
matching the existing pattern for crewed units. rules, equipment, troopType,
magic, and optionalRules are no longer duplicated across troop/champion profiles.
No behaviour changes — resolveUnitEntry handles both formats.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

- No code changes to `from-owb.js` or consumers — `resolveUnitEntry` handles both formats identically.
- Crewed units (88) already in shared format are untouched — the conversion script skips non-arrays.
- Single-profile units (309) are untouched — the script only acts on arrays with 2+ entries.
- If violations are found in Task 1: add the offending keys to `SKIP` in the conversion script, convert the rest, then handle the violating units manually.
- The `scripts/` directory is ephemeral — delete it after Task 5.
