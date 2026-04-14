import { LORES, getSpellTypeLabel } from "../data/spells.js";
import { getSpellSelections, saveSpellSelections, saveArmy } from "../state.js";
import { formatSlug } from "../helpers.js";

export function renderSpellSelection(army, casters) {
  const selections = getSpellSelections();

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-border p-4">
      <h3 class="text-lg font-bold text-wh-purple mb-3">Spell Selection</h3>
      <p class="text-sm text-wh-muted mb-4">Choose a core lore, then select your signature spell and numbered spells.</p>

      ${casters
        .map((caster) => {
          const allBound =
            caster.lores.length > 0 &&
            caster.lores.every((l) => LORES[l]?.bound);
          if (allBound) {
            const boundSpells = caster.lores.flatMap(
              (l) => LORES[l]?.spells || [],
            );
            return `
              <div class="mb-6 last:mb-0 pb-4 border-b border-wh-border last:border-0">
                <div class="mb-2">
                  <span class="font-semibold text-wh-text">${caster.name}</span>
                </div>
                <p class="text-xs text-wh-muted mb-2">Bound Spells — always available, no selection required.</p>
                <div class="space-y-1">
                  ${boundSpells
                    .map(
                      (s) => `
                    <div class="flex justify-between text-xs text-wh-muted py-0.5">
                      <span>${s.name}</span>
                      <span class="font-mono">${s.cv}</span>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `;
          }

          const coreLoreKey =
            caster.activeLore ||
            (caster.lores.length > 0 ? caster.lores[0] : null);
          const unitSelections = selections[caster.id] || {};

          return `
          <div class="mb-6 last:mb-0 pb-4 border-b border-wh-border last:border-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-semibold text-wh-text">${caster.name}</span>
              ${caster.hasLoreFamiliar ? '<span class="text-xs bg-wh-purple/20 text-wh-purple px-1.5 py-0.5 rounded">Lore Familiar</span>' : ""}
            </div>

            <!-- Core lore selector -->
            ${
              caster.lores.length > 1
                ? `
              <div class="mb-3">
                <label class="text-xs text-wh-muted">Core Lore:</label>
                <select class="lore-select bg-wh-card border border-wh-border rounded px-2 py-1 text-sm text-wh-text ml-1"
                  data-unit-id="${caster.id}">
                  ${caster.lores
                    .map((l) => {
                      const lore = LORES[l];
                      return `<option value="${l}" ${l === coreLoreKey ? "selected" : ""}>
                      ${lore ? lore.name : formatSlug(l)}
                    </option>`;
                    })
                    .join("")}
                </select>
              </div>
            `
                : `
              <div class="mb-3">
                <span class="text-xs text-wh-muted">Core Lore:</span>
                <span class="text-sm text-wh-text ml-1">${coreLoreKey && LORES[coreLoreKey] ? LORES[coreLoreKey].name : "None"}</span>
              </div>
            `
            }

            ${caster.hasCursedCoven ? '<p class="text-xs text-wh-muted mb-2">Cursed Coven: choose 1 spell from the selected lore.</p>' : ""}
            <div class="spell-list" data-unit-id="${caster.id}" data-lore="${coreLoreKey || ""}">
              ${coreLoreKey ? renderCasterSpells(coreLoreKey, caster, unitSelections, caster.factionLores) : '<p class="text-sm text-wh-muted">Select a lore above</p>'}
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

function renderCasterSpells(
  coreLoreKey,
  caster,
  unitSelections,
  factionLoreKeys,
) {
  const coreLore = LORES[coreLoreKey];
  if (!coreLore)
    return `<p class="text-sm text-wh-muted">Unknown lore: ${coreLoreKey}</p>`;

  const coreSignatures = coreLore.spells.filter((s) => s.num === "S");
  const numberedSpells = coreLore.spells.filter((s) => s.num !== "S");

  if (caster.hasLoreFamiliar || caster.hasCursedCoven) {
    return `
      <div class="space-y-1">
        ${coreLore.spells.map((spell) => renderSpellCheckbox(coreLoreKey, spell, caster.id, unitSelections, false)).join("")}
      </div>
    `;
  }

  const factionSignatures = [];
  for (const fKey of factionLoreKeys) {
    const fLore = LORES[fKey];
    if (!fLore) continue;
    for (const s of fLore.spells) {
      if (s.num === "S") {
        factionSignatures.push({
          loreKey: fKey,
          loreName: fLore.name,
          spell: s,
        });
      }
    }
  }

  let html = "";

  html += `
    <div class="mb-3">
      <div class="text-xs text-wh-muted mb-1">Signature Spells:</div>
      <div class="space-y-1">
        ${coreSignatures
          .map((spell) => {
            const spellKey = `${coreLoreKey}:${spell.num}:${spell.name}`;
            return `
            <label class="flex items-center gap-2 py-1 px-2 rounded hover:bg-wh-card text-sm cursor-pointer">
              <input type="checkbox" class="spell-checkbox accent-wh-purple"
                data-unit-id="${caster.id}" data-spell-key="${spellKey}"
                ${unitSelections[spellKey] ? "checked" : ""} />
              <span class="font-mono text-xs text-wh-muted w-4">S</span>
              <span class="text-wh-text flex-1">${spell.name}</span>
              <span class="text-xs text-wh-muted">${coreLore.name}</span>
              <span class="spell-type-${spell.type} text-xs">${getSpellTypeLabel(spell.type)}</span>
              <span class="text-wh-accent font-mono text-xs">${spell.cv}</span>
            </label>
          `;
          })
          .join("")}
        ${factionSignatures
          .map(({ loreKey, loreName, spell }) => {
            const spellKey = `${loreKey}:${spell.num}:${spell.name}`;
            return `
            <label class="flex items-center gap-2 py-1 px-2 rounded hover:bg-wh-card text-sm cursor-pointer">
              <input type="checkbox" class="spell-checkbox accent-wh-purple"
                data-unit-id="${caster.id}" data-spell-key="${spellKey}"
                ${unitSelections[spellKey] ? "checked" : ""} />
              <span class="font-mono text-xs text-wh-muted w-4">S</span>
              <span class="text-wh-text flex-1">${spell.name}</span>
              <span class="text-xs text-wh-purple">${loreName}</span>
              <span class="spell-type-${spell.type} text-xs">${getSpellTypeLabel(spell.type)}</span>
              <span class="text-wh-accent font-mono text-xs">${spell.cv}</span>
            </label>
          `;
          })
          .join("")}
      </div>
    </div>
  `;

  if (numberedSpells.length > 0) {
    html += `
      <div>
        <div class="text-xs text-wh-muted mb-1">Spells (${coreLore.name}):</div>
        <div class="space-y-1">
          ${numberedSpells.map((spell) => renderSpellCheckbox(coreLoreKey, spell, caster.id, unitSelections, false)).join("")}
        </div>
      </div>
    `;
  }

  return html;
}

function renderSpellCheckbox(loreKey, spell, unitId, unitSelections, disabled) {
  const spellKey = `${loreKey}:${spell.num}:${spell.name}`;
  const isChecked = unitSelections[spellKey];

  return `
    <label class="flex items-center gap-2 py-1 px-2 rounded hover:bg-wh-card text-sm cursor-pointer">
      <input type="checkbox"
        class="spell-checkbox accent-wh-purple"
        data-unit-id="${unitId}"
        data-spell-key="${spellKey}"
        ${isChecked ? "checked" : ""}
        ${disabled ? "disabled" : ""} />
      <span class="font-mono text-xs text-wh-muted w-4">${spell.num}</span>
      <span class="text-wh-text flex-1">${spell.name}</span>
      <span class="spell-type-${spell.type} text-xs">${getSpellTypeLabel(spell.type)}</span>
      <span class="text-wh-accent font-mono text-xs">${spell.cv}</span>
    </label>
  `;
}

export function bindSpellSelectors(army) {
  document.querySelectorAll(".lore-select").forEach((select) => {
    select.addEventListener("change", () => {
      const unitId = select.dataset.unitId;
      const loreKey = select.value;

      const caster = army.units.find((u) => u.id === unitId);
      if (caster) caster.activeLore = loreKey;
      saveArmy(army);

      const selections = getSpellSelections();
      selections[unitId] = {};
      saveSpellSelections(selections);

      const container = document.querySelector(
        `.spell-list[data-unit-id="${unitId}"]`,
      );
      if (container) {
        container.dataset.lore = loreKey;
        container.innerHTML = renderCasterSpells(
          loreKey,
          caster,
          selections[unitId],
          caster.factionLores,
        );
        bindSpellCheckboxes();
      }
    });
  });

  bindSpellCheckboxes();
}

export function bindSpellCheckboxes() {
  document.querySelectorAll(".spell-checkbox:not([disabled])").forEach((cb) => {
    cb.addEventListener("change", () => {
      const unitId = cb.dataset.unitId;
      const spellKey = cb.dataset.spellKey;
      const selections = getSpellSelections();
      if (!selections[unitId]) selections[unitId] = {};
      selections[unitId][spellKey] = cb.checked;
      saveSpellSelections(selections);
    });
  });
}
