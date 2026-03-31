import './style.css'
import { PHASES, getAllSubPhases } from './phases.js'
import { LORES, getSpellTypeLabel } from './spells.js'
import { parseArmyList, getCasters, getShootingUnits, getMovementUnits, getCombatUnits } from './army.js'
import { SPECIAL_RULES } from './special-rules.js'
import {
  getArmy, saveArmy, clearArmy,
  getSpellSelections, saveSpellSelections,
  getPhaseIndex, savePhaseIndex,
  getRound, saveRound, resetGame,
} from './state.js'

const app = document.getElementById('app')
const allSubPhases = getAllSubPhases()

// Phase colour maps — full class names so Tailwind can detect them at build time
const PHASE_BG = {
  'wh-phase-strategy': 'bg-wh-phase-strategy',
  'wh-phase-movement': 'bg-wh-phase-movement',
  'wh-phase-shooting': 'bg-wh-phase-shooting',
  'wh-phase-combat': 'bg-wh-phase-combat',
}
const PHASE_TEXT = {
  'wh-phase-strategy': 'text-wh-phase-strategy',
  'wh-phase-movement': 'text-wh-phase-movement',
  'wh-phase-shooting': 'text-wh-phase-shooting',
  'wh-phase-combat': 'text-wh-phase-combat',
}

// Spell type → sub-phase mapping
const SPELL_TYPE_PHASES = {
  'enchantment': 'conjuration',
  'hex': 'conjuration',
  'magical-vortex': 'conjuration',
  'magic-missile': 'choose-target',
  'conveyance': 'remaining-moves',
  'assailment': 'choose-fight',
}

function render() {
  const army = getArmy()
  if (!army) {
    renderSetupScreen()
  } else {
    renderSetupScreen()
  }
}

// ─── Setup Screen ───────────────────────────────────────────────────────────

