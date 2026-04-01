import { COMBAT_WEAPONS } from '../data/weapons.js'
import { findMount } from '../data/mounts.js'
import { UNIT_STATS } from '../data/units.js'
import { MAGIC_ITEMS } from '../data/magic-items.js'

const ARMOUR_BASE = {
  'light armour': 6,
  'heavy armour': 5,
  'full plate armour': 4,
  'full plate': 4,
  'chaos armour': 4,
  'gromril armour': 4,
}

// Build a lookup from magic item name (lowercase) → item data
const MAGIC_ITEM_MAP = {}
for (const item of MAGIC_ITEMS) {
  if (item.armourBase !== undefined || item.armourMod !== undefined || item.ward || item.regen) {
    MAGIC_ITEM_MAP[item.name.toLowerCase()] = item
  }
}

const HAND_WEAPON = { name: 'Hand Weapon', s: 'S', ap: '—', rules: '' }

function calculateArmourSave(unit) {
  let best = null
  let mod = 0

  // Base armour from armour list
  for (const a of unit.armour) {
    for (const part of a.split(',').map(s => s.trim().toLowerCase())) {
      if (ARMOUR_BASE[part] !== undefined) {
        const val = ARMOUR_BASE[part]
        if (best === null || val < best) best = val
      }
    }
  }

  // Magic item armour (base or modifier)
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[itemName.toLowerCase()]
    if (!mi) continue
    if (mi.armourBase !== undefined) {
      if (best === null || mi.armourBase < best) best = mi.armourBase
    }
    if (mi.armourMod !== undefined) {
      mod += mi.armourMod
    }
  }

  if (best === null) return null

  // Shield from equipment or options
  const allGear = [...unit.equipment, ...unit.armour].map(g => g.toLowerCase())
  const hasShield = allGear.some(g => g.split(',').some(p => p.trim() === 'shield' || p.trim() === 'shields'))
  if (hasShield) best -= 1
  if (unit.hasBarding) best -= 1
  best += mod
  if (best < 2) best = 2

  return `${best}+`
}

function detectWard(unit) {
  // Check magic items
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[itemName.toLowerCase()]
    if (mi?.ward) return mi.ward
  }
  // Check special rules for Blessings of the Lady
  if (unit.specialRules?.toLowerCase().includes('blessings of the lady')) {
    return '6+ (5+ vs S5+)'
  }
  return null
}

function detectRegen(unit) {
  // Check magic items
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[itemName.toLowerCase()]
    if (mi?.regen) return mi.regen
  }
  // Check special rules for Regeneration
  const regenMatch = unit.specialRules?.match(/Regeneration\s*\((\d\+)\)/i)
  if (regenMatch) return regenMatch[1]
  return null
}

function parseBonus(val) {
  if (!val) return 0
  const m = val.match(/\(\+(\d+)\)/)
  return m ? parseInt(m[1]) : 0
}

function getMountStats(mountName) {
  if (!mountName) return null
  const slug = mountName.toLowerCase().replace(/\s+/g, '-')
  const stats = UNIT_STATS[slug]
  return stats?.[0] || null
}

function matchRiderWeapons(unit) {
  const weapons = []
  const matched = new Set()

  const parts = unit.equipment.flatMap(g => g.split(',').map(s => s.trim()))
  for (const part of parts) {
    const lower = part.toLowerCase()
    for (const [key, weapon] of Object.entries(COMBAT_WEAPONS)) {
      if (lower.includes(key) && !matched.has(weapon.name)) {
        matched.add(weapon.name)
        weapons.push(weapon)
      }
    }
  }

  return { weapons, matched }
}

function matchMountWeapons(unit, alreadyMatched) {
  const weapons = []
  if (!unit.mount) return weapons

  const mount = findMount(unit.mount)
  if (!mount?.weapons) return weapons

  for (const wKey of mount.weapons) {
    const weapon = COMBAT_WEAPONS[wKey]
    if (weapon && !alreadyMatched.has(weapon.name)) {
      alreadyMatched.add(weapon.name)
      weapons.push(weapon)
    }
  }

  return weapons
}

function renderMountWeapons(weapons, mountA, mountS, mountI, mountWS) {
  if (weapons.length === 0) return ''
  const totalA = parseInt(mountA) || 0
  const reserved = weapons.filter(w => w.rules?.toLowerCase().includes('must make one attack'))
  const remaining = weapons.filter(w => !w.rules?.toLowerCase().includes('must make one attack'))
  const reservedCount = reserved.length
  const freeA = Math.max(totalA - reservedCount, 0)

  return [...remaining.map(w =>
    renderWeaponLine(mountI, mountWS, mountS, remaining.length === 1 ? freeA : '?', w)
  ), ...reserved.map(w =>
    renderWeaponLine(mountI, mountWS, mountS, 1, w)
  )].join('')
}

