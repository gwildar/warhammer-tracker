import { describe, it, expect } from "vitest";
import { parseArmyList } from "../army.js";
import darkElvesJson from "./fixtures/dark-elves.owb.json";
import bretonniaChargeJson from "./fixtures/bretonnia-charge.owb.json";
import lizardmenJson from "./fixtures/lizardmen.owb.json";

describe("Unit name resolution", () => {
  it("uses custom name for named characters", () => {
    const army = parseArmyList(bretonniaChargeJson);
    const baron = army.units.find((u) => u.mount === "Hippogryph");
    expect(baron.name).toBe("Baron Guy de Bastille");
  });

  it("uses singular stat name for units without custom names", () => {
    const army = parseArmyList(darkElvesJson);
    const medusa = army.units.find((u) => u.id.startsWith("bloodwrack-medusa"));
    expect(medusa).toBeTruthy();
    expect(medusa.name).toBe("Bloodwrack Medusa");
  });

  it("strips {renegade} from unit names", () => {
    const army = parseArmyList(lizardmenJson);
    const slann = army.units.find((u) => u.id.startsWith("slann"));
    expect(slann).toBeTruthy();
    expect(slann.name).not.toContain("{");
    expect(slann.name).not.toContain("renegade");
  });

  it("uses stat name for rank and file units", () => {
    const army = parseArmyList(bretonniaChargeJson);
    const squires = army.units.filter((u) => u.id.startsWith("squires"));
    expect(squires.length).toBeGreaterThan(0);
    expect(squires[0].name).toBe("Squire");
  });
});
