import './style.css'
import { getArmy, clearAll, getFirstTurn, getIsOpponentTurn } from './state.js'
import { registerScreen } from './navigate.js'

// Import screens
import { renderSetupScreen } from './screens/setup.js'
import { renderGameScreen } from './screens/game.js'
import { renderFirstTurnScreen } from './screens/first-turn.js'
import { renderOpponentTurnScreen } from './screens/opponent-turn.js'
import { renderAboutScreen } from './screens/about.js'

// Register screens for cross-navigation
registerScreen('render', render)
registerScreen('setupScreen', renderSetupScreen)
registerScreen('gameScreen', renderGameScreen)
registerScreen('firstTurnScreen', renderFirstTurnScreen)
registerScreen('opponentTurnScreen', renderOpponentTurnScreen)
registerScreen('aboutScreen', renderAboutScreen)

function render() {
  const army = getArmy()
  if (!army) {
    renderSetupScreen()
  } else if (!getFirstTurn()) {
    renderSetupScreen()
  } else if (getIsOpponentTurn()) {
    renderOpponentTurnScreen(army)
  } else {
    renderGameScreen(army)
  }
}

// ─── Init ───────────────────────────────────────────────────────────────────

clearAll()
render()
