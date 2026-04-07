import {
  getScores,
  updateScore,
  getRound,
  getIsOpponentTurn,
  getFirstTurn,
  getTimings,
} from "../state.js";
import { PHASES, getAllSubPhases } from "../phases.js";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function renderScoringUI() {
  const scores = getScores();
  const round = getRound();
  const isOpponentTurn = getIsOpponentTurn();
  const turnKey = isOpponentTurn ? "opponent" : "you";
  const firstTurn = getFirstTurn();
  const timings = getTimings();
  const allSubPhases = getAllSubPhases();

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

  let timingsHtml = "";
  if (Object.keys(timings).length > 0) {
    timingsHtml = `
      <div class="mt-8 border-t border-wh-border pt-6">
        <h3 class="text-lg font-bold text-wh-text mb-4">Turn Timings</h3>
        <div class="space-y-4">
          ${rounds
            .map((r) => {
              return turnsInOrder
                .map((turn) => {
                  const turnTimings = (timings[r] && timings[r][turn]) || {};
                  const totalMs = Object.values(turnTimings).reduce(
                    (a, b) => a + b,
                    0,
                  );
                  if (totalMs === 0) return "";

                  const isOpponentTimings = turn === "opponent";
                  const phasesList = isOpponentTimings ? PHASES : allSubPhases;

                  return `
                <details class="group bg-wh-card border border-wh-border rounded-lg overflow-hidden">
                  <summary class="flex justify-between items-center p-3 cursor-pointer hover:bg-wh-border/30 transition-colors">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-wh-accent">Rd ${r}</span>
                      <span class="text-xs uppercase tracking-wider ${isOpponentTimings ? "text-wh-red" : "text-wh-text"}">${turn === "you" ? "Your Turn" : "Opponent Turn"}</span>
                    </div>
                    <span class="font-mono font-bold">${formatDuration(totalMs)}</span>
                  </summary>
                  <div class="p-3 pt-0 border-t border-wh-border/30">
                    <table class="w-full text-xs mt-2">
                      <tbody class="divide-y divide-wh-border/30">
                        ${Object.entries(turnTimings)
                          .map(([idx, ms]) => {
                            const phaseInfo = phasesList[idx];
                            const name = isOpponentTimings
                              ? phaseInfo.name
                              : `${phaseInfo.phase.name.split(" ")[0]} - ${phaseInfo.subPhase.name}`;
                            return `
                            <tr>
                              <td class="py-1 text-wh-muted">${name}</td>
                              <td class="py-1 text-right font-mono">${formatDuration(ms)}</td>
                            </tr>
                          `;
                          })
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                </details>
              `;
                })
                .join("");
            })
            .join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="mt-8 border-t border-wh-border pt-6 pb-4">
      <h3 class="text-lg font-bold text-wh-text mb-4">Strategic Objectives</h3>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Your Score</label>
          <select id="score-you" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${[0, 1, 2, 3, 4].map((v) => `<option value="${v}" ${currentTurnScores.you === v ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Opponent Score</label>
          <select id="score-opponent" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${[0, 1, 2, 3, 4].map((v) => `<option value="${v}" ${currentTurnScores.opponent === v ? "selected" : ""}>${v}</option>`).join("")}
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
            </tr>
          </thead>
          <tbody class="divide-y divide-wh-border">
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
                    return `
                  <tr class="${isCurrent ? "bg-wh-accent/5" : ""}">
                    <td class="px-3 py-2 text-wh-muted font-mono">${turn === turnsInOrder[0] ? r : ""}</td>
                    <td class="px-3 py-2 text-wh-muted italic text-xs capitalize">${turn === "you" ? "Yours" : "Opponents"}</td>
                    <td class="px-3 py-2 text-wh-text font-bold">${s.you}</td>
                    <td class="px-3 py-2 text-wh-text font-bold">${s.opponent}</td>
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
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    ${timingsHtml}
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
}
