import "./style.css";
import {
  getArmy,
  clearAll,
  getFirstTurn,
  getIsOpponentTurn,
  getSchemaVersion,
  saveSchemaVersion,
  SCHEMA_VERSION,
  resetStartTime,
} from "./state.js";
import { registerScreen } from "./navigate.js";

// Import screens
import { renderSetupScreen } from "./screens/setup.js";
import { renderGameScreen } from "./screens/game.js";
import { renderFirstTurnScreen } from "./screens/first-turn.js";
import { renderOpponentTurnScreen } from "./screens/opponent-turn.js";
import { renderAboutScreen } from "./screens/about.js";
import { renderUnitAssignmentScreen } from "./screens/unit-assignment.js";
import { renderDeploymentScreen } from "./screens/deployment.js";
import { renderGameOverScreen } from "./screens/game-over.js";
import { renderSpellSelectionScreen } from "./screens/spell-selection-screen.js";
import { renderScenarioSetupScreen } from "./screens/scenario-setup.js";

// Register screens for cross-navigation
registerScreen("render", render);
registerScreen("setupScreen", renderSetupScreen);
registerScreen("gameScreen", renderGameScreen);
registerScreen("firstTurnScreen", renderFirstTurnScreen);
registerScreen("unitAssignmentScreen", renderUnitAssignmentScreen);
registerScreen("deploymentScreen", renderDeploymentScreen);
registerScreen("opponentTurnScreen", renderOpponentTurnScreen);
registerScreen("aboutScreen", renderAboutScreen);
registerScreen("gameOverScreen", renderGameOverScreen);
registerScreen("spellSelectionScreen", renderSpellSelectionScreen);
registerScreen("scenarioSetupScreen", renderScenarioSetupScreen);

function render() {
  const army = getArmy();
  if (!army) {
    renderSetupScreen();
  } else if (!getFirstTurn()) {
    renderSetupScreen();
  } else if (getIsOpponentTurn()) {
    renderOpponentTurnScreen(army);
  } else {
    renderGameScreen(army);
  }
}

// ─── Init ───────────────────────────────────────────────────────────────────

// Schema version guard: clear stale state if schema has changed
if (getSchemaVersion() !== SCHEMA_VERSION) {
  clearAll();
  saveSchemaVersion(SCHEMA_VERSION);
}

// Reset start time so timer doesn't accumulate time while page was closed
resetStartTime();

// Safe render: if anything throws (e.g. stale schema slipped through), clear
// and restart cleanly rather than leaving the user with a broken screen
try {
  render();
} catch {
  clearAll();
  saveSchemaVersion(SCHEMA_VERSION);
  sessionStorage.setItem("tow-recovered", "1");
  render();
}
