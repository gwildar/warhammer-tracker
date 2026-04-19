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

const CHECKS = [checkShieldInMultipleArrays, checkBardingWithoutMount];

export function validateArmy(rawJson, army) {
  return CHECKS.flatMap((check) => check(rawJson, army));
}
