import { findMount } from "./data/mounts.js";
import { fromOwb } from "./parsers/from-owb.js";
import { fromNewRecruit } from "./parsers/from-new-recruit.js";

/**
 * Detect the army list format and delegate to the appropriate converter
 * - OWB format: has "army" and direct category arrays (characters, core, special, etc.)
 * - New Recruit format: has roster.forces nested structure
 */
export function parseArmyList(json) {
  // Detect New Recruit format
  if (json?.roster?.forces && Array.isArray(json.roster.forces)) {
    return fromNewRecruit(json);
  }

  // Detect OWB format
  if (
    json?.army !== undefined ||
    json?.characters !== undefined ||
    json?.core !== undefined
  ) {
    return fromOwb(json);
  }

  throw new Error(
    "Unrecognised army list format. Expected OWB or New Recruit format.",
  );
}

export function getCasters(army) {
  if (!army) return [];
  return army.units.filter((u) => u.isCaster);
}

export function getShootingUnits(army) {
  if (!army) return [];
  return army.units.filter((u) => {
    // Check if unit has resolved shooting weapons
    if (u.shootingWeapons && u.shootingWeapons.length > 0) {
      return true;
    }

    // Check if unit's mount has breath attack
    if (u.mount) {
      const mountData =
        typeof u.mount === "string" ? findMount(u.mount) : u.mount;
      if (mountData?.breath != null) {
        return true;
      }
    }

    return false;
  });
}

export function getMovementUnits(army) {
  if (!army) return [];
  return army.units;
}

export function getCombatUnits(army) {
  if (!army) return [];
  return army.units;
}
