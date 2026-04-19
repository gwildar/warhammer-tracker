import { COMBAT_WEAPONS, getWeapon } from "../data/weapons.js";

export const HAND_WEAPON = { name: "Hand Weapon", s: "S", ap: "—", rules: [] };

const CHARACTER_CATEGORIES = new Set(["characters", "lords", "heroes"]);

export function isCharacter(unit) {
  return CHARACTER_CATEGORIES.has(unit.category);
}

function findVirtueAttacks(unit) {
  for (const item of unit.magicItems || []) {
    if (
      item.type === "virtue" &&
      item.attacks &&
      item.phases?.includes("combat")
    ) {
      return item.attacks;
    }
  }
  return null;
}

function findMagicWeapon(unit) {
  const virtueAttacks = findVirtueAttacks(unit);
  for (const item of unit.magicItems || []) {
    if (item.championOnly) continue;
    if (
      item.type === "weapon" &&
      (item.s || item.profiles) &&
      item.phases?.includes("combat")
    ) {
      return {
        name: item.name,
        s: item.s,
        ap: item.ap || "—",
        rules: item.effect ? [item.effect] : [],
        attacks: item.attacks || virtueAttacks || null,
        profiles: item.profiles || null,
      };
    }
  }
  return null;
}

export function matchRiderWeapons(unit) {
  const weapons = [];
  const matched = new Set();

  // Magic weapon replaces mundane weapons; multi-profile weapons expand into separate entries
  const magicWeapon = findMagicWeapon(unit);
  if (magicWeapon) {
    if (magicWeapon.profiles) {
      for (const p of magicWeapon.profiles) matched.add(p.name);
      return { weapons: magicWeapon.profiles, matched };
    }
    weapons.push(magicWeapon);
    matched.add(magicWeapon.name);
    return { weapons, matched };
  }

  // In canonical schema, weapons are already resolved
  if (Array.isArray(unit.weapons)) {
    for (const weapon of unit.weapons) {
      if (weapon && !matched.has(weapon.name)) {
        matched.add(weapon.name);
        // Convert resolved weapon to format expected by rest of code
        weapons.push({
          name: weapon.name,
          s: weapon.s || null,
          ap: weapon.ap || "—",
          rules: weapon.rules || [],
          attacks: weapon.attacks || null,
          reservedAttacks: weapon.reservedAttacks || null,
        });
      }
    }
    return { weapons, matched };
  }

  return { weapons, matched };
}

export function matchMountWeapons(unit, alreadyMatched) {
  const weapons = [];
  if (!unit.mount) return weapons;

  const mount = unit.mount;
  if (!mount?.weapons) return weapons;

  for (const wKey of mount.weapons) {
    const weapon = getWeapon(COMBAT_WEAPONS, wKey);
    if (weapon && !alreadyMatched.has(weapon.name)) {
      alreadyMatched.add(weapon.name);
      weapons.push(weapon);
    }
  }

  return weapons;
}
