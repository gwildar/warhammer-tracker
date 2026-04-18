import {
  resolveMovement,
  extractFlyMovement,
  resolveBaseMv,
} from "../helpers.js";
import { displayUnitName } from "../utils/unit-name.js";
import { getCharacterAssignments } from "../state.js";

const CHARACTER_CATEGORIES = new Set(["characters", "lords", "heroes"]);

export function renderMovementStatsContext(army) {
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

  const rows = army.units
    .filter(
      (u) =>
        !(CHARACTER_CATEGORIES.has(u.category) && assignedCharIds.has(u.id)),
    )
    .map((u) => {
      const mountData = u.mount ?? null;
      const chars = (charsByUnitId[u.id] || []).map((c) => c.name);

      // War machines: use crew M stat, no march allowed
      const crewProfile =
        u.stats?.[0]?.crewed === true
          ? u.stats.find((s) => s.Ld && s.Ld !== "-")
          : null;
      if (crewProfile) {
        const baseMv =
          crewProfile.M && crewProfile.M !== "-" ? Number(crewProfile.M) : null;
        return { u, baseMv, march: null, flyMv: null, chars };
      }

      const mv = resolveMovement(u);
      const baseMv = resolveBaseMv(mountData, mv);
      const march = baseMv != null ? baseMv * 2 : null;
      const flyMv = extractFlyMovement(u, mountData);
      return { u, baseMv, march, flyMv, chars };
    })
    .filter(({ baseMv }) => baseMv != null)
    .sort((a, b) => b.baseMv - a.baseMv);

  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-movement/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-movement mb-3">Movement</h3>
      <div class="space-y-1">
        ${rows
          .map(
            ({ u, baseMv, march, flyMv, chars }) => `
          <div class="text-sm py-1 px-2 rounded bg-wh-card">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex flex-wrap items-center gap-1">
                  <span class="text-wh-text">${displayUnitName(u.name, u.strength)}</span>
                  ${u.strength > 1 ? `<span class="text-wh-muted">x${u.strength}</span>` : ""}
                </div>
                ${chars.map((c) => `<div class="text-wh-muted text-xs">${c}</div>`).join("")}
              </div>
              <div class="text-right shrink-0 ml-2">
                <span class="text-wh-phase-movement font-mono text-xs">${baseMv}"</span>
                ${
                  march != null
                    ? `<span class="text-wh-muted font-mono text-xs ml-2">March ${march}"</span>`
                    : `<span class="text-wh-muted text-xs ml-2">No march</span>`
                }
                ${
                  flyMv != null
                    ? `<div class="mt-0.5"><span class="text-blue-400 text-xs mr-1">Fly</span><span class="text-blue-400 font-mono text-xs">${flyMv}"</span></div>`
                    : ""
                }
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
