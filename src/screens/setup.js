import { version } from "../../package.json";
import { parseArmyList, getCasters } from "../army.js";
import {
  getArmy,
  saveArmy,
  clearArmy,
  saveSpellSelections,
  resetGame,
  getFirstTurn,
  getIsOpponentTurn,
} from "../state.js";
import { formatSlug } from "../helpers.js";
import { renderSpellSelection, bindSpellSelectors } from "./spell-selection.js";
import { navigate } from "../navigate.js";

const app = document.getElementById("app");

export function renderSetupScreen() {
  const army = getArmy();
  const wasRecovered = sessionStorage.getItem("tow-recovered");
  sessionStorage.removeItem("tow-recovered");

  app.innerHTML = `
    <div class="min-h-dvh flex flex-col">
      <header class="p-4 border-b border-wh-border">
        <div class="flex justify-between items-center max-w-2xl mx-auto">
          <div></div>
          <h1 class="text-2xl font-bold text-wh-accent text-center">Turner Overdrive <span class="text-xs text-wh-muted font-normal">v${version}</span> <span class="text-xs text-wh-red font-normal">Alpha</span></h1>
          <button id="about-btn" class="text-sm text-wh-muted hover:text-wh-accent transition-colors">About</button>
        </div>
      </header>

      <main class="flex-1 p-4 max-w-2xl mx-auto w-full">
        ${wasRecovered ? `<p class="text-wh-red text-sm text-center mt-4 mb-2">Your saved game data was cleared due to an error. Please re-upload your army.</p>` : ""}
        ${army ? renderArmySummary(army) : renderUploadSection()}
      </main>
    </div>
  `;

  if (army) {
    bindArmyActions();
    bindSpellSelectors(army);
  } else {
    bindUpload();
  }

  document.getElementById("about-btn")?.addEventListener("click", () => {
    navigate("aboutScreen");
  });
}

function renderUploadSection() {
  return `
    <div class="mt-8">
      <div id="drop-zone"
        class="border-2 border-dashed border-wh-border rounded-xl p-12 text-center
               hover:border-wh-accent transition-colors cursor-pointer">
        <div class="text-4xl mb-4">&#128193;</div>
        <p class="text-lg mb-2">Drop your army file here</p>
        <p class="text-wh-muted text-sm mb-2"><span class="text-wh-accent font-mono">.owb.json</span> or <span class="text-wh-accent font-mono">newrecruit_file.json</span></p>
        <p class="text-wh-muted text-sm mb-4">or click to browse</p>
        <input type="file" id="file-input" accept=".json,.owb" class="hidden" />
        <button id="browse-btn"
          class="bg-wh-accent text-wh-bg px-6 py-2 rounded-lg font-semibold hover:bg-wh-accent-dim transition-colors">
          Choose File
        </button>
      </div>
      <p id="upload-error" class="text-wh-red text-sm mt-2 hidden"></p>

      <div class="mt-8 p-4 bg-wh-surface rounded-lg border border-wh-border">
        <h3 class="font-semibold text-wh-accent mb-2">How to get your army file</h3>
        <p class="text-xs text-wh-muted mb-2 font-semibold uppercase tracking-wide">Old World Builder</p>
        <ol class="text-sm text-wh-muted space-y-1 list-decimal list-inside mb-3">
          <li>Go to <span class="text-wh-text">Old World Builder</span> (oldworldbuilder.com)</li>
          <li>Create or open your army list</li>
          <li>Export as <span class="font-mono text-wh-text">.owb.json</span></li>
          <li>Upload the file here</li>
        </ol>
        <p class="text-xs text-wh-muted mb-2 font-semibold uppercase tracking-wide">New Recruit</p>
        <ol class="text-sm text-wh-muted space-y-1 list-decimal list-inside">
          <li>Open your army in <span class="text-wh-text">New Recruit</span></li>
          <li>Export / share as <span class="font-mono text-wh-text">.json</span></li>
          <li>Upload the file here</li>
        </ol>
      </div>

      <div class="mt-4 p-3 rounded-lg border border-orange-400/30 bg-orange-400/5">
        <p class="text-xs text-orange-400 font-semibold mb-1">Alpha Build</p>
        <p class="text-xs text-wh-muted">Stats, rules and item effects may be incomplete or incorrect. Tested armies: Dark Elves, Kingdom of Bretonnia, Lizardmen, Ogre Kingdoms, Vampire Counts.</p>
      </div>
    </div>
  `;
}

