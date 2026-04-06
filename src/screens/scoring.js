import {
  getScores,
  updateScore,
  getRound,
  getIsOpponentTurn,
  getFirstTurn,
} from "../state.js";

export function renderScoringUI() {
  const scores = getScores();
  const round = getRound();
  const isOpponentTurn = getIsOpponentTurn();
  const turnKey = isOpponentTurn ? "opponent" : "you";
  const firstTurn = getFirstTurn();

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
