export function renderMagicItemsContext(army, phaseId, subPhaseId) {
  const grouped = {};

  for (const unit of army.units) {
    // In canonical schema, magicItems are already resolved objects
    for (const item of unit.magicItems) {
      if (!item) continue;
      if (item.type === "virtue") continue;
      if (!item.phases?.includes(phaseId)) continue;
      if (subPhaseId && item.subPhases && !item.subPhases.includes(subPhaseId))
        continue;
      if (subPhaseId && item.opponentOnly) continue;
      if (!subPhaseId && item.yourTurnOnly) continue;
      // Your shooting phase: show weapons, banners, bound spells
      // Opponent shooting phase (subPhaseId null): only show defensive items (banners, talismans, etc.)
      if (
        phaseId === "shooting" &&
        !subPhaseId &&
        (item.type === "weapon" ||
          item.effect?.toLowerCase().includes("poisoned attacks")) &&
        !item.mr
      )
        continue;
      if (
        phaseId === "shooting" &&
        subPhaseId &&
        item.type !== "weapon" &&
        item.type !== "banner" &&
        !item.effect?.toLowerCase().includes("bound spell")
      )
        continue;
      if (subPhaseId === "combat-result" && item.type !== "banner") continue;
      if (subPhaseId === "break-test" && item.type !== "banner") continue;
      if (subPhaseId === "pursuit" && !item.subPhases?.includes("pursuit"))
        continue;
      const key = item.name;
      if (!grouped[key]) grouped[key] = { item, units: [] };
      if (!grouped[key].units.includes(unit.name))
        grouped[key].units.push(unit.name);
    }

    // In canonical schema, weapons are already resolved and magical ones are in magicItems
    // So no additional processing needed here
  }

  const entries = Object.values(grouped);
  if (entries.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-purple/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-purple mb-3">Magic Items</h3>
      <div class="space-y-2">
        ${entries
          .map(
            ({ item, units }) => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <span class="text-wh-accent font-semibold">${item.name}</span>
            <span class="text-xs text-wh-muted ml-1">${item.type}</span>
            <p class="text-wh-muted text-xs mt-1">${item.effect}</p>
            <p class="text-wh-text text-xs mt-1">${units.join(", ")}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
