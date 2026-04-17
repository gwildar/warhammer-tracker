import { getCharacterAssignments, saveCharacterAssignments } from "../state.js";
import { navigate } from "../navigate.js";
import { displayUnitName } from "../utils/unit-name.js";
import { renderSetupHeader, bindSetupHeaderEvents } from "./setup-header.js";
import { getCasters } from "../army.js";

const app = document.getElementById("app");

const CHARACTER_CATEGORIES = new Set(["characters", "lords", "heroes"]);

function isCharacter(unit) {
  return CHARACTER_CATEGORIES.has(unit.category);
}

function renderMagicItemNames(unit) {
  if (!unit.magicItems?.length) return "";
  const names = unit.magicItems.map((i) => i.name).join(", ");
  return `<div class="text-wh-muted text-[10px] mt-0.5">${names}</div>`;
}

function renderCharTags(char) {
  return [
    char.isGeneral
      ? '<span class="text-wh-phase-combat text-[10px] font-bold ml-1">GENERAL</span>'
      : "",
    char.isBSB
      ? '<span class="text-wh-accent text-[10px] font-bold ml-1">BSB</span>'
      : "",
  ].join("");
}

function renderCharCard(char) {
  return `
    <div class="p-2 rounded bg-wh-card border border-wh-border cursor-grab active:cursor-grabbing mb-2 select-none touch-none"
      draggable="true"
      data-char-id="${char.id}">
      <div class="text-sm font-semibold text-wh-text">${char.name}${renderCharTags(char)}</div>
      ${renderMagicItemNames(char)}
    </div>
  `;
}

function renderAssignedChar(char) {
  return `
    <div class="flex items-center justify-between mt-1 text-xs text-wh-accent"
      data-assigned-char="${char.id}">
      <span>${char.name}${renderCharTags(char)}</span>
      <button class="remove-char-btn ml-2 text-wh-red hover:opacity-75" data-char-id="${char.id}">✕</button>
    </div>
  `;
}

function renderUnitCard(unit, assignedChars) {
  return `
    <div class="p-2 rounded border border-wh-border bg-wh-surface mb-2 unit-drop-zone"
      data-unit-id="${unit.id}">
      <div class="text-sm font-semibold text-wh-text">${displayUnitName(unit.name, unit.strength)}</div>
      ${renderMagicItemNames(unit)}
      <div class="assigned-chars min-h-[8px]">
        ${assignedChars.map(renderAssignedChar).join("")}
      </div>
    </div>
  `;
}

export function renderUnitAssignmentScreen(army) {
  const assignments = getCharacterAssignments();
  const unitById = Object.fromEntries(army.units.map((u) => [u.id, u]));

  const charsByUnitId = {};
  for (const unit of army.units.filter((u) => !isCharacter(u))) {
    charsByUnitId[unit.id] = [];
  }
  for (const [charId, unitId] of Object.entries(assignments)) {
    if (unitId && charsByUnitId[unitId]) {
      const charUnit = unitById[charId];
      if (charUnit) charsByUnitId[unitId].push(charUnit);
    }
  }

  const assignedCharIds = new Set(
    Object.entries(assignments)
      .filter(([, unitId]) => unitId)
      .map(([charId]) => charId),
  );

  const characters = army.units.filter(isCharacter);
  const regularUnits = army.units.filter((u) => !isCharacter(u));
  const unassignedChars = characters.filter((c) => !assignedCharIds.has(c.id));

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      ${renderSetupHeader(army, "characters")}
      <main class="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-wh-text">Place Characters in Units</h2>
          <span class="text-xs text-wh-muted">Optional</span>
        </div>
        <div class="flex gap-4">
          <div class="w-1/3 shrink-0">
            <h3 class="text-xs font-bold text-wh-muted mb-2 uppercase tracking-wide">Characters</h3>
            <div id="char-pool"
              class="min-h-12 rounded border border-dashed border-wh-border p-2"
              data-pool="true">
              ${unassignedChars.map(renderCharCard).join("")}
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-xs font-bold text-wh-muted mb-2 uppercase tracking-wide">Units</h3>
            <div id="units-list">
              ${regularUnits
                .map((unit) =>
                  renderUnitCard(unit, charsByUnitId[unit.id] || []),
                )
                .join("")}
            </div>
          </div>
        </div>
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

  bindDragDrop(army);
  bindSetupHeaderEvents();

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (getCasters(army).length > 0) {
      navigate("/spell-selection");
    } else {
      navigate("/");
    }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    navigate("/scenario-setup");
  });
}

function bindDragDrop(army) {
  document.querySelectorAll("[data-char-id][draggable]").forEach((el) => {
    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", el.dataset.charId);
      el.classList.add("opacity-50");
    });
    el.addEventListener("dragend", () => {
      el.classList.remove("opacity-50");
    });
  });

  const dropTargets = [
    ...document.querySelectorAll(".unit-drop-zone"),
    document.getElementById("char-pool"),
  ];

  for (const zone of dropTargets) {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.style.borderColor = "var(--color-wh-accent)";
      zone.style.backgroundColor =
        "color-mix(in srgb, var(--color-wh-accent) 12%, transparent)";
    });
    zone.addEventListener("dragleave", (e) => {
      if (!zone.contains(e.relatedTarget)) {
        zone.style.borderColor = "";
        zone.style.backgroundColor = "";
      }
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.style.borderColor = "";
      zone.style.backgroundColor = "";
      const charId = e.dataTransfer.getData("text/plain");
      if (!charId) return;
      const assignments = getCharacterAssignments();
      const unitId = zone.dataset.unitId || null;
      if (unitId) {
        assignments[charId] = unitId;
      } else {
        delete assignments[charId];
      }
      saveCharacterAssignments(assignments);
      renderUnitAssignmentScreen(army);
    });
  }

  document.querySelectorAll(".remove-char-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const assignments = getCharacterAssignments();
      delete assignments[btn.dataset.charId];
      saveCharacterAssignments(assignments);
      renderUnitAssignmentScreen(army);
    });
  });
}