function renderWeaponLine(initiative, ws, s, attacks, w) {
  return `<div class="text-xs">
    <span class="text-wh-phase-combat font-mono">I${initiative}</span>
    <span class="text-wh-phase-combat font-mono ml-1">A${attacks}</span>
    <span class="text-wh-muted font-mono ml-1">WS${ws}</span>
    <span class="text-wh-muted font-mono ml-1">S${s}</span>
    <span class="text-wh-text ml-1">${w.name}</span>
    <span class="text-wh-muted font-mono ml-1">${w.s}</span>
    ${w.ap && w.ap !== '—' ? `<span class="text-wh-muted font-mono ml-1">AP ${w.ap}</span>` : ''}
    ${w.rules ? `<span class="text-wh-muted ml-1">${w.rules}</span>` : ''}
  </div>`
}

export function renderCombatWeaponsContext(army) {
  if (army.units.length === 0) return ''

  const entries = []

  for (const u of army.units) {
    const stats = u.stats?.[0]
    if (!stats) {
      entries.push({
        unitName: u.name, strength: u.strength, mount: null,
        riderI: '?', riderWS: '?', riderS: '?', t: '?', w: '?',
        as: calculateArmourSave(u), ward: detectWard(u), regen: detectRegen(u), iNum: 0,
        riderWeapons: [HAND_WEAPON], riderA: '?',
        mountWeapons: [], mountA: null, mountS: null, mountI: null, mountWS: null, mountName: null, stomp: null,
      })
      continue
    }

    const mountStats = getMountStats(u.mount)
    const isRiddenMonster = mountStats && parseBonus(mountStats.W) > 0

    const baseT = parseInt(stats.T) || 0
    const baseW = parseInt(stats.W) || 0
    const tBonus = isRiddenMonster ? parseBonus(mountStats.T) : 0
    const wBonus = isRiddenMonster ? parseBonus(mountStats.W) : 0

    const { weapons: riderWeapons, matched } = matchRiderWeapons(u)
    const mountWeapons = matchMountWeapons(u, matched)

    // Default to hand weapon if no combat weapons matched
    if (riderWeapons.length === 0) riderWeapons.push(HAND_WEAPON)

    const riderI = stats.I || '?'
    const riderWS = stats.WS || '?'
    const riderS = stats.S || '?'
    const mountI = isRiddenMonster ? (mountStats.I || '?') : null
    const mountWS = isRiddenMonster ? (mountStats.WS || '?') : null
    const mountData = u.mount ? findMount(u.mount) : null

    entries.push({
      unitName: u.name,
      strength: u.strength,
      mount: isRiddenMonster ? u.mount : null,
      riderI,
      riderWS,
      riderS,
      t: baseT + tBonus > 0 ? `${baseT + tBonus}` : stats.T || '?',
      w: baseW + wBonus > 0 ? `${baseW + wBonus}` : stats.W || '?',
      as: calculateArmourSave(u),
      ward: detectWard(u),
      regen: detectRegen(u),
      iNum: Math.max(parseInt(riderI) || 0, parseInt(mountI) || 0),
      riderWeapons,
      riderA: stats.A || '?',
      mountWeapons,
      mountA: isRiddenMonster ? mountStats.A : null,
      mountS: isRiddenMonster ? mountStats.S : null,
      mountI,
      mountWS,
      mountName: isRiddenMonster ? mountStats.Name || u.mount : null,
      stomp: mountData?.stomp || null,
    })
  }

  // Deduplicate
  const deduped = {}
  for (const e of entries) {
    const riderWKey = e.riderWeapons.map(w => w.name).sort().join(',')
    const mountWKey = e.mountWeapons.map(w => w.name).sort().join(',')
    const key = `${e.unitName}||${e.riderI}||${e.riderA}||${e.t}||${e.w}||${e.as}||${riderWKey}||${mountWKey}`
    if (!deduped[key]) {
      deduped[key] = { ...e, merged: false }
    } else {
      deduped[key].merged = true
    }
  }

  const rows = Object.values(deduped).sort((a, b) => b.iNum - a.iNum)
  if (rows.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Combat Units</h3>
      <div class="space-y-2">
        ${rows.map(r => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-wh-text font-semibold text-sm">${r.unitName}${r.mount ? ` (${r.mount})` : ''}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ''}</span>
              <span class="text-wh-muted font-mono text-xs">T${r.t}</span>
              <span class="text-wh-muted font-mono text-xs">W${r.w}</span>
              ${r.as ? `<span class="text-wh-muted font-mono text-xs">AS${r.as}</span>` : ''}
              ${r.ward ? `<span class="text-wh-muted font-mono text-xs">Ward ${r.ward}</span>` : ''}
              ${r.regen ? `<span class="text-wh-muted font-mono text-xs">Regen ${r.regen}</span>` : ''}
            </div>
              <div class="mt-1 ml-2 space-y-0.5">
                ${r.riderWeapons.map(w => renderWeaponLine(r.riderI, r.riderWS, r.riderS, r.riderA, w)).join('')}
                ${renderMountWeapons(r.mountWeapons, r.mountA, r.mountS, r.mountI || r.riderI, r.mountWS || r.riderWS)}
                ${r.stomp ? `<div class="text-xs"><span class="text-wh-muted">Stomp Attacks ${r.stomp}</span></div>` : ''}
              </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}
