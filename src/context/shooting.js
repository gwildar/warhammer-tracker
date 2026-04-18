import { getShootingUnits } from "../army.js";
import { RANGED_WEAPONS, MISFIRE_TABLES, getWeapon } from "../data/weapons.js";
import { displayUnitName } from "../utils/unit-name.js";

function getBS(unit) {
  if (!unit.stats || unit.stats.length === 0) return null;
  for (const profile of unit.stats) {
    if (profile.BS && profile.BS !== "-") return profile.BS;
  }
  return null;
}

function getS(unit) {
  if (!unit.stats || unit.stats.length === 0) return null;
  for (const profile of unit.stats) {
    if (profile.S && profile.S !== "-") return profile.S;
  }
  return null;
}

function getChampionBS(unit) {
  if (unit.category === "characters") return null;
  if (!unit.stats || unit.stats.length < 2) return null;
  for (let idx = 1; idx < unit.stats.length; idx++) {
    const s = unit.stats[idx];
    if (s.Ld !== "-" && s.T !== "-" && !s.T?.startsWith("(+")) {
      return s.BS && s.BS !== "-" ? s.BS : null;
    }
  }
  return null;
}

function resolveStrength(weaponS, unitS) {
  if (!weaponS || !unitS) return weaponS;
  if (weaponS === "S") return unitS;
  const mod = weaponS.match(/^S([+-]\d+)$/);
  if (mod) return `${unitS}${mod[1]}`;
  return weaponS;
}

