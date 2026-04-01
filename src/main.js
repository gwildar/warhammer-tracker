import './style.css'
import { version } from '../package.json'
import { PHASES, getAllSubPhases } from './phases.js'
import { LORES, getSpellTypeLabel } from './spells.js'
import { parseArmyList, getCasters, getShootingUnits, getMovementUnits } from './army.js'
import { RANGED_WEAPONS } from './weapons.js'
import { findMagicItem } from './magic-items.js'
import { SPECIAL_RULES } from './special-rules.js'
import { findMount } from './mounts.js'
import RULES_INDEX from './rules-index-export.json'

// Army name → rules index key overrides (both lowercase)
const UNIT_NAME_ALIASES = {
  'bloodwrack medusas': 'bloodwrack medusa',
}

function resolveRulesIndexKey(name) {
  const key = name.toLowerCase()
  return UNIT_NAME_ALIASES[key] || key
}

function lookupMovement(name) {
  const entry = RULES_INDEX[resolveRulesIndexKey(name)]
  if (!entry?.stats) return null
  for (let i = entry.stats.length - 1; i >= 0; i--) {
    if (entry.stats[i].M && entry.stats[i].M !== '-') return entry.stats[i].M
  }
  return null
}

function resolveMovement(unit) {
  // 1. Inline stats from army file
  const inlineMv = unit.stats?.[0]?.M
  if (inlineMv && inlineMv !== '-') return inlineMv
  // 2. Mount lookup (characters on mounts)
  if (unit.mount) {
    const mount = findMount(unit.mount)
    if (mount) return String(mount.m)
    const mountMv = lookupMovement(unit.mount)
    if (mountMv) return mountMv
  }
  // 3. Unit name lookup (cavalry etc.)
  return lookupMovement(unit.name)
}
import {
  getArmy, saveArmy, clearArmy, clearAll,
  getSpellSelections, saveSpellSelections,
  getPhaseIndex, savePhaseIndex,
  getRound, saveRound, resetGame,
  getIsOpponentTurn, saveIsOpponentTurn,
  getFirstTurn, saveFirstTurn,
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
  } else if (!getFirstTurn()) {
    renderSetupScreen()
  } else if (getIsOpponentTurn()) {
    renderOpponentTurnScreen(army)
  } else {
    renderGameScreen(army)
  }
}

// ─── Setup Screen ───────────────────────────────────────────────────────────