function renderSetupScreen() {
  const army = getArmy()

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <h1 class="text-2xl font-bold text-wh-accent text-center">The Old World — Turn Tracker</h1>
      </header>

      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        ${army ? renderArmySummary(army) : renderUploadSection()}
      </main>
    </div>
  `

  if (army) {
    bindArmyActions()
    bindSpellSelectors(army)
  } else {
    bindUpload()
  }
}

function renderUploadSection() {
  return `
    <div class="mt-8">
      <div id="drop-zone"
        class="border-2 border-dashed border-wh-border rounded-xl p-12 text-center
               hover:border-wh-accent transition-colors cursor-pointer">
        <div class="text-4xl mb-4">&#128193;</div>
        <p class="text-lg mb-2">Drop your <span class="text-wh-accent font-mono">.owb.json</span> file here</p>
        <p class="text-wh-muted text-sm mb-4">or click to browse</p>
        <input type="file" id="file-input" accept=".json,.owb" class="hidden" />
        <button id="browse-btn"
          class="bg-wh-accent text-wh-bg px-6 py-2 rounded-lg font-semibold hover:bg-wh-accent-dim transition-colors">
          Choose File
        </button>
      </div>
      <p id="upload-error" class="text-wh-red text-sm mt-2 hidden"></p>

      <div class="mt-8 p-4 bg-wh-surface rounded-lg border border-wh-border">
        <h3 class="font-semibold text-wh-accent mb-2">How to get your army file</h3>
        <ol class="text-sm text-wh-muted space-y-1 list-decimal list-inside">
          <li>Go to <span class="text-wh-text">Old World Builder</span> (oldworldbuilder.com)</li>
          <li>Create or open your army list</li>
          <li>Export as <span class="font-mono text-wh-text">.owb.json</span></li>
          <li>Upload the file here</li>
        </ol>
      </div>
    </div>
  `
}

function renderArmySummary(army) {
  const casters = getCasters(army)
  const totalPts = army.units.reduce((sum, u) => sum + u.points, 0)

  return `
    <div class="mt-4">
      <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h2 class="text-xl font-bold text-wh-accent">${army.name}</h2>
            <p class="text-wh-muted text-sm">${army.faction}${army.composition ? ' — ' + formatSlug(army.composition) : ''}</p>
          </div>
          <span class="text-wh-accent font-mono text-lg">${totalPts} pts</span>
        </div>

        <div class="space-y-1 mb-4">
          ${renderUnitList(army)}
        </div>

        <div class="flex gap-2">
          <button id="start-game-btn"
            class="flex-1 bg-wh-accent text-wh-bg py-3 rounded-lg font-bold text-lg
                   hover:bg-wh-accent-dim transition-colors">
            Start Game
          </button>
          <button id="replace-army-btn"
            class="bg-wh-card text-wh-muted px-4 py-3 rounded-lg border border-wh-border
                   hover:text-wh-text hover:border-wh-accent transition-colors">
            Replace
          </button>
        </div>
      </div>

      ${casters.length > 0 ? renderSpellSelection(army, casters) : ''}
    </div>
  `
}

function renderUnitList(army) {
  const categories = ['characters', 'lords', 'heroes', 'core', 'special', 'rare', 'mercenaries', 'allies']
  let html = ''

  for (const cat of categories) {
    const units = army.units.filter(u => u.category === cat)
    if (units.length === 0) continue

    html += `<div class="mt-3 first:mt-0">
      <h3 class="text-xs uppercase tracking-wider text-wh-muted mb-1">${cat}</h3>
      ${units.map(u => `
        <div class="flex justify-between items-center py-1 px-2 rounded hover:bg-wh-card text-sm">
          <div>
            <span class="text-wh-text">${u.name}</span>
            ${u.strength > 1 ? `<span class="text-wh-muted ml-1">x${u.strength}</span>` : ''}
            ${u.mount ? `<span class="text-wh-muted ml-1">(${u.mount})</span>` : ''}
            ${u.isCaster ? '<span class="text-wh-purple ml-1 text-xs">WIZARD</span>' : ''}
            ${u.magicWeapons.length > 0 ? `<span class="text-wh-accent ml-1 text-xs">${u.magicWeapons.join(', ')}</span>` : ''}
          </div>
          <span class="text-wh-muted font-mono text-xs">${u.points}pts</span>
        </div>
      `).join('')}
    </div>`
  }

  return html
}

// ─── Spell Selection (Setup Screen) ─────────────────────────────────────────

function renderSpellSelection(army, casters) {
  const selections = getSpellSelections()

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-border p-4">
      <h3 class="text-lg font-bold text-wh-purple mb-3">Spell Selection</h3>
      <p class="text-sm text-wh-muted mb-4">Choose a core lore, then select your signature spell and numbered spells.</p>

      ${casters.map(caster => {
        const coreLoreKey = caster.activeLore || (caster.lores.length > 0 ? caster.lores[0] : null)
        const unitSelections = selections[caster.id] || {}

        return `
          <div class="mb-6 last:mb-0 pb-4 border-b border-wh-border last:border-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-semibold text-wh-text">${caster.name}</span>
              ${caster.hasLoreFamiliar ? '<span class="text-xs bg-wh-purple/20 text-wh-purple px-1.5 py-0.5 rounded">Lore Familiar</span>' : ''}
            </div>

            <!-- Core lore selector -->
            ${caster.lores.length > 1 ? `
              <div class="mb-3">
                <label class="text-xs text-wh-muted">Core Lore:</label>
                <select class="lore-select bg-wh-card border border-wh-border rounded px-2 py-1 text-sm text-wh-text ml-1"
                  data-unit-id="${caster.id}">
                  ${caster.lores.map(l => {
                    const lore = LORES[l]
                    return `<option value="${l}" ${l === coreLoreKey ? 'selected' : ''}>
                      ${lore ? lore.name : formatSlug(l)}
                    </option>`
                  }).join('')}
                </select>
              </div>
            ` : `
              <div class="mb-3">
                <span class="text-xs text-wh-muted">Core Lore:</span>
                <span class="text-sm text-wh-text ml-1">${coreLoreKey && LORES[coreLoreKey] ? LORES[coreLoreKey].name : 'None'}</span>
              </div>
            `}

            <div class="spell-list" data-unit-id="${caster.id}" data-lore="${coreLoreKey || ''}">
              ${coreLoreKey ? renderCasterSpells(coreLoreKey, caster, unitSelections, caster.factionLores) : '<p class="text-sm text-wh-muted">Select a lore above</p>'}
            </div>
          </div>
        `
      }).join('')}
    </div>
  `
}

