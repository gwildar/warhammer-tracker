import { describe, it, expect, beforeEach } from "vitest";
import { renderScenarioSetupScreen } from "../../screens/scenario-setup.js";
import { renderUnitAssignmentScreen } from "../../screens/unit-assignment.js";
import { renderDeploymentScreen } from "../../screens/deployment.js";
import { getApp, loadArmy } from "../helpers.js";
import { registerScreen } from "../../navigate.js";
import { saveCharacterAssignments } from "../../state.js";

describe("Scenario Setup Screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  it("renders Scenario Setup heading", () => {
    renderScenarioSetupScreen(army);
    expect(getApp().querySelector("h2").textContent).toContain(
      "Scenario Setup",
    );
  });

  it("shows next-btn and prev-btn", () => {
    renderScenarioSetupScreen(army);
    expect(getApp().querySelector("#next-btn")).toBeTruthy();
    expect(getApp().querySelector("#prev-btn")).toBeTruthy();
  });
});

describe("Scenario Setup Screen — navigation", () => {
  let army;

  beforeEach(() => {
    saveCharacterAssignments({});
    army = loadArmy("dark-elves");
    registerScreen("unitAssignmentScreen", renderUnitAssignmentScreen);
    registerScreen("deploymentScreen", renderDeploymentScreen);
  });

  it("prev-btn navigates back to unit assignment", () => {
    renderScenarioSetupScreen(army);
    getApp().querySelector("#prev-btn").click();
    expect(getApp().textContent).toContain("Place Characters in Units");
  });

  it("next-btn navigates to deployment", () => {
    renderScenarioSetupScreen(army);
    getApp().querySelector("#next-btn").click();
    expect(getApp().textContent).toContain("Deployment");
  });
});
