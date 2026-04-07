/**
 * Converter from OWB (.owb.json) export format to canonical army schema.
 * This is a refactored version of the logic from army.js, adapted to return
 * the enriched canonical schema instead of the intermediate parsed format.
 */

import { UNIT_STATS } from "../data/units.js";
import { LORES } from "../data/spells.js";

// Build a map from lore display name → lore key
const LORE_NAME_TO_KEY = {};
for (const [key, lore] of Object.entries(LORES)) {
  LORE_NAME_TO_KEY[lore.name.toLowerCase()] = key;
}
import {
  resolveWeapons,
  resolveShootingWeapons,
  resolveMagicItems,
  resolveSpecialRules,
  resolveMount,
  computeArmourSave,
  computeWard,
  computeRegen,
  computeMR,
  computePoisonedAttacks,
  computeStomp,
  computeImpactHits,
} from "./resolve.js";
import { ARMY_COMPOSITIONS } from "../data/army-compositions.js";
import { MAGIC_ITEMS } from "../data/magic-items.js";

const MAGIC_ITEM_NAMES = new Set(MAGIC_ITEMS.map((i) => i.name.toLowerCase()));

function formatFaction(armySlug) {
  if (!armySlug) return "Unknown Faction";
  return armySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Calculate unit points from OWB raw data
 */
function calculateUnitPoints(raw) {
  let pts = (raw.points || 0) * (raw.strength || 1);

  const addActivePoints = (items, recurse = false) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (item.active && item.points) {
        pts += item.perModel ? item.points * (raw.strength || 1) : item.points;
      }
      if (recurse && item.active && Array.isArray(item.options)) {
        addActivePoints(item.options, true);
      }
    }
  };

  addActivePoints(raw.equipment);
  addActivePoints(raw.armor);
  addActivePoints(raw.options, true);
  addActivePoints(raw.mounts);

  // Mount options (e.g. barding)
  if (Array.isArray(raw.mounts)) {
    for (const mount of raw.mounts) {
      if (mount.active) {
        addActivePoints(mount.options);
      }
    }
  }

  if (Array.isArray(raw.command)) {
    for (const cmd of raw.command) {
      if (cmd.active) {
        if (cmd.points) pts += cmd.points;
        if (Array.isArray(cmd.magic?.selected)) {
          for (const item of cmd.magic.selected) {
            pts += item.points || 0;
          }
        }
      }
    }
  }

  if (Array.isArray(raw.items)) {
    for (const slot of raw.items) {
      if (Array.isArray(slot.selected)) {
        for (const item of slot.selected) {
          pts += (item.points || 0) * (item.amount || 1);
        }
      }
    }
  }

  return pts;
}

/**
 * Parse a single unit from OWB export format to canonical unit
 */
