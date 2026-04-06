import { findMount } from "./data/mounts.js";

// Army name → rules index key overrides (both lowercase)
const UNIT_NAME_ALIASES = {
  "bloodwrack medusas": "bloodwrack medusa",
};

export function resolveRulesIndexKey(name) {
  const key = name.toLowerCase();
  return UNIT_NAME_ALIASES[key] || key;
}

export function resolveMovement(unit) {
  // 1. Inline stats from army file
  const inlineMv = unit.stats?.[0]?.M;
  if (inlineMv && inlineMv !== "-") return inlineMv;
  // 2. Mount lookup (characters on mounts)
  if (unit.mount) {
    const mount = findMount(unit.mount);
    if (mount) return String(mount.m);
  }
  // 3. Embedded mount stat line (e.g. Blood Knights with Nightmare)
  if (unit.stats && unit.stats.length > 1) {
    for (let i = 1; i < unit.stats.length; i++) {
      const s = unit.stats[i];
      if (s.M && s.M !== "-" && s.Ld === "-") return s.M;
    }
  }
}

// Spell type → sub-phase mapping
export const SPELL_TYPE_PHASES = {
  enchantment: "conjuration",
  hex: "conjuration",
  "magical-vortex": "conjuration",
  "magic-missile": "shoot",
  conveyance: "remaining-moves",
  assailment: "choose-fight",
};

// Phase colour maps — full class names so Tailwind can detect them at build time
export const PHASE_BG = {
  "wh-phase-strategy": "bg-wh-phase-strategy",
  "wh-phase-movement": "bg-wh-phase-movement",
  "wh-phase-shooting": "bg-wh-phase-shooting",
  "wh-phase-combat": "bg-wh-phase-combat",
  "wh-phase-scoring": "bg-wh-phase-scoring",
};
export const PHASE_TEXT = {
  "wh-phase-strategy": "text-wh-phase-strategy",
  "wh-phase-movement": "text-wh-phase-movement",
  "wh-phase-shooting": "text-wh-phase-shooting",
  "wh-phase-combat": "text-wh-phase-combat",
  "wh-phase-scoring": "text-wh-phase-scoring",
};

export function formatSlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function parseUnitRules(specialRulesStr) {
  if (!specialRulesStr) return [];
  return specialRulesStr
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
}

export function normaliseRuleName(name) {
  // Strip parenthetical parameters: "Armour Bane (2)" → "Armour Bane"
  return name.replace(/\s*\(.*?\)\s*$/, "").trim();
}

export function ruleMatches(rule, normName) {
  if (rule.id === normName.toLowerCase()) return true;
  if (Array.isArray(rule.aliases)) {
    return rule.aliases.some((a) => a.toLowerCase() === normName.toLowerCase());
  }
  return false;
}
