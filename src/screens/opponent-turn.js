import { PHASES } from "../phases.js";
import { getAllSubPhases } from "../phases.js";
import {
  getPhaseIndex,
  getRound,
  getFirstTurn,
  saveFirstTurn,
  resetGame,
  canGoBackToPreviousTurn,
  getStartTime,
  resetStartTime,
  recordCurrentPhaseTime,
  getDisplayMode,
  getScenarioOptions,
} from "../state.js";
import { PHASE_BG } from "../helpers.js";
import { renderChargeContext } from "../context/charge.js";
import { renderCasterContext } from "../context/caster.js";
import { renderMagicItemsContext } from "../context/items.js";
import { renderVirtuesContext } from "../context/virtues.js";
import { renderSpecialRulesForPhase } from "../context/special-rules-context.js";
import {
  renderCombatWeaponsContext,
  renderDefensiveStatsContext,
} from "../context/combat-weapons.js";
import { renderScoringUI, bindScoringEvents } from "./scoring.js";
import { renderSpecialFeaturesTable } from "../context/scenario-context.js";
import { renderMiscastPanel } from "../context/miscast.js";
import { navigate } from "../navigate.js";
import { nextVisibleIdx } from "./game.js";

const allSubPhases = getAllSubPhases();

const app = document.getElementById("app");

export function renderOpponentTurnScreen(army) {
  if (getStartTime() === null) {
    resetStartTime();
  }
  const opPhaseIdx = getPhaseIndex();
  const round = getRound();
  const phase = PHASES[opPhaseIdx];
  const isFirst = opPhaseIdx === 0;
  const isLast = opPhaseIdx === PHASES.length - 1;

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
            <span class="text-xs text-wh-red font-semibold border border-wh-red px-2 py-0.5 rounded">Opp</span>
            ${army.owbId ? `<a href="https://old-world-builder.com/game-view/${army.owbId}" target="_blank" rel="noopener noreferrer" class="text-xs text-wh-green border border-wh-green/30 px-2 py-1 rounded transition-colors" title="View in Old World Builder">&#128065; OWB</a>` : ""}
            <button id="new-game-btn"
              class="text-xs text-wh-muted hover:text-wh-red border border-wh-border px-2 py-1 rounded transition-colors">
              New Game
            </button>
          </div>
        </div>

        <!-- Phase progress -->
        <div class="flex gap-1">
          ${PHASES.map((p, i) => {
            const isCurrent = i === opPhaseIdx;
            const isPast = i < opPhaseIdx;

            return `<div class="flex-1 text-center">
              <div class="h-1.5 rounded-full mb-1 transition-all ${
                isCurrent
                  ? `${PHASE_BG[p.colour]}`
                  : isPast
                    ? `${PHASE_BG[p.colour]} opacity-40`
                    : "bg-wh-border"
              }"></div>
              <span class="text-[10px] ${isCurrent ? "text-wh-text font-semibold" : "text-wh-muted"}">${p.name.replace(" Phase", "")}</span>
            </div>`;
          }).join("")}
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
            ${
              isFirst && !canGoBackToPreviousTurn()
                ? "bg-wh-card text-wh-muted cursor-not-allowed opacity-50"
                : "bg-wh-card text-wh-text hover:bg-wh-border"
            }"
            ${isFirst && !canGoBackToPreviousTurn() ? "disabled" : ""}>
            ${isFirst && canGoBackToPreviousTurn() ? "&#8592; Your Turn" : "&#8592; Previous"}
          </button>
          <button id="next-btn"
            class="flex-1 py-3 rounded-lg font-bold text-lg transition-colors
            bg-wh-accent text-wh-bg hover:bg-wh-accent-dim">
            ${isLast ? "End Turn &#10226;" : "Next &#8594;"}
          </button>
        </div>
      </footer>
    </div>
  `;

  bindOpponentTurnActions(army);
}

function renderOpponentPhaseContext(army, phase) {
  const lightweight = getDisplayMode() === "lightweight";
  let html = "";

  if (phase.id === "strategy" && getScenarioOptions().specialFeatures)
    html += renderSpecialFeaturesTable();

  if (!lightweight && phase.id === "movement")
    html += `<details><summary class="text-sm font-bold text-wh-phase-combat mb-3">Charge Distances</summary>${renderChargeContext(army)}</details>`;
  if (!lightweight && phase.id === "shooting")
    html += renderDefensiveStatsContext(army);
  if (!lightweight && phase.id === "combat")
    html += renderCombatWeaponsContext(army);
  if (phase.id === "combat") html += renderCasterContext(army, ["assailment"]);
  if (phase.id === "scoring") html += renderScoringUI();
  html += renderMagicItemsContext(army, phase.id, null);
  html += renderVirtuesContext(army, phase.id, null);
  html += renderSpecialRulesForPhase(army, phase);
  if (phase.id !== "scoring") html += renderMiscastPanel();

  return html;
}

function recordAndNavigate(army, newPhaseIdx, isOpponentTurn, isPrev) {
  recordCurrentPhaseTime(true);
  if (!isOpponentTurn) {
    const newRound =
      isPrev && getFirstTurn() === "opponent"
        ? getRound() - 1
        : !isPrev && getFirstTurn() === "you"
          ? getRound() + 1
          : getRound();
    const { phase, subPhase } = allSubPhases[newPhaseIdx];
    navigate(`/game/${newRound}/${phase.id}/${subPhase.id}`);
  } else {
    navigate(`/opponent/${getRound()}/${PHASES[newPhaseIdx].id}`);
  }
}

function bindOpponentTurnActions(army) {
  bindScoringEvents(army, renderOpponentTurnScreen);

  document.getElementById("prev-btn")?.addEventListener("click", () => {
    const idx = getPhaseIndex();
    if (idx > 0) {
      recordAndNavigate(army, idx - 1, true, true);
    } else if (canGoBackToPreviousTurn()) {
      recordAndNavigate(army, allSubPhases.length - 1, false, true);
    }
  });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    const idx = getPhaseIndex();
    if (idx < PHASES.length - 1) {
      recordAndNavigate(army, idx + 1, true, false);
    } else {
      recordAndNavigate(army, nextVisibleIdx(army, -1, 1), false, false);
    }
  });

  document.getElementById("manage-army-btn")?.addEventListener("click", () => {
    navigate("/");
  });

  document.getElementById("new-game-btn")?.addEventListener("click", () => {
    if (confirm("Start a new game? This will reset the round counter.")) {
      resetGame();
      saveFirstTurn(null);
      navigate("/");
    }
  });
}
