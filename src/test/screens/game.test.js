import { describe, it, expect, beforeEach } from 'vitest'
import { renderGameScreen } from '../../screens/game.js'
import { loadArmy, startGame, getApp } from '../helpers.js'
import { savePhaseIndex } from '../../state.js'

describe('Game Screen', () => {
  let army

  beforeEach(() => {
    army = loadArmy('dark-elves')
    startGame(army)
  })

  it('shows round counter', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain('Round 1')
  })

  it('shows army name', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain(army.name)
  })

  it('shows first sub-phase heading', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain('Start of Turn')
  })

  it('shows phase name', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain('Strategy Phase')
  })

  it('shows step counter', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain('Step 1 of')
  })

  it('shows Previous and Next buttons', () => {
    renderGameScreen(army)
    expect(getApp().querySelector('#prev-btn')).toBeTruthy()
    expect(getApp().querySelector('#next-btn')).toBeTruthy()
  })

  it('disables Previous on first step', () => {
    renderGameScreen(army)
    expect(getApp().querySelector('#prev-btn').hasAttribute('disabled')).toBe(true)
  })

  it('shows New Game button', () => {
    renderGameScreen(army)
    expect(getApp().querySelector('#new-game-btn')).toBeTruthy()
  })

  it('shows Manage Army button', () => {
    renderGameScreen(army)
    expect(getApp().querySelector('#manage-army-btn')).toBeTruthy()
  })

  describe('shooting phase', () => {
    it('shows shooting units for armies with ranged weapons', () => {
      // Navigate to Choose Target sub-phase (shooting)
      savePhaseIndex(8) // choose-target is step 9 (index 8)
      renderGameScreen(army)
      expect(getApp().textContent).toContain('Shooting')
    })

    it('shows Repeater Crossbow without also matching Crossbow', () => {
      savePhaseIndex(8)
      renderGameScreen(army)
      const panel = getApp().querySelector('.border-wh-phase-shooting\\/30')
      const cards = [...panel.querySelectorAll('.bg-wh-card')]
      const rxbowCard = cards.find(el => el.textContent.includes('Repeater Crossbow'))
      expect(rxbowCard).toBeTruthy()
      const crossbowCard = cards.find(el =>
        el.textContent.includes('Crossbow') && !el.textContent.includes('Repeater Crossbow')
      )
      expect(crossbowCard).toBeFalsy()
    })
  })

  describe('combat phase', () => {
    it('shows combat phase heading', () => {
      savePhaseIndex(12) // choose-fight is step 13 (index 12)
      renderGameScreen(army)
      expect(getApp().textContent).toContain('Combat')
    })

    it('shows Close Order in Special Rules on combat-result step', () => {
      savePhaseIndex(13) // combat-result is step 14 (index 13)
      renderGameScreen(army)
      const specialRulesPanel = getApp().querySelector('.border-wh-accent\\/20')
      expect(specialRulesPanel).toBeTruthy()
      expect(specialRulesPanel.textContent).toContain('Close Order')
    })
  })

  describe('last step', () => {
    it('shows End Turn on last step', () => {
      savePhaseIndex(15) // last step (index 15)
      renderGameScreen(army)
      expect(getApp().querySelector('#next-btn').textContent).toContain('End Turn')
    })
  })
})

describe('Game Screen with Lizardmen', () => {
  let army

  beforeEach(() => {
    army = loadArmy('lizardmen')
    startGame(army)
  })

  it('renders without errors', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain('Round 1')
    expect(getApp().textContent).toContain(army.name)
  })
})

describe('Shooting phase with Lizardmen', () => {
  let army

  beforeEach(() => {
    army = loadArmy('lizardmen')
    startGame(army)
    savePhaseIndex(8) // choose-target sub-phase
  })

  it('shows Solar Engine in shooting units', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Solar Engine')
    expect(text).toContain('Bound Spell')
  })

  it('shows Engine of the Gods in shooting units', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Engine of the Gods')
  })

  it('shows Javelin alongside Engine for same unit', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Javelin')
  })
})

describe('Game Screen with Bretonnia', () => {
  let army

  beforeEach(() => {
    army = loadArmy('bretonnia')
    startGame(army)
  })

  it('renders without errors', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain('Round 1')
    expect(getApp().textContent).toContain(army.name)
  })
})

