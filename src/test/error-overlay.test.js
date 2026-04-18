import { describe, it, expect, beforeEach, vi } from "vitest";
import { showErrorOverlay } from "../error-overlay.js";
import * as state from "../state.js";

function getOverlay() {
  return document.getElementById("error-overlay");
}

describe("showErrorOverlay", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.spyOn(state, "clearAll").mockImplementation(() => {});
  });

  it("inserts an overlay into the document", () => {
    showErrorOverlay(new Error("something went wrong"));
    expect(getOverlay()).toBeTruthy();
  });

  it("shows the error message", () => {
    showErrorOverlay(new Error("something went wrong"));
    expect(getOverlay().textContent).toContain("something went wrong");
  });

  it("has a restart button", () => {
    showErrorOverlay(new Error("any error"));
    expect(getOverlay().querySelector("[data-action='restart']")).toBeTruthy();
  });

  it("calls clearAll when restart is clicked", () => {
    showErrorOverlay(new Error("any error"));
    getOverlay().querySelector("[data-action='restart']").click();
    expect(state.clearAll).toHaveBeenCalled();
  });

  it("removes existing overlay before adding a new one", () => {
    showErrorOverlay(new Error("first"));
    showErrorOverlay(new Error("second"));
    expect(document.querySelectorAll("#error-overlay").length).toBe(1);
  });
});
