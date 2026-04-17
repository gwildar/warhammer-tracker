import { describe, it, expect, beforeEach } from "vitest";
import { renderUnitAssignmentScreen } from "../../screens/unit-assignment.js";
import { saveCharacterAssignments } from "../../state.js";
import { getApp, loadArmy } from "../helpers.js";
import { getCasters } from "../../army.js";
import { registerScreen } from "../../navigate.js";
import { renderSetupScreen } from "../../screens/setup.js";
import { renderSpellSelectionScreen } from "../../screens/spell-selection-screen.js";
import { renderScenarioSetupScreen } from "../../screens/scenario-setup.js";

describe("Unit assignment screen", () => {
  let army;

  beforeEach(() => {
    saveCharacterAssignments({});
    army = loadArmy("bretonnia");
  });

  it("renders a character pool and units list", () => {
    renderUnitAssignmentScreen(army);
    expect(getApp().querySelector("#char-pool")).toBeTruthy();
    expect(getApp().querySelector("#units-list")).toBeTruthy();
  });

  it("renders a card for each character unit", () => {
    renderUnitAssignmentScreen(army);
    const charCards = getApp().querySelectorAll("[data-char-id]");
    const charUnits = army.units.filter((u) =>
      ["characters", "lords", "heroes"].includes(u.category),
    );
    expect(charCards.length).toBe(charUnits.length);
  });

  it("renders a drop zone for each non-character unit", () => {
    renderUnitAssignmentScreen(army);
    const dropZones = getApp().querySelectorAll("[data-unit-id]");
    const regularUnits = army.units.filter(
      (u) => !["characters", "lords", "heroes"].includes(u.category),
    );
    expect(dropZones.length).toBe(regularUnits.length);
  });

  it("shows magic item names on character cards", () => {
    const charWithItems = army.units.find(
      (u) =>
        ["characters", "lords", "heroes"].includes(u.category) &&
        u.magicItems?.length > 0,
    );
    if (!charWithItems) return;
    renderUnitAssignmentScreen(army);
    const card = getApp().querySelector(`[data-char-id="${charWithItems.id}"]`);
    expect(card.textContent).toContain(charWithItems.magicItems[0].name);
  });

  it("next button exists", () => {
    renderUnitAssignmentScreen(army);
    expect(getApp().querySelector("#next-btn")).toBeTruthy();
  });

  it("pre-seeded assignments render in the unit card, not the pool", () => {
    const char = army.units.find((u) =>
      ["characters", "lords", "heroes"].includes(u.category),
    );
    const unit = army.units.find(
      (u) => !["characters", "lords", "heroes"].includes(u.category),
    );
    saveCharacterAssignments({ [char.id]: unit.id });
    renderUnitAssignmentScreen(army);
    const pool = getApp().querySelector("#char-pool");
    expect(pool.querySelector(`[data-char-id="${char.id}"]`)).toBeNull();
    const unitZone = getApp().querySelector(`[data-unit-id="${unit.id}"]`);
    expect(
      unitZone.querySelector(`[data-assigned-char="${char.id}"]`),
    ).toBeTruthy();
  });

  it("shows page title in main content, not in header", () => {
    renderUnitAssignmentScreen(army);
    const header = getApp().querySelector("header");
    const main = getApp().querySelector("main");
    expect(header.textContent).not.toContain("Place Characters in Units");
    expect(main.querySelector("h2").textContent).toContain(
      "Place Characters in Units",
    );
  });

  it("shows Optional subtitle in title block", () => {
    renderUnitAssignmentScreen(army);
    const titleBlock = getApp().querySelector("main > div.mb-4");
    expect(titleBlock.textContent).toContain("Optional");
  });

  it("header shows army name, setup phases, and army button", () => {
    renderUnitAssignmentScreen(army);
    const header = getApp().querySelector("header");
    expect(header.textContent).toContain(army.name);
    expect(header.textContent).toContain("Place Characters");
    expect(header.textContent).toContain("Deploy");
    expect(header.textContent).toContain("Who Goes First");
    expect(header.querySelector("#setup-army-btn")).toBeTruthy();
    expect(header.querySelector("#setup-new-game-btn")).toBeTruthy();
    expect(getApp().querySelector("footer #next-btn")).toBeTruthy();
  });

  it("shows GENERAL tag on the general's character card", () => {
    renderUnitAssignmentScreen(army);
    const cards = [...getApp().querySelectorAll("[data-char-id]")];
    const generalCard = cards.find((c) => c.textContent.includes("GENERAL"));
    expect(generalCard).toBeTruthy();
  });

  it("shows BSB tag on the BSB character card", () => {
    renderUnitAssignmentScreen(army);
    const cards = [...getApp().querySelectorAll("[data-char-id]")];
    const bsbCard = cards.find((c) => c.textContent.includes("BSB"));
    expect(bsbCard).toBeTruthy();
  });

  it("shows GENERAL tag on assigned char row after assignment", () => {
    const general = army.units.find((u) => u.isGeneral);
    const unit = army.units.find(
      (u) => !["characters", "lords", "heroes"].includes(u.category),
    );
    saveCharacterAssignments({ [general.id]: unit.id });
    renderUnitAssignmentScreen(army);
    const assignedRow = getApp().querySelector(
      `[data-assigned-char="${general.id}"]`,
    );
    expect(assignedRow.textContent).toContain("GENERAL");
  });
});

describe("Unit Assignment Screen — navigation", () => {
  beforeEach(() => {
    saveCharacterAssignments({});
    registerScreen("setupScreen", renderSetupScreen);
    registerScreen("spellSelectionScreen", renderSpellSelectionScreen);
    registerScreen("scenarioSetupScreen", renderScenarioSetupScreen);
  });

  it("prev-btn navigates to spell selection when army has casters", () => {
    const army = loadArmy("dark-elves");
    renderUnitAssignmentScreen(army);
    getApp().querySelector("#prev-btn").click();
    expect(getApp().textContent).toContain("Select Spells");
  });

  it("prev-btn navigates to setup screen when army has no casters", () => {
    const army = loadArmy("forest-goblins");
    if (getCasters(army).length === 0) {
      renderUnitAssignmentScreen(army);
      getApp().querySelector("#prev-btn").click();
      expect(getApp().querySelector("#start-game-btn")).toBeTruthy();
    }
  });

  it("next-btn navigates to scenario setup", () => {
    const army = loadArmy("dark-elves");
    renderUnitAssignmentScreen(army);
    getApp().querySelector("#next-btn").click();
    expect(getApp().textContent).toContain("Scenario Setup");
  });
});
