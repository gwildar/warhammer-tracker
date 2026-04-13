import { describe, it, expect, beforeEach } from "vitest";
import { renderDeploymentScreen } from "../../screens/deployment.js";
import { getApp, loadArmy } from "../helpers.js";
import { saveArmy } from "../../state.js";

describe("Deployment screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  it("renders Deployment heading", () => {
    renderDeploymentScreen(army);
    expect(getApp().querySelector("h2").textContent).toContain("Deployment");
  });

  it("shows Setup eyebrow", () => {
    renderDeploymentScreen(army);
    expect(getApp().textContent).toContain("Setup");
  });

  it("shows army name in header", () => {
    renderDeploymentScreen(army);
    const header = getApp().querySelector("header");
    expect(header.textContent).toContain(army.name);
  });

  it("shows Continue button", () => {
    renderDeploymentScreen(army);
    expect(getApp().querySelector("#continue-btn")).toBeTruthy();
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
    saveArmy(armyWithScouts);
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
    saveArmy(armyWithVanguard);
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
    saveArmy(armyWithAmbush);
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
    saveArmy(mixedArmy);
    renderDeploymentScreen(mixedArmy);
    expect(getApp().textContent).toContain("Shadow Warriors");
    expect(getApp().textContent).not.toContain("Spearmen");
  });
});
