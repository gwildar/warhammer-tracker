import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderGameOverScreen } from "../../screens/game-over.js";
import { loadArmy, startGame, getApp } from "../helpers.js";
import {
  saveIsOpponentTurn,
  saveDeploymentTime,
  saveScenarioOptions,
  getRound,
  getFirstTurn,
  updateScore,
} from "../../state.js";
import * as Nav from "../../navigate.js";

describe("Game Over Screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
    startGame(army);
  });

  afterEach(() => {
    saveScenarioOptions({
      domination: false,
      baggageTrains: false,
      strategicLocations: { enabled: false, count: 3 },
      specialFeatures: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Game Over heading", () => {
    renderGameOverScreen(army);
    expect(getApp().textContent).toContain("Game Over");
  });

  it("shows Your Total and Opponent Total labels", () => {
    renderGameOverScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("Your Total");
    expect(text).toContain("Opponent Total");
  });

  it("shows a read-only score table with no select elements", () => {
    renderGameOverScreen(army);
    expect(getApp().querySelector("table")).toBeTruthy();
    expect(getApp().querySelector("table select")).toBeNull();
  });

  it("shows Back button in header and footer", () => {
    renderGameOverScreen(army);
    expect(getApp().querySelector("#back-btn")).toBeTruthy();
    expect(getApp().querySelector("#back-btn-footer")).toBeTruthy();
  });

  it("shows New Game button", () => {
    renderGameOverScreen(army);
    expect(getApp().querySelector("#new-game-btn")).toBeTruthy();
  });

  it("header Back navigates to game screen when not opponent turn", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderGameOverScreen(army);
    getApp().querySelector("#back-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/game/1/strategy/start-of-turn");
  });

  it("footer Back navigates to game screen when not opponent turn", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderGameOverScreen(army);
    getApp().querySelector("#back-btn-footer").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/game/1/strategy/start-of-turn");
  });

  it("Back navigates to opponent screen when on opponent turn", () => {
    saveIsOpponentTurn(true);
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderGameOverScreen(army);
    getApp().querySelector("#back-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/opponent/1/strategy");
  });

  it("New Game resets state and navigates to setup", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderGameOverScreen(army);
    getApp().querySelector("#new-game-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/");
    expect(getRound()).toBe(1);
    expect(getFirstTurn()).toBeNull();
  });

  it("shows deployment row when deploymentTime is set", () => {
    saveDeploymentTime(1200000);
    renderGameOverScreen(army);
    expect(getApp().textContent).toContain("Deploy");
    expect(getApp().textContent).toContain("20:00");
  });

  it("does not show deployment row when deploymentTime is null", () => {
    renderGameOverScreen(army);
    expect(getApp().textContent).not.toContain("Deploy");
  });

  it("totals reflect recorded scores", () => {
    updateScore(1, false, "you", 3);
    updateScore(1, true, "opponent", 2);
    renderGameOverScreen(army);
    const text = getApp().textContent;
    expect(text).toContain("3");
    expect(text).toContain("2");
  });

  it("domination section appears after baggage trains when both enabled", () => {
    saveScenarioOptions({
      domination: true,
      baggageTrains: true,
      strategicLocations: { enabled: false, count: 3 },
      specialFeatures: false,
    });
    renderGameOverScreen(army);
    const html = getApp().innerHTML;
    expect(html.indexOf("Baggage Trains")).toBeLessThan(
      html.indexOf("Domination"),
    );
  });

  it("shows unit strength table sorted by US descending in domination section", () => {
    saveScenarioOptions({
      domination: true,
      baggageTrains: false,
      strategicLocations: { enabled: false, count: 3 },
      specialFeatures: false,
    });
    renderGameOverScreen(army);
    const html = getApp().innerHTML;
    expect(html).toContain("Repeater Crossbowman");
    expect(html.indexOf("Repeater Crossbowman")).toBeLessThan(
      html.indexOf("Dark Rider"),
    );
  });
});
