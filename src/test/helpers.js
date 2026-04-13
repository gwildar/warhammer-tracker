import { parseArmyList } from "../army.js";
import {
  saveArmy,
  saveSpellSelections,
  savePhaseIndex,
  saveRound,
  saveFirstTurn,
  saveIsOpponentTurn,
} from "../state.js";
import { getCasters } from "../army.js";

import darkElvesJson from "./fixtures/dark-elves.owb.json";
import lizardmenJson from "./fixtures/lizardmen.owb.json";
import bretonniaJson from "./fixtures/bretonnia.owb.json";
import bretonniaChargeJson from "./fixtures/bretonnia-charge.owb.json";
import bretonnianExilesJson from "./fixtures/bretonnian-exiles.owb.json";
import exilesCorrectJson from "./fixtures/exiles-correct.owb.json";
import vampireCountsJson from "./fixtures/vampire-counts.owb.json";
import ogreKingdomsJson from "./fixtures/ogre-kingdoms.owb.json";
import forestGoblinsJson from "./fixtures/forest-goblins.owb.json";
import mcSkeletonHordeJson from "./fixtures/mc-skeleton-horde.owb.json";

export function loadArmy(fixture) {
  const jsonMap = {
    "dark-elves": darkElvesJson,
    lizardmen: lizardmenJson,
    bretonnia: bretonniaJson,
    "bretonnia-charge": bretonniaChargeJson,
    "bretonnian-exiles": bretonnianExilesJson,
    "exiles-correct": exilesCorrectJson,
    "vampire-counts": vampireCountsJson,
    "ogre-kingdoms": ogreKingdomsJson,
    "forest-goblins": forestGoblinsJson,
    "mc-skeleton-horde": mcSkeletonHordeJson,
  };
  const json = jsonMap[fixture];
  const army = parseArmyList(json);
  saveArmy(army);

  // Initialise empty spell selections
  const casters = getCasters(army);
  const selections = {};
  for (const c of casters) {
    selections[c.id] = {};
  }
  saveSpellSelections(selections);

  return army;
}

export function startGame(army, firstTurn = "you") {
  saveFirstTurn(firstTurn);
  saveIsOpponentTurn(false);
  savePhaseIndex(0);
  saveRound(1);
  return army;
}

export function getApp() {
  return document.getElementById("app");
}
