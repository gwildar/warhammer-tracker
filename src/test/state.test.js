import { describe, it, expect, beforeEach } from "vitest";
import {
  saveCharacterAssignments,
  getCharacterAssignments,
  clearArmy,
  getDeploymentTime,
  saveDeploymentTime,
  resetGame,
} from "../state.js";

describe("character assignments state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to empty object", () => {
    expect(getCharacterAssignments()).toEqual({});
  });

  it("saves and loads assignments", () => {
    saveCharacterAssignments({ "duke.abc": "knights.xyz" });
    expect(getCharacterAssignments()).toEqual({ "duke.abc": "knights.xyz" });
  });

  it("clearArmy removes assignments", () => {
    saveCharacterAssignments({ "duke.abc": "knights.xyz" });
    clearArmy();
    expect(getCharacterAssignments()).toEqual({});
  });
});

describe("deployment time state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to null", () => {
    expect(getDeploymentTime()).toBeNull();
  });

  it("saves and loads deployment time", () => {
    saveDeploymentTime(72000);
    expect(getDeploymentTime()).toBe(72000);
  });

  it("resetGame clears deployment time", () => {
    saveDeploymentTime(72000);
    resetGame();
    expect(getDeploymentTime()).toBeNull();
  });
});