function parseCanonicalUnit(raw, category) {
  // Core identity
  const id = raw.id || "unknown";
  const strength = raw.strength || 1;

  // Gather equipment and armour strings
  const equipment = [];
  const armour = [];

  if (Array.isArray(raw.equipment)) {
    for (const e of raw.equipment) {
      if (e.active) equipment.push(e.name_en);
    }
  }

  if (Array.isArray(raw.armor)) {
    for (const a of raw.armor) {
      if (a.active) armour.push(a.name_en);
    }
  }

  if (Array.isArray(raw.options)) {
    for (const opt of raw.options) {
      if (opt.active) equipment.push(opt.name_en);
    }
  }

  // Gather special rules text
  let specialRulesText = raw.specialRules?.name_en || "";

  // Gather magic items from various sources
  const magicItemNames = [];

  // From items slots
  if (Array.isArray(raw.items)) {
    for (const slot of raw.items) {
      if (Array.isArray(slot.selected)) {
        for (const item of slot.selected) {
          magicItemNames.push(item.name_en);
        }
      }
    }
  }

  // From equipment (named characters)
  const gearParts = [...equipment, ...armour].flatMap((e) =>
    e.split(",").map((s) => s.trim())
  );
  for (const part of gearParts) {
    if (MAGIC_ITEM_NAMES.has(part.toLowerCase())) {
      magicItemNames.push(part);
    }
  }

  // From command group magic
  const commandItemNames = new Set();
  if (Array.isArray(raw.command)) {
    for (const cmd of raw.command) {
      if (cmd.active && Array.isArray(cmd.magic?.selected)) {
        for (const mi of cmd.magic.selected) {
          magicItemNames.push(`${mi.name_en} (${cmd.name_en})`);
          commandItemNames.add(mi.name_en.toLowerCase());
        }
      }
    }
  }

  // Look up stats (fallback to UNIT_STATS if not in profile)
  let stats = raw.profile?.stats || [];
  if (!stats || stats.length === 0) {
    // Try to look up in UNIT_STATS by id or slug
    const baseId = id.split(".")[0];
    const slugFromName = raw.name_en?.toLowerCase().replace(/\s+/g, "-");

    const keyToTry = [
      baseId,
      baseId.replace(/s$/, ""),  // Try singular form (remove trailing 's')
      baseId + "s",
      slugFromName,
      slugFromName?.replace(/s$/, ""),  // Try singular form of name slug
    ];

    for (const key of keyToTry) {
      if (key && UNIT_STATS[key]) {
        stats = UNIT_STATS[key];
        break;
      }
    }
  }

  // Resolve weapons and items
  const weapons = resolveWeapons(equipment, magicItemNames);
  const shootingWeapons = resolveShootingWeapons([...equipment, specialRulesText || ""]);
  const magicItems = resolveMagicItems(magicItemNames).map((item) =>
    commandItemNames.has(item.name.toLowerCase()) ? { ...item, championOnly: true } : item
  );
  const specialRules = resolveSpecialRules(specialRulesText);

  // Find the active mount (if any)
  let mountName = null;
  if (Array.isArray(raw.mounts)) {
    const activeMount = raw.mounts.find((m) => m.active);
    if (activeMount && activeMount.name_en !== "On foot") {
      mountName = activeMount.name_en;
    }
  }
  const mount = resolveMount(mountName);

  // Compute saves
  const armourSave = computeArmourSave(equipment, armour, magicItems, mount, specialRules, stats);
  const ward = computeWard(magicItems, specialRules);
  const regen = computeRegen(magicItems, specialRules);
  const magicResistance = computeMR(magicItems, specialRules);
  const poisonedAttacks = computePoisonedAttacks(specialRules);
  const stomp = computeStomp(mount, specialRules);
  const impactHits = computeImpactHits(mount, specialRules);

  // Command group flags
  const isGeneral = raw.command?.some((cmd) => cmd.active && cmd.name_en?.toLowerCase() === "general") || false;
  const isBSB = raw.command?.some((cmd) => cmd.active && cmd.name_en?.toLowerCase() === "battle standard bearer") || false;
  const hasStandard = raw.command?.some(
    (cmd) => cmd.active && cmd.name_en?.toLowerCase().includes("standard bearer")
  ) || false;
  const hasMusician = raw.command?.some(
    (cmd) => cmd.active && cmd.name_en?.toLowerCase().includes("musician")
  ) || false;

  // Caster check and faction lores extraction
  const lores = raw.lores || [];
  const isCaster = lores.length > 0;

  // Extract faction lores from special rules
  const factionLores = [];
  if (specialRulesText) {
    const rules = specialRulesText.split(",").map((r) => r.trim());
    for (const rule of rules) {
      const cleaned = rule
        .replace(/\s*\{[^}]*\}/g, "")
        .replace(/\*$/, "")
        .trim()
        .toLowerCase();
      if (LORE_NAME_TO_KEY[cleaned] && !factionLores.includes(LORE_NAME_TO_KEY[cleaned])) {
        factionLores.push(LORE_NAME_TO_KEY[cleaned]);
      }
    }
  }

  // Display name: custom name > stat name (singular) > unit name (plural)
  let displayName = raw.name || "";
  if (!displayName && stats?.[0]) {
    displayName = stats[0].Name;
  }
  if (!displayName) {
    displayName = raw.name_en || "Unit";
  }
  displayName = displayName.replace(/\{renegade\}/g, "").trim();

  // Build canonical unit
  const unit = {
    id,
    name: displayName,
    category,
    strength,
    points: calculateUnitPoints(raw),
    stats,
    weapons,
    shootingWeapons,
    magicItems,
    specialRules,
    mount: mount || null,
    armourSave,
    ward,
    regen,
    magicResistance,
    poisonedAttacks,
    stomp,
    impactHits,
    champions: [], // TODO: parse from stat lines
    crew: [], // TODO: parse from stat lines
    isGeneral,
    isBSB,
    hasStandard,
    hasMusician,
    isCaster,
    lores,
    activeLore: raw.activeLore || null,
    factionLores,
  };

  return unit;
}

/**
 * Convert OWB export JSON to canonical army schema
 */
export function fromOwb(json) {
  const units = [];
  const categories = ["characters", "core", "special", "rare", "mercenaries", "allies", "lords", "heroes"];

  // Parse units from each category
  for (const category of categories) {
    const categoryUnits = json[category];
    if (Array.isArray(categoryUnits)) {
      for (const raw of categoryUnits) {
        const unit = parseCanonicalUnit(raw, category);
        units.push(unit);
      }
    }
  }

  // Apply Army of Infamy composition bonuses if applicable
  const composition = json.armyComposition || "";
  if (composition && ARMY_COMPOSITIONS[composition]) {
    const bonusRules = ARMY_COMPOSITIONS[composition].rules || [];
    for (const bonus of bonusRules) {
      for (const unitId of bonus.unitIds) {
        for (const unit of units) {
          if (unit.id.startsWith(unitId + ".")) {
            // Inject the bonus rule
            const bonusRule = {
              id: null,
              displayName: bonus.rule,
              phases: [],
            };
            if (!unit.specialRules.some((r) => r.displayName === bonus.rule)) {
              unit.specialRules.push(bonusRule);
            }
          }
        }
      }
    }
  }

  // Build canonical army
  const army = {
    name: json.name || "Unknown Army",
    armySlug: json.army || "",
    faction: formatFaction(json.army),
    points: json.points || 0,
    composition: composition || null,
    units,
  };

  return army;
}
