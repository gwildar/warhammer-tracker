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

function miscastTableHtml() {
  return `
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
  `;
}

// Collapsible version — used inline within a spells panel (your turn)
export function renderMiscastTable() {
  return `
    <details class="mt-3 pt-3 border-t border-wh-border/50">
      <summary class="text-xs text-wh-muted cursor-pointer select-none hover:text-wh-text transition-colors">Miscast Table (2D6)</summary>
      ${miscastTableHtml()}
    </details>
  `;
}

// Always-visible panel — used on the opponent turn screen
export function renderMiscastPanel() {
  return `
    <div class="bg-wh-surface rounded-lg border border-wh-purple/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-purple mb-1">Miscast Table (2D6)</h3>
      ${miscastTableHtml()}
    </div>
  `;
}
