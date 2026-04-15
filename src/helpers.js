import { findMount } from "./parsers/resolve.js";

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

/**
 * Extract fly movement value from a unit's specialRules or mount data.
 * Returns the numeric fly distance, or null if the unit cannot fly.
 */
export function extractFlyMovement(unit, mountData) {
  const flyRuleStr = (unit.specialRules || [])
    .map((r) => r.displayName || "")
    .find((d) => /^fly\s*\(/i.test(d.trim()));
  const flyMatch = flyRuleStr ? flyRuleStr.match(/\((\d+)\)/) : null;
  return flyMatch ? Number(flyMatch[1]) : (mountData?.f ?? null);
}

/**
 * Resolve the base movement value (in inches) for charge/movement calculation.
 * Prefers mount.m; falls back to the unit's own M stat; returns null if unknown.
 */
export function resolveBaseMv(mountData, statMv) {
  return mountData ? mountData.m : statMv != null ? Number(statMv) : null;
}

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
