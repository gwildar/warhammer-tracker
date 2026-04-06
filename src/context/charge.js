import { findMount } from "../data/mounts.js";
import { findMagicItem } from "../data/magic-items.js";
import { SPECIAL_RULES } from "../data/special-rules.js";
import {
  resolveMovement,
  parseUnitRules,
  normaliseRuleName,
} from "../helpers.js";

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

function normaliseItemName(name) {
  return name.replace(/\s*\(.*$/, "").trim();
}

function detectChargeMods(unit, mountData) {
  const mods = [];
  const seen = new Set();

  // From special rules
  const rules = parseUnitRules(unit.specialRules);
  for (const r of rules) {
    const norm = normaliseRuleName(r).toLowerCase();
    const mod = CHARGE_MOD_RULES.get(norm);
    if (mod && !seen.has(mod.tag)) {
      seen.add(mod.tag);
      mods.push(mod);
    }
  }

  // From mount (e.g. Swiftstride on mount)
  if (mountData?.swiftstride && !seen.has("Swift")) {
    const mod = CHARGE_MOD_RULES.get("swiftstride");
    if (mod) {
      seen.add(mod.tag);
      mods.push(mod);
    }
  }

  // From magic items and banners
  const itemNames = [...unit.magicItems, ...unit.banners.map((b) => b.name)];
  for (const name of itemNames) {
    const mi = findMagicItem(normaliseItemName(name));
    if (mi?.chargeMod && !seen.has(mi.chargeMod.tag)) {
      seen.add(mi.chargeMod.tag);
      mods.push(mi.chargeMod);
    }
  }

  mods.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return mods;
}

export function renderChargeContext(army) {
  const units = army.units;
  if (units.length === 0) return "";

  const rows = units.map((u) => {
    const mv = resolveMovement(u);
    const allRules = [...parseUnitRules(u.specialRules), ...u.equipment];

    const flyRule = allRules.find((r) => /^fly\s*\(/i.test(r.trim()));
    const flyMatch = flyRule ? flyRule.match(/\((\d+)\)/) : null;
    const mountData = u.mount ? findMount(u.mount) : null;
    const flyMv = flyMatch ? Number(flyMatch[1]) : (mountData?.f ?? null);
    const hasFly = flyMv != null;

    const chargeMods = detectChargeMods(u, mountData);
    const rangeBonus = chargeMods.reduce((sum, m) => sum + m.range, 0);

    const baseMv = mountData ? mountData.m : mv != null ? Number(mv) : null;
    const groundCharge = baseMv != null ? baseMv + 6 + rangeBonus : null;
    const flyCharge = hasFly ? flyMv + 6 + rangeBonus : null;
    const maxCharge = Math.max(groundCharge || 0, flyCharge || 0);

    return { u, groundCharge, flyCharge, hasFly, chargeMods, maxCharge };
  });

  rows.sort((a, b) => b.maxCharge - a.maxCharge);

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Max Declarable Charge</h3>
      <div class="space-y-1">
        ${rows
          .map(
            ({ u, groundCharge, flyCharge, hasFly, chargeMods }) => `
            <div class="text-sm py-1 px-2 rounded bg-wh-card">
              <div class="flex justify-between items-center">
                <div class="flex flex-wrap items-center gap-1">
                  <span class="text-wh-text">${u.name}</span>
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
            </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
