import { saveScenarioOptions, getScenarioOptions } from "../state.js";
import { navigate } from "../navigate.js";
import { renderSetupHeader, bindSetupHeaderEvents } from "./setup-header.js";

const app = document.getElementById("app");

const CONDITIONS = [
  {
    id: "domination",
    name: "Domination",
    description:
      "Score 100–200 VP per controlled board quarter at game end. Quarters determined by Unit Strength.",
  },
  {
    id: "baggageTrains",
    name: "Baggage Trains",
    description:
      "Each player places a supply train. Control yours (100 VP) or destroy the enemy's (250 VP) at game end.",
  },
  {
    id: "strategicLocations",
    name: "Strategic Locations",
    description:
      "30 VP per controlled objective marker at the end of each player's turn.",
    hasCount: true,
  },
  {
    id: "specialFeatures",
    name: "Special Features",
    description:
      "Core unit within 6″, US10+: roll D6 at Start of Turn for a random property. 200 VP if controlling at game end.",
  },
];

function renderCard(condition, opts) {
  const checked = condition.hasCount
    ? opts.strategicLocations.enabled
    : opts[condition.id];
  const count = opts.strategicLocations.count;

  return `
    <div class="bg-wh-card border border-wh-border rounded-lg p-3 mb-3">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          id="toggle-${condition.id}"
          class="scenario-toggle mt-0.5 accent-wh-purple"
          ${checked ? "checked" : ""}
        />
        <div class="flex-1">
          <div class="font-semibold text-wh-text text-sm">${condition.name}</div>
          <div class="text-xs text-wh-muted mt-0.5">${condition.description}</div>
          ${
            condition.hasCount
              ? `
            <div id="count-picker" class="${checked ? "" : "hidden"} mt-2">
              <span class="text-xs text-wh-muted mr-1">Markers:</span>
              ${[1, 2, 3, 4, 5, 6]
                .map(
                  (n) => `
                <button
                  type="button"
                  class="count-btn inline-flex items-center justify-center w-7 h-7 text-xs rounded border mr-1
                    ${n === count ? "bg-wh-purple text-white border-wh-purple" : "bg-wh-surface text-wh-muted border-wh-border hover:border-wh-purple hover:text-wh-purple"}"
                  data-count="${n}">${n}</button>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>
      </label>
    </div>
  `;
}

export function renderScenarioSetupScreen(army) {
  const opts = getScenarioOptions();

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      ${renderSetupHeader(army, "scenario")}
      <main class="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-wh-text">Scenario Setup</h2>
          <p class="text-sm text-wh-muted mt-1">Select any secondary objectives for this game.</p>
        </div>
        ${CONDITIONS.map((c) => renderCard(c, opts)).join("")}
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

  // Track current count in memory so count buttons work without re-rendering
  let currentCount = opts.strategicLocations.count;

  // Count picker buttons
  document.querySelectorAll(".count-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCount = parseInt(btn.dataset.count, 10);
      document.querySelectorAll(".count-btn").forEach((b) => {
        const active = parseInt(b.dataset.count, 10) === currentCount;
        b.className = b.className
          .replace(
            /bg-wh-purple text-white border-wh-purple|bg-wh-surface text-wh-muted border-wh-border hover:border-wh-purple hover:text-wh-purple/g,
            "",
          )
          .trim();
        b.className += active
          ? " bg-wh-purple text-white border-wh-purple"
          : " bg-wh-surface text-wh-muted border-wh-border hover:border-wh-purple hover:text-wh-purple";
      });
    });
  });

  // Strategic locations toggle shows/hides count picker
  document
    .getElementById("toggle-strategicLocations")
    ?.addEventListener("change", (e) => {
      const picker = document.getElementById("count-picker");
      if (picker) picker.classList.toggle("hidden", !e.target.checked);
    });

  document.getElementById("prev-btn").addEventListener("click", () => {
    navigate("/unit-assignment");
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    const newOpts = {
      domination:
        document.getElementById("toggle-domination")?.checked ?? false,
      baggageTrains:
        document.getElementById("toggle-baggageTrains")?.checked ?? false,
      strategicLocations: {
        enabled:
          document.getElementById("toggle-strategicLocations")?.checked ??
          false,
        count: currentCount,
      },
      specialFeatures:
        document.getElementById("toggle-specialFeatures")?.checked ?? false,
    };
    saveScenarioOptions(newOpts);
    navigate("/deployment");
  });

  bindSetupHeaderEvents();
}
