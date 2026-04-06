import { describe, it, expect, beforeEach } from "vitest";
import { renderOpponentTurnScreen } from "../../screens/opponent-turn.js";
import { loadArmy, startGame, getApp } from "../helpers.js";
import { saveIsOpponentTurn, savePhaseIndex } from "../../state.js";

describe("Opponent Turn Screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
    startGame(army);
    saveIsOpponentTurn(true);
    savePhaseIndex(0);
  });

  it("shows Opponent badge", () => {
    renderOpponentTurnScreen(army);
    expect(getApp().textContent).toContain("Opponent");
  });

  it('shows "Opponent\'s Turn" label', () => {
    renderOpponentTurnScreen(army);
    expect(getApp().textContent).toContain("Opponent's Turn");
  });

  it("shows round counter", () => {
    renderOpponentTurnScreen(army);
    expect(getApp().textContent).toContain("Round 1");
  });

  it("shows Strategy Phase as first phase", () => {
    renderOpponentTurnScreen(army);
    expect(getApp().textContent).toContain("Strategy Phase");
  });

  it("shows phase count", () => {
    renderOpponentTurnScreen(army);
    expect(getApp().textContent).toContain("Phase 1 of 5");
  });

  it("shows Previous and Next buttons", () => {
    renderOpponentTurnScreen(army);
    expect(getApp().querySelector("#prev-btn")).toBeTruthy();
    expect(getApp().querySelector("#next-btn")).toBeTruthy();
  });

  it("shows End Turn on last phase", () => {
    savePhaseIndex(4); // Scoring phase (last)
    renderOpponentTurnScreen(army);
    expect(getApp().querySelector("#next-btn").textContent).toContain(
      "End Turn",
    );
  });

  it("shows New Game button", () => {
    renderOpponentTurnScreen(army);
    expect(getApp().querySelector("#new-game-btn")).toBeTruthy();
  });
});
