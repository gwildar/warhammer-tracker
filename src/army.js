import { LORES } from './data/spells.js'
import { findMount } from './data/mounts.js'
import { UNIT_STATS } from './data/units.js'

const UNIT_CATEGORIES = ['characters', 'core', 'special', 'rare', 'mercenaries', 'allies', 'lords', 'heroes']

// Build a map from lore display name → lore key, e.g. "lore of naggaroth" → "naggaroth"
const LORE_NAME_TO_KEY = {}
for (const [key, lore] of Object.entries(LORES)) {
  LORE_NAME_TO_KEY[lore.name.toLowerCase()] = key
}

export function parseArmyList(json) {
  const army = {
    name: json.name || 'Unknown Army',
    armySlug: json.army || '',
    faction: formatFaction(json.army || ''),
    points: json.points || 0,
    composition: json.armyComposition || '',
    units: [],
  }

  for (const cat of UNIT_CATEGORIES) {
    const units = json[cat]
    if (!Array.isArray(units)) continue
    for (const unit of units) {
      army.units.push(parseUnit(unit, cat))
    }
  }

  return army
}

function parseUnit(raw, category) {
  const unit = {
    id: raw.id || '',
    name: raw.name_en || 'Unknown',
    category,
    strength: raw.strength || 1,
    points: calculateUnitPoints(raw),
    equipment: [],
    armour: [],
    specialRules: raw.specialRules?.name_en || '',
    isCaster: false,
    lores: [],
    activeLore: raw.activeLore || null,
    factionLores: [],
    magicItems: [],
    magicWeapons: [],
    banners: [],
    hasLoreFamiliar: false,
    mount: null,
    hasBarding: false,
    stats: null,
    customNote: raw.customNote || '',
  }

  // Equipment
  if (Array.isArray(raw.equipment)) {
    unit.equipment = raw.equipment
      .filter(e => e.active)
      .map(e => e.name_en)
  }

  // Armour
  if (Array.isArray(raw.armor)) {
    unit.armour = raw.armor
      .filter(a => a.active)
      .map(a => a.name_en)
  }

  // Options (active ones)
  if (Array.isArray(raw.options)) {
    const activeOpts = raw.options.filter(o => o.active)
    for (const opt of activeOpts) {
      unit.equipment.push(opt.name_en)
    }
  }

  // Magic items
  if (Array.isArray(raw.items)) {
    for (const slot of raw.items) {
      if (Array.isArray(slot.selected)) {
        for (const item of slot.selected) {
          unit.magicItems.push(item.name_en)
          if (item.type === 'weapon') {
            unit.magicWeapons.push(item.name_en)
          }
          if (item.type === 'banner') {
            unit.banners.push({ name: item.name_en, points: item.points || 0 })
          }
        }
      }
    }
  }

  // Command group magic items
  if (Array.isArray(raw.command)) {
    for (const cmd of raw.command) {
      if (cmd.active && cmd.magic?.selected) {
        for (const item of cmd.magic.selected) {
          unit.magicItems.push(`${item.name_en} (${cmd.name_en})`)
          if (item.type === 'banner') {
            unit.banners.push({ name: item.name_en, points: item.points || 0 })
          }
        }
      }
    }
  }

  // Lore Familiar detection
  unit.hasLoreFamiliar = [...unit.magicItems, ...unit.equipment]
    .some(item => item.toLowerCase().includes('lore familiar'))

  // Mount
  if (Array.isArray(raw.mounts)) {
    const activeMount = raw.mounts.find(m => m.active)
    if (activeMount) {
      unit.mount = activeMount.name_en
      // Barding from mount name or mount options
      if (activeMount.name_en?.toLowerCase().includes('barded')) {
        unit.hasBarding = true
      }
      if (Array.isArray(activeMount.options)) {
        if (activeMount.options.some(o => o.active && o.name_en?.toLowerCase() === 'barding')) {
          unit.hasBarding = true
        }
      }
    }
  }

  // Barding from armour string (e.g. "Heavy armour, Barding")
  if (unit.armour.some(a => a.toLowerCase().includes('barding'))) {
    unit.hasBarding = true
  }

  // Lores / caster detection
  if (Array.isArray(raw.lores) && raw.lores.length > 0) {
    unit.isCaster = true
    unit.lores = raw.lores
  }
  if (raw.activeLore) {
    unit.isCaster = true
  }

  // Faction lores from special rules (e.g. "Lore of Naggaroth" → naggaroth key)
  if (unit.specialRules) {
    const rules = unit.specialRules.split(',').map(r => r.trim())
    for (const rule of rules) {
      // Strip {renegade}, {dark elves} etc. and trailing *
      const cleaned = rule.replace(/\s*\{[^}]*\}/g, '').replace(/\*$/, '').trim().toLowerCase()
      if (LORE_NAME_TO_KEY[cleaned] && !unit.factionLores.includes(LORE_NAME_TO_KEY[cleaned])) {
        unit.factionLores.push(LORE_NAME_TO_KEY[cleaned])
      }
    }
  }

  // Stats — from OWB export, or fall back to rules-index lookup
  if (raw.profile?.stats && raw.profile.stats.length > 0) {
    unit.stats = raw.profile.stats
  } else {
    const baseId = (raw.id || '').split('.')[0]
    if (UNIT_STATS[baseId]) {
      unit.stats = UNIT_STATS[baseId]
    } else {
      // Fallback: try name_en as slug (handles OWB ID typos)
      const nameSlug = (raw.name_en || '').toLowerCase().replace(/\s+/g, '-')
      if (UNIT_STATS[nameSlug]) {
        unit.stats = UNIT_STATS[nameSlug]
      }
    }
  }

  // Detachments
  if (Array.isArray(raw.detachments) && raw.detachments.length > 0) {
    unit.detachments = raw.detachments.map(d => ({
      name: d.name_en,
      strength: d.strength || 0,
    }))
  }

  return unit
}

