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

function renderMountWeapons(
  weapons,
  mountA,
  mountS,
  mountI,
  mountWS,
  options = {},
) {
  if (weapons.length === 0) return "";
  const totalA = parseInt(mountA) || 0;
  const reserved = weapons.filter((w) => w.reservedAttacks);
  const remaining = weapons.filter((w) => !w.reservedAttacks);
  const reservedCount = reserved.reduce((sum, w) => sum + w.reservedAttacks, 0);
  const freeA = Math.max(totalA - reservedCount, 0);

  return [
    ...remaining.map((w) =>
      renderWeaponLine(
        mountI,
        mountWS,
        mountS,
        remaining.length === 1 ? freeA : "?",
        w,
        null,
        buildMountWeaponTags(w),
        options,
      ),
    ),
    ...reserved.map((w) =>
      renderWeaponLine(
        mountI,
        mountWS,
        mountS,
        w.reservedAttacks,
        w,
        null,
        buildMountWeaponTags(w),
        options,
      ),
    ),
  ].join("");
}

function mergeStrength(baseS, weaponS) {
  if (!weaponS) return `${baseS}`;
  if (weaponS === "S") return `${baseS}`;
  const mod = weaponS.match(/^S([+-]\d+)$/);
  if (mod) return `${baseS}${mod[1]}`;
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

function renderWeaponLine(
  initiative,
  ws,
  s,
  attacks,
  w,
  label,
  tags,
  options = {},
) {
  const { apMod = 0 } = options;

  const displayS = mergeStrength(s, w.s);

  const displayA = w.attacks ? `${attacks}${w.attacks}` : attacks;
  const displayRules = stripRedundantRules(w.rules, w);
  const effectiveAP = applyApMod(w.ap, apMod);

  const inlineTags =
    typeof tags === "object" && tags !== null ? tags.inline || "" : tags || "";
  const subLine =
    typeof tags === "object" && tags !== null ? tags.sub || "" : "";

  return `<div class="text-xs mb-1">
    <span class="text-wh-phase-combat font-mono">I${initiative}</span>
    <span class="text-wh-phase-combat font-mono ml-1">A${displayA}</span>
    <span class="text-wh-muted font-mono ml-1">WS${ws}</span>
    <span class="text-wh-muted font-mono ml-1">S${displayS}</span>
    ${label ? `<span class="text-wh-accent text-xs ml-1">${label}</span>` : ""}
    <span class="text-wh-text ml-1">${w.name}</span>
    ${effectiveAP && effectiveAP !== "—" ? `<span class="text-wh-muted font-mono ml-1">AP${effectiveAP}</span>` : ""}
    ${inlineTags}
    ${displayRules ? `<div class="text-wh-muted">${displayRules}</div>` : ""}
    ${subLine}
  </div>`;
}

export function renderCombatWeaponsContext(army) {
  const rows = buildCombatEntries(army);
  if (rows.length === 0) return "";

  function renderSingleUseItems(r) {
    if (r.singleUseItems.length === 0) return "";
    return `<div class="mt-1">${r.singleUseItems.map((item) => `<div class="text-xs"><span class="text-wh-accent">\u{1F6E1} ${item.name}</span> <span class="text-wh-muted">(single use)</span></div>`).join("")}</div>`;
  }

  function statRow(t, w, as_, mr, ward, regen) {
    // as_ avoids shadowing the reserved word 'as'
    return `<div class="flex items-center gap-2 flex-wrap mt-0.5">
      <span class="text-wh-muted font-mono text-xs">T:${t}</span>
      <span class="text-wh-muted font-mono text-xs">W:${w}</span>
      ${as_ ? `<span class="text-blue-400 font-mono text-xs">\u{1F6E1}\uFE0FAS:${as_}</span>` : ""}
      ${mr ? `<span class="text-wh-phase-combat font-mono text-xs">\u2728MR:${mr}</span>` : ""}
      ${ward ? `<span class="text-purple-400 font-mono text-xs">\u{1F52E}Ward:${ward}</span>` : ""}
      ${regen ? `<span class="text-green-400 font-mono text-xs">\u{1F49A}Regen:${regen}</span>` : ""}
    </div>`;
  }

  function renderUnitWeapons(r) {
    return [
      ...(r.champions || []).flatMap((ch) =>
        ch.weapons.map((w) =>
          renderWeaponLine(
            ch.i,
            ch.ws,
            ch.s,
            ch.a,
            w,
            ch.name,
            ch.tags !== null ? ch.tags : r.riderTags,
            { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
          ),
        ),
      ),
      ...(() => {
        const reserved = r.riderWeapons.filter((w) => w.reservedAttacks);
        const remaining = r.riderWeapons.filter((w) => !w.reservedAttacks);
        const totalA = parseInt(r.riderA) || 0;
        const reservedCount = reserved.reduce(
          (sum, w) => sum + w.reservedAttacks,
          0,
        );
        const freeA = Math.max(totalA - reservedCount, 0);
        const mainA = reserved.length > 0 ? `${freeA}/${r.riderA}` : r.riderA;
        return [
          ...remaining.map((w) =>
            renderWeaponLine(
              r.riderI,
              r.riderWS,
              r.riderS,
              mainA,
              w,
              r.riderName,
              mergeTagParts(r.riderTags, weaponPoisonTags(w)),
              { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
            ),
          ),
          ...reserved.map((w) =>
            renderWeaponLine(
              r.riderI,
              r.riderWS,
              r.riderS,
              w.reservedAttacks,
              w,
              r.riderName,
              mergeTagParts(r.riderTags, weaponPoisonTags(w)),
              { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
            ),
          ),
        ];
      })(),
      ...r.crew.map((c) =>
        c.weapons.length > 0
          ? c.weapons
              .map((w) =>
                renderWeaponLine(c.i, c.ws, c.s, c.a, w, c.name, null, {
                  apMod: r.apMod,
                  conditionalSMods: r.conditionalStrengthMods,
                }),
              )
              .join("")
          : renderWeaponLine(c.i, c.ws, c.s, c.a, HAND_WEAPON, c.name, null, {
              apMod: r.apMod,
              conditionalSMods: r.conditionalStrengthMods,
            }),
      ),
      ...(r.detachments || []).map((d) =>
        d.weapons.length > 0
          ? d.weapons
              .map((w) =>
                renderWeaponLine(d.i, d.ws, d.s, d.a, w, d.name, null, {
                  apMod: r.apMod,
                  conditionalSMods: r.conditionalStrengthMods,
                }),
              )
              .join("")
          : renderWeaponLine(d.i, d.ws, d.s, d.a, HAND_WEAPON, d.name, null, {
              apMod: r.apMod,
              conditionalSMods: r.conditionalStrengthMods,
            }),
      ),
      r.mountWeapons.length > 0
        ? renderMountWeapons(
            r.mountWeapons,
            r.mountA,
            r.mountS,
            r.mountI || r.riderI,
            r.mountWS || r.riderWS,
            { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
          )
        : r.mountA
          ? renderWeaponLine(
              r.mountI || r.riderI,
              r.mountWS || r.riderWS,
              r.mountS,
              r.mountA,
              {
                name: r.mountName || "Mount",
                s: "",
                ap: "—",
                rules: r.mountArmourBane
                  ? [`Armour Bane (${r.mountArmourBane})`]
                  : [],
              },
              null,
              null,
              { apMod: r.apMod, conditionalSMods: r.conditionalStrengthMods },
            )
          : "",
      r.stomp || r.impactHits
        ? `<div class="text-xs text-wh-phase-combat">${r.impactHits ? `\u{1F4A5} Impact ${r.impactHits}` : ""}${r.stomp && r.impactHits ? " | " : ""}${r.stomp ? `\u{1F9B6} Stomp ${r.stomp}` : ""}</div>`
        : "",
    ].join("");
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
        .map(
          (m) => `<div class="text-[10px] text-wh-muted">* ${m.source}</div>`,
        )
        .join(""),
      r.itemNames.length > 0
        ? `<div class="text-xs text-wh-muted mt-0.5">${r.itemNames.join(", ")}</div>`
        : "",
    ].join("");
  }

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
                    <div class="border-t border-wh-border mt-1.5 pt-1.5">
                      <div class="flex justify-between items-center">
                        <div class="text-[9px] uppercase tracking-wide text-wh-muted">${ch.name}</div>
                        <div class="text-[9px] text-wh-muted font-mono">${ch.points}pts</div>
                      </div>
                      ${statRow(ch.t, ch.w, ch.as, ch.mr, ch.ward, ch.regen)}
                      ${ch.weapons
                        .map((w) =>
                          renderWeaponLine(
                            ch.i,
                            ch.ws,
                            ch.s,
                            ch.a,
                            w,
                            null,
                            ch.tags,
                            {
                              apMod: r.apMod,
                              conditionalSMods: r.conditionalStrengthMods,
                            },
                          ),
                        )
                        .join("")}
                      ${renderCombatRulesHtml(ch.combatRules)}
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
        </div>
      `
          : ""
      }
      <div class="space-y-1">
        ${rows
          .map(
            (r) => `
          <div class="flex items-center gap-2 p-2 rounded bg-wh-card text-sm">
            <div>
              <span class="text-wh-text">${r.name}</span>
              ${r.chars.map((c) => `<div class="text-wh-muted text-xs">${c}</div>`).join("")}
            </div>
            <span class="text-wh-phase-combat font-mono text-xs ml-auto self-start">Ld${r.ld}</span>
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
              ${r.hasEvasive ? '<span class="text-green-400 font-mono text-xs">\u{1F3C3}\u200D\u2640\uFE0FEvasive</span>' : ""}
              <span class="text-wh-muted font-mono text-xs ml-auto">Ld${r.ld}</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}
