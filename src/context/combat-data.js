import { COMBAT_WEAPONS, getWeapon } from "../data/weapons.js";
import { findMount } from "../parsers/resolve.js";
import { getCharacterAssignments } from "../state.js";

export const HAND_WEAPON = { name: "Hand Weapon", s: "S", ap: "—", rules: [] };

const CHARACTER_CATEGORIES = new Set(["characters", "lords", "heroes"]);

function isCharacter(unit) {
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

function matchRiderWeapons(unit) {
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

function matchMountWeapons(unit, alreadyMatched) {
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

function detectSingleUseItems(unit) {
  return (unit.magicItems || []).filter(
    (item) =>
      (item.type === "armour" || item.type === "talisman") &&
      item.effect?.toLowerCase().includes("single use"),
  );
}

function hasRiderMagicalAttacks(unit) {
  for (const item of unit.magicItems || []) {
    if (item.championOnly) continue;
    if (item.type === "weapon" && item.phases?.includes("combat")) return true;
    if (item.type !== "weapon" && item.effect?.includes("Magical Attacks"))
      return true;
  }
  const rules = unit.specialRules || [];
  if (
    rules.some((r) => r.displayName?.toLowerCase().includes("magical attacks"))
  )
    return true;
  if (rules.some((r) => r.displayName?.toLowerCase().includes("grail vow")))
    return true;
  return false;
}

function detectItemBonuses(units) {
  let armourBane = 0;
  let apMod = 0;
  const conditionalStrengthMods = [];
  const unconditionalStrengthMods = [];
  const grantedRules = new Set();

  for (const unit of units) {
    for (const item of unit.magicItems || []) {
      if (item.championOnly) continue;
      if (item.armourBane) armourBane += item.armourBane;
      if (item.apMod) apMod += item.apMod;
      if (item.strengthMod) {
        const m = item.strengthMod.match(/^([+-]\d+)\s*(.*)$/);
        if (m && m[2].trim()) {
          conditionalStrengthMods.push({
            numeric: m[1],
            condition: m[2].trim(),
            source: item.name,
          });
        } else {
          unconditionalStrengthMods.push(item.strengthMod);
        }
      }
      for (const rule of item.grantsRules || []) {
        grantedRules.add(rule);
      }
    }
  }
  return {
    armourBane,
    apMod,
    conditionalStrengthMods,
    unconditionalStrengthMods,
    grantedRules,
  };
}

function isWeaponMagical(w) {
  return w.rules?.some((r) => /^Magical Attacks/i.test(r)) || false;
}

function buildRiderTags(unit, externalGrantedRules = null) {
  const inlineParts = [];
  const subSpans = [];
  if (hasRiderMagicalAttacks(unit)) {
    inlineParts.push(
      '<span class="text-wh-phase-combat font-mono ml-1">\u2728</span>',
    );
    subSpans.push('<span class="text-violet-400">Magical Attacks</span>');
  }
  const {
    armourBane,
    unconditionalStrengthMods,
    grantedRules: unitGrantedRules,
  } = detectItemBonuses([unit]);
  // Poisoned Attacks from a special rule doesn't apply when a magic weapon replaces
  // mundane attacks — only include unit.poisonedAttacks if no magic weapon is equipped.
  const magicWeapon = findMagicWeapon(unit);
  const hasPoisoned =
    ((unit.poisonedAttacks ?? false) && magicWeapon === null) ||
    unitGrantedRules.has("poisoned attacks") ||
    (externalGrantedRules?.has("poisoned attacks") ?? false);
  if (hasPoisoned) {
    inlineParts.push(
      '<span class="text-wh-phase-combat font-mono ml-1">\u2620\uFE0F</span>',
    );
    subSpans.push('<span class="text-green-400">Poisoned Attacks</span>');
  }
  if (armourBane > 0)
    inlineParts.push(
      `<span class="text-wh-phase-combat font-mono ml-1">AB(${armourBane})</span>`,
    );
  for (const sm of unconditionalStrengthMods)
    inlineParts.push(
      `<span class="text-wh-phase-combat font-mono ml-1">S${sm}</span>`,
    );
  return {
    inline: inlineParts.join(""),
    sub:
      subSpans.length > 0
        ? `<div class="text-xs mt-0.5">${subSpans.join('<span class="text-wh-muted">, </span>')}</div>`
        : "",
  };
}

export function buildMountWeaponTags(w) {
  if (isWeaponMagical(w))
    return {
      inline: '<span class="text-wh-phase-combat font-mono ml-1">\u2728</span>',
      sub: '<div class="text-xs mt-0.5"><span class="text-violet-400">Magical Attacks</span></div>',
    };
  return { inline: "", sub: "" };
}

export function weaponPoisonTags(w) {
  if (!w.rules?.some((r) => r.toLowerCase().includes("poisoned attacks")))
    return { inline: "", sub: "" };
  return {
    inline:
      '<span class="text-wh-phase-combat font-mono ml-1">\u2620\uFE0F</span>',
    sub: '<div class="text-xs mt-0.5"><span class="text-green-400">Poisoned Attacks</span></div>',
  };
}

export function mergeTagParts(t1, t2) {
  if (!t2.inline && !t2.sub) return t1;
  if (!t1.inline && !t1.sub) return t2;
  return {
    inline: t1.inline + t2.inline,
    sub: [t1.sub, t2.sub].filter(Boolean).join(""),
  };
}

const COMBAT_VOWS = ["the grail vow", "the questing vow"];

function buildItemNames(unit) {
  const names = (unit.magicItems || []).map((item) => item.name);
  for (const rule of unit.specialRules || []) {
    const lower = rule.displayName?.toLowerCase();
    if (
      lower &&
      COMBAT_VOWS.includes(lower) &&
      !names.some((n) => n.toLowerCase() === lower)
    ) {
      names.push(rule.displayName);
    }
  }
  return names;
}

function buildFilteredItems(u) {
  const suItems = detectSingleUseItems(u);
  const suNames = new Set(suItems.map((i) => i.name.toLowerCase()));
  const bannerNames = [];
  const bannerLabels = {};
  const itemNames = buildItemNames(u).filter((n) => {
    if (suNames.has(n.toLowerCase())) return false;
    const item = (u.magicItems || []).find((i) => i.name === n);
    if (!item) return true; // vow entries — always show
    if (item.type === "banner" || item.type === "standard") {
      bannerNames.push(n);
      if (item.label) bannerLabels[n] = item.label;
      return false;
    }
    if (
      item.mr &&
      !item.ward &&
      !item.regen &&
      !item.armourBase &&
      !item.armourMod
    )
      return false;
    if (
      item.type === "weapon" &&
      item.phases &&
      !item.phases.includes("combat")
    )
      return false;
    return true;
  });
  return { itemNames, bannerNames, bannerLabels, singleUseItems: suItems };
}

function findChampions(unit) {
  if (!unit.stats || unit.stats.length < 2) return [];
  // Champion is a non-mount stat line (T is a real number, not "-" or "(+N)")
  const champions = [];
  for (let idx = 1; idx < unit.stats.length; idx++) {
    const s = unit.stats[idx];
    if (s.Ld !== "-" && s.T !== "-" && !s.T?.startsWith("(+")) {
      champions.push(s);
    }
  }
  return champions;
}

function getChampionWeapons(unit) {
  for (const item of unit.magicItems || []) {
    if (!item.championOnly) continue;
    if (item.type === "weapon") {
      return [
        {
          name: item.name,
          s: item.s || "S",
          ap: item.ap || "—",
          rules: item.effect ? [item.effect] : [],
          attacks: item.attacks || null,
        },
      ];
    }
  }
  return null;
}

function resolveCrewWeapons(equipmentStrings) {
  const weapons = [];
  const seen = new Set();
  // Sort keys longest-first so more specific keys (e.g. "two hand weapons") win over
  // shorter substrings (e.g. "hand weapon") when both match the same equipment string.
  const sortedKeys = Object.keys(COMBAT_WEAPONS).sort(
    (a, b) => b.length - a.length,
  );
  for (const equipStr of equipmentStrings) {
    const lower = equipStr.toLowerCase();
    for (const key of sortedKeys) {
      if (lower.includes(key)) {
        const weapon = COMBAT_WEAPONS[key];
        if (!seen.has(weapon.name)) {
          seen.add(weapon.name);
          weapons.push(weapon);
        }
        break; // longest match wins per equipment string
      }
    }
  }
  return weapons;
}

function findCrewProfiles(unit) {
  const stats0 = unit.stats?.[0];
  if (!stats0 || unit.stats.length < 2) return [];
  if (stats0.crewed || stats0.A === "-") {
    return unit.stats.slice(1).filter((s) => s.A && s.A !== "-");
  }
  return [];
}

function findEmbeddedMount(unit) {
  if (!unit.stats || unit.stats.length < 2) return null;
  // Look for a mount profile: T is "-" or "(+N)", Ld is "-", not the first line
  for (let idx = 1; idx < unit.stats.length; idx++) {
    const s = unit.stats[idx];
    if (s.Ld === "-" && (s.T === "-" || s.T?.startsWith("(+"))) {
      // Try to match name against known mounts, stripping "(xN)" suffixes
      const cleanName = s.Name.replace(/\s*\(x?\d+\)$/i, "").trim();
      const mount = findMount(cleanName) || findMount(s.Name);
      return { statLine: s, mountData: mount };
    }
  }
  return null;
}

const COMBAT_RELEVANT_RULES = [
  "Untutored Arcanist",
  "armour bane",
  "beguiling aura",
  "killing blow",
  "flaming attacks",
  "immune to psychology",
  "stubborn",
  "unbreakable",
  "frenzy",
  "hatred",
  "eternal hatred",
  "counter charge",
  "furious charge",
  "first charge",
  "strike first",
  "strike last",
  "cleaving blow",
  "multiple wounds",
  "shield of the lady",
  "aura of the lady",
  "living saints",
  "murderous",
  "elven reflexes",
  "mighty constitution",
  "valour of ages",
  "arcane backlash",
  "unstable",
  "aspect of the hound",
  "aspect of the bear",
  "aspect of the boar",
  "aspect of the cat",
  "dance of death",
  "dark venom",
  "manbane",
  "rune of khaine",
  "stony stare",
  "wilful beast",
  "witchbrew",
  "sea dragon cloak",
  "abyssal howl",
  "monster handlers",
];

// Rules that grant a variable bonus attacks count to show alongside base attacks.
// Format: { ruleId -> attackBonus } where attackBonus is the string to append (e.g. "+D3").
const EXTRA_ATTACK_RULES = { "rune of khaine": "+D3" };

function extraAttackBonus(unit) {
  for (const rule of unit.specialRules || []) {
    const id = rule.id?.toLowerCase();
    if (id && EXTRA_ATTACK_RULES[id]) return EXTRA_ATTACK_RULES[id];
  }
  return null;
}

// Rules that apply only to the controlling model (rider/handler), not beasts or mounts
const RIDER_ONLY_RULES = new Set(["strike first", "elven reflexes"]);
// Troop types where rider and mount are distinct models (Elven Reflexes applies to rider only)
const CAVALRY_TROOP_TYPES = new Set(["LC", "HC", "MCa"]);

function extractCombatRules(unit) {
  const hasMount = !!unit.mount;
  const isCavalryMount = hasMount && !(unit.mount.wBonus > 0);
  // Regular cavalry units store their type in stats.troopType with no explicit mount object
  const hasCavalryTroopType = (unit.stats?.[0]?.troopType ?? []).some((t) =>
    CAVALRY_TROOP_TYPES.has(t),
  );
  const isRiderContext = isCavalryMount || hasCavalryTroopType;
  const hasDetachments = (unit.detachments?.length ?? 0) > 0;
  const results = [];
  for (const rule of unit.specialRules || []) {
    const lower = (rule.displayName || "")
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s*\{[^}]*\}/g, "")
      .trim();
    if (COMBAT_RELEVANT_RULES.some((cr) => lower.includes(cr))) {
      let displayName = rule.displayName.replace(/\s*\{[^}]*\}/g, "").trim();
      if (lower === "elven reflexes") {
        if (isRiderContext) displayName += " (rider)";
        else if (hasDetachments) displayName += " (handler)";
      } else if (RIDER_ONLY_RULES.has(lower)) {
        if (hasMount) displayName += " (rider)";
        else if (hasDetachments) displayName += " (handler)";
      }
      results.push(displayName);
    }
  }
  if (
    unit.mount?.counterCharge &&
    !results.some((r) => r.toLowerCase().includes("counter charge"))
  ) {
    results.push("Counter Charge");
  }
  if (
    unit.mount?.furiousCharge &&
    !results.some((r) => r.toLowerCase().includes("furious charge"))
  ) {
    results.push("Furious Charge");
  }
  if (
    unit.mount?.firstCharge &&
    !results.some((r) => r.toLowerCase().includes("first charge"))
  ) {
    results.push("First Charge");
  }
  if (unit.mount?.strikeFirst) {
    results.push("Strike First (mount)");
  }
  return results;
}

