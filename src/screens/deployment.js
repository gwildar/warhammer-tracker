import { SPECIAL_RULES } from "../data/special-rules.js";
import { getStartTime, saveDeploymentTime, resetStartTime } from "../state.js";
import { navigate } from "../navigate.js";
import { renderSetupHeader, bindSetupHeaderEvents } from "./setup-header.js";

const app = document.getElementById("app");

const DEPLOYMENT_RULE_IDS = new Set([
  "scouts",
  "vanguard",
  "ambushers",
  "ambush", // alias for ambushers in special-rules.js
]);

function normaliseRuleId(displayName) {
  return (displayName || "")
    .toLowerCase()
    .replace(/\s*\(.*$/, "")
    .trim();
}

function getDeploymentRules(unit) {
  return (unit.specialRules || []).filter((r) =>
    DEPLOYMENT_RULE_IDS.has(normaliseRuleId(r.displayName)),
  );
}

function ruleDescription(displayName) {
  const id = normaliseRuleId(displayName);
  const rule = SPECIAL_RULES.find((sr) => sr.id === id);
  // phases[0] is used as a fallback; deployment rules lack a dedicated deployment-phase entry
  return rule?.phases?.[0]?.description ?? "";
}

function renderExplainer() {
  return `
    <div class="bg-wh-surface border border-wh-border rounded-lg p-4 mb-4">
      <div class="text-xs uppercase tracking-wider text-wh-muted mb-2">Deployment sequence</div>
      <ol class="space-y-1.5 text-sm text-wh-text list-decimal list-inside">
        <li>Roll off — higher result picks deployment zone and deploys first</li>
        <li>Alternate deploying one unit at a time. Characters may join a unit or deploy separately.</li>
        <li>After all other units: <span class="font-semibold">Scouts</span> deploy — must be placed >12" from all enemy models</li>
        <li>After Scouts: <span class="font-semibold">Vanguard</span> units make their Vanguard move — no march; cannot charge on turn 1</li>
        <li><span class="font-semibold">Ambushers</span> are held in reserve and arrive from round 2 onwards</li>
      </ol>
    </div>
  `;
}

function renderUnitCard(unit) {
  const rules = getDeploymentRules(unit);
  return `
    <div class="p-2 rounded border border-wh-border bg-wh-card mb-2">
      <div class="text-sm font-semibold text-wh-text">${unit.name}</div>
      ${rules
        .map((r) => {
          const desc = ruleDescription(r.displayName);
          return `
          <div class="mt-1">
            <span class="text-xs text-wh-accent font-semibold">${r.displayName}</span>
            ${desc ? `<div class="text-xs text-wh-muted mt-0.5">${desc}</div>` : ""}
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

function renderDeploymentUnits(army) {
  const units = army.units.filter((u) => getDeploymentRules(u).length > 0);
  if (units.length === 0) return "";
  return `
    <div>
      <h3 class="text-xs font-bold text-wh-muted mb-2 uppercase tracking-wide">Deployment Rules</h3>
      ${units.map(renderUnitCard).join("")}
    </div>
  `;
}

export function renderDeploymentScreen(army) {
  if (getStartTime() === null) {
    resetStartTime();
  }
  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      ${renderSetupHeader(army, "deploy")}
      <main class="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-wh-text">Deployment</h2>
        </div>
        ${renderExplainer()}
        ${renderDeploymentUnits(army)}
        <button id="continue-btn"
          class="mt-6 w-full py-3 bg-wh-accent text-wh-bg rounded font-semibold hover:opacity-90">
          Continue
        </button>
      </main>
    </div>
  `;

  document.getElementById("continue-btn").addEventListener("click", () => {
    saveDeploymentTime(Date.now() - getStartTime());
    resetStartTime(); // seeds the timer for the game screen
    navigate("firstTurnScreen", army);
  });
  bindSetupHeaderEvents();
}
