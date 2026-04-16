/**
 * Converter from OWB (.owb.json) export format to canonical army schema.
 * This is a refactored version of the logic from army.js, adapted to return
 * the enriched canonical schema instead of the intermediate parsed format.
 */

import { LORE_NAME_TO_KEY } from "../data/spells.js";
import {
  resolveWeapons,
  resolveShootingWeapons,
  resolveMagicItems,
  resolveSpecialRules,
  resolveMount,
  resolveStats,
  deriveSpellSelectionMode,
  computeArmourSave,
  computeWard,
  computeRegen,
  computeMR,
  computePoisonedAttacks,
  computeStomp,
  computeImpactHits,
  computeUnitStrength,
} from "./resolve.js";
import {
  ARMY_COMPOSITIONS,
  ARMY_PHASE_CONFIG,
} from "../data/army-compositions.js";
import { MAGIC_ITEMS } from "../data/magic-items.js";

const MAGIC_ITEM_NAMES = new Set(MAGIC_ITEMS.map((i) => i.name.toLowerCase()));

/** Returns name_en values for all active items in an array (safe if arr is not an array). */
function collectActive(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item) => item.active).map((item) => item.name_en);
}

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
      } else if (item.stackableCount && item.points) {
        pts += item.points * item.stackableCount;
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
          if (item.perModel && item.perModelPoints != null) {
            pts += item.perModelPoints * (raw.strength || 1);
          } else {
            pts += (item.points || 0) * (item.amount || 1);
          }
        }
      }
    }
  }

  // Detachments (e.g. beasts in a Wood Elf Beast Pack)
  for (const det of raw.detachments || []) {
    pts += (det.points || 0) * (det.strength || 1);
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
  const activeOptions = collectActive(raw.options);
  const equipment = [...collectActive(raw.equipment), ...activeOptions];
  const armour = collectActive(raw.armor);

  // Gather special rules text — include active option names so rules like
  // Ambushers, Scouts, The Grail Vow etc. are resolved from the options array
  let specialRulesText = raw.specialRules?.name_en || "";
  if (activeOptions.length > 0) {
    const optionRulesText = activeOptions.join(", ");
    specialRulesText = specialRulesText
      ? `${specialRulesText}, ${optionRulesText}`
      : optionRulesText;
  }

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
    e.split(",").map((s) => s.trim()),
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

  // Look up stats from units.js (source of truth)
  const stats = resolveStats(id, raw.name_en);

  // Resolve weapons and items
  const weapons = resolveWeapons(equipment, magicItemNames);
  const shootingWeapons = resolveShootingWeapons([
    ...equipment,
    specialRulesText || "",
    raw.name_en || "",
  ]);
  const magicItems = resolveMagicItems(magicItemNames).map((item) =>
    commandItemNames.has(item.name.toLowerCase()) && item.type !== "banner"
      ? { ...item, championOnly: true }
      : item,
  );
  let specialRules = resolveSpecialRules(specialRulesText);

  // Inject rules granted by magic items (e.g. Alter Kindred aspects)
  for (const item of magicItems) {
    for (const ruleName of item.grantsRules || []) {
      if (!specialRules.some((r) => r.id === ruleName)) {
        const resolved = resolveSpecialRules(ruleName);
        specialRules.push(...resolved);
      }
    }
  }

  // Remove rules suppressed by magic items (e.g. Da Thinkin' Orc's 'At removes Impetuous)
  const removedRuleIds = new Set(
    magicItems.flatMap((item) => item.removesRules || []),
  );
  if (removedRuleIds.size > 0) {
    specialRules = specialRules.filter((r) => !removedRuleIds.has(r.id));
  }

  const spellSelectionMode = deriveSpellSelectionMode(magicItems, specialRules);

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
  const armourSave = computeArmourSave(
    equipment,
    armour,
    magicItems,
    mount,
    specialRules,
    stats,
  );
  const ward = computeWard(magicItems, specialRules);
  const regen = computeRegen(magicItems, specialRules);
  const magicResistance = computeMR(magicItems, specialRules, stats);
  const poisonedAttacks = computePoisonedAttacks(specialRules);
  const stomp = computeStomp(mount, specialRules);
  const itemImpactHits =
    magicItems.find((item) => item.impactHits)?.impactHits ?? null;
  const impactHits = computeImpactHits(mount, specialRules) ?? itemImpactHits;

  // Command group flags
  const isGeneral =
    raw.command?.some(
      (cmd) => cmd.active && cmd.name_en?.toLowerCase() === "general",
    ) || false;
  const isBSB =
    raw.command?.some(
      (cmd) =>
        cmd.active && cmd.name_en?.toLowerCase() === "battle standard bearer",
    ) || false;
  const hasStandard =
    raw.command?.some(
      (cmd) =>
        cmd.active && cmd.name_en?.toLowerCase().includes("standard bearer"),
    ) || false;
  const hasMusician =
    raw.command?.some(
      (cmd) => cmd.active && cmd.name_en?.toLowerCase().includes("musician"),
    ) || false;

  // Caster check and faction lores extraction
  // These locals drive lore assignment only (see lores derivation below).
  // They are NOT put on the unit — spell selection behaviour is in spellSelectionMode.
  const hasCursedCoven = specialRules.some((r) => r.id === "cursed coven");
  const hasVortexOfSouls = specialRules.some((r) => r.id === "vortex of souls");
  const lores = hasVortexOfSouls
    ? ["vortex-of-souls"]
    : hasCursedCoven
      ? ["dark-magic", "daemonology"]
      : [...(raw.lores || [])];

  // Detect bound spell weapons in equipment (treated as spells, not shooting weapons)
  const equipmentFlat = [...equipment, specialRulesText || ""]
    .join(", ")
    .toLowerCase();
  if (
    equipmentFlat.includes("engine of the gods") &&
    !lores.includes("engine-of-the-gods")
  ) {
    lores.push("engine-of-the-gods");
  }
  if (
    equipmentFlat.includes("solar engine") &&
    !lores.includes("solar-engine")
  ) {
    lores.push("solar-engine");
  }

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
      if (
        LORE_NAME_TO_KEY[cleaned] &&
        !factionLores.includes(LORE_NAME_TO_KEY[cleaned])
      ) {
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
  displayName = displayName.replace(/\{[^}]*\}/g, "").trim();

  // Parse detachments (e.g. beasts in a Wood Elf Beast Pack)
  const detachments = (raw.detachments || []).map((det) => {
    const detEquipment = collectActive(det.equipment);
    const detStats = resolveStats(det.id, det.name_en);
    const detWeapons = resolveWeapons(detEquipment, []);
    const detSpecialRules = resolveSpecialRules(
      det.specialRules?.name_en || "",
    );
    return {
      id: det.id,
      name: det.name_en,
      strength: det.strength || 1,
      points: det.points || 0,
      stats: detStats,
      weapons: detWeapons,
      specialRules: detSpecialRules,
    };
  });

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
    detachments,
    champions: [], // TODO: parse from stat lines
    crew: [], // TODO: parse from stat lines
    isGeneral,
    isBSB,
    hasStandard,
    hasMusician,
    isCaster,
    lores,
    spellSelectionMode,
    activeLore: raw.activeLore || null,
    factionLores,
  };

  unit.unitStrength = computeUnitStrength(unit);
  return unit;
}

/**
 * Convert OWB export JSON to canonical army schema
 */
export function fromOwb(json) {
  const units = [];
  const categories = [
    "characters",
    "core",
    "special",
    "rare",
    "mercenaries",
    "allies",
    "lords",
    "heroes",
  ];

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
  const phaseConfig = ARMY_PHASE_CONFIG[json.army] || {};
  const army = {
    name: json.name || "Unknown Army",
    armySlug: json.army || "",
    faction: formatFaction(json.army),
    points: json.points || 0,
    composition: composition || null,
    owbId: json.id || null,
    units,
    skipPhases: phaseConfig.skipPhases || [],
  };

  return army;
}
