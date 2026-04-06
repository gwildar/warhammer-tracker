import { getMovementUnits } from "../army.js";

export function renderMovementContext(army) {
  const units = getMovementUnits(army);
  if (units.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-movement/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-movement mb-3">Your Units</h3>
      <div class="space-y-1">
        ${units
          .map((u) => {
            const mv = u.stats?.[0]?.M;
            return `
            <div class="flex justify-between items-center text-sm py-1 px-2 rounded bg-wh-card">
              <div>
                <span class="text-wh-text">${u.name}</span>
                ${u.strength > 1 ? `<span class="text-wh-muted ml-1">x${u.strength}</span>` : ""}
              </div>
              ${mv != null ? `<span class="text-wh-phase-movement font-mono text-xs">M${mv}</span>` : ""}
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `;
}
