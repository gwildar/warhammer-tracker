import { PHASES, getAllSubPhases } from "../phases.js";
import {
  getPhaseIndex,
  savePhaseIndex,
  getRound,
  saveRound,
  saveIsOpponentTurn,
  getFirstTurn,
  saveFirstTurn,
  resetGame,
  canGoBackToPreviousTurn,
  getStartTime,
  resetStartTime,
  recordCurrentPhaseTime,
} from "../state.js";
import { PHASE_BG, PHASE_TEXT } from "../helpers.js";
import { renderCasterContext } from "../context/caster.js";
import { renderShootingContext } from "../context/shooting.js";
import {
  renderCombatWeaponsContext,
  renderCombatResultContext,
  renderCombatLeadershipContext,
} from "../context/combat-weapons.js";
import { renderChargeContext } from "../context/charge.js";
import { renderMovementStatsContext } from "../context/movement.js";
import { renderRandomMoverContext } from "../context/random-mover.js";
import { renderMagicItemsContext } from "../context/items.js";
import { renderVirtuesContext } from "../context/virtues.js";
import { renderSpecialRulesContext } from "../context/special-rules-context.js";
import { renderScoringUI, bindScoringEvents } from "./scoring.js";
import { navigate } from "../navigate.js";

const app = document.getElementById("app");
const allSubPhases = getAllSubPhases();

