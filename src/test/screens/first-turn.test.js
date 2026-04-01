import { describe, it, expect, beforeEach } from 'vitest'
import { renderFirstTurnScreen } from '../../screens/first-turn.js'
import { loadArmy, getApp } from '../helpers.js'

describe('First Turn Screen', () => {
  let army

  beforeEach(() => {
    army = loadArmy('dark-elves')
  })

  it('shows "Who goes first?" heading', () => {
    renderFirstTurnScreen(army)
    expect(getApp().textContent).toContain('Who goes first?')
  })

  it('shows army name', () => {
    renderFirstTurnScreen(army)
    expect(getApp().textContent).toContain(army.name)
  })

  it('shows You and Opponent buttons', () => {
    renderFirstTurnScreen(army)
    expect(getApp().querySelector('#first-you-btn')).toBeTruthy()
    expect(getApp().querySelector('#first-opponent-btn')).toBeTruthy()
    expect(getApp().querySelector('#first-you-btn').textContent.trim()).toBe('You')
    expect(getApp().querySelector('#first-opponent-btn').textContent.trim()).toBe('Opponent')
  })

  it('shows Round 1', () => {
    renderFirstTurnScreen(army)
    expect(getApp().textContent).toContain('Round 1')
  })
})
