import { SPECIAL_RULES } from "../data/special-rules.js";
import { getRound } from "../state.js";
import { normaliseRuleName, ruleMatches } from "../helpers.js";

const TROOP_TYPE_RULES = {
  MCa: ["Fear"],
  MCr: ["Fear", "Large Target"],
  Be: ["Terror", "Large Target", "Lumbering"],
};

function injectMountRules(unitRules, unit) {
  if (!unit.mount) return;
  const mount = unit.mount;
  if (!mount) return;

  if (
    mount.swiftstride &&
    !unitRules.some((r) => normaliseRuleName(r).toLowerCase() === "swiftstride")
  ) {
    unitRules.push("Swiftstride");
  }
  const troopRules = TROOP_TYPE_RULES[mount.troopType] || [];
  for (const rule of troopRules) {
    if (
      !unitRules.some(
        (r) => normaliseRuleName(r).toLowerCase() === rule.toLowerCase(),
      )
    ) {
      unitRules.push(rule);
    }
  }
  if (
    mount.stomp &&
    !unitRules.some(
      (r) => normaliseRuleName(r).toLowerCase() === "stomp attacks",
    )
  ) {
    unitRules.push(`Stomp Attacks (${mount.stomp})`);
  }
  if (
    mount.impactHits &&
    !unitRules.some((r) => normaliseRuleName(r).toLowerCase() === "impact hits")
  ) {
    unitRules.push(`Impact Hits (${mount.impactHits})`);
  }
  if (
    mount.firstCharge &&
    !unitRules.some(
      (r) => normaliseRuleName(r).toLowerCase() === "first charge",
    )
  ) {
    unitRules.push("First Charge");
  }
  if (
    mount.furiousCharge &&
    !unitRules.some(
      (r) => normaliseRuleName(r).toLowerCase() === "furious charge",
    )
  ) {
    unitRules.push("Furious Charge");
  }
  if (
    mount.counterCharge &&
    !unitRules.some(
      (r) => normaliseRuleName(r).toLowerCase() === "counter charge",
    )
  ) {
    unitRules.push("Counter Charge");
  }
}

function injectTerrorFear(unitRules) {
  if (
    unitRules.some((r) => normaliseRuleName(r).toLowerCase() === "terror") &&
    !unitRules.some((r) => normaliseRuleName(r).toLowerCase() === "fear")
  ) {
    unitRules.push("Fear");
  }
}

function normalisePhaseEntry(rule, entry) {
  if (typeof entry === "string") {
    return {
      subPhaseId: entry,
      description: rule.description,
      yourTurnOnly: rule.yourTurnOnly,
      opponentOnly: rule.opponentOnly,
      fromRound: rule.fromRound,
    };
  }
  return entry;
}

function buildUnitRules(unit) {
  const unitRules = [];

  for (const rule of unit.specialRules || []) {
    if (rule.displayName) unitRules.push(rule.displayName);
  }

  // Add weapon names from resolved weapons
  if (Array.isArray(unit.weapons)) {
    for (const weapon of unit.weapons) {
      if (weapon.name) {
        unitRules.push(weapon.name);
      }
    }
  }

  if (Array.isArray(unit.shootingWeapons)) {
    for (const weapon of unit.shootingWeapons) {
      if (weapon.name) {
        unitRules.push(weapon.name);
      }
    }
  }

  injectMountRules(unitRules, unit);
  injectTerrorFear(unitRules);
  return unitRules;
}

function renderRulesBlock(grouped, title) {
  const entries = Object.values(grouped);
  if (entries.length === 0) return "";
  return `
    <div class="bg-wh-surface rounded-lg border border-wh-accent/20 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-accent mb-3">${title}</h3>
      <div class="space-y-2">
        ${entries
          .map(
            (g) => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <span class="text-xs bg-wh-accent/20 text-wh-accent px-1.5 py-0.5 rounded">${g.ruleName}</span>
            <p class="text-wh-muted text-xs mt-1">${g.description}</p>
            <p class="text-wh-text text-xs mt-1">${g.units.join(", ")}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

export function renderSpecialRulesContext(army, subPhase) {
  const round = getRound();
  const matches = [];

  for (const unit of army.units) {
    const unitRules = buildUnitRules(unit);

    for (const ruleName of unitRules) {
      const normName = normaliseRuleName(ruleName);
      for (const rule of SPECIAL_RULES) {
        if (!ruleMatches(rule, normName)) continue;
        for (const rawEntry of rule.phases) {
          const phase = normalisePhaseEntry(rule, rawEntry);
          if (phase.subPhaseId !== subPhase.id) continue;
          if (phase.fromRound && round < phase.fromRound) continue;
          if (phase.opponentOnly) continue;
          matches.push({
            unitName: unit.name,
            ruleName: rule.displayName,
            description: phase.description,
          });
        }
      }
    }
  }

  const grouped = {};
  for (const m of matches) {
    const key = `${m.ruleName}||${m.description}`;
    if (!grouped[key])
      grouped[key] = {
        ruleName: m.ruleName,
        description: m.description,
        units: [],
      };
    if (!grouped[key].units.includes(m.unitName))
      grouped[key].units.push(m.unitName);
  }

  return renderRulesBlock(grouped, "Special Rules This Step");
}

export function renderSpecialRulesForPhase(army, phase) {
  const round = getRound();
  const grouped = {};

  for (const sub of phase.subPhases) {
    for (const unit of army.units) {
      const unitRules = buildUnitRules(unit);

      for (const ruleName of unitRules) {
        const normName = normaliseRuleName(ruleName);
        for (const rule of SPECIAL_RULES) {
          if (!ruleMatches(rule, normName)) continue;
          for (const rawEntry of rule.phases) {
            const rulePhase = normalisePhaseEntry(rule, rawEntry);
            if (rulePhase.subPhaseId !== sub.id) continue;
            if (rulePhase.fromRound && round < rulePhase.fromRound) continue;
            if (rulePhase.yourTurnOnly) continue;
            const key = `${rule.displayName}||${rulePhase.description}`;
            if (!grouped[key])
              grouped[key] = {
                ruleName: rule.displayName,
                description: rulePhase.description,
                units: [],
              };
            if (!grouped[key].units.includes(unit.name))
              grouped[key].units.push(unit.name);
          }
        }
      }
    }
  }

  return renderRulesBlock(grouped, "Special Rules This Phase");
}