function renderSetupScreen() {
  const army = getArmy()

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-2xl mx-auto">
          <div></div>
          <h1 class="text-2xl font-bold text-wh-accent text-center">TOW — Turner Overdrive <span class="text-xs text-wh-muted font-normal">v${version}</span></h1>
          <button id="about-btn" class="text-sm text-wh-muted hover:text-wh-accent transition-colors">About</button>
        </div>
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

  document.getElementById('about-btn')?.addEventListener('click', () => {
    renderAboutScreen()
  })
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
            ${u.banners.length > 0 ? `<span class="text-wh-muted ml-1 text-xs">${u.banners.map(b => `${b.name} (${b.points}pts)`).join(', ')}</span>` : ''}
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
          ${renderPhaseContext(army, phase, subPhase)}
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

function renderPhaseContext(army, phase, subPhase) {
  let html = ''

  // Existing type-based contexts
  if (subPhase.showCasters) html += renderCasterContext(army, ['enchantment', 'hex'])
  if (subPhase.showShooting) html += renderShootingContext(army)

  // Charge context
  if (subPhase.id === 'declare-charges') html += renderChargeContext(army)

  // Spell type contexts for specific sub-phases
  if (subPhase.id === 'choose-target') html += renderCasterContext(army, ['magic-missile', 'magical-vortex'])
  if (subPhase.id === 'remaining-moves') html += renderCasterContext(army, ['conveyance'])
  if (subPhase.id === 'choose-fight') html += renderCasterContext(army, ['assailment'])

  // Magic items context per phase
  html += renderMagicItemsContext(army, phase.id, subPhase.id)

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

function renderShootingContext(army) {
  const shooters = getShootingUnits(army)
  if (shooters.length === 0) return ''

  // Group units by matched weapon type
  const groups = {}
  const other = []

  for (const u of shooters) {
    if (u.isCaster) continue // casters shown separately via magic missile context
    let matched = false
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

function renderChargeContext(army) {
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
          const groundStr = baseMv != null
            ? (hasSwiftstride ? `M${baseMv} + 6 + 3` : `M${baseMv} + 6`)
            : null

          // Fly charge: Fly + 6 (+ 3 if swiftstride)
          const flyCharge = hasFly ? flyMv + 6 + swiftBonus : null
          const flyStr = hasFly
            ? (hasSwiftstride ? `Fly ${flyMv} + 6 + 3` : `Fly ${flyMv} + 6`)
            : null

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
                    ? `<span class="text-wh-muted font-mono text-xs">${groundStr} =</span>
                       <span class="text-wh-phase-combat font-mono text-xs ml-1">${groundCharge}"</span>`
                    : `<span class="text-wh-muted font-mono text-xs">M? + 6${hasSwiftstride ? ' + 3' : ''}</span>`
                  }
                </div>
              </div>
              ${hasFly ? `
                <div class="flex justify-end mt-0.5">
                  <span class="text-wh-muted font-mono text-xs">${flyStr} =</span>
                  <span class="text-wh-phase-movement font-mono text-xs ml-1">${flyCharge}"</span>
                </div>
              ` : ''}
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
}

// ─── Magic Items Context ────────────────────────────────────────────────────

function renderMagicItemsContext(army, phaseId, subPhaseId) {
  const grouped = {}

  for (const unit of army.units) {
    for (const itemName of unit.magicItems) {
      // Strip "(Standard bearer)" etc. before matching
      const cleanName = itemName.replace(/\s*\([^)]*\)\s*$/, '').replace(/\*$/, '').trim()
      const item = findMagicItem(cleanName)
      if (item) {
        if (!item.phases.includes(phaseId)) continue
        if (subPhaseId && item.subPhases && !item.subPhases.includes(subPhaseId)) continue
        const key = item.name
        if (!grouped[key]) grouped[key] = { item, units: [] }
        if (!grouped[key].units.includes(unit.name)) grouped[key].units.push(unit.name)
      } else if (phaseId === 'combat' && unit.magicWeapons.includes(itemName)) {
        // Unrecognised magic weapons still show in combat phase
        const key = cleanName
        if (!grouped[key]) grouped[key] = { item: { name: cleanName, type: 'weapon', effect: '', phases: ['combat'] }, units: [] }
        if (!grouped[key].units.includes(unit.name)) grouped[key].units.push(unit.name)
      }
    }
  }

  const entries = Object.values(grouped)
  if (entries.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-purple/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-purple mb-3">Magic Items</h3>
      <div class="space-y-2">
        ${entries.map(({ item, units }) => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <span class="text-wh-accent font-semibold">${item.name}</span>
            <span class="text-xs text-wh-muted ml-1">${item.type}</span>
            <p class="text-wh-muted text-xs mt-1">${item.effect}</p>
            <p class="text-wh-text text-xs mt-1">${units.join(', ')}</p>
          </div>
        `).join('')}
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
    // Inject mount-granted swiftstride if the unit doesn't already have it
    const hasSwiftstride = unitRules.some(r => normaliseRuleName(r).toLowerCase() === 'swiftstride')
    if (!hasSwiftstride && unit.mount) {
      const mount = findMount(unit.mount)
      if (mount?.swiftstride) unitRules.push('Swiftstride')
    }

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

  // Group by rule name + description
  const grouped = {}
  for (const m of matches) {
    const key = `${m.ruleName}||${m.description}`
    if (!grouped[key]) grouped[key] = { ruleName: m.ruleName, description: m.description, units: [] }
    if (!grouped[key].units.includes(m.unitName)) grouped[key].units.push(m.unitName)
  }

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-accent/20 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-accent mb-3">Special Rules This Step</h3>
      <div class="space-y-2">
        ${Object.values(grouped).map(g => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <span class="text-xs bg-wh-accent/20 text-wh-accent px-1.5 py-0.5 rounded">${g.ruleName}</span>
            <p class="text-wh-muted text-xs mt-1">${g.description}</p>
            <p class="text-wh-text text-xs mt-1">${g.units.join(', ')}</p>
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
    const firstTurn = getFirstTurn()
    if (!firstTurn) {
      renderFirstTurnScreen(getArmy())
    } else if (getIsOpponentTurn()) {
      renderOpponentTurnScreen(getArmy())
    } else {
      renderGameScreen(getArmy())
    }
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
      renderGameScreen(army)
    } else {
      // End of your turn — switch to opponent's turn
      savePhaseIndex(0)
      saveIsOpponentTurn(true)
      // Increment round if you went second (opponent went first)
      if (getFirstTurn() === 'opponent') saveRound(getRound() + 1)
      renderOpponentTurnScreen(army)
    }
  })

  document.getElementById('manage-army-btn')?.addEventListener('click', () => {
    renderSetupScreen()
  })

  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    if (confirm('Start a new game? This will reset the round counter.')) {
      resetGame()
      saveFirstTurn(null)
      render()
    }
  })
}

// ─── First Turn Screen ─────────────────────────────────────────────────────

function renderFirstTurnScreen(army) {
  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-2xl mx-auto">
          <div></div>
          <h1 class="text-2xl font-bold text-wh-accent text-center">TOW — Turner Overdrive</h1>
          <div></div>
        </div>
      </header>

      <main class="flex-1 flex items-center justify-center p-4">
        <div class="max-w-md w-full text-center">
          <h2 class="text-2xl font-bold text-wh-text mb-2">Who goes first?</h2>
          <p class="text-wh-muted text-sm mb-8">${army.name} — Round 1</p>
          <div class="flex gap-4">
            <button id="first-you-btn"
              class="flex-1 py-4 rounded-lg font-bold text-lg bg-wh-accent text-wh-bg hover:bg-wh-accent-dim transition-colors">
              You
            </button>
            <button id="first-opponent-btn"
              class="flex-1 py-4 rounded-lg font-bold text-lg bg-wh-surface text-wh-text border border-wh-border hover:bg-wh-border transition-colors">
              Opponent
            </button>
          </div>
        </div>
      </main>
    </div>
  `

  document.getElementById('first-you-btn').addEventListener('click', () => {
    saveFirstTurn('you')
    saveIsOpponentTurn(false)
    savePhaseIndex(0)
    renderGameScreen(army)
  })

  document.getElementById('first-opponent-btn').addEventListener('click', () => {
    saveFirstTurn('opponent')
    saveIsOpponentTurn(true)
    savePhaseIndex(0)
    renderOpponentTurnScreen(army)
  })
}

// ─── Opponent Turn Screen ──────────────────────────────────────────────────

function renderOpponentTurnScreen(army) {
  const opPhaseIdx = getPhaseIndex()
  const round = getRound()
  const phase = PHASES[opPhaseIdx]
  const isFirst = opPhaseIdx === 0
  const isLast = opPhaseIdx === PHASES.length - 1

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
            <span class="text-sm text-wh-muted hidden sm:inline">${army.name}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-mono text-wh-accent">Round ${round}</span>
            <span class="text-xs text-wh-red font-semibold border border-wh-red px-2 py-0.5 rounded">Opponent</span>
            <button id="new-game-btn"
              class="text-xs text-wh-muted hover:text-wh-red border border-wh-border px-2 py-1 rounded transition-colors">
              New Game
            </button>
          </div>
        </div>

        <!-- Phase progress -->
        <div class="flex gap-1">
          ${PHASES.map((p, i) => {
            const isCurrent = i === opPhaseIdx
            const isPast = i < opPhaseIdx

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
          <!-- Phase heading -->
          <div class="mb-4">
            <span class="text-xs uppercase tracking-wider text-wh-red">Opponent's Turn</span>
            <h2 class="text-2xl font-bold text-wh-text">${phase.name}</h2>
            <span class="text-xs text-wh-muted">Phase ${opPhaseIdx + 1} of ${PHASES.length}</span>
          </div>

          <!-- Contextual army info -->
          ${renderOpponentPhaseContext(army, phase)}
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

  bindOpponentTurnActions(army)
}

function renderOpponentPhaseContext(army, phase) {
  let html = ''

  // Charge context during opponent's movement phase
  if (phase.id === 'movement') html += renderChargeContext(army)

  // Magic items for the whole phase (null subPhaseId skips subPhase filter)
  html += renderMagicItemsContext(army, phase.id, null)

  // Special rules — combined across all sub-phases into one panel
  html += renderSpecialRulesForPhase(army, phase)

  return html
}

function renderSpecialRulesForPhase(army, phase) {
  const round = getRound()
  const grouped = {}

  for (const sub of phase.subPhases) {
    for (const unit of army.units) {
      const unitRules = [
        ...parseUnitRules(unit.specialRules),
        ...unit.equipment,
      ]
      const hasSwiftstride = unitRules.some(r => normaliseRuleName(r).toLowerCase() === 'swiftstride')
      if (!hasSwiftstride && unit.mount) {
        const mount = findMount(unit.mount)
        if (mount?.swiftstride) unitRules.push('Swiftstride')
      }

      for (const ruleName of unitRules) {
        const normName = normaliseRuleName(ruleName)
        for (const rule of SPECIAL_RULES) {
          if (!ruleMatches(rule, normName)) continue
          for (const rulePhase of rule.phases) {
            if (rulePhase.subPhaseId !== sub.id) continue
            if (rulePhase.fromRound && round < rulePhase.fromRound) continue
            const key = `${ruleName}||${rulePhase.description}`
            if (!grouped[key]) grouped[key] = { ruleName, description: rulePhase.description, units: [] }
            if (!grouped[key].units.includes(unit.name)) grouped[key].units.push(unit.name)
          }
        }
      }
    }
  }

  const entries = Object.values(grouped)
  if (entries.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-accent/20 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-accent mb-3">Special Rules This Phase</h3>
      <div class="space-y-2">
        ${entries.map(g => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <span class="text-xs bg-wh-accent/20 text-wh-accent px-1.5 py-0.5 rounded">${g.ruleName}</span>
            <p class="text-wh-muted text-xs mt-1">${g.description}</p>
            <p class="text-wh-text text-xs mt-1">${g.units.join(', ')}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function bindOpponentTurnActions(army) {
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    const idx = getPhaseIndex()
    if (idx > 0) {
      savePhaseIndex(idx - 1)
      renderOpponentTurnScreen(army)
    }
  })

  document.getElementById('next-btn')?.addEventListener('click', () => {
    const idx = getPhaseIndex()
    if (idx < PHASES.length - 1) {
      savePhaseIndex(idx + 1)
      renderOpponentTurnScreen(army)
    } else {
      // End of opponent's turn — switch to your turn
      savePhaseIndex(0)
      saveIsOpponentTurn(false)
      // Increment round if opponent went second (you went first)
      if (getFirstTurn() === 'you') saveRound(getRound() + 1)
      renderGameScreen(army)
    }
  })

  document.getElementById('manage-army-btn')?.addEventListener('click', () => {
    renderSetupScreen()
  })

  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    if (confirm('Start a new game? This will reset the round counter.')) {
      resetGame()
      saveFirstTurn(null)
      render()
    }
  })
}

// ─── About Screen ──────────────────────────────────────────────────────────

function renderAboutScreen() {
  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-2xl mx-auto">
          <button id="back-btn" class="text-sm text-wh-muted hover:text-wh-accent transition-colors">&larr; Back</button>
          <h1 class="text-2xl font-bold text-wh-accent text-center">About</h1>
          <div></div>
        </div>
      </header>

      <main class="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        <div class="bg-wh-surface rounded-lg border border-wh-border p-4 space-y-3">
          <h2 class="text-lg font-bold text-wh-text">The Old World — Turn Tracker</h2>
          <p class="text-wh-muted text-sm">
            This is a free resource. No profit is being made from this site.
          </p>
        </div>

        <div class="bg-wh-surface rounded-lg border border-wh-border p-4 space-y-3">
          <h2 class="text-lg font-bold text-wh-text">Acknowledgements</h2>
          <p class="text-wh-muted text-sm">
            Army list parsing is powered by
            <a href="https://old-world-builder.com" target="_blank" rel="noopener noreferrer"
              class="text-wh-accent hover:underline">Old World Builder</a>.
            Thank you to the Old World Builder team for making such a fantastic tool for the community.
          </p>
        </div>

        <div class="bg-wh-surface rounded-lg border border-wh-border p-4 space-y-3">
          <h2 class="text-lg font-bold text-wh-text">Disclaimer</h2>
          <p class="text-wh-muted text-sm">
            This web site is completely unofficial and in no way endorsed by Games Workshop Limited.
          </p>
          <p class="text-wh-muted text-xs leading-relaxed">
            Warhammer: the Old World, Citadel, Forge World, Games Workshop, GW, Warhammer,
            the \u2018winged-hammer\u2019 Warhammer logo, the Chaos devices, the Chaos logo, Citadel Device,
            the Double-Headed/Imperial Eagle device, \u2018Eavy Metal, Games Workshop logo, Golden Demon,
            Great Unclean One, the Hammer of Sigmar logo, Horned Rat logo, Keeper of Secrets,
            Khemri, Khorne, Lord of Change, Nurgle, Skaven, the Skaven symbol devices, Slaanesh,
            Tomb Kings, Trio of Warriors, Twin Tailed Comet Logo, Tzeentch, Warhammer Online,
            Warhammer World logo, White Dwarf, the White Dwarf logo, and all associated logos,
            marks, names, races, race insignia, characters, vehicles, locations, units,
            illustrations and images from the Warhammer world are either \u00AE, TM and/or
            \u00A9 Copyright Games Workshop Ltd 2000-2024, variably registered in the UK and
            other countries around the world. Used without permission. No challenge to their
            status intended. All Rights Reserved to their respective owners.
          </p>
        </div>
      </main>
    </div>
  `

  document.getElementById('back-btn').addEventListener('click', () => {
    render()
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

clearAll()
render()
