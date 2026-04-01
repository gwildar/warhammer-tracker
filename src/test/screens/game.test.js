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
      savePhaseIndex(7) // choose-target is step 8 (index 7)
      renderGameScreen(army)
      expect(getApp().textContent).toContain('Shooting')
    })
  })

  describe('combat phase', () => {
    it('shows combat phase heading', () => {
      savePhaseIndex(11) // choose-fight is step 12 (index 11)
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
