import { COMBAT_WEAPONS } from '../weapons.js'

export function renderCombatWeaponsContext(army) {
  const units = army.units
  if (units.length === 0) return ''

  const groups = {}

  for (const u of units) {
    const allGear = [...u.equipment]
    for (const gear of allGear) {
      const parts = gear.split(',').map(s => s.trim())
      for (const part of parts) {
        const lower = part.toLowerCase()
        for (const [key, weapon] of Object.entries(COMBAT_WEAPONS)) {
          if (lower.includes(key)) {
            const groupKey = weapon.name
            if (!groups[groupKey]) groups[groupKey] = { weapon, units: [] }
            if (!groups[groupKey].units.some(x => x.name === u.name)) {
              groups[groupKey].units.push(u)
            }
            break
          }
        }
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