function renderCasterSpells(coreLoreKey, caster, unitSelections, factionLoreKeys) {
  const coreLore = LORES[coreLoreKey]
  if (!coreLore) return `<p class="text-sm text-wh-muted">Unknown lore: ${coreLoreKey}</p>`

  const coreSignatures = coreLore.spells.filter(s => s.num === 'S')
  const numberedSpells = coreLore.spells.filter(s => s.num !== 'S')

  // If caster has Lore Familiar: all spells from core lore only, free pick
  if (caster.hasLoreFamiliar) {
    return `
      <div class="mb-2 text-xs text-wh-purple">Lore Familiar: choose any spells from ${coreLore.name}</div>
      <div class="space-y-1">
        ${coreLore.spells.map(spell => renderSpellCheckbox(coreLoreKey, spell, caster.id, unitSelections, false)).join('')}
      </div>
    `
  }

  // Gather faction signature spells available to this caster
  const factionSignatures = []
  for (const fKey of factionLoreKeys) {
    const fLore = LORES[fKey]
    if (!fLore) continue
    for (const s of fLore.spells) {
      if (s.num === 'S') {
        factionSignatures.push({ loreKey: fKey, loreName: fLore.name, spell: s })
      }
    }
  }

  const hasFactionOption = factionSignatures.length > 0

  let html = ''

  // Signature spell section
  html += `
    <div class="mb-3">
      <div class="text-xs text-wh-muted mb-1">Signature Spells:</div>
      <div class="space-y-1">
        ${coreSignatures.map(spell => {
          const spellKey = `${coreLoreKey}:${spell.num}:${spell.name}`
          return `
            <label class="flex items-center gap-2 py-1 px-2 rounded hover:bg-wh-card text-sm cursor-pointer">
              <input type="checkbox" class="spell-checkbox accent-wh-purple"
                data-unit-id="${caster.id}" data-spell-key="${spellKey}"
                ${unitSelections[spellKey] ? 'checked' : ''} />
              <span class="font-mono text-xs text-wh-muted w-4">S</span>
              <span class="text-wh-text flex-1">${spell.name}</span>
              <span class="text-xs text-wh-muted">${coreLore.name}</span>
              <span class="spell-type-${spell.type} text-xs">${getSpellTypeLabel(spell.type)}</span>
              <span class="text-wh-accent font-mono text-xs">${spell.cv}</span>
            </label>
          `
        }).join('')}
        ${factionSignatures.map(({ loreKey, loreName, spell }) => {
          const spellKey = `${loreKey}:${spell.num}:${spell.name}`
          return `
            <label class="flex items-center gap-2 py-1 px-2 rounded hover:bg-wh-card text-sm cursor-pointer">
              <input type="checkbox" class="spell-checkbox accent-wh-purple"
                data-unit-id="${caster.id}" data-spell-key="${spellKey}"
                ${unitSelections[spellKey] ? 'checked' : ''} />
              <span class="font-mono text-xs text-wh-muted w-4">S</span>
              <span class="text-wh-text flex-1">${spell.name}</span>
              <span class="text-xs text-wh-purple">${loreName}</span>
              <span class="spell-type-${spell.type} text-xs">${getSpellTypeLabel(spell.type)}</span>
              <span class="text-wh-accent font-mono text-xs">${spell.cv}</span>
            </label>
          `
        }).join('')}
      </div>
    </div>
  `

  // Numbered spells (always from core lore)
  if (numberedSpells.length > 0) {
    html += `
      <div>
        <div class="text-xs text-wh-muted mb-1">Spells (${coreLore.name}):</div>
        <div class="space-y-1">
          ${numberedSpells.map(spell => renderSpellCheckbox(coreLoreKey, spell, caster.id, unitSelections, false)).join('')}
        </div>
      </div>
    `
  }

  return html
}

function renderSpellCheckbox(loreKey, spell, unitId, unitSelections, disabled) {
  const spellKey = `${loreKey}:${spell.num}:${spell.name}`
  const isChecked = unitSelections[spellKey]

  return `
    <label class="flex items-center gap-2 py-1 px-2 rounded hover:bg-wh-card text-sm cursor-pointer">
      <input type="checkbox"
        class="spell-checkbox accent-wh-purple"
        data-unit-id="${unitId}"
        data-spell-key="${spellKey}"
        ${isChecked ? 'checked' : ''}
        ${disabled ? 'disabled' : ''} />
      <span class="font-mono text-xs text-wh-muted w-4">${spell.num}</span>
      <span class="text-wh-text flex-1">${spell.name}</span>
      <span class="spell-type-${spell.type} text-xs">${getSpellTypeLabel(spell.type)}</span>
      <span class="text-wh-accent font-mono text-xs">${spell.cv}</span>
    </label>
  `
}

