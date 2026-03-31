const KEYS = {
  army: 'tow-army',
  spellSelections: 'tow-spell-selections',
  phaseIndex: 'tow-phase-index',
  round: 'tow-round',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Army
export function getArmy() {
  return load(KEYS.army, null)
}

export function saveArmy(army) {
  save(KEYS.army, army)
}

export function clearArmy() {
  localStorage.removeItem(KEYS.army)
  localStorage.removeItem(KEYS.spellSelections)
}

// Spell selections: { [unitId]: [spellKey, ...] }
export function getSpellSelections() {
  return load(KEYS.spellSelections, {})
}

export function saveSpellSelections(selections) {
  save(KEYS.spellSelections, selections)
}

// Phase navigation
export function getPhaseIndex() {
  return load(KEYS.phaseIndex, 0)
}

export function savePhaseIndex(index) {
  save(KEYS.phaseIndex, index)
}

// Round
export function getRound() {
  return load(KEYS.round, 1)
}

export function saveRound(round) {
  save(KEYS.round, round)
}

// Reset game (keeps army)
export function resetGame() {
  save(KEYS.phaseIndex, 0)
  save(KEYS.round, 1)
}

// Clear all app state
export function clearAll() {
  for (const key of Object.values(KEYS)) {
    localStorage.removeItem(key)
  }
}
