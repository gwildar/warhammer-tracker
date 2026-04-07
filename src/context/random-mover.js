export function renderRandomMoverContext(army) {
  const movers = army.units.filter((u) =>
    (u.specialRules || []).some((r) => r.id === "random movement"),
  );

  if (movers.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-movement/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-movement mb-3">Random Movers</h3>
      <div class="space-y-1">
        ${movers
          .map((u) => {
            const rule = u.specialRules.find((r) => r.id === "random movement");
            return `
          <div class="text-sm py-1 px-2 rounded bg-wh-card flex justify-between items-center">
            <div class="flex items-center gap-1">
              <span class="text-wh-text">${u.name}</span>
              ${u.strength > 1 ? `<span class="text-wh-muted">x${u.strength}</span>` : ""}
            </div>
            <span class="text-wh-phase-movement font-mono text-xs">${rule?.displayName ?? "Random Movement"}</span>
          </div>
        `;
          })
          .join("")}
      </div>
    </div>
  `;
}
