import { LORES, getSpellTypeLabel } from "../data/spells.js";
import { getCasters } from "../army.js";
import { getSpellSelections } from "../state.js";

const MISCAST_TABLE = [
  {
    roll: "2–4",
    name: "Dimensional Cascade",
    effect:
      'Centre a 5" blast template over the Wizard. All models underneath suffer Strength 10 hits with AP −4.',
  },
  {
    roll: "5–6",
    name: "Calamitous Detonation",
    effect:
      'Centre a 3" blast template over the Wizard. All models underneath suffer Strength 6 hits with AP −2.',
  },
  {
    roll: "7",
    name: "Careless Conjuration",
    effect: "The Wizard takes a Strength 4 hit with AP −1.",
  },
  {
    roll: "8–9",
    name: "Barely Controlled Power",
    effect:
      "Spell casts, but the Wizard cannot cast any more spells for the remainder of the current turn.",
  },
  {
    roll: "10–12",
    name: "Power Drain",
    effect:
      "Spell casts, but you cannot attempt to cast any more spells for the remainder of the current turn.",
  },
];

export function getKnownSpells(caster) {
  const selections = getSpellSelections();
  const unitSel = selections[caster.id] || {};
  const spells = [];

  // Auto-include all spells from bound lores (no selection needed)
  for (const loreKey of caster.lores || []) {
    const lore = LORES[loreKey];
    if (lore?.bound) {
      for (const spell of lore.spells) {
        spells.push({ ...spell, loreKey, loreName: lore.name });
      }
    }
  }

  // Include selected spells from non-bound lores
  for (const [key, selected] of Object.entries(unitSel)) {
    if (!selected) continue;
    const parts = key.split(":");
    if (parts.length < 3) continue;
    const loreKey = parts[0];
    const num = parts[1];
    const name = parts.slice(2).join(":");
    const lore = LORES[loreKey];
    if (!lore || lore.bound) continue;
    const spell = lore.spells.find(
      (s) => String(s.num) === num && s.name === name,
    );
    if (spell) spells.push({ ...spell, loreKey, loreName: lore.name });
  }

  return spells;
}

export function renderCasterContext(army, allowedTypes) {
  const casters = getCasters(army);
  if (casters.length === 0) return "";

  const castersWithSpells = casters
    .map((c) => {
      const known = getKnownSpells(c);
      const filtered = known.filter((s) => allowedTypes.includes(s.type));
      return { caster: c, spells: filtered };
    })
    .filter((c) => c.spells.length > 0);

  if (castersWithSpells.length === 0) return "";

  const label =
    allowedTypes.length === 1
      ? getSpellTypeLabel(allowedTypes[0]) + " Spells"
      : "Spells";

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-purple/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-purple mb-3">${label}</h3>
      ${castersWithSpells
        .map(
          ({ caster: c, spells }) => `
        <div class="mb-3 last:mb-0 p-2 rounded bg-wh-card">
          <div class="flex justify-between items-center mb-1">
            <span class="font-semibold text-wh-text">${c.name}</span>
          </div>
          <div class="space-y-0.5">
            ${spells
              .map(
                (s) => `
              <div class="flex justify-between text-xs">
                <span class="spell-type-${s.type}">${s.name}</span>
                <div class="flex gap-2">
                  ${s.range ? `<span class="text-wh-muted font-mono">${s.range}</span>` : ""}
                  <span class="text-wh-accent font-mono">${s.cv}</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
        )
        .join("")}
      <details class="mt-3 pt-3 border-t border-wh-border/50">
        <summary class="text-xs text-wh-muted cursor-pointer select-none hover:text-wh-text transition-colors">Miscast Table (2D6)</summary>
        <table class="w-full text-xs mt-2">
          <thead>
            <tr class="text-left text-wh-muted">
              <th class="pb-1 pr-2 font-medium w-10">2D6</th>
              <th class="pb-1 pr-2 font-medium">Result</th>
              <th class="pb-1 font-medium">Effect</th>
            </tr>
          </thead>
          <tbody>
            ${MISCAST_TABLE.map(
              (row) => `
              <tr class="border-t border-wh-border/30">
                <td class="py-1 pr-2 font-mono text-wh-accent">${row.roll}</td>
                <td class="py-1 pr-2 font-semibold text-wh-text whitespace-nowrap">${row.name}</td>
                <td class="py-1 text-wh-muted">${row.effect}</td>
              </tr>
            `,
            ).join("")}
          </tbody>
        </table>
      </details>
    </div>
  `;
}
