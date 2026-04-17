import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderFirstTurnScreen } from "../../screens/first-turn.js";
import { loadArmy, getApp } from "../helpers.js";
import * as Nav from "../../navigate.js";

describe("First Turn Screen", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("dark-elves");
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows "Who goes first?" heading', () => {
    renderFirstTurnScreen(army);
    expect(getApp().textContent).toContain("Who goes first?");
  });

  it("shows army name", () => {
    renderFirstTurnScreen(army);
    expect(getApp().textContent).toContain(army.name);
  });

  it("shows You and Opponent buttons", () => {
    renderFirstTurnScreen(army);
    expect(getApp().querySelector("#first-you-btn")).toBeTruthy();
    expect(getApp().querySelector("#first-opponent-btn")).toBeTruthy();
    expect(getApp().querySelector("#first-you-btn").textContent.trim()).toBe(
      "You",
    );
    expect(
      getApp().querySelector("#first-opponent-btn").textContent.trim(),
    ).toBe("Opponent");
  });

  it("shows Round 1", () => {
    renderFirstTurnScreen(army);
    expect(getApp().textContent).toContain("Round 1");
  });

  it("has a prev-btn that navigates back to deployment", () => {
    vi.spyOn(Nav, "navigate").mockImplementation(() => {});
    renderFirstTurnScreen(army);
    expect(getApp().querySelector("#prev-btn")).toBeTruthy();
    getApp().querySelector("#prev-btn").click();
    expect(Nav.navigate).toHaveBeenCalledWith("/deployment");
  });
});
