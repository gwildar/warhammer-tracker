export const PHASES = [
  {
    id: 'strategy',
    name: 'Strategy Phase',
    colour: 'wh-phase-strategy',
    subPhases: [
      {
        id: 'start-of-turn',
        name: 'Start of Turn',
        rules: [
          'Units with special actions triggered at the start of a turn perform them now, in an order chosen by the active player.',
          'Scenario-specific tests and victory condition checks occur here.',
          'Housekeeping: remove stray casualties, errant dice, other detritus.',
          'Players may ask opponents clarifying questions about special rules and magic items.',
        ],
      },
      {
        id: 'command',
        name: 'Command',
        rules: [
          'Characters with Command sub-phase special rules activate them now.',
          'Select one non-fleeing model with a Command ability, announce the special rule and affected unit(s), make any required tests.',
          'Repeat for all eligible models.',
          'A model can only use a given special rule once per Command sub-phase (unless stated otherwise).',
        ],
      },
      {
        id: 'conjuration',
        name: 'Conjuration',
        rules: [
          'Wizards cast Enchantment spells (buffs for friendly units) and Hex spells (debuffs on enemies).',
          'Select one non-fleeing Wizard, attempt to cast. If successful, the inactive player may attempt to dispel.',
          'Repeat for all Wizards in the army.',
          'Enchantment and Hex spells only \u2014 Magic Missiles and Magical Vortexes are cast in the Shooting phase.',
          'Dispel Remains in Play: attempt to dispel enemy Remains in Play spells. You only need to beat the spell\u2019s minimum casting value (not the original roll). Wizardly dispel range: 18" (Lvl 1\u20132) or 24" (Lvl 3\u20134).',
        ],
        showCasters: true,
      },
      {
        id: 'rally',
        name: 'Rally Fleeing Troops',
        rules: [
          'Test each fleeing unit against its Leadership (roll 2D6, must roll equal to or under Ld).',
          'Passed: unit rallies, may perform a free reform. Cannot charge this turn; counts as having moved for shooting.',
          'Failed: unit continues fleeing (will flee during Movement phase).',
          'Natural 12 always fails. Natural 2 always passes.',
          'Insurmountable Losses: units below 50% strength suffer \u22121 Ld for rallying; below 25% can only pass on a natural double 1.',
        ],
      },
    ],
  },
  {
    id: 'movement',
    name: 'Movement Phase',
    colour: 'wh-phase-movement',
    subPhases: [
      {
        id: 'declare-charges',
        name: 'Declare Charges & Charge Reactions',
        rules: [
          'Declare charging units one at a time, specifying the enemy charge target.',
          'At least one model in the unit must have line of sight to the target; target must be at least partially within the front arc.',
          'Players may measure distances before declaring charges.',
          'Inactive player declares charge reactions for each targeted unit:',
          '\u2022 Hold \u2014 defensive stance, no movement.',
          '\u2022 Stand & Shoot \u2014 fire at the chargers before contact.',
          '\u2022 Flee \u2014 the charged unit flees from the chargers.',
        ],
        showMovement: true,
      },
      {
        id: 'charge-moves',
        name: 'Charge Moves',
        rules: [
          'Move charging units in an order of your choosing.',
          'Charge range = 2d6 (pick the highest unless charging into dangerous or difficult terrain then pick the lowest) + Movement characteristic + swiftstride d6 (if applicable).',
          'Failed charges: unit moves forward a reduced distance.',
          'Align charging unit with the target on contact.',
        ],
        showMovement: true,
      },
      {
        id: 'compulsory-moves',
        name: 'Compulsory Moves',
        rules: [
          'Units that must move (e.g. fleeing units) do so now.',
          'No player discretion \u2014 these movements are mandatory.',
          'Fleeing units move 2D6" directly away from the nearest enemy.',
        ],
      },
      {
        id: 'remaining-moves',
        name: 'Remaining Moves',
        rules: [
          'Move units that haven\u2019t yet moved this phase.',
          'Units that charged, are fleeing, or moved during Compulsory Moves cannot move again.',
          'Conveyance spells may be cast during this sub-phase.',
          'Units can march (double move) but cannot shoot this turn if they do.',
        ],
        showMovement: true,
      },
    ],
  },
  {
    id: 'shooting',
    name: 'Shooting Phase',
    colour: 'wh-phase-shooting',
    subPhases: [
      {
        id: 'choose-target',
        name: 'Choose Unit & Declare Target',
        rules: [
          'Select a unit that is able to shoot.',
          'Check range and line of sight to potential targets, then declare the target.',
          'Cannot shoot: units that charged or marched, units engaged in combat, fleeing units.',
          'Magic Missiles are also cast during this phase.',
        ],
        showShooting: true,
      },
      {
        id: 'roll-to-hit',
        name: 'Roll To Hit',
        rules: [
          'Roll To Hit for the shooting unit (BS-based).',
          'Not all models in a unit may be able to shoot (check arcs, range).',
          'Apply To Hit modifiers: long range (\u22121), moving (\u22121), cover, etc.',
          'A natural 1 always misses. A natural 6 always hits.',
        ],
        showShooting: true,
      },
      {
        id: 'wound-and-save',
        name: 'Roll To Wound & Armour Saves',
        rules: [
          'For each hit, roll To Wound (compare S vs T on the wound chart).',
          'For each wound, the opponent may make an Armour Save.',
          'Armour Piercing (AP) modifies the save (e.g. AP \u22121 means save worsened by 1).',
          'Ward saves are taken after armour saves (not modified by AP).',
        ],
      },
      {
        id: 'remove-casualties',
        name: 'Remove Casualties & Panic Tests',
        rules: [
          'Each unsaved wound removes one Wound from the target unit.',
          'Models reduced to zero Wounds are removed as casualties.',
          'If 25% or more of a unit\u2019s starting strength is killed in one phase, it must take a Panic test (Ld on 2D6).',
          'Failed Panic test: unit flees.',
        ],
      },
    ],
  },
  {
    id: 'combat',
    name: 'Combat Phase',
    colour: 'wh-phase-combat',
    subPhases: [
      {
        id: 'choose-fight',
        name: 'Choose & Fight Combat',
        rules: [
          'Active player picks a combat to resolve.',
          'Models fight in Initiative order (highest first).',
          'Each model makes its attacks, rolling To Hit (WS vs WS) then To Wound (S vs T).',
          'Defender makes Armour and Ward saves, then remove casualties.',
          'All engaged models must fight \u2014 no opting out.',
        ],

      },
      {
        id: 'combat-result',
        name: 'Calculate Combat Result',
        rules: [
          'Each side totals combat result points:',
          '\u2022 Wounds caused (unsaved)',
          '\u2022 Rank bonus (up to +3 for additional ranks)',
          '\u2022 Standard bearer (+1)',
          '\u2022 Flank or rear charge bonus',
          '\u2022 High ground, outnumber, etc.',
          'The side with the higher total wins the combat.',
        ],

      },
      {
        id: 'break-test',
        name: 'Break Test',
        rules: [
          'Each unit on the losing side takes a Break test.',
          'Roll 2D6 \u2264 Ld (modified by amount lost by).',
          'Gives Ground: lost by 1 \u2014 unit moves back but maintains formation.',
          'Falls Back in Good Order: lost by 2+ but passed Break test \u2014 controlled retreat.',
          'Breaks and Flees: failed Break test \u2014 unit routs and flees.',
        ],
      },
      {
        id: 'pursuit',
        name: 'Follow Up & Pursuit',
        rules: [
          'Winning units may:',
          '\u2022 Follow up an enemy that Gives Ground.',
          '\u2022 Pursue an enemy that Falls Back in Good Order or Breaks.',
          '\u2022 Restrain from pursuit (requires Ld test).',
          'Pursuing into a fleeing unit destroys it.',
          'This is the last sub-phase \u2014 the turn ends after all combats are resolved.',
        ],
      },
    ],
  },
]

export function getAllSubPhases() {
  const result = []
  for (const phase of PHASES) {
    for (const sub of phase.subPhases) {
      result.push({ phase, subPhase: sub })
    }
  }
  return result
}
