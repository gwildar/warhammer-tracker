/**
 * Converter from New Recruit / BattleScribe (.json) export format to canonical army schema.
 * Handles the nested selection structure with profiles of various typeNames.
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
/**
 * Sum all "pts" costs recursively through a selection tree
 */
function sumSelectionCosts(sel) {
  let total = 0;
  if (Array.isArray(sel.costs)) {
    for (const c of sel.costs) {
      if (c.name === "pts") total += c.value || 0;
    }
  }
  if (Array.isArray(sel.selections)) {
    for (const child of sel.selections) total += sumSelectionCosts(child);
  }
  return total;
}

/**
 * Extract characteristics from a profile by name
 */
function getCharacteristic(profile, charName) {
  if (!profile.characteristics) return null;
  const char = profile.characteristics.find((c) => c.name === charName);
  return char ? char.$text : null;
}

/**
 * Build a stat block from Model profile characteristics
 */
function buildStatBlockFromProfile(modelProfile) {
  if (!modelProfile || modelProfile.typeName !== "Model") return [];

  const statNames = ["M", "WS", "BS", "S", "T", "W", "I", "A", "Ld"];
  const stats = {};

  for (const statName of statNames) {
    stats[statName] = getCharacteristic(modelProfile, statName);
  }

  // Return as single-entry array with model name
  return [
    {
      Name: modelProfile.name,
      ...stats,
    },
  ];
}

/**
 * Recursively walk selections to gather equipment, magic items, and special rules
 */
function gatherSelectionsData(selections) {
  const equipment = [];
  const magicItemNames = [];
  const rulesText = [];
  const mountName = null;

  if (!Array.isArray(selections))
    return { equipment, magicItemNames, rulesText, mountName };

  for (const selection of selections) {
    if (!selection.profiles) continue;

    for (const profile of selection.profiles) {
      if (!profile.typeName) continue;

      switch (profile.typeName) {
        case "Weapon":
          equipment.push(profile.name);
          break;

        case "Magic Weapons":
        case "Magic Armour":
        case "Magic Standards":
        case "Arcane Items":
        case "Talismans":
          // All of these become magic item names
          magicItemNames.push(profile.name);
          break;

        case "Armour":
          equipment.push(profile.name);
          break;

        case "Special Rule":
        case "Spell":
        case "Command":
          // Collect special rules and commands as text
          if (profile.name) {
            rulesText.push(profile.name);
          }
          break;

        case "Mount":
          // Mount found
          if (profile.name && !mountName) {
            // Store mount name for later resolution
            // Note: we return this separately as we can't reassign in this context
          }
          break;

        default:
          // Ignore other profile types
          break;
      }
    }

    // Recursively gather from nested selections (e.g., crew, mount selections)
    if (selection.selections) {
      const nested = gatherSelectionsData(selection.selections);
      equipment.push(...nested.equipment);
      magicItemNames.push(...nested.magicItemNames);
      rulesText.push(...nested.rulesText);
    }
  }

  return { equipment, magicItemNames, rulesText, mountName };
}

/**
 * Find a specific profile type from a selection
 */
function findProfile(selection, typeName) {
  if (!selection.profiles) return null;
  return selection.profiles.find((p) => p.typeName === typeName);
}

/**
 * Find a mount name from nested selections
 */
function findMountName(selections) {
  if (!Array.isArray(selections)) return null;

  // Find the first selection representing the main unit model (has a Model profile)
  for (const sel of selections) {
    if (!sel.profiles?.some((p) => p.typeName === "Model")) continue;
    // Look for a nested Model within it — that is the mount
    for (const nested of sel.selections || []) {
      const mountProfile = nested.profiles?.find((p) => p.typeName === "Model");
      if (mountProfile) return mountProfile.name;
    }
    break; // Only inspect the first Model selection
  }

  return null;
}

/**
 * Parse a single unit from New Recruit export format to canonical unit
 */
