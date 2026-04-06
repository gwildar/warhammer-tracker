import { describe, it, expect, beforeEach } from "vitest";
import { renderSetupScreen } from "../../screens/setup.js";
import { loadArmy, getApp } from "../helpers.js";

describe("Setup Screen", () => {
  describe("without army", () => {
    it("shows upload section", () => {
      renderSetupScreen();
      const app = getApp();
      expect(app.querySelector("#drop-zone")).toBeTruthy();
      expect(app.querySelector("#file-input")).toBeTruthy();
      expect(app.querySelector("#browse-btn")).toBeTruthy();
    });

    it("shows instructions", () => {
      renderSetupScreen();
      expect(getApp().textContent).toContain("Old World Builder");
      expect(getApp().textContent).toContain(".owb.json");
    });

    it("shows app title", () => {
      renderSetupScreen();
      expect(getApp().textContent).toContain("Turner Overdrive");
    });
  });

  describe("with Dark Elves army", () => {
    let army;

    beforeEach(() => {
      army = loadArmy("dark-elves");
    });

    it("shows army name and faction", () => {
      renderSetupScreen();
      const text = getApp().textContent;
      expect(text).toContain(army.name);
      expect(text).toContain("Dark Elves");
    });

    it("shows total points", () => {
      renderSetupScreen();
      const totalPts = army.units.reduce((sum, u) => sum + u.points, 0);
      expect(getApp().textContent).toContain(`${totalPts} pts`);
    });

    it("shows Start Game button", () => {
      renderSetupScreen();
      expect(getApp().querySelector("#start-game-btn")).toBeTruthy();
      expect(getApp().querySelector("#start-game-btn").textContent.trim()).toBe(
        "Start Game",
      );
    });

    it("shows Replace button", () => {
      renderSetupScreen();
      expect(getApp().querySelector("#replace-army-btn")).toBeTruthy();
    });

    it("lists unit names", () => {
      renderSetupScreen();
      const text = getApp().textContent;
      for (const unit of army.units) {
        expect(text).toContain(unit.name);
      }
    });

    it("shows mounts", () => {
      renderSetupScreen();
      const text = getApp().textContent;
      const mountedUnits = army.units.filter((u) => u.mount);
      expect(mountedUnits.length).toBeGreaterThan(0);
      for (const unit of mountedUnits) {
        expect(text).toContain(unit.mount);
      }
    });

    it("shows spell selection for casters", () => {
      renderSetupScreen();
      const text = getApp().textContent;
      const casters = army.units.filter((u) => u.isCaster);
      if (casters.length > 0) {
        expect(text).toContain("Spell Selection");
      }
    });
  });

  describe("with Lizardmen army", () => {
    beforeEach(() => {
      loadArmy("lizardmen");
    });

    it("shows Lizardmen faction", () => {
      renderSetupScreen();
      expect(getApp().textContent).toContain("Lizardmen");
    });
  });

  describe("with Bretonnia army", () => {
    beforeEach(() => {
      loadArmy("bretonnia");
    });

    it("shows Bretonnia faction", () => {
      renderSetupScreen();
      expect(getApp().textContent).toContain("Bretonnia");
    });
  });

  describe("with Bretonnia charge army", () => {
    let army;

    beforeEach(() => {
      army = loadArmy("bretonnia-charge");
    });

    it("includes mount option points in unit total (barding)", () => {
      const baron = army.units.find((u) => u.mount === "Hippogryph");
      expect(baron).toBeTruthy();
      expect(baron.points).toBe(346);
    });

    it("shows mount option points on setup screen", () => {
      renderSetupScreen();
      expect(getApp().textContent).toContain("346pts");
    });
  });
});
