const KEYS = {
  army: "tow-army",
  spellSelections: "tow-spell-selections",
  phaseIndex: "tow-phase-index",
  round: "tow-round",
  opponentTurn: "tow-opponent-turn",
  firstTurn: "tow-first-turn",
  scores: "tow-scores",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Army
export function getArmy() {
  return load(KEYS.army, null);
}

export function saveArmy(army) {
  save(KEYS.army, army);
}

export function clearArmy() {
  localStorage.removeItem(KEYS.army);
  localStorage.removeItem(KEYS.spellSelections);
}

// Spell selections: { [unitId]: [spellKey, ...] }
export function getSpellSelections() {
  return load(KEYS.spellSelections, {});
}

export function saveSpellSelections(selections) {
  save(KEYS.spellSelections, selections);
}

// Phase navigation
export function getPhaseIndex() {
  return load(KEYS.phaseIndex, 0);
}

export function savePhaseIndex(index) {
  save(KEYS.phaseIndex, index);
}

// Round
export function getRound() {
  return load(KEYS.round, 1);
}

export function saveRound(round) {
  save(KEYS.round, round);
}

// Opponent turn
export function getIsOpponentTurn() {
  return load(KEYS.opponentTurn, false);
}

export function saveIsOpponentTurn(value) {
  save(KEYS.opponentTurn, value);
}

// First turn (who goes first: 'you' or 'opponent')
export function getFirstTurn() {
  return load(KEYS.firstTurn, null);
}

export function saveFirstTurn(value) {
  save(KEYS.firstTurn, value);
}

// Scores: { [round]: { you: N, opponent: N } }
export function getScores() {
  return load(KEYS.scores, {});
}

export function saveScores(scores) {
  save(KEYS.scores, scores);
}

export function updateScore(round, isOpponentTurn, player, score) {
  const turnKey = isOpponentTurn ? "opponent" : "you";
  const scores = getScores();
  if (!scores[round]) {
    scores[round] = {
      you: { you: 0, opponent: 0 },
      opponent: { you: 0, opponent: 0 },
    };
  }
  scores[round][turnKey][player] = score;
  saveScores(scores);
}

// Can we go back to the previous turn?
export function canGoBackToPreviousTurn() {
  const round = getRound();
  const firstTurn = getFirstTurn();
  const isOpponentTurn = getIsOpponentTurn();
  if (round === 1) {
    if (firstTurn === "you" && !isOpponentTurn) return false;
    if (firstTurn === "opponent" && isOpponentTurn) return false;
  }
  return true;
}

// Reset game (keeps army)
export function resetGame() {
  save(KEYS.phaseIndex, 0);
  save(KEYS.round, 1);
  save(KEYS.opponentTurn, false);
  save(KEYS.scores, {});
}

// Clear all app state
export function clearAll() {
  for (const key of Object.values(KEYS)) {
    localStorage.removeItem(key);
  }
}
