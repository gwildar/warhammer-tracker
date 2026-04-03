import { findMagicItem } from '../data/magic-items.js'

export function renderVirtuesContext(army, phaseId, subPhaseId) {
  const grouped = {}

  for (const unit of army.units) {
    for (const itemName of unit.magicItems) {
      const cleanName = itemName.replace(/\s*\([^)]*\)\s*$/, '').replace(/\*$/, '').trim()
      const item = findMagicItem(cleanName)
      if (!item || item.type !== 'virtue') continue
      if (!item.phases.includes(phaseId)) continue
      if (subPhaseId && item.subPhases && !item.subPhases.includes(subPhaseId)) continue
      if (subPhaseId && item.opponentOnly) continue
      if (!subPhaseId && item.yourTurnOnly) continue
      const key = item.name
      if (!grouped[key]) grouped[key] = { item, units: [] }
      if (!grouped[key].units.includes(unit.name)) grouped[key].units.push(unit.name)
    }
  }

  const entries = Object.values(grouped)
  if (entries.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-blue-400/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-blue-400 mb-3">Virtues</h3>
      <div class="space-y-2">
        ${entries.map(({ item, units }) => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <span class="text-wh-accent font-semibold">${item.name}</span>
            <p class="text-wh-muted text-xs mt-1">${item.effect}</p>
            <p class="text-wh-text text-xs mt-1">${units.join(', ')}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `
}
