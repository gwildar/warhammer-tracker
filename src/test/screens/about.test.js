import { describe, it, expect } from "vitest";
import { renderAboutScreen } from "../../screens/about.js";
import { getApp } from "../helpers.js";

describe("About Screen", () => {
  it("shows About heading", () => {
    renderAboutScreen();
    expect(getApp().textContent).toContain("About");
  });

  it("shows disclaimer", () => {
    renderAboutScreen();
    expect(getApp().textContent).toContain("completely unofficial");
    expect(getApp().textContent).toContain("Games Workshop");
  });

  it("shows acknowledgements", () => {
    renderAboutScreen();
    expect(getApp().textContent).toContain("Old World Builder");
    expect(getApp().textContent).toContain(
      "Warhammer: The Old World Online Rules Index",
    );
  });

  it("shows back button", () => {
    renderAboutScreen();
    expect(getApp().querySelector("#back-btn")).toBeTruthy();
  });
});
