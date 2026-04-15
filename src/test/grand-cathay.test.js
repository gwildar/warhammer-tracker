import { describe, it, expect, beforeEach } from "vitest";
import { loadArmy } from "./helpers.js";

describe("Grand Cathay — army parsing", () => {
  let army;

  beforeEach(() => {
    army = loadArmy("grand-cathay");
  });

  // ── Caster detection ─────────────────────────────────────────────────

  it("Shugengan Lord is detected as a caster", () => {
    const unit = army.units.find((u) => u.name === "Shugengan Lord");
    expect(unit.isCaster).toBe(true);
  });

  it("Shugengan General is detected as a caster", () => {
    const unit = army.units.find((u) => u.name === "Shugengan General");
    expect(unit.isCaster).toBe(true);
  });

  it("Astromancer is detected as a caster", () => {
    const unit = army.units.find((u) => u.name === "Astromancer");
    expect(unit.isCaster).toBe(true);
  });

  // ── Magic item resolution ─────────────────────────────────────────────

  it("Shugengan Lord has The Monkey King's Wisdom", () => {
    const lord = army.units.find((u) => u.name === "Shugengan Lord");
    expect(
      lord.magicItems.some((i) => i.name === "The Monkey King's Wisdom"),
    ).toBe(true);
  });

  it("Shugengan Lord has Scrolls of Wei-jin", () => {
    const lord = army.units.find((u) => u.name === "Shugengan Lord");
    expect(lord.magicItems.some((i) => i.name === "Scrolls of Wei-jin")).toBe(
      true,
    );
  });

  it("Shugengan General has Ring of Jet", () => {
    const general = army.units.find((u) => u.name === "Shugengan General");
    expect(general.magicItems.some((i) => i.name === "Ring of Jet")).toBe(true);
  });

  it("Astromancer has Ruby Ring of Ruin", () => {
    const astromancer = army.units.find((u) => u.name === "Astromancer");
    expect(
      astromancer.magicItems.some((i) => i.name === "Ruby Ring of Ruin"),
    ).toBe(true);
  });

  it("Jade Warriors standard bearer has Icon of Heavenly Fury", () => {
    const jadeWarriors = army.units.filter((u) => u.name === "Jade Warrior");
    expect(
      jadeWarriors.some((u) =>
        u.magicItems.some((i) => i.name === "Icon of Heavenly Fury"),
      ),
    ).toBe(true);
  });

  // ── Unit stat resolution ──────────────────────────────────────────────

  it("Jade Warriors resolve stats (WS4, S3, T3)", () => {
    const unit = army.units.find((u) => u.name === "Jade Warrior");
    const profile = unit.stats.find((s) => s.Name === "Jade Warrior");
    expect(profile).toBeDefined();
    expect(profile.WS).toBe("4");
    expect(profile.S).toBe("3");
    expect(profile.T).toBe("3");
  });

  it("Shugengan Lord resolves as a crewed unit with Great Spirit Longma", () => {
    const lord = army.units.find((u) => u.name === "Shugengan Lord");
    const hasLord = lord.stats.some((s) => s.Name === "Shugengan Lord");
    const hasMount = lord.stats.some((s) => s.Name === "Great Spirit Longma");
    expect(hasLord).toBe(true);
    expect(hasMount).toBe(true);
  });

  it("Sky Lantern resolves as a crewed unit", () => {
    const unit = army.units.find((u) => u.name === "Sky Lantern");
    expect(unit.stats.length).toBeGreaterThan(1);
    expect(unit.stats.some((s) => s.Name === "Sky Lantern")).toBe(true);
  });

  it("Cathayan Grand Cannon resolves as a crewed unit", () => {
    const unit = army.units.find((u) => u.name === "Grand Cannon");
    expect(unit.stats.some((s) => s.Name === "Grand Cannon")).toBe(true);
    expect(
      unit.stats.some((s) => s.Name === "Cathayan Artillery Crew (x3)"),
    ).toBe(true);
  });

  // ── Army total ────────────────────────────────────────────────────────

  it("army total points equal 2000", () => {
    expect(army.points).toBe(2000);
  });
});
