import { getShootingUnits } from '../army.js'
import { RANGED_WEAPONS } from '../data/weapons.js'
import { findMount } from '../data/mounts.js'

export function renderShootingContext(army) {
  const shooters = getShootingUnits(army)
  if (shooters.length === 0) return ''

  const groups = {}
  const other = []

  for (const u of shooters) {
    let matched = false
    // Check mount breath weapon first (applies to casters too)
    if (u.mount) {
      const mount = findMount(u.mount)
      if (mount?.breath) {
        const breathKey = mount.breath.toLowerCase()
        const weapon = RANGED_WEAPONS[breathKey]
        if (weapon) {
          const groupKey = weapon.name
          if (!groups[groupKey]) groups[groupKey] = { weapon, units: [] }
          groups[groupKey].units.push(u)
          matched = true
        }
      }
    }
    const allGear = [...u.equipment]
    for (const gear of allGear) {
      const lower = gear.toLowerCase()
      for (const [key, weapon] of Object.entries(RANGED_WEAPONS)) {
        if (lower.includes(key)) {
          const groupKey = weapon.name
          if (!groups[groupKey]) groups[groupKey] = { weapon, units: [] }
          groups[groupKey].units.push(u)
          matched = true
          break
        }
      }
      if (matched) break
    }
    if (!matched) other.push(u)
  }

  const groupEntries = Object.values(groups)
  if (groupEntries.length === 0 && other.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-shooting/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-shooting mb-3">Shooting Units</h3>
      <div class="space-y-3">
        ${groupEntries.map(({ weapon, units }) => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-wh-text font-semibold text-sm">${weapon.name}</span>
              <span class="text-wh-phase-shooting font-mono text-xs">${weapon.range}</span>
              ${weapon.s ? `<span class="text-wh-muted font-mono text-xs">S${weapon.s}</span>` : ''}
              ${weapon.ap && weapon.ap !== '—' ? `<span class="text-wh-muted font-mono text-xs">AP ${weapon.ap}</span>` : ''}
            </div>
            ${weapon.rules ? `<p class="text-xs text-wh-muted mb-1">${weapon.rules}</p>` : ''}
            <p class="text-xs text-wh-text">${units.map(u => u.name + (u.strength > 1 ? ` x${u.strength}` : '')).join(', ')}</p>
          </div>
        `).join('')}
        ${other.length > 0 ? `
          <div class="p-2 rounded bg-wh-card">
            <div class="text-sm font-semibold text-wh-text mb-1">Other</div>
            <p class="text-xs text-wh-text">${other.map(u => u.name + (u.strength > 1 ? ` x${u.strength}` : '')).join(', ')}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `
}
