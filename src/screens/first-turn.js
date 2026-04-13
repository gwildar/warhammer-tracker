import { saveFirstTurn, saveIsOpponentTurn, savePhaseIndex } from "../state.js";
import { navigate } from "../navigate.js";

const app = document.getElementById("app");

export function renderFirstTurnScreen(army) {
  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="bg-wh-surface border-b border-wh-border p-4">
        <div class="max-w-2xl mx-auto">
          <span class="text-sm font-semibold text-wh-accent">${army.name}</span>
        </div>
      </header>

      <main class="flex-1 flex items-center justify-center p-4">
        <div class="max-w-md w-full text-center">
          <span class="text-xs uppercase tracking-wider text-wh-muted">Setup</span>
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
  `;

  document.getElementById("first-you-btn").addEventListener("click", () => {
    saveFirstTurn("you");
    saveIsOpponentTurn(false);
    savePhaseIndex(0);
    navigate("gameScreen", army);
  });

  document
    .getElementById("first-opponent-btn")
    .addEventListener("click", () => {
      saveFirstTurn("opponent");
      saveIsOpponentTurn(true);
      savePhaseIndex(0);
      navigate("opponentTurnScreen", army);
    });
}
