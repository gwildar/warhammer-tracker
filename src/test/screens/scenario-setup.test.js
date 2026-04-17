import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderScenarioSetupScreen } from "../../screens/scenario-setup.js";
import { getApp, loadArmy } from "../helpers.js";
import { saveCharacterAssignments } from "../../state.js";
import * as Nav from "../../navigate.js";

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prev-btn navigates back to unit assignment", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderScenarioSetupScreen(army);
    getApp().querySelector("#prev-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/unit-assignment");
  });

  it("next-btn navigates to deployment", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderScenarioSetupScreen(army);
    getApp().querySelector("#next-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/deployment");
  });
});
