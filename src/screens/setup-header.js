import { navigate } from "../navigate.js";
import { resetGame, saveFirstTurn } from "../state.js";

const SETUP_PHASES = [
  { id: "spells", label: "Select Spells", bg: "bg-wh-setup-spells" },
  { id: "characters", label: "Place Characters", bg: "bg-wh-setup-characters" },
  { id: "scenario", label: "Scenario", bg: "bg-wh-setup-scenario" },
  { id: "deploy", label: "Deploy", bg: "bg-wh-setup-deploy" },
  { id: "first-turn", label: "Who Goes First", bg: "bg-wh-setup-first-turn" },
];

export function renderSetupHeader(army, currentPhaseId) {
  const currentIdx = SETUP_PHASES.findIndex((p) => p.id === currentPhaseId);
  return `
    <header class="bg-wh-surface border-b border-wh-border p-3">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <button id="setup-army-btn" class="text-wh-muted hover:text-wh-accent text-sm transition-colors">
            &#9776; Army
          </button>
          <span class="text-wh-muted text-sm hidden sm:inline">|</span>
          <span class="text-sm text-wh-accent hidden sm:inline">${army.name}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-mono font-black text-wh-accent">Setup</span>
          ${army.owbId ? `<a href="https://old-world-builder.com/game-view/${army.owbId}" target="_blank" rel="noopener noreferrer" class="text-xs text-wh-green border border-wh-green/30 px-2 py-1 rounded transition-colors" title="View in Old World Builder">&#128065; OWB</a>` : ""}
          <button id="setup-new-game-btn"
            class="text-xs text-wh-muted hover:text-wh-red border border-wh-border px-2 py-1 rounded transition-colors">
            New Game
          </button>
        </div>
      </div>
      <div class="flex gap-1">
        ${SETUP_PHASES.map((phase, idx) => {
          const isCurrent = idx === currentIdx;
          const isPast = idx < currentIdx;
          return `<div class="flex-1 text-center">
            <div class="h-1.5 rounded-full mb-1 transition-all ${
              isCurrent
                ? phase.bg
                : isPast
                  ? `${phase.bg} opacity-40`
                  : "bg-wh-border"
            }"></div>
            <span class="text-[10px] ${isCurrent ? "text-wh-text font-semibold" : "text-wh-muted"}">${phase.label}</span>
          </div>`;
        }).join("")}
      </div>
    </header>
  `;
}

export function bindSetupHeaderEvents() {
  document.getElementById("setup-army-btn")?.addEventListener("click", () => {
    navigate("setupScreen");
  });
  document
    .getElementById("setup-new-game-btn")
    ?.addEventListener("click", () => {
      if (confirm("Start a new game? This will reset the round counter.")) {
        resetGame();
        saveFirstTurn(null);
        navigate("setupScreen");
      }
    });
}
