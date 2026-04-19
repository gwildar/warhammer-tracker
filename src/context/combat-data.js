import { COMBAT_WEAPONS, getWeapon } from "../data/weapons.js";
import { findMount } from "../parsers/resolve.js";

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

export function detectItemBonuses(units) {
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

export function isWeaponMagical(w) {
  return w.rules?.some((r) => /^Magical Attacks/i.test(r)) || false;
}

export function buildRiderTags(unit, externalGrantedRules = null) {
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
  const hasPoisoned =
    (unit.poisonedAttacks ?? false) ||
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

export function buildFilteredItems(u) {
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

export function findChampions(unit) {
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

export function getChampionWeapons(unit) {
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

export function findCrewProfiles(unit) {
  const stats0 = unit.stats?.[0];
  if (!stats0 || unit.stats.length < 2) return [];
  if (stats0.crewed || stats0.A === "-") {
    return unit.stats.slice(1).filter((s) => s.A && s.A !== "-");
  }
  return [];
}

export function findEmbeddedMount(unit) {
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
];

// Rules that apply only to the controlling model (rider/handler), not beasts or mounts
const RIDER_ONLY_RULES = new Set(["strike first", "elven reflexes"]);
// Troop types where rider and mount are distinct models (Elven Reflexes applies to rider only)
const CAVALRY_TROOP_TYPES = new Set(["LC", "HC", "MCa"]);

export function extractCombatRules(unit) {
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

export function getUnitLd(u) {
  if (u.stats) {
    for (const profile of u.stats) {
      if (profile.Ld && profile.Ld !== "-") return profile.Ld;
    }
  }
  return "?";
}
