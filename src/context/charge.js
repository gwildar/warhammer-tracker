import { findMount } from '../data/mounts.js'
import { resolveMovement, parseUnitRules, normaliseRuleName } from '../helpers.js'

export function renderChargeContext(army) {
  const units = army.units
  if (units.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Charge Ranges</h3>
      <div class="space-y-1">
        ${units.map(u => {
          const mv = resolveMovement(u)
          const allRules = [...parseUnitRules(u.specialRules), ...u.equipment]
          const unitSwiftstride = allRules.some(r => normaliseRuleName(r).toLowerCase() === 'swiftstride')

          // Check for Fly — unit special rules first, then flying mount lookup
          const flyRule = allRules.find(r => /^fly\s*\(/i.test(r.trim()))
          const flyMatch = flyRule ? flyRule.match(/\((\d+)\)/) : null
          const mountData = u.mount ? findMount(u.mount) : null
          const flyMv = flyMatch ? Number(flyMatch[1]) : (mountData?.f ?? null)
          const hasFly = flyMv != null
          const hasSwiftstride = unitSwiftstride || (mountData?.swiftstride ?? false)

          // Base movement — for mounts use mount's m value
          const baseMv = mountData ? mountData.m : (mv != null ? Number(mv) : null)
          const swiftBonus = hasSwiftstride ? 3 : 0

          // Ground charge: M + 6 (+ 3 if swiftstride)
          const groundCharge = baseMv != null ? baseMv + 6 + swiftBonus : null

          // Fly charge: Fly + 6 (+ 3 if swiftstride)
          const flyCharge = hasFly ? flyMv + 6 + swiftBonus : null

          return `
            <div class="text-sm py-1 px-2 rounded bg-wh-card">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-wh-text">${u.name}</span>
                  ${u.strength > 1 ? `<span class="text-wh-muted ml-1">x${u.strength}</span>` : ''}
                  ${u.magicWeapons.length > 0 ? `<span class="text-wh-accent ml-1 text-xs">${u.magicWeapons.join(', ')}</span>` : ''}
                  ${hasFly ? '<span class="text-wh-phase-movement ml-1 text-xs">Fly</span>' : ''}
                  ${hasSwiftstride ? '<span class="text-wh-phase-movement ml-1 text-xs">Swiftstride</span>' : ''}
                </div>
                <div class="text-right">
                  ${groundCharge != null
                    ? `<span class="text-wh-phase-combat font-mono text-xs">${groundCharge}"</span>`
                    : ''
                  }
                </div>
              </div>
              ${hasFly ? `
                <div class="flex justify-end mt-0.5">
                  <span class="text-wh-muted text-xs mr-1">Fly</span>
                  <span class="text-wh-phase-movement font-mono text-xs">${flyCharge}"</span>
                </div>
              ` : ''}
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
}
