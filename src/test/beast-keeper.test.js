import { describe, it, expect } from "vitest";
import { loadArmy } from "./helpers.js";
import { renderMovementStatsContext } from "../context/movement.js";
import { saveCharacterAssignments } from "../state.js";

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

describe("Beast Pack unit strength includes detachments", () => {
  it("Beast Pack (RI, US 1) + 1 Deepwood Hound (WB, US 1) = unitStrength 2", () => {
    const army = loadArmy("wood-elves");
    const pack = army.units.find(
      (u) => u.id === "wood-elf-beast-pack.jpyafkrs",
    );
    expect(pack).toBeDefined();
    expect(pack.unitStrength).toBe(2);
  });
});

describe("Beast Pack movement uses majority M (Run with the Pack)", () => {
  it("shows beast M when beasts outnumber keepers", () => {
    saveCharacterAssignments({});
    const packUnit = {
      id: "wood-elf-beast-pack.test",
      name: "Wood Elf Beast Pack",
      category: "rare",
      strength: 1,
      mount: null,
      stats: [
        { M: "5", Name: "Beast Keeper", troopType: ["RI"], crewed: false },
      ],
      detachments: [
        {
          id: "deepwood-hounds.test",
          strength: 2,
          stats: [{ M: "9", Name: "Deepwood Hound", troopType: ["WB"] }],
        },
      ],
      specialRules: [],
    };
    const html = renderMovementStatsContext({ units: [packUnit] });
    expect(html).toContain('9"');
    expect(html).toContain("March 18");
  });

  it("keeps keeper M when beasts do not outnumber keepers", () => {
    saveCharacterAssignments({});
    const packUnit = {
      id: "wood-elf-beast-pack.test2",
      name: "Wood Elf Beast Pack",
      category: "rare",
      strength: 1,
      mount: null,
      stats: [
        { M: "5", Name: "Beast Keeper", troopType: ["RI"], crewed: false },
      ],
      detachments: [
        {
          id: "deepwood-hounds.test2",
          strength: 1,
          stats: [{ M: "9", Name: "Deepwood Hound", troopType: ["WB"] }],
        },
      ],
      specialRules: [],
    };
    const html = renderMovementStatsContext({ units: [packUnit] });
    expect(html).toContain('5"');
    expect(html).toContain("March 10");
  });
});
