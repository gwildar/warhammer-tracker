import { getShootingUnits } from '../army.js'
import { RANGED_WEAPONS } from '../data/weapons.js'
import { findMount } from '../data/mounts.js'

function getBS(unit) {
  if (!unit.stats || unit.stats.length === 0) return null
  return unit.stats[0].BS || null
}

export function renderShootingContext(army) {
  const shooters = getShootingUnits(army)
  if (shooters.length === 0) return ''

  const entries = []

  for (const u of shooters) {
    let matched = false
    const bs = getBS(u)

    // Check mount breath weapon
    if (u.mount) {
      const mount = findMount(u.mount)
      if (mount?.breath) {
        const breathKey = mount.breath.toLowerCase()
        const weapon = RANGED_WEAPONS[breathKey]
        if (weapon) {
          entries.push({ unitName: u.name, strength: u.strength, bs: null, weapon })
          matched = true
        }
      }
    }

    // Check equipment — split comma-separated strings and match all weapons
    const matchedWeapons = new Set()
    const allParts = u.equipment.flatMap(g => g.split(',').map(s => s.trim().toLowerCase()))
    for (const part of allParts) {
      for (const [key, weapon] of Object.entries(RANGED_WEAPONS)) {
        if (part.includes(key) && !matchedWeapons.has(weapon.name)) {
          matchedWeapons.add(weapon.name)
          entries.push({ unitName: u.name, strength: u.strength, bs, weapon })
          matched = true
        }
      }
    }

    if (!matched) {
      entries.push({ unitName: u.name, strength: u.strength, bs, weapon: null })
    }
  }

  // Deduplicate by unitName + weaponName + bs
  const deduped = {}
  for (const e of entries) {
    const weaponName = e.weapon?.name || 'other'
    const key = `${e.unitName}||${weaponName}||${e.bs}`
    if (!deduped[key]) {
      deduped[key] = { ...e, merged: false }
    } else {
      deduped[key].merged = true
    }
  }

  const rows = Object.values(deduped)
  const weaponRows = rows.filter(r => r.weapon)
  const otherRows = rows.filter(r => !r.weapon)

  if (weaponRows.length === 0 && otherRows.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-shooting/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-shooting mb-3">Shooting Units</h3>
      <div class="space-y-2">
        ${weaponRows.map(r => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-wh-text font-semibold text-sm">${r.unitName}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ''}</span>
              <span class="text-wh-muted text-sm">${r.weapon.name}</span>
              ${r.bs ? `<span class="text-wh-phase-shooting font-mono text-xs">BS${r.bs}</span>` : ''}
              <span class="text-wh-phase-shooting font-mono text-xs">${r.weapon.range}</span>
              ${r.weapon.s ? `<span class="text-wh-muted font-mono text-xs">S${r.weapon.s}</span>` : ''}
              ${r.weapon.ap && r.weapon.ap !== '—' ? `<span class="text-wh-muted font-mono text-xs">AP ${r.weapon.ap}</span>` : ''}
            </div>
            ${r.weapon.rules ? `<p class="text-xs text-wh-muted mt-1">${r.weapon.rules}</p>` : ''}
          </div>
        `).join('')}
        ${otherRows.length > 0 ? `
          <div class="p-2 rounded bg-wh-card">
            <div class="text-sm font-semibold text-wh-text mb-1">Other</div>
            <p class="text-xs text-wh-text">${otherRows.map(r => r.unitName + (!r.merged && r.strength > 1 ? ` x${r.strength}` : '') + (r.bs ? ` BS${r.bs}` : '')).join(', ')}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `
}
