/**
 * Army of Infamy / Army Composition bonus rules.
 *
 * Some army compositions grant additional special rules to specific units
 * that are not included in the OWB export. This file maps compositions
 * to the bonus rules they inject.
 *
 * Each composition has:
 *   id       – matches the armyComposition field from OWB JSON
 *   rules    – array of { rule, unitIds }
 *     rule    – special rule string to inject into unit.specialRules
 *     unitIds – array of OWB unit ID prefixes (before the dot) that gain the rule
 */

export const ARMY_COMPOSITIONS = {
  "mortuary-cults": {
    name: "Mortuary Cult",
    rules: [
      {
        rule: "Sepulchral Animus",
        unitIds: ["mortuary-priest", "high-priest"],
      },
    ],
  },
  "errantry-crusades": {
    name: "Errantry Crusade",
    rules: [
      {
        rule: "Crusader's Zeal",
        unitIds: [
          "baron",
          "paladin",
          "knights-of-the-realm",
          "knights-of-the-realm-on-foot",
          "battle-pilgrims",
          "knights-errant",
          "questing-knights",
          "grail-knights",
          "pegasus-knights",
          "mounted-yeomen",
        ],
      },
    ],
  },
};

/**
 * Phase skips for armies that are immune to certain game mechanics.
 * Keyed by armySlug (json.army from OWB export).
 */
export const ARMY_PHASE_CONFIG = {
  "vampire-counts": { skipPhases: ["rally", "break-test"] },
  "tomb-kings-of-khemri": { skipPhases: ["rally", "break-test"] },
};
