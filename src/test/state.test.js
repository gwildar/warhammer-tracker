import { describe, it, expect, beforeEach } from "vitest";
import {
  saveCharacterAssignments,
  getCharacterAssignments,
  clearArmy,
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
