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
  })

  describe('combat phase', () => {
    it('shows combat phase heading', () => {
      savePhaseIndex(12) // choose-fight is step 13 (index 12)
      renderGameScreen(army)
      expect(getApp().textContent).toContain('Combat')
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
    expect(text).toContain('Squires')
    expect(text).toContain('BS3')
    expect(text).toContain('Longbow')
  })

  it('does not show unit count for merged units', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    // 3 squire units merged — should not show x10 or x30
    expect(text).not.toMatch(/Squires\s*x\d/)
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
    expect(text).toContain('T4')
  })

  it('shows ridden monster with combined wounds and mount name', () => {
    renderGameScreen(army)
    const text = getApp().textContent
    // Baron on Hippogryph: W3 + (+3) = W6, T4 + (+1) = T5
    expect(text).toContain('(Hippogryph)')
    expect(text).toContain('W6')
    expect(text).toContain('T5')
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
    expect(text).toContain('AS: 3+')
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
})
