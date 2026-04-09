import { describe, it, expect, beforeEach } from "vitest";
import { renderUnitAssignmentScreen } from "../../screens/unit-assignment.js";
import { saveCharacterAssignments } from "../../state.js";
import { getApp, loadArmy } from "../helpers.js";

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

  it("save button exists", () => {
    renderUnitAssignmentScreen(army);
    expect(getApp().querySelector("#save-assignments-btn")).toBeTruthy();
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
});
