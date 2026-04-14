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
        <button id="spell-continue-btn"
          class="mt-6 w-full py-3 bg-wh-accent text-wh-bg rounded font-semibold hover:opacity-90">
          Continue
        </button>
      </main>
    </div>
  `;

  bindSetupHeaderEvents();
  bindSpellSelectors(army);

  document
    .getElementById("spell-continue-btn")
    .addEventListener("click", () => {
      navigate("unitAssignmentScreen", army);
    });
}