function getUnitLd(u) {
  if (u.stats) {
    for (const profile of u.stats) {
      if (profile.Ld && profile.Ld !== "-") return profile.Ld;
    }
  }
  return "?";
}

// For crewed units (beast + handlers), returns { primary, alt } where primary is the
// handlers' Ld (used while alive) and alt is the beast's own Ld (fallback).
// Returns null when there is only one distinct Ld value.
function getCrewedLds(u) {
  if (!u.stats || u.stats.length < 2 || !u.stats[0].crewed) return null;
  const beastLd = u.stats[0].Ld && u.stats[0].Ld !== "-" ? u.stats[0].Ld : null;
  let crewLd = null;
  for (let i = 1; i < u.stats.length; i++) {
    if (u.stats[i].Ld && u.stats[i].Ld !== "-") {
      crewLd = u.stats[i].Ld;
      break;
    }
  }
  if (!beastLd || !crewLd || beastLd === crewLd) return null;
  return { primary: crewLd, alt: beastLd };
}

export function buildCombatLeadershipData(army) {
  if (army.units.length === 0) {
    return {
      rows: [],
      general: null,
      generalLd: null,
      generalRange: 12,
      bsb: null,
      bsbRange: 12,
    };
  }

  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));
  const charsByUnitId = {};
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (!unitId) continue;
    const charUnit = unitById[charId];
    if (charUnit) {
      if (!charsByUnitId[unitId]) charsByUnitId[unitId] = [];
      charsByUnitId[unitId].push(charUnit);
    }
  }

  const deduped = {};
  for (const u of army.units) {
    if (isCharacter(u) && assignedCharIds.has(u.id)) continue;

    const assignedChars = charsByUnitId[u.id] || [];
    const crewedLds = getCrewedLds(u);
    const allLds = [
      ...(crewedLds
        ? [parseInt(crewedLds.primary), parseInt(crewedLds.alt)]
        : [parseInt(getUnitLd(u)) || 0]),
      ...assignedChars.map((x) => parseInt(getUnitLd(x)) || 0),
    ].filter((x) => x > 0);
    const maxLd = allLds.length > 0 ? String(Math.max(...allLds)) : "?";
    const ldAlt = crewedLds && !assignedChars.length ? crewedLds.alt : null;

    const key = `${u.name}||${maxLd}`;
    if (!deduped[key])
      deduped[key] = {
        name: u.name,
        ld: maxLd,
        ldAlt,
        ldNum: parseInt(maxLd) || 0,
        chars: assignedChars.map((c) => c.name),
      };
  }

  const rows = Object.values(deduped).sort((a, b) => b.ldNum - a.ldNum);

  const general = army.units.find((u) => u.isGeneral) ?? null;
  const bsb = army.units.find((u) => u.isBSB) ?? null;

  let generalLd = null;
  let generalRange = 12;
  if (general) {
    if (general.stats) {
      for (const profile of general.stats) {
        if (profile.Ld && profile.Ld !== "-") {
          generalLd = profile.Ld;
          break;
        }
      }
    }
    const hasLargeTarget =
      (general.specialRules || []).some((r) =>
        r.displayName?.toLowerCase().includes("large target"),
      ) || !!general.mount?.largeTarget;
    if (hasLargeTarget) generalRange = 18;
  }

  let bsbRange = 12;
  if (bsb) {
    const hasLargeTarget =
      (bsb.specialRules || []).some((r) =>
        r.displayName?.toLowerCase().includes("large target"),
      ) || !!bsb.mount?.largeTarget;
    if (hasLargeTarget) bsbRange = 18;
  }

  return { rows, general, generalLd, generalRange, bsb, bsbRange };
}

