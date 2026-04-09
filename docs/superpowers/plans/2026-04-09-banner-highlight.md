# Banner Highlight on Combat Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render magical banners on their own gold-styled row in combat cards, separated from other magic items.

**Architecture:** All changes are in `src/context/combat-weapons.js`. A new `buildFilteredItems(u)` helper replaces two identical inline filter lambdas and additionally splits banner items into a separate `bannerNames` array. The `renderFooter` function is updated to render each banner on its own highlighted row above the plain items line.

**Tech Stack:** Vanilla JS, Tailwind CSS (via CSS variables), Vitest

---

### Task 1: Write failing tests

**Files:**

- Create: `src/test/combat-banner.test.js`

- [ ] **Step 1: Create the test file**

```js
import { describe, it, expect } from "vitest";
import { renderCombatWeaponsContext } from "../context/combat-weapons.js";
import { loadArmy } from "./helpers.js";

describe("banner highlight in combat card", () => {
  it("renders banner name inside a gold-bordered element", () => {
    // bretonnia-charge fixture: Pegasus Knights have Totem of Wrath (type: banner)
    const army = loadArmy("bretonnia-charge");
    const html = renderCombatWeaponsContext(army);
    expect(html).toContain("border-wh-accent");
    expect(html).toContain("Totem of Wrath");
    expect(html).toContain("text-wh-accent-dim");
  });

  it("does not include banner name in the plain muted items line", () => {
    const army = loadArmy("bretonnia-charge");
    const html = renderCombatWeaponsContext(army);
    // Plain items line looks like: class="text-xs text-wh-muted ...">Item, Item</div>
    // Banner name must not appear inside that pattern
    expect(html).not.toMatch(/text-wh-muted[^"]*">[^<]*Totem of Wrath/);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test src/test/combat-banner.test.js
```

Expected: FAIL — `border-wh-accent` not found in output (banner currently rendered in plain muted line).

---

### Task 2: Add `buildFilteredItems` helper

**Files:**

- Modify: `src/context/combat-weapons.js` — add helper after `buildItemNames` (around line 338)

- [ ] **Step 1: Add the helper function after `buildItemNames`**

Insert after the closing `}` of `buildItemNames` (after line 338):

```js
function buildFilteredItems(u) {
  const suItems = detectSingleUseItems(u);
  const suNames = new Set(suItems.map((i) => i.name.toLowerCase()));
  const bannerNames = [];
  const itemNames = buildItemNames(u).filter((n) => {
    if (suNames.has(n.toLowerCase())) return false;
    const item = (u.magicItems || []).find((i) => i.name === n);
    if (!item) return true; // vow entries — always show
    if (item.type === "banner" || item.type === "standard") {
      bannerNames.push(n);
      return false;
    }
    if (
      item.mr &&
      !item.ward &&
      !item.regen &&
      !item.armourBase &&
      !item.armourMod
    )
      return false;
    if (
      item.type === "weapon" &&
      item.phases &&
      !item.phases.includes("combat")
    )
      return false;
    return true;
  });
  return { itemNames, bannerNames };
}
```

---

### Task 3: Wire `buildFilteredItems` into the no-stats entry builder

**Files:**

- Modify: `src/context/combat-weapons.js` — no-stats `entries.push` block (~lines 515–569)

The current no-stats block starts with:

```js
const suItems = detectSingleUseItems(u);
const suNames = new Set(suItems.map((i) => i.name.toLowerCase()));
entries.push({
  ...
  singleUseItems: suItems,
  itemNames: buildItemNames(u).filter((n) => {
    if (suNames.has(n.toLowerCase())) return false;
    const item = (u.magicItems || []).find((i) => i.name === n);
    if (!item) return true;
    if (item.mr && !item.ward && !item.regen && !item.armourBase && !item.armourMod)
      return false;
    if (item.type === "weapon" && item.phases && !item.phases.includes("combat"))
      return false;
    return true;
  }),
```

- [ ] **Step 1: Replace the two `const` declarations and the inline filter**

Replace:

```js
    const suItems = detectSingleUseItems(u);
    const suNames = new Set(suItems.map((i) => i.name.toLowerCase()));
    entries.push({
```

With:

