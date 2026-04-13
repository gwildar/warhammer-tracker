import { describe, it, expect } from "vitest";
import { parseArmyList } from "../army.js";
import fixture from "./fixtures/dark-elves.new-recruit.json";

describe("New Recruit import", () => {
  it("detects sorceress as caster", () => {
    const army = parseArmyList(fixture);
    const sorceress = army.units.find((u) =>
      u.name.toLowerCase().includes("sorceress"),
    );
    expect(sorceress.isCaster).toBe(true);
  });

  it("sets lores to lore keys, not spell names", () => {
    const army = parseArmyList(fixture);
    const sorceress = army.units.find((u) =>
      u.name.toLowerCase().includes("sorceress"),
    );
    expect(sorceress.lores).toContain("daemonology");
    expect(sorceress.lores).not.toContain("Steed of Shadows");
    expect(sorceress.lores).not.toContain("Gathering Darkness");
  });

  it("calculates unit points by summing nested costs", () => {
    const army = parseArmyList(fixture);
    const sorceress = army.units.find((u) =>
      u.name.toLowerCase().includes("sorceress"),
    );
    expect(sorceress.points).toBe(500);
  });

  it("sets activeLore to the chosen lore key", () => {
    const army = parseArmyList(fixture);
    const sorceress = army.units.find((u) =>
      u.name.toLowerCase().includes("sorceress"),
    );
    expect(sorceress.activeLore).toBe("daemonology");
  });

  it("resolves mount for Dark Riders (Dark Steed, M9)", () => {
    const army = parseArmyList(fixture);
    const darkRiders = army.units.find((u) => u.name === "Dark Riders");
    expect(darkRiders.mount).not.toBeNull();
    expect(darkRiders.mount.m).toBe(9);
  });

  it("does not set owbId on New Recruit armies", () => {
    const army = parseArmyList(fixture);
    expect(army.owbId).toBeFalsy();
  });
});
