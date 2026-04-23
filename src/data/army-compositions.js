/**
 * Army of Infamy / Army Composition bonus rules.
 *
 * Some army compositions grant additional special rules to specific units
 * that are not included in the OWB export. This file maps compositions
 * to the bonus rules they inject.
 *
 * Each composition has:
 *   id              – matches the armyComposition field from OWB JSON
 *   deploymentCards – array of { title, colour, description, items } shown on the deployment screen
 *   rules           – array of { rule, unitIds }
 *     rule    – special rule string to inject into unit.specialRules
 *     unitIds – array of OWB unit ID prefixes (before the dot) that gain the rule
 */

/**
 * Deployment cards that apply to all armies of a given armySlug,
 * regardless of army-of-infamy composition.
 */
export const ARMY_SLUG_DEPLOYMENT_CARDS = {
  "wood-elf-realms": [
    {
      title: "Woodland Ambush — Before Deployment",
      colour: "wh-green",
      description: "Place one additional wood on the battlefield.",
      items: [
        'Between 3" and 9" wide',
        "Cannot be placed within the opponent's deployment zone",
        'Cannot be placed within 12" of the centre of the battlefield',
      ],
    },
  ],
};

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
  "orions-wild-hunt": {
    name: "Orion's Wild Hunt",
    deploymentCards: [
      {
        title: "Worthy of Kurnous",
        colour: "wh-purple",
        description:
          "After all units are deployed, nominate a single enemy character or monster.",
        items: [
          "All friendly models re-roll To Hit rolls of 1 (shooting & combat) when targeting the nominated unit",
          "+100 VP if the nominated model is slain, flees, or is fleeing at game end",
        ],
      },
    ],
    rules: [],
  },
  "wolves-of-the-sea": {
    name: "Wolves of the Sea",
    deploymentCards: [
      {
        title: "Warriors' Duel — Before First Turn",
        colour: "wh-red",
        description:
          "Before the first-turn roll-off, either player may propose a Warriors' Duel.",
        items: [
          "Each side nominates one champion (infantry or cavalry, exactly 1 Wound)",
          "Champions fight in a challenge until one falls — winner's army takes the first turn",
          "If both fall simultaneously, revert to a standard roll-off",
          "If declined, Wolves of the Sea automatically takes the first turn",
          "Bretonnian opponent: accepting triggers Blessings of the Lady; declining causes units with Grail Vow to lose it",
        ],
      },
    ],
    rules: [],
  },
  "the-chracian-warhost": {
    name: "The Chracian Warhost",
    deploymentCards: [
      {
        title: "Warriors of the Wilderness — Before Deployment",
        colour: "wh-green",
        description: "Place one additional wood on the battlefield.",
        items: [
          'Between 3" and 9" wide',
          "Cannot be placed within the opponent's deployment zone",
          'Cannot be placed within 6" of any special terrain features',
        ],
      },
    ],
    rules: [
      {
        rule: "Warriors of the Wilderness",
        unitIds: ["prince", "noble", "archmage", "mage"],
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