```js
    const suItems = detectSingleUseItems(u);
    const { itemNames: noStatsItemNames, bannerNames: noStatsBannerNames } =
      buildFilteredItems(u);
    entries.push({
```

- [ ] **Step 2: Replace the inline `itemNames` filter with the extracted values**

Replace:

```js
        singleUseItems: suItems,
        itemNames: buildItemNames(u).filter((n) => {
          if (suNames.has(n.toLowerCase())) return false;
          const item = (u.magicItems || []).find((i) => i.name === n);
          if (!item) return true; // vow entries — always show
          if (
            item.mr &&
            !item.ward &&
            !item.regen &&
            !item.armourBase &&
            !item.armourMod
          )
            return false;
          if (
            item.type === "weapon" &&
            item.phases &&
            !item.phases.includes("combat")
          )
            return false;
          return true;
        }),
```

With:

```js
        singleUseItems: suItems,
        itemNames: noStatsItemNames,
        bannerNames: noStatsBannerNames,
```

---

### Task 4: Wire `buildFilteredItems` into the has-stats entry builder

**Files:**

- Modify: `src/context/combat-weapons.js` — has-stats `entries.push` block (~lines 700–768)

- [ ] **Step 1: Add `buildFilteredItems` call before the `entries.push`**

Find the line immediately before `entries.push({` in the has-stats path (around line 700). Add:

```js
    const { itemNames: filteredItemNames, bannerNames: filteredBannerNames } =
      buildFilteredItems(u);
    entries.push({
```

- [ ] **Step 2: Replace the inline IIFE with the extracted values**

Replace:

```js
      singleUseItems: detectSingleUseItems(u),
      itemNames: (() => {
        const suItems = detectSingleUseItems(u);
        const suNames = new Set(suItems.map((i) => i.name.toLowerCase()));
        return buildItemNames(u).filter((n) => {
          if (suNames.has(n.toLowerCase())) return false;
          const item = (u.magicItems || []).find((i) => i.name === n);
          if (!item) return true; // vow entries — always show
          if (
            item.mr &&
            !item.ward &&
            !item.regen &&
            !item.armourBase &&
            !item.armourMod
          )
            return false;
          if (
            item.type === "weapon" &&
            item.phases &&
            !item.phases.includes("combat")
          )
            return false;
          return true;
        });
      })(),
```

With:

```js
      singleUseItems: detectSingleUseItems(u),
      itemNames: filteredItemNames,
      bannerNames: filteredBannerNames,
```

---

### Task 5: Update `renderFooter` to render banner rows

**Files:**

- Modify: `src/context/combat-weapons.js` — `renderFooter` function (~lines 931–945)

Current `renderFooter`:

```js
function renderFooter(r) {
  return [
    (r.conditionalStrengthMods || []).length > 0
      ? r.conditionalStrengthMods
          .map(
            (m) => `<div class="text-[10px] text-wh-muted">* ${m.source}</div>`,
          )
          .join("")
      : "",
    r.itemNames.length > 0
      ? `<div class="text-xs text-wh-muted mt-0.5">${r.itemNames.join(", ")}</div>`
      : "",
  ].join("");
}
```

- [ ] **Step 1: Replace `renderFooter` with the version that includes banner rows**

```js
function renderFooter(r) {
  return [
    (r.conditionalStrengthMods || []).length > 0
      ? r.conditionalStrengthMods
          .map(
            (m) => `<div class="text-[10px] text-wh-muted">* ${m.source}</div>`,
          )
          .join("")
      : "",
    (r.bannerNames || [])
      .map(
        (name) =>
          `<div class="text-xs mt-0.5 pl-2 border-l-2 border-wh-accent bg-wh-accent/8"><span class="text-[9px] uppercase tracking-wide text-wh-accent-dim mr-1">Banner</span><span class="text-wh-accent">${name}</span></div>`,
      )
      .join(""),
    r.itemNames.length > 0
      ? `<div class="text-xs text-wh-muted mt-0.5">${r.itemNames.join(", ")}</div>`
      : "",
  ].join("");
}
```

---

### Task 6: Run tests and commit

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass including the two new banner tests.

- [ ] **Step 2: Commit**

```bash
git add src/context/combat-weapons.js src/test/combat-banner.test.js
git commit -m "feat: highlight magical banners on combat cards"
```
