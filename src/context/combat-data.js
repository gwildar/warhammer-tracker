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
