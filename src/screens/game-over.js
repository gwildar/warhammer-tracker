import {
  getScores,
  getRound,
  getIsOpponentTurn,
  getFirstTurn,
  getTimings,
  getDeploymentTime,
  resetGame,
  saveFirstTurn,
} from "../state.js";
import { navigate } from "../navigate.js";
import { formatDuration } from "../helpers.js";

const app = document.getElementById("app");

export function renderGameOverScreen(army) {
  const scores = getScores();
  const round = getRound();
  const firstTurn = getFirstTurn();
  const timings = getTimings();
  const deploymentTime = getDeploymentTime();

  const turnsInOrder =
    firstTurn === "opponent" ? ["opponent", "you"] : ["you", "opponent"];

  let totalYou = 0;
  let totalOpponent = 0;

  const deploymentRow =
    deploymentTime !== null
      ? `<tr>
          <td class="px-3 py-2 text-wh-muted font-mono">0</td>
          <td class="px-3 py-2 text-wh-muted italic text-xs">Deployment</td>
          <td class="px-3 py-2 text-wh-text">—</td>
          <td class="px-3 py-2 text-wh-text">—</td>
          <td class="px-3 py-2 font-mono text-xs">${formatDuration(deploymentTime)}</td>
        </tr>`
      : "";

  const rounds = [];
  for (let i = 1; i <= round; i++) rounds.push(i);

  const tableRows = rounds
    .map((r) =>
      turnsInOrder
        .map((turn) => {
          const s = (scores[r] && scores[r][turn]) || { you: 0, opponent: 0 };
          totalYou += s.you;
          totalOpponent += s.opponent;
          const turnMs = Object.values(
            (timings[r] && timings[r][turn]) || {},
          ).reduce((a, b) => a + b, 0);
          const timeCell = turnMs > 0 ? formatDuration(turnMs) : "—";
          return `<tr>
            <td class="px-3 py-2 text-wh-muted font-mono">${turn === turnsInOrder[0] ? r : ""}</td>
            <td class="px-3 py-2 text-wh-muted italic text-xs capitalize">${turn === "you" ? "Yours" : "Opponents"}</td>
            <td class="px-3 py-2 text-wh-text font-bold">${s.you}</td>
            <td class="px-3 py-2 text-wh-text font-bold">${s.opponent}</td>
            <td class="px-3 py-2 font-mono text-xs">${timeCell}</td>
          </tr>`;
        })
        .join(""),
    )
    .join("");

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="bg-wh-surface border-b border-wh-border p-3">
        <div class="flex items-center justify-between">
          <button id="back-btn" class="text-wh-muted hover:text-wh-accent text-sm transition-colors">&#8592; Back</button>
          <h1 class="text-lg font-bold text-wh-text">Game Over</h1>
          <div></div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4">
        <div class="max-w-2xl mx-auto">
          <h3 class="text-lg font-bold text-wh-text mb-4">Strategic Locations</h3>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-wh-surface rounded-lg border border-wh-border p-4 text-center">
              <div class="text-xs uppercase tracking-wider text-wh-muted mb-1">Your Total</div>
              <div class="text-4xl font-black text-wh-accent">${totalYou}</div>
            </div>
            <div class="bg-wh-surface rounded-lg border border-wh-border p-4 text-center">
              <div class="text-xs uppercase tracking-wider text-wh-muted mb-1">Opponent Total</div>
              <div class="text-4xl font-black text-wh-red">${totalOpponent}</div>
            </div>
          </div>

          <div class="overflow-hidden border border-wh-border rounded-lg">
            <table class="w-full text-sm text-left">
              <thead class="bg-wh-card text-wh-muted uppercase tracking-wider border-b border-wh-border">
                <tr>
                  <th class="px-3 py-2 font-semibold">Rd</th>
                  <th class="px-3 py-2 font-semibold">Turn</th>
                  <th class="px-3 py-2 font-semibold text-wh-accent">You</th>
                  <th class="px-3 py-2 font-semibold text-wh-red">Opp</th>
                  <th class="px-3 py-2 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-wh-border">
                ${deploymentRow}
                ${tableRows}
              </tbody>
              <tfoot class="bg-wh-card border-t border-wh-border font-bold">
                <tr>
                  <td class="px-3 py-2 text-wh-muted" colspan="2">Total</td>
                  <td class="px-3 py-2 text-wh-accent">${totalYou}</td>
                  <td class="px-3 py-2 text-wh-red">${totalOpponent}</td>
                  <td class="px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <footer class="sticky bottom-0 bg-wh-surface border-t border-wh-border p-3">
        <div class="max-w-2xl mx-auto flex gap-3">
          <button id="back-btn-footer"
            class="flex-1 py-3 rounded-lg font-semibold text-lg transition-colors bg-wh-card text-wh-text hover:bg-wh-border">
            &#8592; Back
          </button>
          <button id="new-game-btn"
            class="flex-1 py-3 rounded-lg font-bold text-lg transition-colors bg-wh-accent text-wh-bg hover:bg-wh-accent-dim">
            New Game &#10226;
          </button>
        </div>
      </footer>
    </div>
  `;

  bindGameOverActions(army);
}

function bindGameOverActions(army) {
  const goBack = () => {
    if (getIsOpponentTurn()) {
      navigate("opponentTurnScreen", army);
    } else {
      navigate("gameScreen", army);
    }
  };

  document.getElementById("back-btn")?.addEventListener("click", goBack);
  document.getElementById("back-btn-footer")?.addEventListener("click", goBack);

  document.getElementById("new-game-btn")?.addEventListener("click", () => {
    resetGame();
    saveFirstTurn(null);
    navigate("setupScreen");
  });
}
