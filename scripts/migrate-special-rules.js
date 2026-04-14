// Run once: node scripts/migrate-special-rules.js
// Then delete this file.
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";

// Dynamic import to get the current SPECIAL_RULES
const { SPECIAL_RULES } = await import("../src/data/special-rules.js");

function classifyRule(rule) {
  if (rule.passive) return "passive";
  const phases = rule.phases;
  if (!phases || phases.length === 0) return "passive";
  if (phases.every((p) => typeof p === "string")) return "already-simple";
  if (phases.every((p) => typeof p === "object" && p.subPhaseId === null))
    return "null-phase";
  const descriptions = new Set(phases.map((p) => p.description));
  if (descriptions.size > 1) return "complex";
  return "simple";
}

function migrateRule(rule) {
  const type = classifyRule(rule);
  if (type === "passive" || type === "already-simple") return rule;

  if (type === "null-phase") {
    const desc = rule.phases[0]?.description ?? rule.description;
    const result = {
      id: rule.id,
      displayName: rule.displayName,
      passive: true,
    };
    if (rule.aliases) result.aliases = rule.aliases;
    if (rule.chargeMod) result.chargeMod = rule.chargeMod;
    result.description = desc;
    result.phases = [];
    return result;
  }

  if (type === "simple") {
    const first = rule.phases[0];
    const result = { id: rule.id, displayName: rule.displayName };
    if (rule.aliases) result.aliases = rule.aliases;
    if (rule.chargeMod) result.chargeMod = rule.chargeMod;
    result.description = first.description;
    result.phases = rule.phases.map((p) => p.subPhaseId);
    if (first.yourTurnOnly) result.yourTurnOnly = true;
    if (first.opponentOnly) result.opponentOnly = true;
    if (first.fromRound) result.fromRound = first.fromRound;
    return result;
  }

  if (type === "complex") {
    return {
      ...rule,
      phases: rule.phases.map(({ phaseId: _drop, ...rest }) => rest),
    };
  }

  return rule;
}

function indent(str, spaces) {
  return str
    .split("\n")
    .map((l) => " ".repeat(spaces) + l)
    .join("\n");
}

function serialiseValue(v) {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    if (v.every((x) => typeof x === "string")) {
      if (v.length === 1) return `[${JSON.stringify(v[0])}]`;
      return `[${v.map((s) => JSON.stringify(s)).join(", ")}]`;
    }
    // array of objects
    const items = v
      .map((item) => {
        const pairs = Object.entries(item)
          .map(([k, val]) => `        ${k}: ${serialiseValue(val)},`)
          .join("\n");
        return `      {\n${pairs}\n      }`;
      })
      .join(",\n");
    return `[\n${items},\n    ]`;
  }
  if (typeof v === "object" && v !== null) {
    return JSON.stringify(v);
  }
  return String(v);
}

function serialiseRule(rule) {
  const lines = ["  {"];
  for (const [k, v] of Object.entries(rule)) {
    lines.push(`    ${k}: ${serialiseValue(v)},`);
  }
  lines.push("  }");
  return lines.join("\n");
}

const original = readFileSync("src/data/special-rules.js", "utf8");
const headerEnd = original.indexOf("export const SPECIAL_RULES = [");
const header = original.slice(0, headerEnd);
// Find the closing ];\n of the SPECIAL_RULES array specifically.
// The array is followed by a blank line then a comment, so look for ];\n\n
const arrayCloseIdx = original.indexOf("];\n\n", headerEnd);
if (arrayCloseIdx === -1)
  throw new Error("Could not find end of SPECIAL_RULES array");
const footerStart = arrayCloseIdx + 3; // skip ];\n, leave the trailing \n as part of footer
const footer = original.slice(footerStart);

const migrated = SPECIAL_RULES.map(migrateRule);
const body = migrated.map(serialiseRule).join(",\n");
const output = `${header}export const SPECIAL_RULES = [\n${body},\n];\n${footer}`;

writeFileSync("src/data/special-rules.js", output, "utf8");

// Summary
const counts = {};
for (const rule of SPECIAL_RULES) {
  const t = classifyRule(rule);
  counts[t] = (counts[t] || 0) + 1;
}
console.log("Migration complete.");
console.table(counts);
