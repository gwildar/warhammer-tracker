import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderDeploymentScreen } from "../../screens/deployment.js";
import { getApp, loadArmy } from "../helpers.js";
import { getDeploymentTime } from "../../state.js";
import * as Nav from "../../navigate.js";

describe("Deployment screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  afterEach(() => vi.restoreAllMocks());

  it("renders Deployment heading", () => {
    renderDeploymentScreen(army);
    expect(getApp().querySelector("h2").textContent).toContain("Deployment");
  });

  it("shows setup phase header with Deploy active and army name", () => {
    renderDeploymentScreen(army);
    const header = getApp().querySelector("header");
    expect(header.textContent).toContain(army.name);
    expect(header.textContent).toContain("Deploy");
    expect(header.textContent).toContain("Place Characters");
    expect(header.textContent).toContain("Who Goes First");
    expect(header.querySelector("#setup-army-btn")).toBeTruthy();
  });

  it("shows Next button and Back button", () => {
    renderDeploymentScreen(army);
    expect(getApp().querySelector("#next-btn")).toBeTruthy();
    expect(getApp().querySelector("#prev-btn")).toBeTruthy();
  });

  it("shows deployment sequence explainer", () => {
    renderDeploymentScreen(army);
    expect(getApp().textContent).toContain("Deployment sequence");
    expect(getApp().textContent).toContain("Roll off");
    expect(getApp().textContent).toContain("Alternate deploying");
  });

  it("does not show Deployment Rules section when no relevant units", () => {
    const armyWithoutDeploymentRules = loadArmy("bretonnia");
    renderDeploymentScreen(armyWithoutDeploymentRules);
    expect(getApp().textContent).not.toContain("Deployment Rules");
  });

  it("shows unit card with Scouts rule when unit has Scouts", () => {
    const armyWithScouts = {
      name: "Test Army",
      units: [
        {
          id: "scouts-unit",
          name: "Shadow Warriors",
          category: "core",
          specialRules: [{ displayName: "Scouts" }],
          magicItems: [],
        },
      ],
    };
    renderDeploymentScreen(armyWithScouts);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Shadow Warriors");
    expect(getApp().textContent).toContain("Scouts");
  });

  it("shows unit card with Vanguard rule when unit has Vanguard", () => {
    const armyWithVanguard = {
      name: "Test Army",
      units: [
        {
          id: "vanguard-unit",
          name: "Outriders",
          category: "core",
          specialRules: [{ displayName: "Vanguard" }],
          magicItems: [],
        },
      ],
    };
    renderDeploymentScreen(armyWithVanguard);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Outriders");
    expect(getApp().textContent).toContain("Vanguard");
  });

  it("shows unit card with Ambushers rule when unit has Ambush alias", () => {
    const armyWithAmbush = {
      name: "Test Army",
      units: [
        {
          id: "ambush-unit",
          name: "Night Goblins",
          category: "core",
          specialRules: [{ displayName: "Ambush" }],
          magicItems: [],
        },
      ],
    };
    renderDeploymentScreen(armyWithAmbush);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Night Goblins");
    expect(getApp().textContent).toContain("Ambush");
  });

  it("does not show units without deployment rules", () => {
    const mixedArmy = {
      name: "Test Army",
      units: [
        {
          id: "scouts-unit",
          name: "Shadow Warriors",
          category: "core",
          specialRules: [{ displayName: "Scouts" }],
          magicItems: [],
        },
        {
          id: "normal-unit",
          name: "Spearmen",
          category: "core",
          specialRules: [{ displayName: "Killing Blow" }],
          magicItems: [],
        },
      ],
    };
    renderDeploymentScreen(mixedArmy);
    expect(getApp().textContent).toContain("Shadow Warriors");
    expect(getApp().textContent).not.toContain("Spearmen");
  });

  it("shows unit card with Ambushers rule when unit has Ambushers", () => {
    const armyWithAmbushers = {
      name: "Test Army",
      units: [
        {
          id: "ambushers-unit",
          name: "Forest Goblins",
          category: "core",
          specialRules: [{ displayName: "Ambushers" }],
          magicItems: [],
        },
      ],
    };
    renderDeploymentScreen(armyWithAmbushers);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Forest Goblins");
    expect(getApp().textContent).toContain("Ambushers");
  });

  it("shows unit card when rule has parenthetical suffix like 'Scouts (Cavalry)'", () => {
    const armyWithParenRule = {
      name: "Test Army",
      units: [
        {
          id: "paren-unit",
          name: "Light Cavalry",
          category: "core",
          specialRules: [{ displayName: "Scouts (Cavalry)" }],
          magicItems: [],
        },
      ],
    };
    renderDeploymentScreen(armyWithParenRule);
    expect(getApp().textContent).toContain("Deployment Rules");
    expect(getApp().textContent).toContain("Light Cavalry");
  });

  it("Next button saves deployment time", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    localStorage.setItem("tow-start-time", String(Date.now() - 60000));
    renderDeploymentScreen(army);
    getApp().querySelector("#next-btn").click();
    expect(getDeploymentTime()).not.toBeNull();
    expect(getDeploymentTime()).toBeGreaterThan(0);
  });
});

describe("Deployment Screen — navigation", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prev-btn navigates back to scenario setup", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderDeploymentScreen(army);
    getApp().querySelector("#prev-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/scenario-setup");
  });

  it("next-btn navigates to first turn", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    localStorage.setItem("tow-start-time", String(Date.now() - 1000));
    renderDeploymentScreen(army);
    getApp().querySelector("#next-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/first-turn");
  });
});
