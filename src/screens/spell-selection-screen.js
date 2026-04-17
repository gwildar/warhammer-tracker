import { getCasters } from "../army.js";
import { navigate } from "../navigate.js";
import { renderSetupHeader, bindSetupHeaderEvents } from "./setup-header.js";
import { renderSpellSelection, bindSpellSelectors } from "./spell-selection.js";

const app = document.getElementById("app");

export function renderSpellSelectionScreen(army) {
  const casters = getCasters(army);

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      ${renderSetupHeader(army, "spells")}
      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-wh-text">Select Spells</h2>
        </div>
        ${renderSpellSelection(army, casters)}
      </main>
      <footer class="sticky bottom-0 bg-wh-surface border-t border-wh-border p-3">
        <div class="max-w-2xl mx-auto flex gap-3">
          <button id="prev-btn"
            class="flex-1 py-3 rounded-lg font-semibold text-lg transition-colors bg-wh-card text-wh-text hover:bg-wh-border">
            &#8592; Back
          </button>
          <button id="next-btn"
            class="flex-1 py-3 rounded-lg font-bold text-lg transition-colors bg-wh-accent text-wh-bg hover:bg-wh-accent-dim">
            Next &#8594;
          </button>
        </div>
      </footer>
    </div>
  `;

  bindSetupHeaderEvents();
  bindSpellSelectors(army);

  document.getElementById("prev-btn").addEventListener("click", () => {
    navigate("/setup");
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    navigate("/unit-assignment");
  });
}