describe('Shooting phase with Bretonnia charge army', () => {
  let army

  beforeEach(() => {
    army = loadArmy('bretonnia-charge')
    startGame(army)
    savePhaseIndex(8) // choose-target sub-phase
  })

  it('shows merged squires with BS from rules-index', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Squire')
    expect(text).toContain('BS3')
    expect(text).toContain('Longbow')
  })

  it('does not show unit count for merged units', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    // 3 squire units merged — should not show x10 or x30
    expect(text).not.toMatch(/Squire\s*x\d/)
  })
})

describe('Combat phase with Bretonnia charge army', () => {
  let army

  beforeEach(() => {
    army = loadArmy('bretonnia-charge')
    startGame(army)
    savePhaseIndex(12) // choose-fight sub-phase
  })

  it('shows combat units with stats ordered by initiative', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Combat Units')
    expect(text).toContain('I5')
    expect(text).toContain('T:4')
  })

  it('shows ridden monster with combined wounds and mount name', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    // Baron on Hippogryph: W3 + (+3) = W6, T4 + (+1) = T5
    expect(text).toContain('(Hippogryph)')
    expect(text).toContain('W:6')
    expect(text).toContain('T:5')
  })

  it('shows attacks next to weapon line', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('A4')
    expect(text).toContain('Lance')
  })

  it('calculates armour save for Baron with heavy armour + shield + barding', () => {
    renderGameScreen(army)
    // Baron: heavy armour (5+) + shield (-1) + barding (-1) = 3+
    const text = getApp().textContent
    expect(text).toContain('AS:3+')
  })

  it('does not show unit count for merged Knights Errant', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).not.toMatch(/Knights Errant\s*x\d/)
  })

  it('shows lance weapon under combat units', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Lance')
  })

  it('shows The Grail Vow and Magical on ridden monster character card', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const baronCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Baron Guy de Bastille'))
    expect(baronCard).toBeTruthy()
    expect(baronCard.textContent).toContain('The Grail Vow')
    expect(baronCard.textContent).toContain('Magical')
  })

  it('shows The Grail Vow from special rules in footer', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const dukeCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Duke Gerard'))
    expect(dukeCard).toBeTruthy()
    expect(dukeCard.textContent).toContain('The Grail Vow')
  })
})

describe('Combat phase with Dark Elves', () => {
  let army

  beforeEach(() => {
    army = loadArmy('dark-elves')
    startGame(army)
    savePhaseIndex(12) // choose-fight sub-phase
  })

  it('shows champion magic weapon replacing mundane weapon', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const knightsCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Cold One Knight'))
    expect(knightsCard).toBeTruthy()
    expect(knightsCard.textContent).toContain('Spelleater Axe')
    expect(knightsCard.textContent).toContain('Dread Knight')
  })

  it('shows MR from champion magic items on unit card', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const knightsCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Cold One Knight'))
    expect(knightsCard).toBeTruthy()
    expect(knightsCard.textContent).toContain('MR:-2')
  })

  it('only shows Magical on champion weapon line, not rank-and-file', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const knightsCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Cold One Knight'))
    expect(knightsCard).toBeTruthy()
    const weaponLines = [...knightsCard.querySelectorAll('.text-xs')]
    const champLine = weaponLines.find(el => el.textContent.includes('Spelleater Axe'))
    const lanceLine = weaponLines.find(el => el.textContent.includes('Lance'))
    expect(champLine.textContent).toContain('Magical')
    expect(lanceLine.textContent).not.toContain('Magical')
  })

  it('stacks Armoured Hide with armour for Cold One Knights', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const knightsCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Cold One Knight'))
    expect(knightsCard).toBeTruthy()
    // Full plate (4+) + Armoured Hide 1 (-1) + shield (-1) = 2+
    expect(knightsCard.textContent).toContain('AS:2+')
  })

  it('includes magic shield in armour save calculation', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const dreadlordCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Dark Elf Dreadlord'))
    expect(dreadlordCard).toBeTruthy()
    // Full plate (4+) + Shield of Ghrond (-1) = 3+
    expect(dreadlordCard.textContent).toContain('AS:3+')
  })

  it('does not show Magical Attacks for shooting-only weapons like Sword of Sorrow', () => {
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const masterCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Dark Elf Master'))
    expect(masterCard).toBeTruthy()
    expect(masterCard.textContent).not.toContain('Magical')
  })
})

