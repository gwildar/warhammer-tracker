export function getRawUnits(rawJson) {
  if (rawJson.game !== "the-old-world") return [];
  return [
    ...(rawJson.characters || []),
    ...(rawJson.core || []),
    ...(rawJson.special || []),
    ...(rawJson.rare || []),
    ...(rawJson.mercenaries || []),
    ...(rawJson.allies || []),
  ];
}

function checkShieldInMultipleArrays(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const hasShieldInArray = (arr) =>
      (arr || []).some(
        (e) => e.active === true && e.name_en?.toLowerCase().includes("shield"),
      );
    const count = [unit.equipment, unit.armor, unit.options].filter(
      hasShieldInArray,
    ).length;
    if (count > 1) {
      warnings.push({
        unitName: unit.name_en,
        message:
          "Shield appears in multiple data fields — check your OWB export.",
      });
    }
  }
  return warnings;
}

function checkBardingWithoutMount(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const mounts = unit.mounts || [];
    if (mounts.length === 0) continue; // fixed cavalry — always mounted, skip

    const hasBarding = [
      ...(unit.equipment || []),
      ...(unit.armor || []),
      ...(unit.options || []),
    ].some(
      (e) => e.active === true && e.name_en?.toLowerCase().includes("barding"),
    );
    if (!hasBarding) continue;

    const hasActiveMount = mounts.some(
      (m) => m.active === true && m.name_en?.toLowerCase() !== "on foot",
    );
    if (!hasActiveMount) {
      warnings.push({
        unitName: unit.name_en,
        message: "Barding equipped but no mount is active.",
      });
    }
  }
  return warnings;
}

function checkMagicWeaponWithMundane(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const hasMagicWeapon = (unit.items || []).some((slot) =>
      (slot.selected || []).some((item) => item.type === "weapon"),
    );
    if (!hasMagicWeapon) continue;

    const mundaneWeapons = (unit.equipment || []).filter(
      (e) =>
        e.active === true && !e.name_en?.toLowerCase().includes("hand weapon"),
    );
    for (const w of mundaneWeapons) {
      warnings.push({
        unitName: unit.name_en,
        message: `Magic weapon equipped alongside ${w.name_en} — only the magic weapon is used in combat.`,
      });
    }
  }
  return warnings;
}

function checkMagicShieldWithMundane(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const magicShield = (unit.items || [])
      .flatMap((slot) => slot.selected || [])
      .find(
        (item) =>
          item.type === "armor" &&
          item.name_en?.toLowerCase().includes("shield"),
      );
    if (!magicShield) continue;

    const hasMundaneShield = [
      ...(unit.equipment || []),
      ...(unit.armor || []),
      ...(unit.options || []),
    ].some(
      (e) => e.active === true && e.name_en?.toLowerCase().includes("shield"),
    );
    if (hasMundaneShield) {
      warnings.push({
        unitName: unit.name_en,
        message: `Magic shield (${magicShield.name_en}) equipped alongside Shield — only the magic shield applies.`,
      });
    }
  }
  return warnings;
}

function checkNoStatProfile(rawJson, army) {
  const warnings = [];
  for (const unit of army.units) {
    if (!unit.stats?.length) {
      warnings.push({
        unitName: unit.name,
        message: "No stat profile found — combat display will be incomplete.",
      });
    }
  }
  return warnings;
}

function checkPeasantBowmenSkirmishers(rawJson) {
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    if (!unit.name_en?.toLowerCase().includes("peasant bow")) continue;
    const hasSkirmishers = (unit.options || []).some(
      (o) => o.name_en?.toLowerCase() === "skirmishers" && o.active === true,
    );
    if (!hasSkirmishers) {
      warnings.push({
        unitName: unit.name_en,
        message: "Skirmishers option is not selected — is this intentional?",
      });
    }
  }
  return warnings;
}

function checkExilesMissingVow(rawJson) {
  if (rawJson.armyComposition !== "bretonnian-exiles") return [];
  const warnings = [];
  for (const unit of getRawUnits(rawJson)) {
    const vowOptions = (unit.options || []).filter((o) =>
      o.name_en?.toLowerCase().includes("vow"),
    );
    if (vowOptions.length === 0) continue; // not vow-eligible
    const hasActiveVow = vowOptions.some((o) => o.active === true);
    if (!hasActiveVow) {
      warnings.push({
        unitName: unit.name_en,
        message: "No vow is active — is this correct?",
      });
    }
  }
  return warnings;
}

const CHECKS = [
  checkShieldInMultipleArrays,
  checkBardingWithoutMount,
  checkMagicWeaponWithMundane,
  checkMagicShieldWithMundane,
  checkNoStatProfile,
  checkExilesMissingVow,
  checkPeasantBowmenSkirmishers,
];

export function validateArmy(rawJson, army) {
  return CHECKS.flatMap((check) => check(rawJson, army));
}
