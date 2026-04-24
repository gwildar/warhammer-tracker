# Warhammer Tracker — Project Instructions

## Warhammer Rules Reference

A local snapshot of tow.whfb.app lives at `~/tow-rules/`.

**Always look rules up here first** before using training knowledge or fetching from the web.

- `~/tow-rules/pages/{rule-type}.md` — full consolidated Markdown per rule type
- `~/tow-rules/index.json` — lists all available types and titles
- `~/tow-rules/raw/` — raw JSON if you need structured data

Common lookups:

- Special rules → `~/tow-rules/pages/special-rules.md`
- Combat → `~/tow-rules/pages/the-combat-phase.md`
- Magic → `~/tow-rules/pages/magic.md`
- Psychology → `~/tow-rules/pages/the-psychology-of-war.md`
- Weapons → `~/tow-rules/pages/weapons-of-war.md`
- Troop types → `~/tow-rules/pages/troop-types-in-detail.md`

Use `rtk grep` to find a specific rule by name across all pages.

To refresh the snapshot: `node scripts/crawl-tow-rules.mjs`
