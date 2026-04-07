import { describe, it, expect, beforeEach } from "vitest";
import { renderGameScreen } from "../screens/game.js";
import { loadArmy, startGame, getApp } from "./helpers.js";
import { savePhaseIndex } from "../state.js";

describe("Unit Champions", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("bretonnian-exiles");
    startGame(army);
  });

  it("shows both Warden and Grail Monk for Yeomen Guard in combat phase", () => {
    savePhaseIndex(10); // choose-fight
    renderGameScreen(army);
    const combatPanel = getApp().querySelector(".border-wh-phase-combat\\/30");
    const yeomenCard = [...combatPanel.querySelectorAll(".bg-wh-card")].find(
      (el) =>
        el.textContent.toLowerCase().includes("yeoman guard") ||
        el.textContent.toLowerCase().includes("yeomen guard"),
    );
    expect(yeomenCard).toBeTruthy();
    expect(yeomenCard.textContent).toContain("Warden");
    expect(yeomenCard.textContent).toContain("Grail Monk");
  });
});