export function buildCombatResultEntries(army) {
  if (army.units.length === 0) return [];

  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, uid]) => uid)
      .map(([cid]) => cid),
  );
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));
  const charsByUnitId = {};
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (!unitId) continue;
    const charUnit = unitById[charId];
    if (charUnit) {
      if (!charsByUnitId[unitId]) charsByUnitId[unitId] = [];
      charsByUnitId[unitId].push(charUnit);
    }
  }

  const entries = [];
  for (const u of army.units) {
    if (isCharacter(u) && assignedCharIds.has(u.id)) continue;

    const bonuses = [];
    let total = 0;

    const hasCloseOrder = (u.specialRules || []).some((r) =>
      r.displayName?.toLowerCase().includes("close order"),
    );
    if (hasCloseOrder && u.unitStrength >= 10) {
      bonuses.push("Close Order +1");
      total += 1;
    }
    if (u.hasStandard) {
      bonuses.push("Standard +1");
      total += 1;
    }
    if (u.hasMusician) {
      bonuses.push("Musician");
    }

    const assignedChars = charsByUnitId[u.id] || [];
    const allUnits = [u, ...assignedChars];
    for (const unit of allUnits) {
      for (const item of unit.magicItems || []) {
        if (item.combatResBonus) {
          bonuses.push(`${item.name} +${item.combatResBonus}`);
          total += item.combatResBonus;
        }
      }
    }

    if (total === 0 && !u.hasMusician) continue;

    entries.push({ name: u.name, strength: u.strength, total, bonuses });
  }

  const deduped = {};
  for (const e of entries) {
    const key = `${e.name}||${e.total}||${e.bonuses.join(",")}`;
    if (!deduped[key]) deduped[key] = { ...e, merged: false };
    else deduped[key].merged = true;
  }

  return Object.values(deduped).sort((a, b) => b.total - a.total);
}

