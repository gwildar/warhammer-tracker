import { describe, it, expect, beforeEach } from "vitest";
import { renderFirstTurnScreen } from "../../screens/first-turn.js";
import { loadArmy, getApp } from "../helpers.js";
import { registerScreen } from "../../navigate.js";
import { renderDeploymentScreen } from "../../screens/deployment.js";

describe("First Turn Screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  it('shows "Who goes first?" heading', () => {
    renderFirstTurnScreen(army);
    expect(getApp().textContent).toContain("Who goes first?");
  });

  it("shows army name", () => {
    renderFirstTurnScreen(army);
    expect(getApp().textContent).toContain(army.name);
  });

  it("shows You and Opponent buttons", () => {
    renderFirstTurnScreen(army);
    expect(getApp().querySelector("#first-you-btn")).toBeTruthy();
    expect(getApp().querySelector("#first-opponent-btn")).toBeTruthy();
    expect(getApp().querySelector("#first-you-btn").textContent.trim()).toBe(
      "You",
    );
    expect(
      getApp().querySelector("#first-opponent-btn").textContent.trim(),
    ).toBe("Opponent");
  });

  it("shows Round 1", () => {
    renderFirstTurnScreen(army);
    expect(getApp().textContent).toContain("Round 1");
  });

  it("has a prev-btn that navigates back to deployment", () => {
    registerScreen("deploymentScreen", renderDeploymentScreen);
    renderFirstTurnScreen(army);
    expect(getApp().querySelector("#prev-btn")).toBeTruthy();
    getApp().querySelector("#prev-btn").click();
    expect(getApp().textContent).toContain("Deployment");
  });
});
