import { getCharacterAssignments, saveCharacterAssignments } from "../state.js";
import { navigate } from "../navigate.js";
import { displayUnitName } from "../utils/unit-name.js";

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

function renderCharCard(char) {
  return `
    <div class="p-2 rounded bg-wh-card border border-wh-border cursor-grab active:cursor-grabbing mb-2 select-none"
      draggable="true"
      data-char-id="${char.id}">
      <div class="text-sm font-semibold text-wh-text">${char.name}</div>
      ${renderMagicItemNames(char)}
    </div>
  `;
}

function renderAssignedChar(char) {
  return `
    <div class="flex items-center justify-between mt-1 text-xs text-wh-accent"
      data-assigned-char="${char.id}">
      <span>${char.name}</span>
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
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-4xl mx-auto">
          <h1 class="text-xl font-bold text-wh-accent">${army.name}</h1>
          <button id="save-assignments-btn"
            class="px-4 py-2 bg-wh-accent text-wh-bg rounded text-sm font-semibold hover:opacity-90">
            Save &amp; Continue
          </button>
        </div>
      </header>
      <main class="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div class="mb-4">
          <span class="text-xs uppercase tracking-wider text-wh-muted">Setup</span>
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
    </div>
  `;

  bindDragDrop(army);

  document
    .getElementById("save-assignments-btn")
    .addEventListener("click", () => {
      navigate("deploymentScreen", army);
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
      zone.classList.add("border-wh-accent");
    });
    zone.addEventListener("dragleave", (e) => {
      if (!zone.contains(e.relatedTarget))
        zone.classList.remove("border-wh-accent");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("border-wh-accent");
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
