import { navigate } from "../navigate.js";
import {
  getScores,
  updateScore,
  getRound,
  getIsOpponentTurn,
  getFirstTurn,
  getTimings,
  getDeploymentTime,
  getScenarioOptions,
} from "../state.js";
import { formatDuration } from "../helpers.js";

export function renderScoringUI() {
  const scores = getScores();
  const round = getRound();
  const isOpponentTurn = getIsOpponentTurn();
  const turnKey = isOpponentTurn ? "opponent" : "you";
  const firstTurn = getFirstTurn();
  const timings = getTimings();
  const deploymentTime = getDeploymentTime();
  const scenarioOpts = getScenarioOptions();
  const slOpts = scenarioOpts.strategicLocations;
  const maxScore = slOpts.enabled ? slOpts.count : 4;
  const scoreOptions = Array.from({ length: maxScore + 1 }, (_, i) => i);
  const scoreLabel = slOpts.enabled
    ? `Strategic Locations (${slOpts.count})`
    : "Strategic Objectives";

  const currentTurnScores = (scores[round] && scores[round][turnKey]) || {
    you: 0,
    opponent: 0,
  };

  const rounds = [];
  for (let i = 1; i <= round; i++) {
    rounds.push(i);
  }

  const turnsInOrder =
    firstTurn === "opponent" ? ["opponent", "you"] : ["you", "opponent"];

  let totalYou = 0;
  let totalOpponent = 0;

  const deploymentRow =
    deploymentTime !== null
      ? `
    <tr>
      <td class="px-3 py-2 text-wh-muted font-mono">0</td>
      <td class="px-3 py-2 text-wh-muted italic text-xs">Deployment</td>
      <td class="px-3 py-2 text-wh-text">—</td>
      <td class="px-3 py-2 text-wh-text">—</td>
      <td class="px-3 py-2 font-mono text-xs">${formatDuration(deploymentTime)}</td>
    </tr>
  `
      : "";

  return `
    <div class="mt-8 border-t border-wh-border pt-6 pb-4">
      <h3 class="text-lg font-bold text-wh-text mb-4">${scoreLabel}</h3>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Your Score</label>
          <select id="score-you" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${scoreOptions.map((v) => `<option value="${v}" ${currentTurnScores.you === v ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Opponent Score</label>
          <select id="score-opponent" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${scoreOptions.map((v) => `<option value="${v}" ${currentTurnScores.opponent === v ? "selected" : ""}>${v}</option>`).join("")}
          </select>
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
            ${rounds
              .map((r) => {
                return turnsInOrder
                  .map((turn) => {
                    const s = (scores[r] && scores[r][turn]) || {
                      you: 0,
                      opponent: 0,
                    };
                    totalYou += s.you;
                    totalOpponent += s.opponent;
                    const isCurrent = r === round && turn === turnKey;
                    const isFuture =
                      r === round &&
                      turnsInOrder.indexOf(turn) >
                        turnsInOrder.indexOf(turnKey);
                    const turnMs = Object.values(
                      (timings[r] && timings[r][turn]) || {},
                    ).reduce((a, b) => a + b, 0);
                    const timeCell = turnMs > 0 ? formatDuration(turnMs) : "—";
                    const scoreSelect = (player) => {
                      const val = s[player];
                      if (isCurrent)
                        return `<td class="px-3 py-2 text-wh-text font-bold">${val}</td>`;
                      if (isFuture)
                        return `<td class="px-3 py-2 text-wh-muted">—</td>`;
                      return `<td class="px-3 py-2"><select data-hist-round="${r}" data-hist-turn="${turn}" data-hist-player="${player}" class="bg-wh-card border border-wh-border text-wh-text rounded px-1 py-0.5 text-sm outline-none focus:border-wh-accent transition-colors">${scoreOptions.map((v) => `<option value="${v}" ${val === v ? "selected" : ""}>${v}</option>`).join("")}</select></td>`;
                    };
                    return `
                  <tr class="${isCurrent ? "bg-wh-accent/5" : ""}">
                    <td class="px-3 py-2 text-wh-muted font-mono">${turn === turnsInOrder[0] ? r : ""}</td>
                    <td class="px-3 py-2 text-wh-muted italic text-xs capitalize">${turn === "you" ? "Yours" : "Opponents"}</td>
                    ${scoreSelect("you")}
                    ${scoreSelect("opponent")}
                    <td class="px-3 py-2 font-mono text-xs">${timeCell}</td>
                  </tr>
                `;
                  })
                  .join("");
              })
              .join("")}
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

      <div class="mt-4 flex justify-end">
        <button id="end-game-btn"
          class="px-4 py-2 rounded-lg font-semibold text-sm bg-wh-card border border-wh-border text-wh-muted hover:border-wh-red hover:text-wh-red transition-colors">
          End Game
        </button>
      </div>
    </div>
  `;
}

export function bindScoringEvents(army, renderCallback) {
  const round = getRound();
  const isOpponentTurn = getIsOpponentTurn();

  document.getElementById("score-you")?.addEventListener("change", (e) => {
    updateScore(round, isOpponentTurn, "you", parseInt(e.target.value, 10));
    renderCallback(army);
  });

  document.getElementById("score-opponent")?.addEventListener("change", (e) => {
    updateScore(
      round,
      isOpponentTurn,
      "opponent",
      parseInt(e.target.value, 10),
    );
    renderCallback(army);
  });

  document.querySelectorAll("select[data-hist-round]").forEach((el) => {
    el.addEventListener("change", (e) => {
      const r = parseInt(e.target.dataset.histRound, 10);
      const isOpp = e.target.dataset.histTurn === "opponent";
      const player = e.target.dataset.histPlayer;
      updateScore(r, isOpp, player, parseInt(e.target.value, 10));
      renderCallback(army);
    });
  });

  document.getElementById("end-game-btn")?.addEventListener("click", () => {
    navigate("gameOverScreen", army);
  });
}
