import { findMount } from './data/mounts.js'
import RULES_INDEX from './rules-index-export.json'

// Army name → rules index key overrides (both lowercase)
const UNIT_NAME_ALIASES = {
  'bloodwrack medusas': 'bloodwrack medusa',
}

export function resolveRulesIndexKey(name) {
  const key = name.toLowerCase()
  return UNIT_NAME_ALIASES[key] || key
}

export function lookupMovement(name) {
  const entry = RULES_INDEX[resolveRulesIndexKey(name)]
  if (!entry?.stats) return null
  for (let i = entry.stats.length - 1; i >= 0; i--) {
    if (entry.stats[i].M && entry.stats[i].M !== '-') return entry.stats[i].M
  }
  return null
}

export function resolveMovement(unit) {
  // 1. Inline stats from army file
  const inlineMv = unit.stats?.[0]?.M
  if (inlineMv && inlineMv !== '-') return inlineMv
  // 2. Mount lookup (characters on mounts)
  if (unit.mount) {
    const mount = findMount(unit.mount)
    if (mount) return String(mount.m)
    const mountMv = lookupMovement(unit.mount)
    if (mountMv) return mountMv
  }
  // 3. Unit name lookup (cavalry etc.)
  return lookupMovement(unit.name)
}

// Spell type → sub-phase mapping
export const SPELL_TYPE_PHASES = {
  'enchantment': 'conjuration',
  'hex': 'conjuration',
  'magical-vortex': 'conjuration',
  'magic-missile': 'choose-target',
  'conveyance': 'remaining-moves',
  'assailment': 'choose-fight',
}

// Phase colour maps — full class names so Tailwind can detect them at build time
export const PHASE_BG = {
  'wh-phase-strategy': 'bg-wh-phase-strategy',
  'wh-phase-movement': 'bg-wh-phase-movement',
  'wh-phase-shooting': 'bg-wh-phase-shooting',
  'wh-phase-combat': 'bg-wh-phase-combat',
}
export const PHASE_TEXT = {
  'wh-phase-strategy': 'text-wh-phase-strategy',
  'wh-phase-movement': 'text-wh-phase-movement',
  'wh-phase-shooting': 'text-wh-phase-shooting',
  'wh-phase-combat': 'text-wh-phase-combat',
}

export function formatSlug(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function parseUnitRules(specialRulesStr) {
  if (!specialRulesStr) return []
  return specialRulesStr.split(',').map(r => r.trim()).filter(Boolean)
}

export function normaliseRuleName(name) {
  // Strip parenthetical parameters: "Armour Bane (2)" → "Armour Bane"
  return name.replace(/\s*\(.*?\)\s*$/, '').trim()
}

export function ruleMatches(rule, normName) {
  if (rule.name.toLowerCase() === normName.toLowerCase()) return true
  if (Array.isArray(rule.aliases)) {
    return rule.aliases.some(a => a.toLowerCase() === normName.toLowerCase())
  }
  return false
}