describe('Vampire Counts army', () => {
  let army

  beforeEach(() => {
    army = loadArmy('vampire-counts')
    startGame(army)
  })

  it('shows Blood Knights with embedded Nightmare mount attacks', () => {
    savePhaseIndex(12) // choose-fight
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Nightmare')
    expect(text).toContain('Blood Knight')
  })

  it('shows Wailing Dirge in shooting phase', () => {
    savePhaseIndex(8) // choose-target
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Wailing Dirge')
    expect(text).toContain('8"')
  })
})

describe('Ogre Kingdoms army', () => {
  let army

  beforeEach(() => {
    army = loadArmy('ogre-kingdoms')
    startGame(army)
  })

  it('renders without errors', () => {
    renderGameScreen(army)
    expect(getApp().textContent).toContain('Round 1')
    expect(getApp().textContent).toContain(army.name)
  })

  it('shows Ironguts with AS:5+ from innate heavy armour', () => {
    savePhaseIndex(12) // choose-fight
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const irongutCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Irongut'))
    expect(irongutCard).toBeTruthy()
    expect(irongutCard.textContent).toContain('AS:5+')
  })

  it('shows Thundertusk Riders with AS:5+ from frozen pelt', () => {
    savePhaseIndex(12)
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const ttCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Thundertusk'))
    expect(ttCard).toBeTruthy()
    expect(ttCard.textContent).toContain('AS:5+')
  })

  it('shows Cackling Blade extra attacks on Tyrant card', () => {
    savePhaseIndex(12)
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const tyrantCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Tyrant'))
    expect(tyrantCard).toBeTruthy()
    expect(tyrantCard.textContent).toContain('A5+D6')
    expect(tyrantCard.textContent).toContain('Cackling Blade')
  })

  it('shows Cannibal Totem in combat phase magic items', () => {
    savePhaseIndex(12) // choose-fight
    renderGameScreen(army)
    const text = getApp().textContent
    expect(text).toContain('Cannibal Totem')
    expect(text).toContain('Regeneration')
  })

  it('shows Regen on Ironguts from Cannibal Totem', () => {
    savePhaseIndex(12)
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const irongutCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Irongut'))
    expect(irongutCard).toBeTruthy()
    expect(irongutCard.textContent).toContain('Regen:5+')
  })

  it('shows Ironblaster Rhinox with Monstrous Tusks exactly once', () => {
    savePhaseIndex(12)
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const ironblasterCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Ironblaster'))
    expect(ironblasterCard).toBeTruthy()
    const matches = ironblasterCard.textContent.match(/Monstrous Tusks/g)
    expect(matches).toHaveLength(1)
  })

  it('shows Thundertusk Great Tusks exactly once', () => {
    savePhaseIndex(12)
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const ttCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Thundertusk'))
    expect(ttCard).toBeTruthy()
    const matches = ttCard.textContent.match(/Great Tusks/g)
    expect(matches).toHaveLength(1)
  })

  it('shows Stonehorn Horns of Stone exactly once', () => {
    savePhaseIndex(12)
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const shCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Stonehorn'))
    expect(shCard).toBeTruthy()
    const matches = shCard.textContent.match(/Horns of Stone/g)
    expect(matches).toHaveLength(1)
  })

  it('shows Ironblaster Leadbelcher crew with Hand Weapon', () => {
    savePhaseIndex(12)
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const ironblasterCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Ironblaster'))
    expect(ironblasterCard).toBeTruthy()
    expect(ironblasterCard.textContent).toContain('Hand Weapon')
    expect(ironblasterCard.textContent).toContain('Leadbelcher')
  })

  it('shows crew Ld for Ironblaster on break test', () => {
    savePhaseIndex(14) // break-test
    renderGameScreen(army)
    const combatPanel = getApp().querySelector('.border-wh-phase-combat\\/30')
    const ironblasterCard = [...combatPanel.querySelectorAll('.bg-wh-card')]
      .find(el => el.textContent.includes('Ironblaster'))
    expect(ironblasterCard).toBeTruthy()
    expect(ironblasterCard.textContent).toContain('Ld7')
  })
})