function calculateUnitPoints(raw) {
  let pts = (raw.points || 0) * (raw.strength || 1)

  const addActivePoints = (items) => {
    if (!Array.isArray(items)) return
    for (const item of items) {
      if (item.active && item.points) {
        pts += item.perModel ? item.points * (raw.strength || 1) : item.points
      }
    }
  }

  addActivePoints(raw.equipment)
  addActivePoints(raw.armor)
  addActivePoints(raw.options)
  addActivePoints(raw.mounts)

  // Mount options (e.g. barding)
  if (Array.isArray(raw.mounts)) {
    for (const mount of raw.mounts) {
      if (mount.active) {
        addActivePoints(mount.options)
      }
    }
  }

  if (Array.isArray(raw.command)) {
    for (const cmd of raw.command) {
      if (cmd.active) {
        if (cmd.points) pts += cmd.points
        if (Array.isArray(cmd.magic?.selected)) {
          for (const item of cmd.magic.selected) {
            pts += item.points || 0
          }
        }
      }
    }
  }

  if (Array.isArray(raw.items)) {
    for (const slot of raw.items) {
      if (Array.isArray(slot.selected)) {
        for (const item of slot.selected) {
          pts += item.points || 0
        }
      }
    }
  }

  return pts
}

function formatFaction(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function getCasters(army) {
  if (!army) return []
  return army.units.filter(u => u.isCaster)
}

export function getShootingUnits(army) {
  if (!army) return []
  const missileKeywords = ['bow', 'crossbow', 'handgun', 'pistol', 'javelin', 'sling', 'throwing', 'bolt thrower', 'cannon', 'mortar', 'catapult', 'trebuchet', 'gun', 'rifle', 'petrifying gaze', 'gaze', 'bombard', 'harpoon', 'breath']
  return army.units.filter(u => {
    const allGear = [...u.equipment, ...u.armour].map(e => e.toLowerCase())
    const hasRangedGear = allGear.some(g => missileKeywords.some(k => g.includes(k)))
    const mountData = u.mount ? findMount(u.mount) : null
    const hasBreath = mountData?.breath != null
    return hasRangedGear || hasBreath
  })
}

export function getMovementUnits(army) {
  if (!army) return []
  return army.units
}

export function getCombatUnits(army) {
  if (!army) return []
  return army.units
}
