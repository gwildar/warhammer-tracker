import { getScores, updateScore, getRound } from '../state.js'

export function renderScoringUI() {
  const scores = getScores()
  const round = getRound()
  const currentRoundScore = scores[round] || { you: 0, opponent: 0 }

  const rounds = Object.keys(scores).map(Number).sort((a, b) => a - b)
  if (!rounds.includes(round)) rounds.push(round)
  rounds.sort((a, b) => a - b)

  return `
    <div class="mt-8 border-t border-wh-border pt-6 pb-4">
      <h3 class="text-lg font-bold text-wh-text mb-4">Strategic Objectives</h3>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Your Score</label>
          <select id="score-you" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${[0, 1, 2, 3, 4].map(v => `<option value="${v}" ${currentRoundScore.you === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wider text-wh-muted mb-1">Opponent Score</label>
          <select id="score-opponent" class="w-full bg-wh-card border border-wh-border text-wh-text rounded p-2 outline-none focus:border-wh-accent transition-colors">
            ${[0, 1, 2, 3, 4].map(v => `<option value="${v}" ${currentRoundScore.opponent === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="overflow-hidden border border-wh-border rounded-lg">
        <table class="w-full text-sm text-left">
          <thead class="bg-wh-card text-wh-muted uppercase tracking-wider border-b border-wh-border">
            <tr>
              <th class="px-3 py-2 font-semibold">Round</th>
              <th class="px-3 py-2 font-semibold">You</th>
              <th class="px-3 py-2 font-semibold">Opponent</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-wh-border">
            ${rounds.map(r => {
              const s = scores[r] || { you: 0, opponent: 0 }
              return `
                <tr class="${r === round ? 'bg-wh-accent/5' : ''}">
                  <td class="px-3 py-2 text-wh-muted font-mono">${r}</td>
                  <td class="px-3 py-2 text-wh-text font-bold">${s.you}</td>
                  <td class="px-3 py-2 text-wh-text font-bold">${s.opponent}</td>
                </tr>
              `
            }).join('')}
          </tbody>
          <tfoot class="bg-wh-card border-t border-wh-border font-bold">
            <tr>
              <td class="px-3 py-2 text-wh-muted">Total</td>
              <td class="px-3 py-2 text-wh-accent">${Object.values(scores).reduce((sum, s) => sum + (s.you || 0), 0)}</td>
              <td class="px-3 py-2 text-wh-red">${Object.values(scores).reduce((sum, s) => sum + (s.opponent || 0), 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `
}

export function bindScoringEvents(army, renderCallback) {
  const round = getRound()

  document.getElementById('score-you')?.addEventListener('change', (e) => {
    updateScore(round, 'you', parseInt(e.target.value, 10))
    renderCallback(army)
  })

  document.getElementById('score-opponent')?.addEventListener('change', (e) => {
    updateScore(round, 'opponent', parseInt(e.target.value, 10))
    renderCallback(army)
  })
}
