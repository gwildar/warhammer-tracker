import { parseArmyList } from '../army.js'
import { saveArmy, saveSpellSelections, savePhaseIndex, saveRound, saveFirstTurn, saveIsOpponentTurn } from '../state.js'
import { getCasters } from '../army.js'

import darkElvesJson from './fixtures/dark-elves.owb.json'
import lizardmenJson from './fixtures/lizardmen.owb.json'
import bretonniaJson from './fixtures/bretonnia.owb.json'

export function loadArmy(fixture) {
  const jsonMap = {
    'dark-elves': darkElvesJson,
    'lizardmen': lizardmenJson,
    'bretonnia': bretonniaJson,
  }
  const json = jsonMap[fixture]
  const army = parseArmyList(json)
  saveArmy(army)

  // Initialise empty spell selections
  const casters = getCasters(army)
  const selections = {}
  for (const c of casters) {
    selections[c.id] = {}
  }
  saveSpellSelections(selections)

  return army
}

export function startGame(army, firstTurn = 'you') {
  saveFirstTurn(firstTurn)
  saveIsOpponentTurn(false)
  savePhaseIndex(0)
  saveRound(1)
  return army
}

export function getApp() {
  return document.getElementById('app')
}
