# D6 Table Rendering for Special Rules

## Context

Some special rules (Giant Attacks, Bonegrinder Giant Attacks, Sky Lantern Bombs) resolve by rolling a D6 and consulting a result table. Currently their phase descriptions are stored as long prose strings. The Black Powder Misfire Chart already renders as a proper HTML table in the shooting context. This feature brings the same treatment to special rules, using a general pattern any rule can opt into.

---

## Data Structure

Add an optional `table` field to the phase descriptor object in `src/data/special-rules.js`. Each entry in the array has three string fields:

```js
{
  roll: "1",              // die value or range: "1", "2-4", "5-6"
  result: "'Eadbutt",     // short outcome name
  effect: "D3+1 wounds, no armour or regeneration saves."
}
```

Rules currently using the shorthand `phases: ["choose-fight"]` with a top-level `description` string are expanded to the phase-object form:

```js
// before
{
  id: "giant attacks",
  displayName: "Giant Attacks",
  description: "Instead of normal attacks, roll D6: 1 = 'Eadbutt...",
  phases: ["choose-fight"],
}

// after
{
  id: "giant attacks",
  displayName: "Giant Attacks",
  phases: [{
    subPhaseId: "choose-fight",
    description: "Instead of normal attacks, roll a D6:",
    table: [
      { roll: "1",   result: "'Eadbutt",        effect: "D3+1 wounds, no armour or regeneration saves." },
      { roll: "2",   result: "Belly Flop",       effect: "3\" blast, Strength, AP -2." },
      { roll: "3-4", result: "Mighty Swing",     effect: "D6+1 attacks, S+1, AP -2." },
      { roll: "5",   result: "Thump with Club",  effect: "One model, S+4, AP -4, Multiple Wounds (D6)." },
      { roll: "6",   result: "Jump Up and Down", effect: "D6+1 hits, no armour saves allowed." },
    ]
  }]
}
```

Rules converted on day one:

- **Giant Attacks** — 6 rows
- **Bonegrinder Giant Attacks** — 6 rows
- **Sky Lantern Bombs** — new rule entry to be added (verify row content against rulebook)

---

## Rendering

**File:** `src/context/special-rules-context.js`

### 1. Collection

`renderSpecialRulesContext()` and `renderSpecialRulesForPhase()` both push match objects. Add `table`:

```js
matches.push({
  unitName: unit.name,
  ruleName: rule.displayName,
  description: phase.description,
  table: phase.table ?? null, // new
});
```

### 2. Grouping

The grouping key (`ruleName||description`) is unchanged. Add `table` to the grouped value:

```js
grouped[key] = { ruleName, description, table: m.table, units: [] };
```

### 3. `renderRulesBlock()`

When `g.table` is present, append an HTML table after the description paragraph, styled to match the misfire chart in `shooting.js`:

```html
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
      <td
        class="py-0.5 pr-2 font-semibold text-wh-text align-top whitespace-nowrap"
      >
        ${r.result}
      </td>
      <td class="py-0.5 text-wh-muted">${r.effect}</td>
    </tr>
    `).join("")}
  </tbody>
</table>
```

The opponent-turn screen uses the same `renderRulesBlock()` path, so it gets the table for free.

---

## Testing

Add assertions to the relevant existing test file(s) — whichever already loads an army containing a Giant or Sky Lantern — confirming:

- The rendered HTML contains `<td>` cells with the expected roll values (e.g. `"1"`, `"3-4"`)
- The existing description text still renders

No new fixture files are needed.

---

## Files Modified

| File                                   | Change                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/data/special-rules.js`            | Convert Giant Attacks and Bonegrinder Giant Attacks to phase-object form with `table`; add Sky Lantern Bombs entry |
| `src/context/special-rules-context.js` | Thread `table` through collection and grouping; render `<table>` in `renderRulesBlock()`                           |
| Relevant test file(s)                  | Assert `<td>` content for at least one D6 table rule                                                               |
