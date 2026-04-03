import { PHASES, getAllSubPhases } from '../phases.js'
import { getPhaseIndex, savePhaseIndex, getRound, saveRound, getIsOpponentTurn, saveIsOpponentTurn, getFirstTurn, saveFirstTurn, resetGame, canGoBackToPreviousTurn } from '../state.js'
import { PHASE_BG, PHASE_TEXT } from '../helpers.js'
import { renderCasterContext } from '../context/caster.js'
import { renderShootingContext } from '../context/shooting.js'
import { renderCombatWeaponsContext, renderCombatResultContext, renderCombatLeadershipContext } from '../context/combat-weapons.js'
import { renderChargeContext } from '../context/charge.js'
import { renderMagicItemsContext } from '../context/items.js'
import { renderSpecialRulesContext } from '../context/special-rules-context.js'
import { navigate } from '../navigate.js'

const app = document.getElementById('app')
const allSubPhases = getAllSubPhases()

export function renderGameScreen(army) {
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
              ${subPhase.rules.map(rule => {
                if (rule.startsWith('•')) {
                  return `<li class="flex gap-2 text-sm ml-5">
                    <span class="text-wh-muted mt-0.5 shrink-0">•</span>
                    <span>${rule.slice(1).trim()}</span>
                  </li>`
                }
                return `<li class="flex gap-2 text-sm">
                  <span class="${PHASE_TEXT[phase.colour]} mt-0.5 shrink-0">&#9654;</span>
                  <span>${rule}</span>
                </li>`
              }).join('')}
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
            ${isFirst && !canGoBackToPreviousTurn()
              ? 'bg-wh-card text-wh-muted cursor-not-allowed opacity-50'
              : 'bg-wh-card text-wh-text hover:bg-wh-border'}"
            ${isFirst && !canGoBackToPreviousTurn() ? 'disabled' : ''}>
            ${isFirst && canGoBackToPreviousTurn() ? '&#8592; Opponent Turn' : '&#8592; Previous'}
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

function renderPhaseContext(army, phase, subPhase) {
  let html = ''

  if (subPhase.showCasters) html += renderCasterContext(army, ['enchantment', 'hex'])
  if (subPhase.showShooting) html += renderShootingContext(army)

  if (subPhase.id === 'declare-charges') html += renderChargeContext(army)

  if (subPhase.id === 'choose-target') html += renderCasterContext(army, ['magic-missile', 'magical-vortex'])
  if (subPhase.id === 'remaining-moves') html += renderCasterContext(army, ['conveyance'])
  if (subPhase.id === 'choose-fight') {
    html += renderCasterContext(army, ['assailment'])
    html += renderCombatWeaponsContext(army)
  }
  if (subPhase.id === 'combat-result') html += renderCombatResultContext(army)
  if (subPhase.id === 'break-test') html += renderCombatLeadershipContext(army)

  if (subPhase.id !== 'remove-casualties') html += renderMagicItemsContext(army, phase.id, subPhase.id)
  html += renderSpecialRulesContext(army, subPhase)

  return html
}

function bindGameActions(army) {
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    const idx = getPhaseIndex()
    if (idx > 0) {
      savePhaseIndex(idx - 1)
      renderGameScreen(army)
    } else if (canGoBackToPreviousTurn()) {
      saveIsOpponentTurn(true)
      savePhaseIndex(PHASES.length - 1)
      if (getFirstTurn() === 'you') saveRound(getRound() - 1)
      navigate('opponentTurnScreen', army)
    }
  })

  document.getElementById('next-btn')?.addEventListener('click', () => {
    const idx = getPhaseIndex()
    if (idx < allSubPhases.length - 1) {
      savePhaseIndex(idx + 1)
      renderGameScreen(army)
    } else {
      savePhaseIndex(0)
      saveIsOpponentTurn(true)
      if (getFirstTurn() === 'opponent') saveRound(getRound() + 1)
      navigate('opponentTurnScreen', army)
    }
  })

  document.getElementById('manage-army-btn')?.addEventListener('click', () => {
    navigate('setupScreen')
  })

  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    if (confirm('Start a new game? This will reset the round counter.')) {
      resetGame()
      saveFirstTurn(null)
      navigate('render')
    }
  })
}
