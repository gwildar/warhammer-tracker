import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderSetupScreen } from "../../screens/setup.js";
import { renderSpellSelectionScreen } from "../../screens/spell-selection-screen.js";
import { loadArmy, getApp } from "../helpers.js";
import * as Nav from "../../navigate.js";
import { displayUnitName } from "../../utils/unit-name.js";
import { getDisplayMode, saveDisplayMode } from "../../state.js";

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
        expect(text).toContain(displayUnitName(unit.name, unit.strength));
      }
    });

    it("shows mounts", () => {
      renderSetupScreen();
      const text = getApp().textContent;
      const mountedUnits = army.units.filter((u) => u.mount);
      expect(mountedUnits.length).toBeGreaterThan(0);
      for (const unit of mountedUnits) {
        expect(text).toContain(unit.mount.name);
      }
    });

    it("navigates to spell selection for casters", () => {
      vi.spyOn(Nav, "navigate").mockImplementation(() => {});
      renderSetupScreen();
      getApp().querySelector("#start-game-btn").click();
      expect(Nav.navigate).toHaveBeenCalledWith("/spell-selection");
      vi.restoreAllMocks();
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
      const baron = army.units.find((u) => u.mount?.name === "Hippogryph");
      expect(baron).toBeTruthy();
      expect(baron.points).toBe(346);
    });

    it("shows mount option points on setup screen", () => {
      renderSetupScreen();
      expect(getApp().textContent).toContain("346pts");
    });
  });

  describe("start game navigation", () => {
    beforeEach(() => {
      loadArmy("bretonnia");
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("navigates to spell selection on new game for army with casters", () => {
      vi.spyOn(Nav, "navigate").mockImplementation(() => {});
      renderSetupScreen();
      getApp().querySelector("#start-game-btn").click();
      // bretonnia has casters — goes to spell selection first
      expect(Nav.navigate).toHaveBeenCalledWith("/spell-selection");
    });
  });

  describe("display mode settings", () => {
    it("shows settings button", () => {
      renderSetupScreen();
      expect(getApp().querySelector("#settings-btn")).toBeTruthy();
    });

    it("settings modal contains Standard and Lightweight buttons", () => {
      renderSetupScreen();
      expect(getApp().querySelector("#settings-modal")).toBeTruthy();
      expect(getApp().querySelector("#mode-standard")).toBeTruthy();
      expect(getApp().querySelector("#mode-lightweight")).toBeTruthy();
    });

    it("clicking Lightweight saves mode", () => {
      renderSetupScreen();
      getApp().querySelector("#mode-lightweight").click();
      expect(getDisplayMode()).toBe("lightweight");
    });

    it("clicking Standard saves mode", () => {
      saveDisplayMode("lightweight");
      renderSetupScreen();
      getApp().querySelector("#mode-standard").click();
      expect(getDisplayMode()).toBe("standard");
    });
  });
});

describe("Setup Screen — Skeleton Horde army (Casket of Souls)", () => {
  it("spell selection screen shows bound spells without checkboxes for the Casket", () => {
    const army = loadArmy("mc-skeleton-horde");
    renderSpellSelectionScreen(army);
    expect(getApp().textContent).toContain("Light of Death");
    expect(getApp().textContent).toContain("Light of Protection");
    expect(getApp().textContent).toContain("Bound Spells");
  });
});

describe("Spell Selection Screen — navigation", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has a prev-btn that navigates back to setup screen", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderSpellSelectionScreen(army);
    getApp().querySelector("#prev-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/setup");
  });

  it("has a next-btn that navigates to unit assignment", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderSpellSelectionScreen(army);
    getApp().querySelector("#next-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/unit-assignment");
  });
});
