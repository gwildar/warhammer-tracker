import { displayUnitName } from "../utils/unit-name.js";
import {
  HAND_WEAPON,
  buildMountWeaponTags,
  weaponPoisonTags,
  mergeTagParts,
  buildCombatEntries,
  buildCombatResultEntries,
  buildCombatLeadershipData,
  buildDefensiveStatsEntries,
} from "./combat-data.js";

function applyApMod(ap, mod) {
  if (!mod) return ap;
  if (!ap || ap === "—") return `${mod}`;
  const result = parseInt(ap, 10) + mod;
  return result >= 0 ? "—" : `${result}`;
}

function mergeStrength(baseS, weaponS) {
  if (!weaponS) return `${baseS}`;
  if (weaponS === "S") return `${baseS}`;
  const mod = weaponS.match(/^S([+-]\d+)$/);
  if (mod) return `${parseInt(baseS) + parseInt(mod[1])}`;
  return weaponS;
}

// Rules already represented visually (tags, stats) — stripped from the rules text line
const REDUNDANT_RULE_PATTERNS = [
  { pattern: /^Extra Attacks\s*\(/i, condition: (w) => w.attacks },
  { pattern: /^Magical Attacks/i },
  { pattern: /^Poisoned Attacks/i, condition: (w) => w.reservedAttacks },
];

function stripRedundantRules(rules, w) {
  if (!rules?.length) return "";
  return rules
    .filter((r) => {
      for (const { pattern, condition } of REDUNDANT_RULE_PATTERNS) {
        if ((!condition || condition(w)) && pattern.test(r)) return false;
      }
      return true;
    })
    .join(", ");
}

// Builds a plain descriptor for one weapon row — no HTML yet
function buildWeaponRow(i, ws, s, attacks, weapon, label, tags, apMod = 0) {
  return {
    i,
    ws,
    displayS: mergeStrength(s, weapon.s),
    displayA: weapon.attacks ? `${attacks}${weapon.attacks}` : `${attacks}`,
    label: label || null,
    name: weapon.name,
    ap: applyApMod(weapon.ap, apMod),
    rules: stripRedundantRules(weapon.rules, weapon),
    tags,
  };
}

// Renders a row descriptor as a <tbody class="text-xs"> containing one or two <tr>s.
// Each weapon gets its own tbody so querySelectorAll(".text-xs") still finds individual
// weapon lines (tests depend on this isolation).
function renderWeaponRow(row) {
  const inlineTags =
    typeof row.tags === "object" && row.tags !== null
      ? row.tags.inline || ""
      : row.tags || "";
  const subParts = [
    typeof row.tags === "object" && row.tags !== null ? row.tags.sub || "" : "",
    row.rules
      ? `<span class="text-wh-muted text-[9px]">${row.rules}</span>`
      : "",
  ].filter(Boolean);

  return `
    <tbody class="text-xs">
      <tr class="align-baseline ${subParts.length === 0 ? "border-b border-wh-border/80" : ""}">
        <td class="w-8 pl-1 pr-1 text-wh-phase-combat font-mono whitespace-nowrap">I${row.i}</td>
        <td class="w-12 pl-1 pr-1 text-wh-phase-combat font-mono whitespace-nowrap">A${row.displayA}</td>
        <td class="w-10 pl-1 pr-1 text-wh-muted font-mono whitespace-nowrap">WS${row.ws}</td>
        <td class="w-8 pl-1 pr-1 text-wh-muted font-mono whitespace-nowrap">S${row.displayS}</td>
        <td class="w-10 pl-1 pr-2 font-mono text-wh-muted whitespace-nowrap">${row.ap !== "—" ? `AP${row.ap}` : "-"}</td>
        <td class="pl-1">
          <span class="text-wh-text">${row.name}</span>
          ${inlineTags}
        </td>
      </tr>
      ${subParts.length > 0 ? `<tr class="border-b border-wh-border/80"><td colspan="6" class="pl-1 pb-1">${subParts.join("")}</td></tr>` : ""}
    </tbody>
  `;
}

function renderWeaponTable(rows) {
  if (rows.length === 0) return "";
  let html = "";
  let currentLabel = undefined;
  for (const row of rows) {
    if (row.label !== currentLabel) {
      currentLabel = row.label;
      if (row.label) {
        html += `<tbody><tr><td colspan="6" class="pl-1 pt-1 text-[9px] uppercase tracking-wide text-wh-accent">${row.label}</td></tr></tbody>`;
      }
    }
    html += renderWeaponRow(row);
  }
  return `<table class="w-full mt-1 border-collapse table-fixed">
    <colgroup>
      <col class="w-8">
      <col class="w-12">
      <col class="w-10">
      <col class="w-8">
      <col class="w-10">
      <col>
    </colgroup>
    ${html}</table>`;
}

// Collects all weapon row descriptors for a full unit entry
function collectWeaponRows(r) {
  const rows = [];
  const apMod = r.apMod || 0;

  // Champions
  for (const ch of r.champions || []) {
    const tags = ch.tags !== null ? ch.tags : r.riderTags;
    for (const w of ch.weapons) {
      rows.push(
        buildWeaponRow(ch.i, ch.ws, ch.s, ch.a, w, ch.name, tags, apMod),
      );
    }
  }

  // Rider weapons (with reserved/remaining A-budget)
  {
    const reserved = r.riderWeapons.filter((w) => w.reservedAttacks);
    const remaining = r.riderWeapons.filter((w) => !w.reservedAttacks);
    const totalA = parseInt(r.riderA) || 0;
    const reservedCount = reserved.reduce(
      (sum, w) => sum + w.reservedAttacks,
      0,
    );
    const freeA = Math.max(totalA - reservedCount, 0);
    const mainA = reserved.length > 0 ? `${freeA}/${r.riderA}` : r.riderA;
    for (const w of remaining) {
      rows.push(
        buildWeaponRow(
          r.riderI,
          r.riderWS,
          r.riderS,
          mainA,
          w,
          r.riderName,
          mergeTagParts(r.riderTags, weaponPoisonTags(w)),
          apMod,
        ),
      );
    }
    for (const w of reserved) {
      rows.push(
        buildWeaponRow(
          r.riderI,
          r.riderWS,
          r.riderS,
          w.reservedAttacks,
          w,
          r.riderName,
          mergeTagParts(r.riderTags, weaponPoisonTags(w)),
          apMod,
        ),
      );
    }
  }

  // Crew
  for (const c of r.crew) {
    const weapons = c.weapons.length > 0 ? c.weapons : [HAND_WEAPON];
    for (const w of weapons) {
      rows.push(buildWeaponRow(c.i, c.ws, c.s, c.a, w, c.name, null, apMod));
    }
  }

  // Detachments
  for (const d of r.detachments || []) {
    const weapons = d.weapons.length > 0 ? d.weapons : [HAND_WEAPON];
    for (const w of weapons) {
      rows.push(buildWeaponRow(d.i, d.ws, d.s, d.a, w, d.name, null, apMod));
    }
  }

  // Mount weapons (with A-budget)
  if (r.mountWeapons.length > 0) {
    const mountI = r.mountI || r.riderI;
    const mountWS = r.mountWS || r.riderWS;
    const totalA = parseInt(r.mountA) || 0;
    const reserved = r.mountWeapons.filter((w) => w.reservedAttacks);
    const remaining = r.mountWeapons.filter((w) => !w.reservedAttacks);
    const reservedCount = reserved.reduce(
      (sum, w) => sum + w.reservedAttacks,
      0,
    );
    const freeA = Math.max(totalA - reservedCount, 0);
    for (const w of remaining) {
      rows.push(
        buildWeaponRow(
          mountI,
          mountWS,
          r.mountS,
          remaining.length === 1 ? freeA : "?",
          w,
          r.mountName,
          buildMountWeaponTags(w),
          apMod,
        ),
      );
    }
    for (const w of reserved) {
      rows.push(
        buildWeaponRow(
          mountI,
          mountWS,
          r.mountS,
          w.reservedAttacks,
          w,
          r.mountName,
          buildMountWeaponTags(w),
          apMod,
        ),
      );
    }
  } else if (r.mountA) {
    // Mount has attacks but no weapon list — synthesise a row
    const syntheticWeapon = {
      name: r.mountName || "Mount",
      s: "",
      ap: "—",
      rules: r.mountArmourBane ? [`Armour Bane (${r.mountArmourBane})`] : [],
    };
    rows.push(
      buildWeaponRow(
        r.mountI || r.riderI,
        r.mountWS || r.riderWS,
        r.mountS,
        r.mountA,
        syntheticWeapon,
        null,
        null,
        apMod,
      ),
    );
  }

  return rows;
}

// Collects weapon row descriptors for an assigned character profile
function collectCharWeaponRows(ch, apMod = 0) {
  const rows = [];

  // Rider weapons — use ch.a for all (no reserved split for character profiles)
  for (const w of ch.weapons) {
    rows.push(buildWeaponRow(ch.i, ch.ws, ch.s, ch.a, w, null, ch.tags, apMod));
  }

  // Mount weapons (with A-budget)
  if (ch.mountWeapons?.length > 0) {
    const mountI = ch.mountI || ch.i;
    const mountWS = ch.mountWS || ch.ws;
    const totalA = parseInt(ch.mountA) || 0;
    const reserved = ch.mountWeapons.filter((w) => w.reservedAttacks);
    const remaining = ch.mountWeapons.filter((w) => !w.reservedAttacks);
    const reservedCount = reserved.reduce(
      (sum, w) => sum + w.reservedAttacks,
      0,
    );
    const freeA = Math.max(totalA - reservedCount, 0);
    for (const w of remaining) {
      rows.push(
        buildWeaponRow(
          mountI,
          mountWS,
          ch.mountS,
          remaining.length === 1 ? freeA : "?",
          w,
          ch.mountName,
          buildMountWeaponTags(w),
          apMod,
        ),
      );
    }
    for (const w of reserved) {
      rows.push(
        buildWeaponRow(
          mountI,
          mountWS,
          ch.mountS,
          w.reservedAttacks,
          w,
          ch.mountName,
          buildMountWeaponTags(w),
          apMod,
        ),
      );
    }
  } else if (ch.mountA) {
    const syntheticWeapon = {
      name: ch.mountName || "Mount",
      s: "",
      ap: "—",
      rules: [],
    };
    rows.push(
      buildWeaponRow(
        ch.mountI || ch.i,
        ch.mountWS || ch.ws,
        ch.mountS,
        ch.mountA,
        syntheticWeapon,
        null,
        null,
        apMod,
      ),
    );
  }

  return rows;
}

function renderSingleUseItems(r) {
  if (r.singleUseItems.length === 0) return "";
  return `<div class="mt-1">${r.singleUseItems.map((item) => `<div class="text-xs"><span class="text-wh-accent">\u{1F6E1} ${item.name}</span> <span class="text-wh-muted">(single use)</span></div>`).join("")}</div>`;
}

function statRow(t, w, as_, mr, ward, regen) {
  // as_ avoids shadowing the reserved word 'as'
  return `<div class="flex items-center gap-2 flex-wrap mt-0.5 pb-1 border-b border-wh-border">
      <span class="text-wh-text font-mono text-xs">T:${t}</span>
      <span class="text-wh-text font-mono text-xs">W:${w}</span>
      ${as_ ? `<span class="text-blue-400 font-mono text-xs">\u{1F6E1}\uFE0FAS:${as_}</span>` : ""}
      ${mr ? `<span class="text-wh-phase-combat font-mono text-xs">\u2728MR:${mr}</span>` : ""}
      ${ward ? `<span class="text-purple-400 font-mono text-xs">\u{1F52E}Ward:${ward}</span>` : ""}
      ${regen ? `<span class="text-green-400 font-mono text-xs">\u{1F49A}Regen:${regen}</span>` : ""}
    </div>`;
}

function renderUnitWeapons(r) {
  const rows = collectWeaponRows(r);
  const stomp =
    r.stomp || r.impactHits
      ? `<div class="text-xs text-wh-phase-combat mt-0.5">${r.impactHits ? `\u{1F4A5} Impact ${r.impactHits}` : ""}${r.stomp && r.impactHits ? " | " : ""}${r.stomp ? `\u{1F9B6} Stomp ${r.stomp}` : ""}</div>`
      : "";
  return renderWeaponTable(rows) + stomp;
}

function renderCombatRulesHtml(rules) {
  return rules.length > 0
    ? `<div class="text-xs text-wh-accent mt-0.5">${rules.join(", ")}</div>`
    : "";
}

function renderBanners(r) {
  return (r.bannerNames || [])
    .map((name) => {
      const label = r.bannerLabels?.[name];
      const modHtml = label
        ? `<span class="text-[10px] text-wh-accent-dim ml-2">${label}</span>`
        : "";
      return `<div class="text-xs mt-0.5 pl-2 border-l-2 border-wh-accent bg-wh-accent/8"><span class="text-[9px] uppercase tracking-wide text-wh-accent-dim mr-1">Banner</span><span class="text-wh-accent">${name}</span>${modHtml}</div>`;
    })
    .join("");
}

function renderFooter(r) {
  const bannerNameSet = new Set(r.bannerNames || []);
  return [
    (r.conditionalStrengthMods || [])
      .filter((m) => !bannerNameSet.has(m.source))
      .map((m) => `<div class="text-[10px] text-wh-muted">* ${m.source}</div>`)
      .join(""),
    r.itemNames.length > 0
      ? `<div class="text-xs text-wh-muted mt-0.5">${r.itemNames.join(", ")}</div>`
      : "",
  ].join("");
}

export function renderCombatWeaponsContext(army) {
  const rows = buildCombatEntries(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Combat Units</h3>
      <div class="space-y-2">
        ${rows
          .map(
            (r) => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex justify-between items-start">
              <div class="text-wh-text font-semibold text-sm">${displayUnitName(r.unitName, r.strength)}${r.mount ? ` (${r.mount})` : ""}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ""}</div>
              <div class="text-right shrink-0 ml-2">
                <div class="text-wh-muted text-[10px] font-mono">${r.points}pts</div>
                <div class="text-wh-muted text-[10px] font-mono">US:${r.unitStrength}</div>
              </div>
            </div>
            ${renderBanners(r)}
            ${
              (r.assignedCharProfiles || []).length === 0
                ? `
                ${statRow(r.t, r.w, r.as, r.mr, r.ward, r.regen)}
                ${renderSingleUseItems(r)}
                <div class="mt-1">
                  ${renderUnitWeapons(r)}
                  ${renderCombatRulesHtml(r.combatRules)}
                  ${renderFooter(r)}
                </div>
              `
                : `
                ${renderSingleUseItems(r)}
                <div class="mt-1">
                  <div class="text-[9px] uppercase tracking-wide text-wh-muted mb-0.5">${displayUnitName(r.unitName, r.strength)}</div>
                  ${statRow(r.t, r.w, r.as, r.mr, r.ward, r.regen)}
                  ${renderUnitWeapons(r)}
                  ${renderCombatRulesHtml(r.combatRules)}
                  ${(r.assignedCharProfiles || [])
                    .map(
                      (ch) => `
                    <div class="border-t-2 border-wh-text/40 mt-1.5 pt-1.5">
                      <div class="flex justify-between items-center">
                        <div class="text-[9px] uppercase tracking-wide text-wh-muted">${ch.name}</div>
                        <div class="text-[9px] text-wh-muted font-mono">${ch.points}pts</div>
                      </div>
                      ${statRow(ch.t, ch.w, ch.as, ch.mr, ch.ward, ch.regen)}
                      ${renderWeaponTable(collectCharWeaponRows(ch, r.apMod))}
                      ${renderCombatRulesHtml(ch.combatRules)}
                      ${ch.singleUseItems?.length > 0 ? `<div class="mt-1">${ch.singleUseItems.map((item) => `<div class="text-xs"><span class="text-wh-accent">\u{1F6E1} ${item.name}</span> <span class="text-wh-muted">(single use)</span></div>`).join("")}</div>` : ""}
                      ${ch.itemNames?.length > 0 ? `<div class="text-xs text-wh-muted mt-0.5">${ch.itemNames.join(", ")}</div>` : ""}
                    </div>
                  `,
                    )
                    .join("")}
                  ${renderFooter(r)}
                </div>
              `
            }
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

export function renderCombatResultContext(army) {
  const rows = buildCombatResultEntries(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Static Combat Bonuses</h3>
      <div class="space-y-1">
        ${rows
          .map(
            (r) => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <div class="flex items-center gap-2">
              <span class="text-wh-text">${r.name}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ""}</span>
              <span class="text-wh-phase-combat font-mono text-xs ml-auto">+${r.total}</span>
            </div>
            ${r.bonuses.length > 0 ? `<p class="text-xs text-wh-muted mt-0.5">${r.bonuses.join(", ")}</p>` : ""}
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

export function renderCombatLeadershipContext(army, title = "Break Test") {
  const { rows, general, generalLd, generalRange, bsb, bsbRange } =
    buildCombatLeadershipData(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">${title}</h3>
      ${
        general
          ? `
        <div class="p-2 rounded bg-wh-card mb-2">
          <p class="text-xs"><span class="font-semibold text-wh-text">Inspiring Presence:</span> <span class="text-wh-muted">Units within ${generalRange}" of ${general.name} (Ld${generalLd}) may use their Ld.</span></p>
          ${bsb ? `<p class="text-xs mt-1"><span class="font-semibold text-wh-text">Hold Your Ground:</span> <span class="text-wh-muted">Units within ${bsbRange}" of ${bsb.name} may re-roll Break tests.</span></p>` : ""}
        </div>`
          : ""
      }
      <div class="space-y-1">
        ${rows
          .map(
            (r) => `
          <div class="p-2 rounded bg-wh-card flex justify-between items-center">
            <span class="text-wh-text text-sm">${r.name}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ""}</span>
            <span class="text-wh-muted font-mono text-xs">Ld${r.ld}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

export function renderDefensiveStatsContext(army) {
  const rows = buildDefensiveStatsEntries(army);
  if (rows.length === 0) return "";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-shooting/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-shooting mb-3">Your Units</h3>
      <div class="space-y-1">
        ${rows
          .map(
            (r) => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex items-center gap-2 flex-wrap text-sm">
              <span class="text-wh-text font-semibold">${r.name}${r.mount ? ` (${r.mount})` : ""}${!r.merged && r.strength > 1 ? ` <span class="text-wh-muted font-normal">x${r.strength}</span>` : ""}</span>
              <span class="text-wh-muted font-mono text-xs">T:${r.t}</span>
              <span class="text-wh-muted font-mono text-xs">W:${r.w}</span>
              ${r.as ? `<span class="text-blue-400 font-mono text-xs">\u{1F6E1}\uFE0FAS:${r.as}</span>` : ""}
              ${r.ward ? `<span class="text-purple-400 font-mono text-xs">\u{1F52E}Ward:${r.ward}</span>` : ""}
              ${r.regen ? `<span class="text-green-400 font-mono text-xs">\u{1F49A}Regen:${r.regen}</span>` : ""}
              ${r.mr ? `<span class="text-purple-400 font-mono text-xs">\u2728MR:${r.mr}</span>` : ""}
              ${r.hasEvasive ? '<span class="text-green-400 font-mono text-xs">\u{1F3C3}\u200D\u2640\uFE0FEvasive</span>' : ""}
              <span class="text-wh-muted font-mono text-xs ml-auto">Ld${r.ld}</span>
            </div>
            ${(r.chars || [])
              .map(
                (c) => `
              <div class="flex items-center gap-2 flex-wrap text-sm mt-1 ml-2 border-l border-wh-border pl-2">
                <span class="text-wh-muted font-semibold">${c.name}${c.mount ? ` (${c.mount})` : ""}</span>
                ${statRow(c.t, c.w, c.as, c.mr, c.ward, c.regen)}
              </div>`,
              )
              .join("")}
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
