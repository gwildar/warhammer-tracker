import { describe, it, expect } from "vitest";
import { loadArmy } from "./helpers.js";

describe("wood-elves fixture loads", () => {
  it("loadArmy('wood-elves') returns an army with units", () => {
    const army = loadArmy("wood-elves");
    expect(army.units.length).toBeGreaterThan(0);
  });
});

describe("Beast Pack points include detachment costs", () => {
  it("Beast Pack with 1 Deepwood Hound costs 19 pts (11 keeper + 8 hound)", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    expect(pack).toBeDefined();
    expect(pack.points).toBe(19);
  });
});

describe("Beast Pack canonical unit has parsed detachments", () => {
  it("unit.detachments contains one Deepwood Hound entry", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    expect(pack.detachments).toHaveLength(1);
    const hound = pack.detachments[0];
    expect(hound.id).toBe("deepwood-hounds.klifrac");
    expect(hound.name).toBe("Deepwood Hound");
    expect(hound.strength).toBe(1);
    expect(hound.points).toBe(8);
  });

  it("detachment has resolved stats from units.js", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    const hound = pack.detachments[0];
    expect(hound.stats).toHaveLength(1);
    expect(hound.stats[0].Name).toBe("Deepwood Hound");
    expect(hound.stats[0].M).toBe("9");
    expect(hound.stats[0].A).toBe("1");
  });

  it("detachment has resolved weapons", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    const hound = pack.detachments[0];
    expect(hound.weapons.length).toBeGreaterThan(0);
    expect(hound.weapons[0].name).toBe("Hand Weapon");
  });

  it("detachment has resolved specialRules", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    const hound = pack.detachments[0];
    const ruleIds = hound.specialRules.map((r) => r.id);
    expect(ruleIds).toContain("skirmishers");
  });

  it("units without detachments have an empty detachments array", () => {
    const army = loadArmy("wood-elves");
    const gladeLord = army.units.find((u) => u.id.startsWith("glade-lord"));
    expect(gladeLord.detachments).toEqual([]);
  });
});
