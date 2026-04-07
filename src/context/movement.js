import { resolveMovement } from "../helpers.js";

export function renderMovementStatsContext(army) {
  const rows = army.units
    .map((u) => {
      const mountData = u.mount ?? null;
      const mv = resolveMovement(u);
      const baseMv = mountData ? mountData.m : mv != null ? Number(mv) : null;
      const march = baseMv != null ? baseMv * 2 : null;

      // Fly: check specialRules for "Fly (N)", then mount.f
      const flyRuleStr = (u.specialRules || [])
        .map((r) => r.displayName || "")
        .find((d) => /^fly\s*\(/i.test(d.trim()));
      const flyMatch = flyRuleStr ? flyRuleStr.match(/\((\d+)\)/) : null;
      const flyMv = flyMatch ? Number(flyMatch[1]) : (mountData?.f ?? null);

      return { u, baseMv, march, flyMv };
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
            ({ u, baseMv, march, flyMv }) => `
          <div class="text-sm py-1 px-2 rounded bg-wh-card">
            <div class="flex justify-between items-center">
              <div class="flex flex-wrap items-center gap-1">
                <span class="text-wh-text">${u.name}</span>
                ${u.strength > 1 ? `<span class="text-wh-muted">x${u.strength}</span>` : ""}
              </div>
              <div class="text-right">
                <span class="text-wh-phase-movement font-mono text-xs">${baseMv}"</span>
                <span class="text-wh-muted font-mono text-xs ml-2">March ${march}"</span>
              </div>
            </div>
            ${
              flyMv != null
                ? `
              <div class="flex justify-end mt-0.5">
                <span class="text-blue-400 text-xs mr-1">Fly</span>
                <span class="text-blue-400 font-mono text-xs">${flyMv}"</span>
              </div>
            `
                : ""
            }
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
