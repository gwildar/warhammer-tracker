import { saveFirstTurn } from "../state.js";
import { PHASES, getAllSubPhases } from "../phases.js";
import { navigate } from "../navigate.js";
import { renderSetupHeader, bindSetupHeaderEvents } from "./setup-header.js";

const allSubPhases = getAllSubPhases();

const app = document.getElementById("app");

export function renderFirstTurnScreen(army) {
  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      ${renderSetupHeader(army, "first-turn")}

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
      <footer class="sticky bottom-0 bg-wh-surface border-t border-wh-border p-3">
        <div class="max-w-2xl mx-auto">
          <button id="prev-btn"
            class="w-full py-3 rounded-lg font-semibold text-lg transition-colors bg-wh-card text-wh-text hover:bg-wh-border">
            &#8592; Back
          </button>
        </div>
      </footer>
    </div>
  `;

  document.getElementById("first-you-btn").addEventListener("click", () => {
    saveFirstTurn("you");
    const { phase, subPhase } = allSubPhases[0];
    navigate(`/game/1/${phase.id}/${subPhase.id}`);
  });

  document
    .getElementById("first-opponent-btn")
    .addEventListener("click", () => {
      saveFirstTurn("opponent");
      navigate(`/opponent/1/${PHASES[0].id}`);
    });

  bindSetupHeaderEvents();

  document.getElementById("prev-btn").addEventListener("click", () => {
    navigate("/deployment");
  });
}