// ─── Game Screen ────────────────────────────────────────────────────────────

function renderGameScreen(army) {
  const phaseIdx = getPhaseIndex()
  const round = getRound()
  const { phase, subPhase } = allSubPhases[phaseIdx]
  const isFirst = phaseIdx === 0
  const isLast = phaseIdx === allSubPhases.length - 1

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <!-- Header -->
      <header class="bg-wh-surface border-b border-wh-border p-3">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <button id="manage-army-btn" class="text-wh-muted hover:text-wh-accent text-sm transition-colors">
              &#9776; Army
            </button>
            <span class="text-wh-muted text-sm hidden sm:inline">|</span>
            <span class="text-sm text-wh-accent hidden sm:inline">${army.name}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-mono text-wh-accent">Round ${round}</span>
            <button id="new-game-btn"
              class="text-xs text-wh-muted hover:text-wh-red border border-wh-border px-2 py-1 rounded transition-colors">
              New Game
            </button>
          </div>
        </div>

        <!-- Phase progress -->
        <div class="flex gap-1">
          ${PHASES.map((p) => {
            const startIdx = allSubPhases.findIndex(s => s.phase.id === p.id)
            const endIdx = startIdx + p.subPhases.length - 1
            const isCurrent = phaseIdx >= startIdx && phaseIdx <= endIdx
            const isPast = phaseIdx > endIdx

            return `<div class="flex-1 text-center">
              <div class="h-1.5 rounded-full mb-1 transition-all ${
                isCurrent ? `${PHASE_BG[p.colour]}` :
                isPast ? `${PHASE_BG[p.colour]} opacity-40` :
                'bg-wh-border'
              }"></div>
              <span class="text-[10px] ${isCurrent ? 'text-wh-text font-semibold' : 'text-wh-muted'}">${p.name.replace(' Phase', '')}</span>
            </div>`
          }).join('')}
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto p-4">
        <div class="max-w-2xl mx-auto">
          <!-- Phase & sub-phase heading -->
          <div class="mb-4">
            <span class="text-xs uppercase tracking-wider ${PHASE_TEXT[phase.colour]}">${phase.name}</span>
            <h2 class="text-2xl font-bold text-wh-text">${subPhase.name}</h2>
            <span class="text-xs text-wh-muted">Step ${phaseIdx + 1} of ${allSubPhases.length}</span>
          </div>

          <!-- Rules -->
          <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
            <ul class="space-y-2">
              ${subPhase.rules.map(rule => `
                <li class="flex gap-2 text-sm">
                  <span class="${PHASE_TEXT[phase.colour]} mt-0.5 shrink-0">&#9654;</span>
                  <span>${rule}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Contextual army info -->
          ${renderPhaseContext(army, subPhase)}
        </div>
      </main>

      <!-- Footer nav -->
      <footer class="sticky bottom-0 bg-wh-surface border-t border-wh-border p-3">
        <div class="max-w-2xl mx-auto flex gap-3">
          <button id="prev-btn"
            class="flex-1 py-3 rounded-lg font-semibold text-lg transition-colors
            ${isFirst
              ? 'bg-wh-card text-wh-muted cursor-not-allowed opacity-50'
              : 'bg-wh-card text-wh-text hover:bg-wh-border'}"
            ${isFirst ? 'disabled' : ''}>
            &#8592; Previous
          </button>
          <button id="next-btn"
            class="flex-1 py-3 rounded-lg font-bold text-lg transition-colors
            bg-wh-accent text-wh-bg hover:bg-wh-accent-dim">
            ${isLast ? 'End Turn &#10226;' : 'Next &#8594;'}
          </button>
        </div>
      </footer>
    </div>
  `

  bindGameActions(army)
}

// ─── Phase Context Rendering ────────────────────────────────────────────────

function renderPhaseContext(army, subPhase) {
  let html = ''

  // Existing type-based contexts
  if (subPhase.showCasters) html += renderCasterContext(army, ['enchantment', 'hex', 'magical-vortex'])
  if (subPhase.showShooting) html += renderShootingContext(army)
  if (subPhase.showMovement) html += renderMovementContext(army)
  if (subPhase.showCombat) html += renderCombatContext(army)

  // Spell type contexts for specific sub-phases
  if (subPhase.id === 'choose-target') html += renderCasterContext(army, ['magic-missile'])
  if (subPhase.id === 'remaining-moves') html += renderCasterContext(army, ['conveyance'])
  if (subPhase.id === 'choose-fight') html += renderCasterContext(army, ['assailment'])

  // Special rules context for ALL sub-phases
  html += renderSpecialRulesContext(army, subPhase)

  return html
}

function getKnownSpells(caster) {
  const selections = getSpellSelections()
  const unitSel = selections[caster.id] || {}
  const spells = []

  // Gather all selected spells across all lores
  for (const [key, selected] of Object.entries(unitSel)) {
    if (!selected) continue
    // key format: "loreKey:num:name"
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

function renderCasterContext(army, allowedTypes) {
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
                  <span class="text-wh-muted">${s.loreName}</span>
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

function renderShootingContext(army) {
  const shooters = getShootingUnits(army)
  if (shooters.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-shooting/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-shooting mb-3">Shooting Units</h3>
      <div class="space-y-1">
        ${shooters.map(u => `
          <div class="flex justify-between items-center text-sm py-1 px-2 rounded bg-wh-card">
            <div>
              <span class="text-wh-text">${u.name}</span>
              ${u.strength > 1 ? `<span class="text-wh-muted ml-1">x${u.strength}</span>` : ''}
              ${u.magicWeapons.length > 0 ? `<span class="text-wh-accent ml-1 text-xs">${u.magicWeapons.join(', ')}</span>` : ''}
            </div>
            <span class="text-xs text-wh-muted">${u.equipment.join(', ')}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function renderMovementContext(army) {
  const units = getMovementUnits(army)
  if (units.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-movement/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-movement mb-3">Your Units</h3>
      <div class="space-y-1">
        ${units.map(u => {
          const mv = u.stats?.[0]?.M
          return `
            <div class="flex justify-between items-center text-sm py-1 px-2 rounded bg-wh-card">
              <div>
                <span class="text-wh-text">${u.name}</span>
                ${u.strength > 1 ? `<span class="text-wh-muted ml-1">x${u.strength}</span>` : ''}
              </div>
              ${mv != null ? `<span class="text-wh-phase-movement font-mono text-xs">M${mv}</span>` : ''}
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
}

function renderCombatContext(army) {
  const units = getCombatUnits(army)
  if (units.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Combat Units</h3>
      <div class="space-y-1">
        ${units.map(u => {
          const s = u.stats?.[0]
          return `
            <div class="text-sm py-1 px-2 rounded bg-wh-card">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-wh-text">${u.name}</span>
                  ${u.magicWeapons.length > 0 ? `<span class="text-wh-accent ml-1 text-xs">${u.magicWeapons.join(', ')}</span>` : ''}
                </div>
                ${u.strength > 1 ? `<span class="text-wh-muted text-xs">x${u.strength}</span>` : ''}
              </div>
              ${s ? `
                <div class="flex gap-2 text-xs text-wh-muted mt-0.5 font-mono">
                  <span>WS${s.WS}</span>
                  <span>S${s.S}</span>
                  <span>T${s.T}</span>
                  <span>I${s.I}</span>
                  <span>A${s.A}</span>
                </div>
              ` : ''}
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
}

// ─── Special Rules Context ──────────────────────────────────────────────────

function parseUnitRules(specialRulesStr) {
  if (!specialRulesStr) return []
  return specialRulesStr.split(',').map(r => r.trim()).filter(Boolean)
}

function normaliseRuleName(name) {
  // Strip parenthetical parameters: "Armour Bane (2)" → "Armour Bane"
  return name.replace(/\s*\(.*?\)\s*$/, '').trim()
}

function ruleMatches(rule, normName) {
  if (rule.name.toLowerCase() === normName.toLowerCase()) return true
  if (Array.isArray(rule.aliases)) {
    return rule.aliases.some(a => a.toLowerCase() === normName.toLowerCase())
  }
  return false
}

function renderSpecialRulesContext(army, subPhase) {
  const round = getRound()
  const matches = []

  for (const unit of army.units) {
    // Check both specialRules string AND equipment (options like Ambushers, Scouts, Fire & Flee are purchased as options)
    const unitRules = [
      ...parseUnitRules(unit.specialRules),
      ...unit.equipment,
    ]
    for (const ruleName of unitRules) {
      const normName = normaliseRuleName(ruleName)
      for (const rule of SPECIAL_RULES) {
        if (!ruleMatches(rule, normName)) continue
        for (const phase of rule.phases) {
          if (phase.subPhaseId !== subPhase.id) continue
          if (phase.fromRound && round < phase.fromRound) continue
          matches.push({
            unitName: unit.name,
            ruleName: ruleName,
            description: phase.description,
          })
        }
      }
    }
  }

  if (matches.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-accent/20 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-accent mb-3">Special Rules This Step</h3>
      <div class="space-y-2">
        ${matches.map(m => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-wh-text font-semibold">${m.unitName}</span>
              <span class="text-xs bg-wh-accent/20 text-wh-accent px-1.5 py-0.5 rounded">${m.ruleName}</span>
            </div>
            <p class="text-wh-muted text-xs">${m.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

// ─── Event Bindings ─────────────────────────────────────────────────────────

function bindUpload() {
  const dropZone = document.getElementById('drop-zone')
  const fileInput = document.getElementById('file-input')
  const browseBtn = document.getElementById('browse-btn')
  const errorEl = document.getElementById('upload-error')

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    fileInput.click()
  })
  dropZone.addEventListener('click', () => fileInput.click())

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.classList.add('border-wh-accent', 'bg-wh-card')
  })
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-wh-accent', 'bg-wh-card')
  })
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.classList.remove('border-wh-accent', 'bg-wh-card')
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file, errorEl)
  })

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]
    if (file) handleFile(file, errorEl)
  })
}

function handleFile(file, errorEl) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result)
      const army = parseArmyList(json)
      saveArmy(army)
      // Initialise empty spell selections for each caster
      const casters = getCasters(army)
      const selections = {}
      for (const c of casters) {
        selections[c.id] = {}
      }
      saveSpellSelections(selections)
      resetGame()
      render()
    } catch (err) {
      errorEl.textContent = `Failed to parse file: ${err.message}`
      errorEl.classList.remove('hidden')
    }
  }
  reader.readAsText(file)
}

function bindArmyActions() {
  document.getElementById('start-game-btn').addEventListener('click', () => {
    renderGameScreen(getArmy())
  })

  document.getElementById('replace-army-btn').addEventListener('click', () => {
    clearArmy()
    render()
  })
}

function bindSpellSelectors(army) {
  // Lore dropdowns
  document.querySelectorAll('.lore-select').forEach(select => {
    select.addEventListener('change', () => {
      const unitId = select.dataset.unitId
      const loreKey = select.value

      // Update army caster's activeLore
      const caster = army.units.find(u => u.id === unitId)
      if (caster) caster.activeLore = loreKey
      saveArmy(army)

      // Reset spell selections for this caster
      const selections = getSpellSelections()
      selections[unitId] = {}
      saveSpellSelections(selections)

      // Re-render spell list for this caster
      const container = document.querySelector(`.spell-list[data-unit-id="${unitId}"]`)
      if (container) {
        container.dataset.lore = loreKey
        container.innerHTML = renderCasterSpells(loreKey, caster, selections[unitId], caster.factionLores)
        bindSpellCheckboxes()

      }
    })
  })

  bindSpellCheckboxes()
}

function bindSpellCheckboxes() {
  document.querySelectorAll('.spell-checkbox:not([disabled])').forEach(cb => {
    cb.addEventListener('change', () => {
      const unitId = cb.dataset.unitId
      const spellKey = cb.dataset.spellKey
      const selections = getSpellSelections()
      if (!selections[unitId]) selections[unitId] = {}
      selections[unitId][spellKey] = cb.checked
      saveSpellSelections(selections)
    })
  })
}


function bindGameActions(army) {
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    const idx = getPhaseIndex()
    if (idx > 0) {
      savePhaseIndex(idx - 1)
      renderGameScreen(army)
    }
  })

  document.getElementById('next-btn')?.addEventListener('click', () => {
    const idx = getPhaseIndex()
    if (idx < allSubPhases.length - 1) {
      savePhaseIndex(idx + 1)
    } else {
      // End of turn — next round
      savePhaseIndex(0)
      saveRound(getRound() + 1)
    }
    renderGameScreen(army)
  })

  document.getElementById('manage-army-btn')?.addEventListener('click', () => {
    renderSetupScreen()
  })

  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    if (confirm('Start a new game? This will reset the round counter.')) {
      resetGame()
      renderGameScreen(army)
    }
  })
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatSlug(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Init ───────────────────────────────────────────────────────────────────

render()