function parseCanonicalUnit(selection, category) {
  // Find the Unit profile for basic info
  const unitProfile = findProfile(selection, "Unit");
  const unitName = unitProfile?.name || "Unknown Unit";

  // Generate a deterministic ID from the unit name and entry ID
  const id = selection.entryId || unitName.toLowerCase().replace(/\s+/g, "-");

  // Find the Model profile for stats
  const modelProfiles = [];
  if (selection.selections) {
    for (const sel of selection.selections) {
      const modelProfile = findProfile(sel, "Model");
      if (modelProfile) {
        modelProfiles.push(...buildStatBlockFromProfile(modelProfile));
      }
    }
  }

  // If no model profile in nested selections, try the main selection
  if (modelProfiles.length === 0 && selection.profiles) {
    const mainModel = findProfile(selection, "Model");
    if (mainModel) {
      modelProfiles.push(...buildStatBlockFromProfile(mainModel));
    }
  }

  // Gather equipment and magic items from nested selections
  const { equipment, magicItemNames, rulesText } = gatherSelectionsData(
    selection.selections,
  );

  // Find mount
  const mountName = findMountName(selection.selections);

  // Get unit size from Unit profile characteristic
  const unitSizeStr = getCharacteristic(unitProfile, "Unit Size") || "1";
  const strength = parseInt(unitSizeStr, 10) || 1;

  // Gather special rules from top-level profiles
  const topLevelRules = [];
  if (selection.profiles) {
    for (const profile of selection.profiles) {
      if (profile.typeName === "Special Rule") {
        topLevelRules.push(profile.name);
      }
    }
  }

  const allRulesText = [...topLevelRules, ...rulesText].join(", ");

  // Resolve all data
  const weapons = resolveWeapons(equipment, magicItemNames);
  const shootingWeapons = resolveShootingWeapons(equipment);
  const resolvedMagicItems = resolveMagicItems(magicItemNames);
  const specialRules = resolveSpecialRules(allRulesText);
  const spellSelectionMode = deriveSpellSelectionMode(
    resolvedMagicItems,
    specialRules,
  );
  const resolvedMount = resolveMount(mountName);

  // Compute saves
  const armourSave = computeArmourSave(
    equipment,
    [],
    resolvedMagicItems,
    resolvedMount,
    specialRules,
    modelProfiles,
  );
  const ward = computeWard(resolvedMagicItems, specialRules);
  const regen = computeRegen(resolvedMagicItems, specialRules);
  const magicResistance = computeMR(resolvedMagicItems, specialRules);
  const poisonedAttacks = computePoisonedAttacks(specialRules);
  const stomp = computeStomp(resolvedMount, specialRules);
  const impactHits = computeImpactHits(resolvedMount, specialRules);

  // Check for command roles
  const isGeneral = rulesText.some((r) => r.toLowerCase() === "general");
  const isBSB = rulesText.some((r) =>
    r.toLowerCase().includes("battle standard bearer"),
  );
  const hasStandard = rulesText.some((r) =>
    r.toLowerCase().includes("standard bearer"),
  );
  const hasMusician = rulesText.some((r) =>
    r.toLowerCase().includes("musician"),
  );

  // Check for caster and extract lore keys from "Lores of Magic" group selections
  const lores = [];
  let isCaster = false;
  const factionLores = [];

  function walkSelectionsForLores(selections) {
    if (!Array.isArray(selections)) return;
    for (const sel of selections) {
      if (sel.group === "Wizard Level") {
        isCaster = true;
      }
      if (sel.group === "Lores of Magic" && sel.name) {
        const key = LORE_NAME_TO_KEY[sel.name.toLowerCase()];
        if (key && !lores.includes(key)) lores.push(key);
      }
      if (sel.selections) walkSelectionsForLores(sel.selections);
    }
  }
  walkSelectionsForLores(selection.selections);

  // Detect bound spell weapons in equipment (treated as spells, not shooting weapons)
  const equipmentFlat = equipment.join(", ").toLowerCase();
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

  if (lores.length > 0) isCaster = true;

  // Extract faction lores from special rules
  if (allRulesText) {
    const rules = allRulesText.split(",").map((r) => r.trim());
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

  // Look up stats from units.js to get troopType for unit strength calculation
  const resolvedStats = resolveStats(id, unitName);

  // Build canonical unit
  const unit = {
    id,
    name: unitName,
    category,
    strength,
    points: sumSelectionCosts(selection),
    stats: resolvedStats.length > 0 ? resolvedStats : modelProfiles,
    weapons,
    shootingWeapons,
    magicItems: resolvedMagicItems,
    specialRules,
    mount: resolvedMount || null,
    armourSave,
    ward,
    regen,
    magicResistance,
    poisonedAttacks,
    stomp,
    impactHits,
    detachments: [],
    champions: [],
    crew: [],
    isGeneral,
    isBSB,
    hasStandard,
    hasMusician,
    isCaster,
    lores,
    spellSelectionMode,
    activeLore: lores[0] || null,
    factionLores,
  };

  unit.unitStrength = computeUnitStrength(unit);
  return unit;
}

/**
 * Determine the category from the selection's entryGroupId or type hints
 */
function getCategoryFromSelection(selection) {
  const entryGroupId = selection.entryGroupId || "";

  // Try to infer from entryGroupId patterns
  if (
    entryGroupId.includes("character") ||
    entryGroupId.includes("lord") ||
    entryGroupId.includes("hero")
  ) {
    return "characters";
  }
  if (entryGroupId.includes("core")) {
    return "core";
  }
  if (entryGroupId.includes("special")) {
    return "special";
  }
  if (entryGroupId.includes("rare")) {
    return "rare";
  }
  if (
    entryGroupId.includes("mercenaries") ||
    entryGroupId.includes("mercenary")
  ) {
    return "mercenaries";
  }
  if (entryGroupId.includes("allies")) {
    return "allies";
  }

  // Default to core if unclear
  return "core";
}

/**
 * Convert New Recruit export JSON to canonical army schema
 */
export function fromNewRecruit(json) {
  const units = [];

  // Navigate to the selections array
  const forces = json.roster?.forces;
  if (!Array.isArray(forces) || forces.length === 0) {
    throw new Error("Invalid New Recruit format: no forces found");
  }

  const force = forces[0];
  const selections = force.selections || [];

  // Parse each selection as a unit
  for (const selection of selections) {
    const category = getCategoryFromSelection(selection);
    const unit = parseCanonicalUnit(selection, category);
    units.push(unit);
  }

  // Get army name and points from roster
  const armyName = json.roster?.name || "Unknown Army";
  const totalPoints = json.roster?.costs?.[0]?.value || 0;

  // Build canonical army
  const army = {
    name: armyName,
    armySlug: "", // New Recruit format doesn't include this
    faction: "", // We'd need to infer this from unit names or metadata
    points: totalPoints,
    composition: null,
    units,
  };

  return army;
}