export function buildCombatEntries(army) {
  if (army.units.length === 0) return [];

  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));
  const charsByUnitId = {};
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (!unitId) continue;
    if (!charsByUnitId[unitId]) charsByUnitId[unitId] = [];
    const charUnit = unitById[charId];
    if (charUnit) charsByUnitId[unitId].push(charUnit);
  }

  const entries = [];

  for (const u of army.units) {
    // Skip characters that are assigned to a host unit
    if (isCharacter(u) && assignedCharIds.has(u.id)) continue;

    const assignedChars = charsByUnitId[u.id] || [];
    const allUnitsForBonuses = [u, ...assignedChars];
    const charBannerNames = assignedChars.flatMap((char) =>
      (char.magicItems || [])
        .filter((i) => i.type === "banner" || i.type === "standard")
        .map((i) => i.name),
    );
    const charBannerLabels = Object.fromEntries(
      assignedChars.flatMap((char) =>
        (char.magicItems || [])
          .filter(
            (i) => (i.type === "banner" || i.type === "standard") && i.label,
          )
          .map((i) => [i.name, i.label]),
      ),
    );

    // Shared computation (applies to both stats and no-stats paths)
    const unitMRNum = u.magicResistance ? parseInt(u.magicResistance) : 0;
    const mergedMR = unitMRNum !== 0 ? `${unitMRNum}` : null;
    const { apMod, conditionalStrengthMods, grantedRules } =
      detectItemBonuses(allUnitsForBonuses);
    const assignedCharProfiles = assignedChars.map((char) => {
      const cStats = char.stats?.[0];
      const { weapons: charWeapons, matched: charMatched } =
        matchRiderWeapons(char);
      const charMountWeapons = matchMountWeapons(char, charMatched);
      const charMount = char.mount ?? null;
      const charIsRiddenMonster = charMount && charMount.wBonus > 0;
      let charMountA = null,
        charMountS = null,
        charMountI = null,
        charMountWS = null,
        charMountName = null;
      if (charMount?.a && charMount.a !== "-") {
        charMountA = charMount.a;
        charMountS = charMount.s;
        charMountI = charMount.i;
        charMountWS = charMount.ws;
        charMountName = charMount.name;
      }
      const charBaseT = parseInt(cStats?.T) || 0;
      const charBaseW = parseInt(cStats?.W) || 0;
      const charCrew =
        charIsRiddenMonster && charMount.crew
          ? charMount.crew.map((c) => ({
              name: c.name,
              i: c.i,
              ws: c.ws,
              s: c.s,
              a: c.a,
              weapons: resolveCrewWeapons(c.equipment || []),
            }))
          : [];
      const { itemNames: charItemNames, singleUseItems: charSuItems } =
        buildFilteredItems(char);
      return {
        name: char.name,
        points: char.points,
        i: cStats?.I || "?",
        ws: cStats?.WS || "?",
        s: cStats?.S || "?",
        a: cStats?.A ? `${cStats.A}${extraAttackBonus(char) ?? ""}` : "?",
        t: charIsRiddenMonster
          ? `${charBaseT + charMount.tBonus}`
          : cStats?.T || "?",
        w: charIsRiddenMonster
          ? `${charBaseW + charMount.wBonus}`
          : cStats?.W || "?",
        as: char.armourSave ?? null,
        mr: char.magicResistance ? parseInt(char.magicResistance) : null,
        ward: char.ward ?? null,
        regen: char.regen ?? null,
        weapons: charWeapons.length > 0 ? charWeapons : [HAND_WEAPON],
        mountWeapons: charMountWeapons,
        mountA: charMountA,
        mountS: charMountS,
        mountI: charMountI,
        mountWS: charMountWS,
        mountName: charMountName,
        crew: charCrew,
        impactHits: charIsRiddenMonster ? (charMount.impactHits ?? null) : null,
        tags: buildRiderTags(char, grantedRules),
        combatRules: extractCombatRules(char),
        itemNames: charItemNames,
        singleUseItems: charSuItems,
      };
    });

    const stats = u.stats?.[0];
    if (!stats) {
      const {
        itemNames: noStatsItemNames,
        bannerNames: noStatsBannerNames,
        bannerLabels: noStatsBannerLabels,
        singleUseItems: noStatsSuItems,
      } = buildFilteredItems(u);
      entries.push({
        unitName: u.name,
        points: u.points,
        strength: u.strength,
        mount: null,
        riderI: "?",
        riderWS: "?",
        riderS: "?",
        t: "?",
        w: "?",
        as: u.armourSave ?? null,
        mr: mergedMR,
        ward: u.ward ?? null,
        regen: u.regen ?? null,
        iNum: 0,
        riderWeapons: [HAND_WEAPON],
        riderA: "?",
        mountWeapons: [],
        mountA: null,
        mountS: null,
        mountI: null,
        mountWS: null,
        mountName: null,
        stomp: u.stomp ?? null,
        impactHits: u.impactHits ?? null,
        singleUseItems: noStatsSuItems,
        itemNames: noStatsItemNames,
        bannerNames: [...noStatsBannerNames, ...charBannerNames],
        bannerLabels: { ...noStatsBannerLabels, ...charBannerLabels },
        riderTags: buildRiderTags(u, grantedRules),
        combatRules: extractCombatRules(u),
        apMod,
        conditionalStrengthMods,
        assignedCharProfiles,
        unitStrength:
          (u.unitStrength ?? 0) +
          assignedChars.reduce((sum, c) => sum + (c.unitStrength ?? 0), 0),
        crew: [],
        detachments: (u.detachments || []).map((d) => {
          const dStats = d.stats?.[0];
          return {
            name: d.name,
            strength: d.strength,
            i: dStats?.I || "?",
            ws: dStats?.WS || "?",
            s: dStats?.S || "?",
            a: dStats?.A || "?",
            weapons: d.weapons || [],
          };
        }),
      });
      continue;
    }

    const mount = u.mount ?? null;
    const isRiddenMonster = mount && mount.wBonus > 0;

    // Check for embedded mount profile in unit stats (e.g. Knights Errant, Pegasus Knights)
    // Skip for crewed units — their creature weapons come from stat line weapons field
    const embedded =
      !isRiddenMonster && !stats.crewed ? findEmbeddedMount(u) : null;
    const hasEmbeddedMount =
      embedded && embedded.statLine.A && embedded.statLine.A !== "-";

    // Check for champion profiles (non-character units only)
    // Units with detachments (e.g. Beast Pack) use detachments[] for their animal profiles —
    // skip champion detection so we don't show all possible animals, only the ones present.
    const champions =
      u.category !== "characters" && !u.detachments?.length
        ? findChampions(u)
        : [];

    // Check for crew profiles (crewed units like chariots)
    const crew = findCrewProfiles(u);

    const baseT = parseInt(stats.T) || 0;
    const baseW = parseInt(stats.W) || 0;

    const { weapons: riderWeapons, matched } = matchRiderWeapons(u);
    let mountWeapons = matchMountWeapons(u, matched);

    // For embedded mounts, get weapons from the mount data if available
    if (
      hasEmbeddedMount &&
      mountWeapons.length === 0 &&
      embedded.mountData?.weapons
    ) {
      for (const wKey of embedded.mountData.weapons) {
        const weapon = getWeapon(COMBAT_WEAPONS, wKey);
        if (weapon && !matched.has(weapon.name)) {
          matched.add(weapon.name);
          mountWeapons.push(weapon);
        }
      }
    }

    // For crewed units with weapons on stat lines, remove those from riderWeapons (they belong to creatures)
    if (stats.crewed) {
      const crewWeaponNames = new Set();
      if (stats.weapons)
        stats.weapons.forEach((wKey) => {
          const w = getWeapon(COMBAT_WEAPONS, wKey);
          if (w) crewWeaponNames.add(w.name);
        });
      // Supplement units use stats.equipment (array of raw strings) instead of stats.weapons
      if (!stats.weapons && stats.equipment)
        resolveCrewWeapons(stats.equipment).forEach((w) =>
          crewWeaponNames.add(w.name),
        );
      for (const c of crew) {
        if (c.weapons)
          c.weapons.forEach((wKey) => {
            const w = getWeapon(COMBAT_WEAPONS, wKey);
            if (w) crewWeaponNames.add(w.name);
          });
      }
      if (crewWeaponNames.size > 0) {
        const filtered = riderWeapons.filter(
          (w) => !crewWeaponNames.has(w.name),
        );
        riderWeapons.length = 0;
        riderWeapons.push(...filtered);
      }
    }

    // Crewed units with weapons on stats[0] have no rider — mount is in crew array
    if (stats.crewed && (stats.weapons || stats.equipment))
      riderWeapons.length = 0;

    // War machine bodies (A="-") do not fight — OWB may resolve default weapons onto
    // the unit but the machine itself has no melee attacks; only crew does.
    if (stats.crewed && stats.A === "-") riderWeapons.length = 0;

    // War machines (A="-") have no rider attacks — crew handles melee instead.
    if (
      riderWeapons.length === 0 &&
      !(stats.crewed && (stats.weapons || stats.equipment)) &&
      stats.A !== "-"
    )
      riderWeapons.push(HAND_WEAPON);

    const riderI = stats.I || "?";
    const riderWS = stats.WS || "?";
    const riderS = stats.S || "?";

    let mountI = null,
      mountWS = null,
      mountA = null,
      mountS = null,
      mountName = null,
      mountStomp = null,
      mountArmourBane = null;

    if (isRiddenMonster) {
      mountI = mount.i;
      mountWS = mount.ws;
      mountA = mount.a;
      mountS = mount.s;
      mountName = mount.name;
      mountStomp = mount.stomp;
      mountArmourBane = mount.armourBane || null;
    } else if (mount && mount.a) {
      // Mount exists but doesn't grant T/W (e.g. howdah mounts like Ancient Stegadon)
      mountI = mount.i;
      mountWS = mount.ws;
      mountA = mount.a;
      mountS = mount.s;
      mountName = mount.name;
      mountStomp = mount.stomp;
      mountArmourBane = mount.armourBane || null;
    } else if (
      stats.crewed &&
      stats.A &&
      stats.A !== "-" &&
      !stats.weapons &&
      !stats.equipment
    ) {
      // Crewed unit without explicit weapons: stats[0] is the mount/vehicle itself
      mountI = parseInt(stats.I) || null;
      mountWS = parseInt(stats.WS) || null;
      mountA = parseInt(stats.A) || stats.A;
      mountS = parseInt(stats.S) || stats.S;
      mountName = stats.Name;
      const cleanName = stats.Name.replace(/\s*\(x?\d+\)$/i, "").trim();
      const crewedMount = findMount(cleanName);
      mountStomp = crewedMount?.stomp || null;
      mountArmourBane = crewedMount?.armourBane || null;
    } else if (hasEmbeddedMount) {
      const es = embedded.statLine;
      mountI = parseInt(es.I) || null;
      mountWS = parseInt(es.WS) || null;
      mountA = parseInt(es.A) || es.A;
      mountS = parseInt(es.S) || es.S;
      mountName = es.Name;
      mountStomp = embedded.mountData?.stomp || null;
      mountArmourBane = embedded.mountData?.armourBane || null;
    }

    const {
      itemNames: filteredItemNames,
      bannerNames: filteredBannerNames,
      bannerLabels: filteredBannerLabels,
      singleUseItems: filteredSuItems,
    } = buildFilteredItems(u);
    entries.push({
      unitName: u.name,
      points: u.points,
      strength: u.strength,
      mount: isRiddenMonster || (mount && mount.a) ? mount.name : null,
      riderI,
      riderWS,
      riderS,
      t: isRiddenMonster
        ? `${baseT + mount.tBonus}`
        : stats.crewed &&
            stats.A === "-" &&
            !stats.troopType?.some((t) => t.endsWith("Ch"))
          ? crew[0]?.T || "?"
          : stats.T || "?",
      w: isRiddenMonster ? `${baseW + mount.wBonus}` : stats.W || "?",
      as: u.armourSave ?? null,
      mr: mergedMR,
      ward: u.ward ?? null,
      regen: u.regen ?? null,
      iNum: Math.max(parseInt(riderI) || 0, mountI || 0),
      riderWeapons,
      riderA: stats.A ? `${stats.A}${extraAttackBonus(u) ?? ""}` : "?",
      mountWeapons,
      mountA,
      mountS,
      mountI,
      mountWS,
      mountName,
      mountArmourBane,
      stomp: mount?.stomp || mountStomp || (u.stomp ?? null),
      impactHits:
        mount?.impactHits ||
        embedded?.mountData?.impactHits ||
        (u.impactHits ?? null),
      singleUseItems: filteredSuItems,
      itemNames: filteredItemNames,
      bannerNames: [...filteredBannerNames, ...charBannerNames],
      bannerLabels: { ...filteredBannerLabels, ...charBannerLabels },
      riderTags: buildRiderTags(u),
      combatRules: extractCombatRules(u),
      crew: [
        ...(stats.crewed &&
        (stats.weapons || stats.equipment) &&
        stats.A &&
        stats.A !== "-"
          ? [
              {
                name: stats.Name,
                i: stats.I,
                ws: stats.WS,
                s: stats.S,
                a: stats.A,
                weapons: stats.weapons
                  ? stats.weapons
                      .map((wKey) => getWeapon(COMBAT_WEAPONS, wKey))
                      .filter(Boolean)
                  : resolveCrewWeapons(stats.equipment || []),
              },
            ]
          : []),
        ...crew.map((c) => ({
          name: c.Name,
          i: c.I,
          ws: c.WS,
          s: c.S,
          a: c.A,
          weapons:
            c.weapons?.length > 0
              ? c.weapons
                  .map((wKey) => getWeapon(COMBAT_WEAPONS, wKey))
                  .filter(Boolean)
              : resolveCrewWeapons(c.equipment || []),
        })),
        // Crew from a ridden monster mount (e.g. Death Hag on Cauldron of Blood)
        ...(isRiddenMonster && mount.crew
          ? mount.crew.map((c) => ({
              name: c.name,
              i: c.i,
              ws: c.ws,
              s: c.s,
              a: c.a,
              weapons: resolveCrewWeapons(c.equipment || []),
            }))
          : []),
      ],
      champions: champions.map((champion) => {
        const championWeapons = getChampionWeapons(u);
        return {
          name: champion.Name,
          i: champion.I || riderI,
          ws: champion.WS || riderWS,
          s: champion.S || riderS,
          a: champion.A || "?",
          weapons: championWeapons || riderWeapons,
          tags: championWeapons
            ? championWeapons.some((w) => isWeaponMagical(w))
              ? {
                  inline:
                    '<span class="text-wh-phase-combat font-mono ml-1">\u2728</span>',
                  sub: '<div class="text-xs mt-0.5"><span class="text-violet-400">Magical Attacks</span></div>',
                }
              : { inline: "", sub: "" }
            : null,
        };
      }),
      riderName: champions.length > 0 ? stats.Name : null,
      apMod,
      conditionalStrengthMods,
      assignedCharProfiles,
      unitStrength:
        (u.unitStrength ?? 0) +
        assignedChars.reduce((sum, c) => sum + (c.unitStrength ?? 0), 0),
      detachments: (u.detachments || []).map((d) => {
        const dStats = d.stats?.[0];
        return {
          name: d.name,
          strength: d.strength,
          i: dStats?.I || "?",
          ws: dStats?.WS || "?",
          s: dStats?.S || "?",
          a: dStats?.A || "?",
          weapons: d.weapons || [],
        };
      }),
    });
  }

  // Deduplicate
  const deduped = {};
  for (const e of entries) {
    const riderWKey = e.riderWeapons
      .map((w) => w.name)
      .sort()
      .join(",");
    const mountWKey = e.mountWeapons
      .map((w) => w.name)
      .sort()
      .join(",");
    const itemKey = [...e.itemNames, ...e.singleUseItems.map((i) => i.name)]
      .sort()
      .join(",");
    const key = `${e.unitName}||${e.riderI}||${e.riderA}||${e.t}||${e.w}||${e.as}||${riderWKey}||${mountWKey}||${itemKey}`;
    if (!deduped[key]) {
      deduped[key] = { ...e, merged: false };
    } else {
      deduped[key].merged = true;
    }
  }

  return Object.values(deduped).sort((a, b) => b.iNum - a.iNum);
}

