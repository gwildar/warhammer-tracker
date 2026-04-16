export function renderSpecialFeaturesTable() {
  return `
    <div class="bg-wh-surface rounded-lg border border-wh-accent/20 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-accent mb-2">Special Features</h3>
      <p class="text-wh-muted text-xs mb-2">Core unit within 6″, US10+, not fleeing — roll D6 for property until turn end.</p>
      <table class="w-full text-xs mt-2">
        <thead>
          <tr class="text-left text-wh-muted">
            <th class="pb-1 pr-2 font-medium w-8">D6</th>
            <th class="pb-1 pr-2 font-medium">Property</th>
            <th class="pb-1 font-medium">Effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="py-0.5 pr-2 font-mono text-wh-accent align-top">1–2</td>
            <td class="py-0.5 pr-2 font-semibold text-wh-text align-top whitespace-nowrap">A Tingle in the Air</td>
            <td class="py-0.5 text-wh-muted">Magic Resistance (-3).</td>
          </tr>
          <tr>
            <td class="py-0.5 pr-2 font-mono text-wh-accent align-top">3–4</td>
            <td class="py-0.5 pr-2 font-semibold text-wh-text align-top whitespace-nowrap">Honour Thy Forebears</td>
            <td class="py-0.5 text-wh-muted">Hatred (all enemies).</td>
          </tr>
          <tr>
            <td class="py-0.5 pr-2 font-mono text-wh-accent align-top">5–6</td>
            <td class="py-0.5 pr-2 font-semibold text-wh-text align-top whitespace-nowrap">An Inspirational Sight</td>
            <td class="py-0.5 text-wh-muted">Unbreakable.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
