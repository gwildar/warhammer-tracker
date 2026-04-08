import { COMBAT_WEAPONS, RANGED_WEAPONS } from "../data/weapons.js";
import { MAGIC_ITEMS } from "../data/magic-items.js";
import { SPECIAL_RULES } from "../data/special-rules.js";
import { UNIT_STATS } from "../data/units.js";

// Maps canonical mount name (lowercase) → units.js key.
// Used for mounts whose slug doesn't directly match a units.js key.
const MOUNT_KEY_OVERRIDES = {
  griffon: "griffon-empire",
  manticore: "manticore-dark-elves",
  "skeletal steed": "skeletal-steed-vampire-counts",
};

function resolveMountProfile(entry) {
  return Array.isArray(entry)
    ? entry
    : entry.stats.map((s) => ({ ...entry.shared, ...s }));
}

function parseBonusInt(val) {
  return parseInt(String(val ?? "").match(/\(\+(\d+)\)/)?.[1] ?? "0", 10);
}

export function findMount(name) {
  if (!name) return null;
  if (typeof name === "object") return name;

  const lower = name.toLowerCase();
  const key = MOUNT_KEY_OVERRIDES[lower] ?? lower.replace(/\s+/g, "-");
  const entry = UNIT_STATS[key];
  if (!entry) return null;

  const profile = resolveMountProfile(entry)[0];
  if (!profile) return null;

  const armourBaneRule = profile.rules?.find((r) => /^Armour Bane/i.test(r));
  const armourBane = armourBaneRule
    ? parseInt(armourBaneRule.match(/\((\d+)/)?.[1] ?? "0", 10)
    : null;

  return {
    name: profile.Name,
    m: parseInt(profile.M, 10),
    stomp: profile.Stomps ?? null,
    impactHits: profile["Impact-Hits"] ?? null,
    tBonus: parseBonusInt(profile.T),
    wBonus: parseBonusInt(profile.W),
    ws: profile.WS,
    s: profile.S,
    i: profile.I,
    a: profile.A,
    as: profile.as ?? null,
    weapons: (profile.equipment ?? []).map((e) => e.toLowerCase()),
    swiftstride:
      profile.rules?.some((r) => r.toLowerCase() === "swiftstride") ?? false,
    troopType: profile.troopType?.[0] ?? null,
    armourBane,
  };
}

/**
 * Normalize an item name for lookup in MAGIC_ITEM_MAP
 */
export function normaliseItemName(name) {
  return name
    .replace(/\s*\(.*$/, "")
    .toLowerCase()
    .replace(/\*$/, "");
}

/**
 * Build a lookup map from magic item names (lowercase) → item data
 */
export function buildMagicItemMap() {
  const map = {};
  for (const item of MAGIC_ITEMS) {
    map[item.name.toLowerCase()] = item;
  }
  return map;
}

const MAGIC_ITEM_MAP = buildMagicItemMap();

/**
 * Resolve combat weapons from equipment strings
 * @param {string[]} equipmentStrings - e.g. ["Hand weapon", "Lance", "Shield"]
 * @param {string[]} magicItemNames - magic item names that may include weapons
 * @returns {object[]} - array of resolved weapon objects
 */
export function resolveWeapons(equipmentStrings, magicItemNames) {
  const weapons = [];
  const seen = new Set();

  // Check for magic weapons first (skip champion-only items)
  for (const itemName of magicItemNames) {
    if (itemName.toLowerCase().includes("(champion)")) continue;
    const cleanName = normaliseItemName(itemName);
    const mi = MAGIC_ITEM_MAP[cleanName];
    if (mi?.type === "weapon" && mi.s && mi.phases?.includes("combat")) {
      const weapon = {
        name: mi.name,
        s: mi.s,
        ap: mi.ap || "—",
        rules: mi.effect || "",
        magical: true,
        attacks: mi.attacks || null,
        reservedAttacks: mi.reservedAttacks || null,
      };
      weapons.push(weapon);
      seen.add(mi.name);
      return weapons; // Magic weapon replaces mundane weapons
    }
  }

  // Then check equipment strings for mundane weapons
  for (const equipStr of equipmentStrings) {
    const lower = equipStr.toLowerCase();
    for (const [key, weapon] of Object.entries(COMBAT_WEAPONS)) {
      if (lower.includes(key) && !seen.has(weapon.name)) {
        seen.add(weapon.name);
        weapons.push({
          name: weapon.name,
          s: weapon.s,
          ap: weapon.ap || "—",
          rules: weapon.rules || "",
          magical: false,
          attacks: weapon.attacks || null,
          reservedAttacks: weapon.reservedAttacks || null,
        });
      }
    }
  }

  // Default to hand weapon if nothing matched
  if (weapons.length === 0) {
    weapons.push({
      name: "Hand Weapon",
      s: "S",
      ap: "—",
      rules: "",
      magical: false,
      attacks: null,
      reservedAttacks: null,
    });
  }

  return weapons;
}

/**
 * Resolve shooting weapons from equipment strings
 * @param {string[]} equipmentStrings
 * @returns {object[]} - array of resolved ranged weapon objects
 */
export function resolveShootingWeapons(equipmentStrings) {
  const weapons = [];
  const seen = new Set();

  for (const equipStr of equipmentStrings) {
    const lower = equipStr.toLowerCase();
    for (const [key, weapon] of Object.entries(RANGED_WEAPONS)) {
      if (lower.includes(key) && !seen.has(weapon.name)) {
        seen.add(weapon.name);
        weapons.push({
          name: weapon.name,
          range: weapon.range,
          s: weapon.s,
          ap: weapon.ap || "—",
          rules: weapon.rules || "",
          magical: false,
          attacks: weapon.attacks || null,
        });
      }
    }
  }

  return weapons;
}

/**
 * Resolve magic items by name
 * @param {string[]} itemNames - magic item names
 * @returns {object[]} - array of full magic item objects
 */
export function resolveMagicItems(itemNames) {
  const items = [];

  for (const name of itemNames) {
    const cleanName = normaliseItemName(name);
    const mi = MAGIC_ITEM_MAP[cleanName];
    if (mi) {
      items.push(mi);
    }
  }

  return items;
}

/**
 * Resolve special rules from a comma-separated rules string
 * @param {string} rulesString - e.g. "Killing Blow, Hatred (Elves), Armoured Hide (1)"
 * @returns {object[]} - array of resolved rule objects
 */
export function resolveSpecialRules(rulesString) {
  if (!rulesString || !rulesString.trim()) return [];

  const rules = [];
  const parts = rulesString.split(",").map((s) => s.trim());

  for (const part of parts) {
    // Try to find in SPECIAL_RULES by id or alias
    let found = null;

    for (const rule of SPECIAL_RULES) {
      if (rule.id === part.toLowerCase()) {
        found = rule;
        break;
      }
      if (
        rule.aliases?.some(
          (alias) => alias.toLowerCase() === part.toLowerCase(),
        )
      ) {
        found = rule;
        break;
      }
    }

    if (found) {
      rules.push(found);
    } else {
      // Keep unrecognised rules as bare entries
      rules.push({
        id: null,
        displayName: part,
        phases: [],
      });
    }
  }

  return rules;
}

/**
 * Resolve a mount by name
 * @param {string} mountName
 * @returns {object|null} - full mount object or null
 */
export function resolveMount(mountName) {
  if (!mountName) return null;
  return findMount(mountName);
}

/**
 * Compute armour save from equipment, armour, magic items, mount, special rules, and stats
 * Based on calculateArmourSave from combat-weapons.js
 */
export function computeArmourSave(
  equipmentStrings,
  armourStrings,
  magicItems,
  mount,
  specialRules,
  stats,
) {
  let baseAS = null;

  // Natural armour save from unit stat line (e.g. Thundertusk AS:5, Bastiladon AS:3)
  if (stats && stats[0]?.AS) {
    baseAS = parseInt(stats[0].AS);
  }

  // Check armour base from armour strings
  for (const armourStr of armourStrings) {
    const lower = armourStr.toLowerCase();
    if (lower.includes("gromril")) {
      if (baseAS === null || 4 < baseAS) baseAS = 4;
      break;
    }
    if (lower.includes("full plate") || lower.includes("chaos armour")) {
      if (baseAS === null || 4 < baseAS) baseAS = 4;
      break;
    }
    if (lower.includes("heavy")) {
      if (baseAS === null || 5 < baseAS) baseAS = 5;
      break;
    }
    if (lower.includes("light")) {
      if (baseAS === null || 6 < baseAS) baseAS = 6;
      break;
    }
  }

  // Apply magic item modifiers
  let modifier = 0;
  for (const item of magicItems) {
    if (item.armourBase !== undefined) {
      if (baseAS === null || item.armourBase < baseAS) baseAS = item.armourBase;
    }
    if (item.armourMod) modifier += item.armourMod;
  }

  // Magic shield bonus (items like Shield of Ghrond that are armour-type with "Shield." effect)
  const hasMagicShield = magicItems.some(
    (item) => item.type === "armour" && item.effect?.startsWith("Shield."),
  );
  if (hasMagicShield) modifier -= 1;

  // Shield bonus from equipment/armour strings
  if (equipmentStrings.some((e) => e.toLowerCase().includes("shield"))) {
    modifier -= 1;
  }
  if (armourStrings.some((a) => a.toLowerCase().includes("shield"))) {
    modifier -= 1;
  }

  // Barding bonus
  if (armourStrings.some((a) => a.toLowerCase().includes("barding"))) {
    modifier -= 1;
  }

  // Armoured Hide from special rules — use displayName regex (rule may be unrecognised)
  for (const rule of specialRules) {
    const match = (rule.displayName || "").match(/Armoured Hide\s*\((\d+)\)/i);
    if (match) {
      if (baseAS === null) {
        // No armour: Armoured Hide alone gives a base save of 7-X
        baseAS = 7 - parseInt(match[1]);
      } else {
        modifier -= parseInt(match[1]);
      }
    }
  }

  if (baseAS === null) return null;
  const finalAS = baseAS + modifier;
  if (finalAS > 6) return "6+";
  if (finalAS < 2) return "2+";
  return `${finalAS}+`;
}

/**
 * Compute ward save from magic items and special rules
 */
export function computeWard(magicItems, specialRules) {
  // Check magic items
  for (const item of magicItems) {
    if (item.ward) return item.ward;
  }

  // Check special rules (e.g. Blessings of the Lady)
  for (const rule of specialRules) {
    if (rule.id === "blessings-of-the-lady") {
      return "6+";
    }
  }

  return null;
}

/**
 * Compute regeneration from magic items and special rules
 */
export function computeRegen(magicItems, specialRules) {
  // Check magic items
  for (const item of magicItems) {
    if (item.regen) return item.regen;
  }

  // Check special rules
  for (const rule of specialRules) {
    if (rule.displayName.match(/Regeneration\s*\((\d\+)\)/i)) {
      const match = rule.displayName.match(/Regeneration\s*\((\d\+)\)/i);
      if (match) return match[1];
    }
  }

  return null;
}

/**
 * Compute magic resistance from magic items and special rules
 */
export function computeMR(magicItems, specialRules) {
  let total = 0;

  // Check magic items
  for (const item of magicItems) {
    if (item.mr) total += parseInt(item.mr);
  }

  // Check special rules
  for (const rule of specialRules) {
    if (rule.id === "magic-resistance") {
      const match = rule.displayName.match(/\((-?\d+)\)/);
      if (match) total += parseInt(match[1]);
    }
  }

  return total !== 0 ? `${total}` : null;
}

const RANGED_WEAPON_NAMES = [
  "javelin",
  "bow",
  "crossbow",
  "handgun",
  "pistol",
  "sling",
  "throwing",
  "bolt thrower",
  "cannon",
  "mortar",
  "catapult",
  "harpoon",
  "breath",
];

/**
 * Compute whether a unit has poisoned attacks for combat (not ranged-only)
 */
export function computePoisonedAttacks(specialRules) {
  for (const rule of specialRules) {
    const match = rule.displayName?.match(
      /Poisoned Attacks(?:\s*\(([^)]+)\))?/i,
    );
    if (!match) continue;
    if (!match[1]) return true;
    const qualifier = match[1].toLowerCase();
    return !RANGED_WEAPON_NAMES.some((w) => qualifier.includes(w));
  }
  return false;
}

/**
 * Compute stomp attacks from mount or special rules
 */
export function computeStomp(mount, specialRules) {
  if (mount?.stomp) return mount.stomp;
  for (const rule of specialRules) {
    const match = rule.displayName?.match(/Stomp Attacks\s*\(([^)]+)\)/i);
    if (match) return match[1];
  }
  return null;
}

/**
 * Compute impact hits from mount or special rules
 */
export function computeImpactHits(mount, specialRules) {
  if (mount?.impactHits) return mount.impactHits;
  for (const rule of specialRules) {
    const match = rule.displayName?.match(/Impact Hits\s*\(([^)]+)\)/i);
    if (match) return match[1];
  }
  return null;
}