function renderArmySummary(army) {
  const casters = getCasters(army);
  const totalPts = army.units.reduce((sum, u) => sum + u.points, 0);

  return `
    <div class="mt-4">
      <div class="bg-wh-surface rounded-lg border border-wh-border p-4 mb-4">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h2 class="text-xl font-bold text-wh-accent">${army.name}</h2>
            <p class="text-wh-muted text-sm">${army.faction}${army.composition ? " — " + formatSlug(army.composition) : ""}</p>
          </div>
          <span class="text-wh-accent font-mono text-lg">${totalPts} pts</span>
        </div>

        <div class="space-y-1 mb-4">
          ${renderUnitList(army)}
        </div>

        <div class="flex gap-2">
          <button id="start-game-btn"
            class="flex-1 bg-wh-accent text-wh-bg py-3 rounded-lg font-bold text-lg
                   hover:bg-wh-accent-dim transition-colors">
            Start Game
          </button>
          <button id="replace-army-btn"
            class="bg-wh-card text-wh-muted px-4 py-3 rounded-lg border border-wh-border
                   hover:text-wh-text hover:border-wh-accent transition-colors">
            Replace
          </button>
        </div>
      </div>

      ${casters.length > 0 ? renderSpellSelection(army, casters) : ""}
    </div>
  `;
}

function renderUnitList(army) {
  const categories = [
    "characters",
    "lords",
    "heroes",
    "core",
    "special",
    "rare",
    "mercenaries",
    "allies",
  ];
  let html = "";

  for (const cat of categories) {
    const units = army.units.filter((u) => u.category === cat);
    if (units.length === 0) continue;

    html += `<div class="mt-3 first:mt-0">
      <h3 class="text-xs uppercase tracking-wider text-wh-muted mb-1">${cat}</h3>
      ${units
        .map((u) => {
          const magicWeapons = u.magicItems
            .filter((item) => item.type === "weapon")
            .map((item) => item.name);
          const banners = u.magicItems.filter(
            (item) => item.type === "banner" || item.type === "standard",
          );

          return `
        <div class="flex justify-between items-center py-1 px-2 rounded hover:bg-wh-card text-sm">
          <div>
            <span class="text-wh-text">${u.name}</span>
            ${u.strength > 1 ? `<span class="text-wh-muted ml-1">x${u.strength}</span>` : ""}
            ${u.mount ? `<span class="text-wh-muted ml-1">(${u.mount.name})</span>` : ""}
            ${u.isGeneral ? '<span class="text-wh-phase-combat ml-1 text-xs">GENERAL</span>' : ""}
            ${u.isBSB ? '<span class="text-wh-phase-combat ml-1 text-xs">BSB</span>' : ""}
            ${u.isCaster ? '<span class="text-wh-purple ml-1 text-xs">WIZARD</span>' : ""}
            ${magicWeapons.length > 0 ? `<span class="text-wh-accent ml-1 text-xs">${magicWeapons.join(", ")}</span>` : ""}
            ${banners.length > 0 ? `<span class="text-wh-muted ml-1 text-xs">${banners.map((b) => `${b.name} (${b.points || 0}pts)`).join(", ")}</span>` : ""}
          </div>
          <span class="text-wh-muted font-mono text-xs">${u.points}pts</span>
        </div>
      `;
        })
        .join("")}
    </div>`;
  }

  return html;
}

function bindUpload() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const browseBtn = document.getElementById("browse-btn");
  const errorEl = document.getElementById("upload-error");

  browseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-wh-accent", "bg-wh-card");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-wh-accent", "bg-wh-card");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-wh-accent", "bg-wh-card");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, errorEl);
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) handleFile(file, errorEl);
  });
}

function handleFile(file, errorEl) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      const army = parseArmyList(json);
      saveArmy(army);
      const casters = getCasters(army);
      const selections = {};
      for (const c of casters) {
        selections[c.id] = {};
      }
      saveSpellSelections(selections);
      resetGame();
      navigate("render");
    } catch (err) {
      errorEl.textContent = `Failed to parse file: ${err.message}`;
      errorEl.classList.remove("hidden");
    }
  };
  reader.readAsText(file);
}

function bindArmyActions() {
  document.getElementById("start-game-btn").addEventListener("click", () => {
    const firstTurn = getFirstTurn();
    if (!firstTurn) {
      navigate("firstTurnScreen", getArmy());
    } else if (getIsOpponentTurn()) {
      navigate("opponentTurnScreen", getArmy());
    } else {
      navigate("gameScreen", getArmy());
    }
  });

  document.getElementById("replace-army-btn").addEventListener("click", () => {
    clearArmy();
    navigate("render");
  });
}
