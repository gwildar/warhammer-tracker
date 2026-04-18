import { SPECIAL_RULES } from "../data/special-rules.js";
import {
  resolveMovement,
  normaliseRuleName,
  extractFlyMovement,
  resolveBaseMv,
} from "../helpers.js";
import { getCharacterAssignments } from "../state.js";
import { displayUnitName } from "../utils/unit-name.js";

// Build lookup: normalised rule name → chargeMod object
const CHARGE_MOD_RULES = new Map();
for (const rule of SPECIAL_RULES) {
  if (rule.chargeMod) {
    CHARGE_MOD_RULES.set(rule.id, rule.chargeMod);
    if (rule.aliases) {
      for (const a of rule.aliases)
        CHARGE_MOD_RULES.set(a.toLowerCase(), rule.chargeMod);
    }
  }
}

function detectChargeMods(unit, mountData) {
  const mods = [];
  const seen = new Set();

  // From special rules (resolved array of objects)
  for (const rule of unit.specialRules || []) {
    const norm = normaliseRuleName(rule.displayName || "").toLowerCase();
    const mod = CHARGE_MOD_RULES.get(rule.id) ?? CHARGE_MOD_RULES.get(norm);
    if (mod && !seen.has(mod.tag)) {
      seen.add(mod.tag);
      mods.push(mod);
    }
  }

  // From mount
  if (mountData?.swiftstride && !seen.has("Swift")) {
    const mod = CHARGE_MOD_RULES.get("swiftstride");
    if (mod) {
      seen.add(mod.tag);
      mods.push(mod);
    }
  }

  // From magic items (already resolved objects; includes banner chargeMods)
  for (const item of unit.magicItems || []) {
    if (item.chargeMod && !seen.has(item.chargeMod.tag)) {
      seen.add(item.chargeMod.tag);
      mods.push(item.chargeMod);
    }
  }

  mods.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return mods;
}

export function renderChargeContext(army) {
  const units = army.units;
  if (units.length === 0) return "";

  const assignments = getCharacterAssignments();
  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, uid]) => uid)
      .map(([cid]) => cid),
  );

  // Build reverse map: unitId → assigned character units
  const charsByUnitId = new Map();
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (!unitId) continue;
    const charUnit = units.find((u) => u.id === charId);
    if (!charUnit) continue;
    if (!charsByUnitId.has(unitId)) charsByUnitId.set(unitId, []);
    charsByUnitId.get(unitId).push(charUnit);
  }

  // Exclude assigned characters and war machines (cannot charge)
  const unitsToRender = units.filter(
    (u) => !assignedCharIds.has(u.id) && u.stats?.[0]?.crewed !== true,
  );

  const rows = unitsToRender.map((u) => {
    const mv = resolveMovement(u);
    const mountData = u.mount ?? null;

    const flyMv = extractFlyMovement(u, mountData);
    const hasFly = flyMv != null;

    const chargeMods = detectChargeMods(u, mountData);

    // Merge chargeMods from assigned characters' magic items
    const seenTags = new Set(chargeMods.map((m) => m.tag));
    for (const char of charsByUnitId.get(u.id) || []) {
      for (const item of char.magicItems || []) {
        if (item.chargeMod && !seenTags.has(item.chargeMod.tag)) {
          seenTags.add(item.chargeMod.tag);
          chargeMods.push(item.chargeMod);
        }
      }
    }
    chargeMods.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    const rangeBonus = chargeMods.reduce((sum, m) => sum + m.range, 0);

    const baseMv = resolveBaseMv(mountData, mv);
    const groundCharge = baseMv != null ? baseMv + 6 + rangeBonus : null;
    const flyCharge = hasFly ? flyMv + 6 + rangeBonus : null;
    const maxCharge = Math.max(groundCharge || 0, flyCharge || 0);

    const assignedChars = charsByUnitId.get(u.id) || [];
    return {
      u,
      groundCharge,
      flyCharge,
      hasFly,
      chargeMods,
      maxCharge,
      assignedChars,
    };
  });

  rows.sort((a, b) => b.maxCharge - a.maxCharge);

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Max Declarable Charge</h3>
      <div class="space-y-1">
        ${rows
          .map(
            ({
              u,
              groundCharge,
              flyCharge,
              hasFly,
              chargeMods,
              assignedChars,
            }) => `
            <div class="text-sm py-1 px-2 rounded bg-wh-card">
              <div class="flex justify-between items-center">
                <div class="flex flex-wrap items-center gap-1">
                  <span class="text-wh-text">${displayUnitName(u.name, u.strength)}</span>
                  ${u.strength > 1 ? `<span class="text-wh-muted">x${u.strength}</span>` : ""}
                  ${chargeMods
                    .map((m) => {
                      const colors = {
                        green: "text-wh-phase-movement bg-wh-phase-movement/10",
                        orange: "text-orange-400 bg-orange-400/10",
                      };
                      const cls = colors[m.color] || colors.orange;
                      return `<span class="${cls} rounded px-1 text-xs font-mono">${m.tag}${m.range ? ` +${m.range}"` : ""}</span>`;
                    })
                    .join("")}
                </div>
                <div class="text-right">
                  ${
                    groundCharge != null
                      ? `<span class="text-wh-phase-combat font-mono text-xs">${groundCharge}"</span>`
                      : ""
                  }
                </div>
              </div>
              ${
                hasFly
                  ? `
                <div class="flex justify-end mt-0.5">
                  <span class="text-blue-400 text-xs mr-1">Fly</span>
                  <span class="text-blue-400 font-mono text-xs">${flyCharge}"</span>
                </div>
              `
                  : ""
              }
              ${
                assignedChars.length > 0
                  ? `<div class="text-wh-muted text-[10px] mt-0.5">${assignedChars.map((c) => c.name).join(", ")}</div>`
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
