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

const CHECKS = [];

export function validateArmy(rawJson, army) {
  return CHECKS.flatMap((check) => check(rawJson, army));
}
