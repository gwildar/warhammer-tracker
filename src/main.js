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
  getRound,
  getPhaseIndex,
  saveRound,
  savePhaseIndex,
  saveIsOpponentTurn,
} from "./state.js";
import { getAllSubPhases, PHASES, subPhaseToIndex } from "./phases.js";
import { router, navigate } from "./navigate.js";

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

const allSubPhases = getAllSubPhases();

function guardArmy(fn) {
  const army = getArmy();
  if (!army) {
    navigate("/setup");
    return;
  }
  fn(army);
}

router
  .on("/setup", () => renderSetupScreen())
  .on("/unit-assignment", () => guardArmy(renderUnitAssignmentScreen))
  .on("/spell-selection", () => guardArmy(renderSpellSelectionScreen))
  .on("/scenario-setup", () => guardArmy(renderScenarioSetupScreen))
  .on("/deployment", () => guardArmy(renderDeploymentScreen))
  .on("/first-turn", () => guardArmy(renderFirstTurnScreen))
  .on("/about", () => renderAboutScreen())
  .on("/game-over", () => guardArmy(renderGameOverScreen))
  .on("/game/:round/:phase/:subphase", ({ data }) => {
    guardArmy((army) => {
      const idx = subPhaseToIndex(data.phase, data.subphase);
      if (idx === -1) {
        navigate("/setup");
        return;
      }
      saveRound(Number(data.round));
      saveIsOpponentTurn(false);
      savePhaseIndex(idx);
      renderGameScreen(army);
    });
  })
  .on("/opponent/:round/:phase", ({ data }) => {
    guardArmy((army) => {
      const idx = PHASES.findIndex((p) => p.id === data.phase);
      if (idx === -1) {
        navigate("/setup");
        return;
      }
      saveRound(Number(data.round));
      saveIsOpponentTurn(true);
      savePhaseIndex(idx);
      renderOpponentTurnScreen(army);
    });
  })
  .notFound(() => {
    const army = getArmy();
    if (!army || !getFirstTurn()) {
      navigate("/setup");
    } else if (getIsOpponentTurn()) {
      const phase = PHASES[getPhaseIndex()];
      navigate(`/opponent/${getRound()}/${phase.id}`);
    } else {
      const { phase, subPhase } = allSubPhases[getPhaseIndex()];
      navigate(`/game/${getRound()}/${phase.id}/${subPhase.id}`);
    }
  });

// ─── Init ───────────────────────────────────────────────────────────────────

if (getSchemaVersion() !== SCHEMA_VERSION) {
  clearAll();
  saveSchemaVersion(SCHEMA_VERSION);
}

resetStartTime();

try {
  router.resolve();
} catch {
  clearAll();
  saveSchemaVersion(SCHEMA_VERSION);
  sessionStorage.setItem("tow-recovered", "1");
  navigate("/setup");
}
