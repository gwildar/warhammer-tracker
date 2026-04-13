import { describe, it, expect, beforeEach } from "vitest";
import { renderGameOverScreen } from "../../screens/game-over.js";
import { loadArmy, startGame, getApp } from "../helpers.js";
import {
  saveIsOpponentTurn,
  saveDeploymentTime,
  getRound,
  getFirstTurn,
  updateScore,
} from "../../state.js";
import { registerScreen } from "../../navigate.js";

describe("Game Over Screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
    startGame(army);
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

  it("header Back navigates to gameScreen when not opponent turn", () => {
    let navigated = null;
    registerScreen("gameScreen", () => {
      navigated = "gameScreen";
    });
    renderGameOverScreen(army);
    getApp().querySelector("#back-btn").click();
    expect(navigated).toBe("gameScreen");
  });

  it("footer Back navigates to gameScreen when not opponent turn", () => {
    let navigated = null;
    registerScreen("gameScreen", () => {
      navigated = "gameScreen";
    });
    renderGameOverScreen(army);
    getApp().querySelector("#back-btn-footer").click();
    expect(navigated).toBe("gameScreen");
  });

  it("Back navigates to opponentTurnScreen when on opponent turn", () => {
    saveIsOpponentTurn(true);
    let navigated = null;
    registerScreen("opponentTurnScreen", () => {
      navigated = "opponentTurnScreen";
    });
    renderGameOverScreen(army);
    getApp().querySelector("#back-btn").click();
    expect(navigated).toBe("opponentTurnScreen");
  });

  it("New Game resets state and navigates to setupScreen", () => {
    let navigated = null;
    registerScreen("setupScreen", () => {
      navigated = "setupScreen";
    });
    renderGameOverScreen(army);
    getApp().querySelector("#new-game-btn").click();
    expect(navigated).toBe("setupScreen");
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
});
