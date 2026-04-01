import { COMBAT_WEAPONS } from '../data/weapons.js'

function matchCombatWeapon(gearStr) {
  const lower = gearStr.toLowerCase()
  for (const [key, weapon] of Object.entries(COMBAT_WEAPONS)) {
    if (lower.includes(key)) return weapon
  }
  return null
}

export function renderCombatWeaponsContext(army) {
  if (army.units.length === 0) return ''

  const groups = {}

  for (const u of army.units) {
    const parts = u.equipment.flatMap(g => g.split(',').map(s => s.trim()))
    const matched = new Set()

    for (const part of parts) {
      const weapon = matchCombatWeapon(part)
      if (weapon && !matched.has(weapon.name)) {
        matched.add(weapon.name)
        if (!groups[weapon.name]) groups[weapon.name] = { weapon, units: [] }
        groups[weapon.name].units.push(u)
      }
    }
  }

  const groupEntries = Object.values(groups)
  if (groupEntries.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Combat Weapons</h3>
      <div class="space-y-3">
        ${groupEntries.map(({ weapon, units }) => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-wh-text font-semibold text-sm">${weapon.name}</span>
              <span class="text-wh-muted font-mono text-xs">${weapon.s}</span>
              ${weapon.ap && weapon.ap !== '—' ? `<span class="text-wh-muted font-mono text-xs">AP ${weapon.ap}</span>` : ''}
            </div>
            ${weapon.rules ? `<p class="text-xs text-wh-muted mb-1">${weapon.rules}</p>` : ''}
            <p class="text-xs text-wh-text">${units.map(u => u.name + (u.strength > 1 ? ` x${u.strength}` : '')).join(', ')}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `
}
