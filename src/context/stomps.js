import { findMount } from '../data/mounts.js'

export function renderStompContext(army) {
  if (army.units.length === 0) return ''

  const stompers = []

  for (const u of army.units) {
    if (!u.mount) continue
    const mount = findMount(u.mount)
    if (!mount?.stomp) continue
    stompers.push({ name: u.name, mount: mount.name, stomp: mount.stomp })
  }

  if (stompers.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Stomp Attacks</h3>
      <p class="text-xs text-wh-muted mb-2">Resolved last (after I1 attacks). Auto-hit at unmodified S. Only models in base contact.</p>
      <div class="space-y-1">
        ${stompers.map(s => `
          <div class="flex items-center gap-2 p-2 rounded bg-wh-card text-sm">
            <span class="text-wh-text">${s.name}</span>
            <span class="text-wh-muted text-xs">(${s.mount})</span>
            <span class="text-wh-phase-combat font-mono text-xs ml-auto">${s.stomp} hits</span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}