export function buildDefensiveStatsEntries(army) {
  if (army.units.length === 0) return [];

  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));
  const charsByUnitId = {};
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (!unitId) continue;
    const charUnit = unitById[charId];
    if (charUnit) {
      if (!charsByUnitId[unitId]) charsByUnitId[unitId] = [];
      charsByUnitId[unitId].push(charUnit);
    }
  }

  function extractStats(u) {
    const stats = u.stats?.[0];
    const mount = u.mount ?? null;
    const isRiddenMonster = mount && mount.wBonus > 0;
    const baseT = parseInt(stats?.T) || 0;
    const baseW = parseInt(stats?.W) || 0;
    const t = isRiddenMonster ? `${baseT + mount.tBonus}` : stats?.T || "?";
    const w = isRiddenMonster ? `${baseW + mount.wBonus}` : stats?.W || "?";
    const as = u.armourSave ?? null;
    const ward = u.ward ?? null;
    const regen = u.regen ?? null;
    const mr = u.magicResistance ?? null;
    let ld = "?";
    if (u.stats) {
      for (const profile of u.stats) {
        if (profile.Ld && profile.Ld !== "-") {
          ld = profile.Ld;
          break;
        }
      }
    }
    const hasEvasive = (u.specialRules || []).some((r) =>
      r.displayName?.toLowerCase().includes("evasive"),
    );
    return {
      t,
      w,
      as,
      ward,
      regen,
      mr,
      ld,
      hasEvasive,
      mount: isRiddenMonster ? mount.name : null,
    };
  }

  const deduped = {};
  for (const u of army.units) {
    if (isCharacter(u) && assignedCharIds.has(u.id)) continue;

    const { t, w, as, ward, regen, mr, ld, hasEvasive, mount } =
      extractStats(u);
    const assignedChars = charsByUnitId[u.id] || [];

    const key = `${u.name}||${t}||${w}||${as}`;
    if (!deduped[key]) {
      deduped[key] = {
        name: u.name,
        strength: u.strength,
        mount,
        t,
        w,
        as,
        ward,
        regen,
        mr,
        ld,
        ldNum: parseInt(ld) || 0,
        hasEvasive,
        merged: false,
        chars: assignedChars.map((c) => ({ name: c.name, ...extractStats(c) })),
      };
    } else {
      deduped[key].merged = true;
    }
  }

  return Object.values(deduped).sort((a, b) => b.ldNum - a.ldNum);
}