export function renderGameScreen(army) {
  if (getStartTime() === null) {
    resetStartTime();
  }
  const phaseIdx = getPhaseIndex();
  const round = getRound();
  const { phase, subPhase } = allSubPhases[phaseIdx];
  const isFirst = phaseIdx === 0;
  const isLast = phaseIdx === allSubPhases.length - 1;

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
            ${army.owbId ? `<a href="https://old-world-builder.com/game-view/${army.owbId}" target="_blank" rel="noopener noreferrer" class="text-xs text-wh-muted hover:text-wh-green border border-wh-green px-2 py-1 rounded transition-colors hidden sm:inline" title="View in Old World Builder">&#128065; gameview</a>` : ""}
          </div>
          <div class="flex items-center gap-3">
            <span class="font-mono font-black text-wh-accent">Round ${round}</span>
            <button id="new-game-btn"
              class="text-xs text-wh-muted hover:text-wh-red border border-wh-border px-2 py-1 rounded transition-colors">
              New Game
            </button>
          </div>
        </div>

        <!-- Phase progress -->
        <div class="flex gap-1">
          ${PHASES.map((p) => {
            const startIdx = allSubPhases.findIndex((s) => s.phase.id === p.id);
            const endIdx = startIdx + p.subPhases.length - 1;
            const isCurrent = phaseIdx >= startIdx && phaseIdx <= endIdx;
            const isPast = phaseIdx > endIdx;

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
          <!-- Phase & sub-phase heading -->
          <div class="mb-4">
            <span class="text-xs uppercase tracking-wider ${PHASE_TEXT[phase.colour]}">${phase.name}</span>
            <h2 class="text-2xl font-bold text-wh-text">${subPhase.name}</h2>
            <span class="text-xs text-wh-muted">Step ${phaseIdx + 1} of ${allSubPhases.length}</span>
          </div>

          <!-- Rules -->
          <details class="mb-4">
          <summary>Rules Summary</summary>
          <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mt-1 mb-4">
            <ul class="space-y-2">
              ${subPhase.rules
                .map((rule) => {
                  if (rule.startsWith("•")) {
                    return `<li class="flex gap-2 text-sm ml-5">
                    <span class="text-wh-muted mt-0.5 shrink-0">•</span>
                    <span>${rule.slice(1).trim()}</span>
                  </li>`;
                  }
                  return `<li class="flex gap-2 text-sm">
                  <span class="${PHASE_TEXT[phase.colour]} mt-0.5 shrink-0">&#9654;</span>
                  <span>${rule}</span>
                </li>`;
                })
                .join("")}
            </ul>
          </div>
          </details>

          <!-- Contextual army info -->
          ${renderPhaseContext(army, phase, subPhase)}

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
            ${isFirst && canGoBackToPreviousTurn() ? "&#8592; Opponent Turn" : "&#8592; Previous"}
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

  bindGameActions(army);
}

const PHASE_CASTER_RENDERERS = {
  shoot: [(a) => renderCasterContext(a, ["magic-missile", "magical-vortex"])],
  "remaining-moves": [(a) => renderCasterContext(a, ["conveyance"])],
  "choose-fight": [(a) => renderCasterContext(a, ["assailment"])],
};

const PHASE_RENDERERS = {
  rally: [(a) => renderCombatLeadershipContext(a, "Rally Leadership")],
  "declare-charges": [renderChargeContext],
  "compulsory-moves": [renderRandomMoverContext],
  "remaining-moves": [renderMovementStatsContext],
  "choose-fight": [renderCombatWeaponsContext],
  "combat-result": [renderCombatResultContext],
  "break-test": [renderCombatLeadershipContext],
};

function renderPhaseContext(army, phase, subPhase) {
  let html = "";

  if (subPhase.showCasters)
    html += renderCasterContext(army, ["enchantment", "hex"]);
  for (const renderer of PHASE_CASTER_RENDERERS[subPhase.id] || []) {
    html += renderer(army);
  }

  if (subPhase.showShooting) html += renderShootingContext(army);

  for (const renderer of PHASE_RENDERERS[subPhase.id] || []) {
    html += renderer(army);
  }

  if (subPhase.id !== "remove-casualties" && subPhase.id !== "scoring") {
    html += renderMagicItemsContext(army, phase.id, subPhase.id);
    html += renderVirtuesContext(army, phase.id, subPhase.id);
  }
  if (subPhase.id === "scoring") {
    html += renderScoringUI();
  }
  html += renderSpecialRulesContext(army, subPhase);
  if (
    subPhase.id === "command" &&
    army.units.some((u) =>
      (u.specialRules || []).some((r) =>
        r.displayName?.toLowerCase().includes("rallying cry"),
      ),
    )
  )
    html += renderCombatLeadershipContext(army, "Rally Leadership");

  return html;
}

function recordAndNavigate(army, newPhaseIdx, isOpponentTurn, isPrev) {
  recordCurrentPhaseTime(false);

  if (isOpponentTurn) {
    savePhaseIndex(newPhaseIdx);
    saveIsOpponentTurn(true);
    if (isPrev) {
      if (getFirstTurn() === "you") saveRound(getRound() - 1);
    } else {
      if (getFirstTurn() === "opponent") saveRound(getRound() + 1);
    }
    navigate("opponentTurnScreen", army);
  } else {
    savePhaseIndex(newPhaseIdx);
    renderGameScreen(army);
  }
}

function bindGameActions(army) {
  bindScoringEvents(army, renderGameScreen);

  document.getElementById("prev-btn")?.addEventListener("click", () => {
    const idx = getPhaseIndex();
    if (idx > 0) {
      recordAndNavigate(army, idx - 1, false, true);
    } else if (canGoBackToPreviousTurn()) {
      recordAndNavigate(army, PHASES.length - 1, true, true);
    }
  });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    const idx = getPhaseIndex();
    if (idx < allSubPhases.length - 1) {
      recordAndNavigate(army, idx + 1, false, false);
    } else {
      recordAndNavigate(army, 0, true, false);
    }
  });

  document.getElementById("manage-army-btn")?.addEventListener("click", () => {
    navigate("setupScreen");
  });

  document.getElementById("new-game-btn")?.addEventListener("click", () => {
    if (confirm("Start a new game? This will reset the round counter.")) {
      resetGame();
      saveFirstTurn(null);
      navigate("setupScreen");
    }
  });
}
