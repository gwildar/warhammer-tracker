import { LORES, getSpellTypeLabel } from '../data/spells.js'
import { getCasters } from '../army.js'
import { getSpellSelections } from '../state.js'

export function getKnownSpells(caster) {
  const selections = getSpellSelections()
  const unitSel = selections[caster.id] || {}
  const spells = []

  for (const [key, selected] of Object.entries(unitSel)) {
    if (!selected) continue
    const parts = key.split(':')
    if (parts.length < 3) continue
    const loreKey = parts[0]
    const num = parts[1]
    const name = parts.slice(2).join(':')
    const lore = LORES[loreKey]
    if (!lore) continue
    const spell = lore.spells.find(s => String(s.num) === num && s.name === name)
    if (spell) spells.push({ ...spell, loreKey, loreName: lore.name })
  }

  return spells
}

export function renderCasterContext(army, allowedTypes) {
  const casters = getCasters(army)
  if (casters.length === 0) return ''

  const castersWithSpells = casters.map(c => {
    const known = getKnownSpells(c)
    const filtered = known.filter(s => allowedTypes.includes(s.type))
    return { caster: c, spells: filtered }
  }).filter(c => c.spells.length > 0)

  if (castersWithSpells.length === 0) return ''

  const label = allowedTypes.length === 1
    ? getSpellTypeLabel(allowedTypes[0]) + ' Spells'
    : 'Spells'

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-purple/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-purple mb-3">${label}</h3>
      ${castersWithSpells.map(({ caster: c, spells }) => `
        <div class="mb-3 last:mb-0 p-2 rounded bg-wh-card">
          <div class="flex justify-between items-center mb-1">
            <span class="font-semibold text-wh-text">${c.name}</span>
          </div>
          <div class="space-y-0.5">
            ${spells.map(s => `
              <div class="flex justify-between text-xs">
                <span class="spell-type-${s.type}">${s.name}</span>
                <div class="flex gap-2">
                  ${s.range ? `<span class="text-wh-muted font-mono">${s.range}</span>` : ''}
                  <span class="text-wh-accent font-mono">${s.cv}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `
}