export function renderShootingContext(army) {
  const shooters = getShootingUnits(army);
  if (shooters.length === 0) return "";

  const entries = [];

  for (const u of shooters) {
    let matched = false;
    const bs = getBS(u);
    const unitS = getS(u);
    const champBS = getChampionBS(u);
    const championBS = champBS && champBS !== bs ? champBS : null;

    const specialRulesStr = (u.specialRules || [])
      .map((r) => r.displayName || "")
      .join(" ");
    const hasArrowsOfIsha =
      specialRulesStr?.toLowerCase().includes("arrows of isha") || false;

    // Check mount breath weapon
    if (u.mount) {
      const mount = u.mount;
      if (mount?.breath) {
        const breathKey = mount.breath.toLowerCase();
        const weapon = getWeapon(RANGED_WEAPONS, breathKey);
        if (weapon) {
          entries.push({
            unitName: u.name,
            strength: u.strength,
            bs: null,
            unitS,
            championBS,
            hasArrowsOfIsha,
            weapon,
          });
          matched = true;
        }
      }
    }

    // Check shooting weapons from canonical schema or equipment array
    const matchedWeapons = new Set();

    // In canonical schema, shootingWeapons are already resolved
    if (Array.isArray(u.shootingWeapons) && u.shootingWeapons.length > 0) {
      for (const weapon of u.shootingWeapons) {
        if (weapon && !matchedWeapons.has(weapon.name)) {
          matchedWeapons.add(weapon.name);
          // Find corresponding RANGED_WEAPONS entry
          let rangedWeapon = null;
          for (const rw of Object.values(RANGED_WEAPONS)) {
            if (rw.name === weapon.name) {
              rangedWeapon = rw;
              break;
            }
          }
          if (!rangedWeapon && weapon.name) {
            // Fallback: create a simple weapon object
            rangedWeapon = { name: weapon.name };
          }
          if (rangedWeapon) {
            entries.push({
              unitName: u.name,
              strength: u.strength,
              bs,
              unitS,
              championBS,
              hasArrowsOfIsha,
              weapon: rangedWeapon,
            });
            matched = true;

            if (rangedWeapon.altProfiles) {
              for (const altKey of rangedWeapon.altProfiles) {
                const altWeapon = getWeapon(RANGED_WEAPONS, altKey);
                if (altWeapon && !matchedWeapons.has(altWeapon.name)) {
                  matchedWeapons.add(altWeapon.name);
                  entries.push({
                    unitName: u.name,
                    strength: u.strength,
                    bs,
                    unitS,
                    championBS,
                    hasArrowsOfIsha,
                    weapon: altWeapon,
                  });
                }
              }
            }
          }
        }
      }
    } else {
      // Legacy support for string-based equipment
      const allParts = [...(u.equipment || []), specialRulesStr || ""].flatMap(
        (g) => g.split(",").map((s) => s.trim().toLowerCase()),
      );
      for (const part of allParts) {
        // Find the longest matching key for this part to avoid substring false positives
        let bestKey = null;
        let bestWeapon = null;
        for (const [key, weapon] of Object.entries(RANGED_WEAPONS)) {
          if (part.includes(key) && (!bestKey || key.length > bestKey.length)) {
            bestKey = key;
            bestWeapon = weapon;
          }
        }
        if (bestWeapon && !matchedWeapons.has(bestWeapon.name)) {
          matchedWeapons.add(bestWeapon.name);
          entries.push({
            unitName: u.name,
            strength: u.strength,
            bs,
            unitS,
            championBS,
            hasArrowsOfIsha,
            weapon: bestWeapon,
          });
          matched = true;

          // Include alternate profiles (e.g. scatter shot)
          if (bestWeapon.altProfiles) {
            for (const altKey of bestWeapon.altProfiles) {
              const altWeapon = getWeapon(RANGED_WEAPONS, altKey);
              if (altWeapon && !matchedWeapons.has(altWeapon.name)) {
                matchedWeapons.add(altWeapon.name);
                entries.push({
                  unitName: u.name,
                  strength: u.strength,
                  bs,
                  unitS,
                  championBS,
                  hasArrowsOfIsha,
                  weapon: altWeapon,
                });
              }
            }
          }
        }
      }
    }

    if (!matched) {
      entries.push({
        unitName: u.name,
        strength: u.strength,
        bs,
        unitS,
        championBS,
        hasArrowsOfIsha,
        weapon: null,
      });
    }
  }

  // Deduplicate by unitName + weaponName + bs
  const deduped = {};
  for (const e of entries) {
    const weaponName = e.weapon?.name || "other";
    const key = `${e.unitName}||${weaponName}||${e.bs}`;
    if (!deduped[key]) {
      deduped[key] = { ...e, merged: false };
    } else {
      deduped[key].merged = true;
    }
  }

  const rows = Object.values(deduped);
  const weaponRows = rows.filter((r) => r.weapon);
  const otherRows = rows.filter((r) => !r.weapon);

  if (weaponRows.length === 0 && otherRows.length === 0) return "";

  // Group weapon rows by unit name
  const groups = new Map();
  for (const r of weaponRows) {
    if (!groups.has(r.unitName)) {
      groups.set(r.unitName, {
        strength: r.strength,
        merged: r.merged,
        championBS: r.championBS,
        hasArrowsOfIsha: r.hasArrowsOfIsha,
        weapons: [],
      });
    }
    groups.get(r.unitName).weapons.push(r);
  }

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-shooting/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-shooting mb-3">Shooting Units</h3>
      <div class="space-y-2">
        ${[...groups.entries()]
          .map(
            ([unitName, group]) => `
          <div class="p-2 rounded bg-wh-card">
            <div class="text-sm font-semibold text-wh-text mb-1">
              ${displayUnitName(unitName, group.strength)}${!group.merged && group.strength > 1 ? ` <span class="text-wh-muted font-normal">x${group.strength}</span>` : ""}
            </div>
            <div class="space-y-1">
              ${group.weapons
                .map(
                  (r) => `
                <div class="pl-2 border-l-2 border-wh-phase-shooting/20">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-wh-muted text-sm">${r.weapon.name}</span>
                    ${r.bs && !r.weapon?.noBS ? `<span class="text-wh-phase-shooting font-mono text-xs">BS${r.bs}</span>` : ""}
                    <span class="text-wh-phase-shooting font-mono text-xs">${r.weapon.range}</span>
                    ${r.weapon.s ? `<span class="text-wh-muted font-mono text-xs">S${resolveStrength(r.weapon.s, r.unitS)}</span>` : ""}
                    ${r.weapon.ap && r.weapon.ap !== "—" ? `<span class="text-wh-muted font-mono text-xs">AP${r.weapon.ap}</span>` : ""}
                    ${group.championBS && !r.weapon?.noBS ? `<div class="text-xs text-wh-muted pl-1">Champion: <span class="text-wh-phase-shooting font-mono">BS${group.championBS}</span></div>` : ""}
                  </div>
                  ${r.weapon.rules?.length ? `<p class="text-xs text-wh-muted mt-0.5">${r.weapon.rules.join(", ")}</p>` : ""}
                  ${group.hasArrowsOfIsha && r.weapon.name.toLowerCase().includes("bow") ? '<p class="text-xs text-wh-accent mt-0.5">+Arrows of Isha: AP -1, Armour Bane (1)</p>' : ""}

                </div>
              `,
                )
                .join("")}
              
            </div>
          </div>
        `,
          )
          .join("")}
        ${
          otherRows.length > 0
            ? `
          <div class="p-2 rounded bg-wh-card">
            <div class="text-sm font-semibold text-wh-text mb-1">Other</div>
            <p class="text-xs text-wh-text">${otherRows.map((r) => displayUnitName(r.unitName, r.strength) + (!r.merged && r.strength > 1 ? ` x${r.strength}` : "") + (r.bs ? ` BS${r.bs}` : "")).join(", ")}</p>
          </div>
        `
            : ""
        }
      </div>
      ${renderMisfireTables(weaponRows)}
    </div>
  `;
}

function renderMisfireTables(weaponRows) {
  const keys = [
    ...new Set(
      weaponRows
        .filter((r) => r.weapon?.misfireTable)
        .map((r) => r.weapon.misfireTable),
    ),
  ];
  if (keys.length === 0) return "";

  return keys
    .map((key) => {
      const table = MISFIRE_TABLES[key];
      if (!table) return "";
      return `
      <div class="mt-3 pt-3 border-t border-wh-phase-shooting/20">
        <h4 class="text-xs font-bold text-wh-phase-shooting mb-2">${table.name}</h4>
        <table class="w-full text-xs">
          <thead>
            <tr class="text-left text-wh-muted">
              <th class="pb-1 pr-2 font-medium w-8">D6</th>
              <th class="pb-1 pr-2 font-medium">Result</th>
              <th class="pb-1 font-medium">Effect</th>
            </tr>
          </thead>
          <tbody>
            ${table.rows
              .map(
                (r) => `
              <tr>
                <td class="py-0.5 pr-2 font-mono text-wh-phase-shooting align-top">${r.roll}</td>
                <td class="py-0.5 pr-2 font-semibold text-wh-text align-top whitespace-nowrap">${r.result}</td>
                <td class="py-0.5 text-wh-muted">${r.effect}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    })
    .join("");
}
