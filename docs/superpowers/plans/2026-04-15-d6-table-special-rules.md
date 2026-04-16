# D6 Table Special Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render D6 result tables inside special rule cards in the UI, matching the existing Black Powder Misfire Chart pattern.

**Architecture:** Add an optional `table` field to phase-descriptor objects in `special-rules.js`. Thread it through the two render functions in `special-rules-context.js`. When present, `renderRulesBlock` appends a 3-column `<table>` after the description paragraph.

**Tech Stack:** Vanilla JS, Vitest

---

## Files Modified

| File                                     | Change                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/test/special-rules-context.test.js` | Add TABLE_RULE fixture; assert `<td>` cells                                                     |
| `src/context/special-rules-context.js`   | Thread `table` through match/grouped objects; render `<table>` in `renderRulesBlock`            |
| `src/data/special-rules.js`              | Convert Giant Attacks and Bonegrinder Giant Attacks to phase-object form; add Sky Lantern Bombs |

---

### Task 1: Write the failing test

**Files:**

- Modify: `src/test/special-rules-context.test.js`

- [ ] **Step 1: Add TABLE_RULE fixture**

Insert after the `COMPLEX_RULE` constant (line 56) and before `ALL_TEST_RULES`:

```js
const TABLE_RULE = {
  id: "table rule",
  displayName: "Table Rule",
  phases: [
    {
      subPhaseId: "choose-fight",
      description: "Roll a D6:",
      table: [
        { roll: "1", result: "Miss", effect: "Nothing happens." },
        { roll: "2-6", result: "Hit", effect: "Deal 1 wound." },
      ],
    },
  ],
};
```

Add `TABLE_RULE` to `ALL_TEST_RULES`:

```js
const ALL_TEST_RULES = [
  SIMPLE_RULE,
  SIMPLE_MULTI_RULE,
  YOUR_TURN_RULE,
  OPPONENT_RULE,
  FROM_ROUND_RULE,
  COMPLEX_RULE,
  TABLE_RULE,
];
```

- [ ] **Step 2: Write the failing tests**

Append a new `describe` block at the end of the file:

```js
describe("table field renders D6 table", () => {
  it("renders roll values as <td> cells", () => {
    const html = renderSpecialRulesContext(makeArmy(TABLE_RULE), {
      id: "choose-fight",
    });
    expect(html).toContain("<td");
    expect(html).toContain(">1<");
    expect(html).toContain(">2-6<");
  });

  it("renders result and effect text", () => {
    const html = renderSpecialRulesContext(makeArmy(TABLE_RULE), {
      id: "choose-fight",
    });
    expect(html).toContain("Miss");
    expect(html).toContain("Deal 1 wound.");
  });

  it("description still renders when table is present", () => {
    const html = renderSpecialRulesContext(makeArmy(TABLE_RULE), {
      id: "choose-fight",
    });
    expect(html).toContain("Roll a D6:");
  });

  it("renderSpecialRulesForPhase also renders the table", () => {
    const combatPhase = PHASES.find((p) => p.id === "combat");
    const html = renderSpecialRulesForPhase(makeArmy(TABLE_RULE), combatPhase);
    expect(html).toContain(">1<");
    expect(html).toContain(">2-6<");
  });
});
```

- [ ] **Step 3: Run the tests and confirm they fail**

```
npx vitest run src/test/special-rules-context.test.js
```

Expected: 4 new failures — `<td` and roll-value assertions are not met because `renderRulesBlock` doesn't emit table HTML yet.

---

### Task 2: Implement table rendering in `special-rules-context.js`

**Files:**

- Modify: `src/context/special-rules-context.js`

- [ ] **Step 1: Thread `table` through `renderSpecialRulesContext`**

In `renderSpecialRulesContext`, the `matches.push` call is at line 161. Change it from:

```js
matches.push({
  unitName: unit.name,
  ruleName: rule.displayName,
  description: phase.description,
});
```

to:

```js
matches.push({
  unitName: unit.name,
  ruleName: rule.displayName,
  description: phase.description,
  table: phase.table ?? null,
});
```

The `grouped[key]` assignment is at line 174. Change it from:

```js
grouped[key] = {
  ruleName: m.ruleName,
  description: m.description,
  units: [],
};
```

to:

```js
grouped[key] = {
  ruleName: m.ruleName,
  description: m.description,
  table: m.table,
  units: [],
};
```

- [ ] **Step 2: Thread `table` through `renderSpecialRulesForPhase`**

In `renderSpecialRulesForPhase`, the `grouped[key]` assignment is at line 203. Change it from:

```js
grouped[key] = {
  ruleName: rule.displayName,
  description: rulePhase.description,
  units: [],
};
```

to:

```js
grouped[key] = {
  ruleName: rule.displayName,
  description: rulePhase.description,
  table: rulePhase.table ?? null,
  units: [],
};
```

- [ ] **Step 3: Render the table in `renderRulesBlock`**

`renderRulesBlock` is at line 123. Replace the inner `.map` callback so the card body becomes:

```js
(g) => `
  <div class="p-2 rounded bg-wh-card text-sm">
    <span class="text-xs bg-wh-accent/20 text-wh-accent px-1.5 py-0.5 rounded">${g.ruleName}</span>
    <p class="text-wh-muted text-xs mt-1">${g.description}</p>
    ${g.table ? `
    <table class="w-full text-xs mt-2">
      <thead>
        <tr class="text-left text-wh-muted">
          <th class="pb-1 pr-2 font-medium w-8">D6</th>
          <th class="pb-1 pr-2 font-medium">Result</th>
          <th class="pb-1 font-medium">Effect</th>
        </tr>
      </thead>
      <tbody>
        ${g.table.map(r => `
        <tr>
          <td class="py-0.5 pr-2 font-mono text-wh-accent align-top">${r.roll}</td>
          <td class="py-0.5 pr-2 font-semibold text-wh-text align-top whitespace-nowrap">${r.result}</td>
          <td class="py-0.5 text-wh-muted">${r.effect}</td>
        </tr>
        `).join("")}
      </tbody>
    </table>` : ""}
    <p class="text-wh-text text-xs mt-1">${g.units.join(", ")}</p>
  </div>
`,
```

- [ ] **Step 4: Run the tests and confirm they pass**

```
npx vitest run src/test/special-rules-context.test.js
```

Expected: all tests pass, including the 4 new ones.

- [ ] **Step 5: Commit**

```bash
git add src/test/special-rules-context.test.js src/context/special-rules-context.js
git commit -m "feat: render D6 result tables in special rules cards"
```

---

### Task 3: Convert Giant Attacks and Bonegrinder Giant Attacks to structured form

**Files:**

- Modify: `src/data/special-rules.js`

- [ ] **Step 1: Replace Giant Attacks (line 1317)**

Find and replace the existing entry (lines 1316–1322):

```js
{
  id: "giant attacks",
  displayName: "Giant Attacks",
  description:
    "Instead of normal attacks, roll D6: 1 = 'Eadbutt (D3+1 wounds, no armour/regen), 2 = Belly Flop (3\" blast, S, AP -2), 3-4 = Mighty Swing (D6+1 attacks, S+1, AP -2), 5 = Thump with Club (single model, S+4, AP -4, Multiple Wounds D6), 6 = Jump Up & Down (D6+1 hits, no armour saves).",
  phases: ["choose-fight"],
},
```

with:

```js
{
  id: "giant attacks",
  displayName: "Giant Attacks",
  phases: [
    {
      subPhaseId: "choose-fight",
      description: "Instead of normal attacks, roll a D6:",
      table: [
        { roll: "1",   result: "'Eadbutt",        effect: "D3+1 wounds, no armour or regeneration saves." },
        { roll: "2",   result: "Belly Flop",       effect: "3\" blast, Strength, AP -2." },
        { roll: "3-4", result: "Mighty Swing",     effect: "D6+1 attacks, S+1, AP -2." },
        { roll: "5",   result: "Thump with Club",  effect: "One model, S+4, AP -4, Multiple Wounds (D6)." },
        { roll: "6",   result: "Jump Up and Down", effect: "D6+1 hits, no armour saves allowed." },
      ],
    },
  ],
},
```

- [ ] **Step 2: Replace Bonegrinder Giant Attacks (line 1560)**

Find and replace the existing entry (lines 1559–1565):

```js
{
  id: "bonegrinder giant attacks",
  displayName: "Bonegrinder Giant Attacks",
  description:
    "Instead of normal attacks, roll D6: 1 = 'Eadbutt (D6+1 wounds, no armour/Regen saves), 2 = Belly Flop (5\" blast, S, AP -2), 3-4 = Mighty Swing (2D6 attacks, S+2, AP -3), 5 = Grind its Bones (each base-contact infantry model tests Str or removed as casualty; repeat on 4+), 6 = Crush Underfoot (all base-contact models, D6 hits at S+3, AP -3).",
  phases: ["choose-fight"],
},
```

with:

```js
{
  id: "bonegrinder giant attacks",
  displayName: "Bonegrinder Giant Attacks",
  phases: [
    {
      subPhaseId: "choose-fight",
      description: "Instead of normal attacks, roll a D6:",
      table: [
        { roll: "1",   result: "'Eadbutt",        effect: "D6+1 wounds, no armour or regeneration saves." },
        { roll: "2",   result: "Belly Flop",       effect: "5\" blast, Strength, AP -2." },
        { roll: "3-4", result: "Mighty Swing",     effect: "2D6 attacks, S+2, AP -3." },
        { roll: "5",   result: "Grind its Bones",  effect: "Each base-contact infantry model tests Strength or is removed as a casualty; repeat on 4+." },
        { roll: "6",   result: "Crush Underfoot",  effect: "All base-contact models suffer D6 hits at S+3, AP -3." },
      ],
    },
  ],
},
```

- [ ] **Step 3: Run the full test suite**

```
npx vitest run
```

Expected: all tests pass. The prose description is gone; rules using Giant Attacks or Bonegrinder Giant Attacks now render a table instead.

- [ ] **Step 4: Commit**

```bash
git add src/data/special-rules.js
git commit -m "feat: convert Giant Attacks and Bonegrinder Giant Attacks to D6 table form"
```

---

### Task 4: Add Sky Lantern Bombs

**Files:**

- Modify: `src/data/special-rules.js`

Sky Lantern Bombs is a Grand Cathay Weapons of War rule (Arcane Journal: Armies of Grand Cathay, p.35). It does not exist in `special-rules.js` yet and needs a new entry.

- [ ] **Step 1: Add the Sky Lantern Bombs entry**

Find a sensible location near other Grand Cathay rules or append near the end of the array (before the closing `]`). Add:

```js
{
  id: "sky lantern bombs",
  displayName: "Sky Lantern Bombs",
  phases: [
    {
      subPhaseId: "shoot",
      description: "Roll a D6 to determine the bombing run result:",
      table: [
        { roll: "1",   result: "Premature Detonation", effect: "The release mechanism jams and a bomb explodes prematurely. This model loses a single Wound." },
        { roll: "2",   result: "Dud",                  effect: "A solitary bomb is released but fails to detonate, landing on an enemy model. The enemy unit loses a single Wound." },
        { roll: "3-4", result: "Direct Hit",            effect: "Place a large (5\") blast template over the centre of the enemy unit; it scatters D6\". Any model underneath risks a Strength 5 hit, AP -2." },
        { roll: "5-6", result: "Bombs Away",            effect: "Place two small (3\") blast templates over the enemy unit; each scatters D6\". Any model underneath risks a Strength 5 hit, AP -2." },
      ],
    },
  ],
},
```

- [ ] **Step 2: Run the full test suite**

```
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/data/special-rules.js
git commit -m "feat: add Sky Lantern Bombs D6 table rule"
```
