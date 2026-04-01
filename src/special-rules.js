/**
 * Universal Special Rules mapped to game phases/sub-phases.
 *
 * Each rule has:
 *   name        – canonical name (as it appears on army lists)
 *   phases      – array of { phaseId, subPhaseId, description } entries
 *   passive     – true if the rule has no phase-specific trigger (always-on modifier)
 *
 * Phase/sub-phase IDs match those defined in phases.js.
 *
 * Source: https://tow.whfb.app/special-rules
 */

export const SPECIAL_RULES = [
  // ─── Deployment / Pre-game ────────────────────────────────────────
  {
    name: 'Scouts',
    phases: [
      {
        phaseId: null,
        subPhaseId: null,
        description:
          'Deploy after all other units from both armies. Must be placed >12" from enemy models. Cannot charge on first turn.',
      },
    ],
  },
  {
    name: 'Vanguard',
    phases: [
      {
        phaseId: null,
        subPhaseId: null,
        description:
          'After deployment, make a Vanguard move (basic movement, no march). Cannot declare charges on first turn.',
      },
    ],
  },

  // ─── Strategy Phase ───────────────────────────────────────────────
  {
    name: 'Stupidity',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'start-of-turn',
        description:
          'Unless fleeing or in combat, test Ld. If failed: cannot move, shoot, cast, or dispel until next Start of Turn. Must Hold if charged.',
      },
    ],
  },
  {
    name: 'Ambushers',
    aliases: ['Ambush'],
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'start-of-turn',
        fromRound: 2,
        description:
          'Roll D6 for each unit in reserve. 4+: arrives during Compulsory Moves. Auto-arrives round 5.',
      },
      {
        phaseId: 'movement',
        subPhaseId: 'compulsory-moves',
        fromRound: 2,
        description:
          'Arriving Ambushers enter from any board edge chosen by controlling player, >8" from enemy. Cannot march; count as having moved for shooting.',
      },
    ],
  },
  {
    name: 'Invocation of Nehek',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'command',
        description:
          'If not engaged, resurrect D3 + Wizard Level Wounds of Infantry, or Wizard Level Wounds of Monstrous/Cavalry, or 1 Wound of Behemoth/War Machine, in a friendly Necromantic Undead unit within 12". Requires Ld test.',
      },
    ],
  },
  {
    name: 'Rallying Cry',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'command',
        description:
          'During Command sub-phase, a non-engaged character nominates a fleeing friendly unit within Command range to take a Rally test. If failed, the unit may still try again in the Rally sub-phase.',
      },
    ],
  },
  {
    name: 'Frenzy',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'If majority Frenzied, unit must declare a charge if able. Cannot choose Flee as a charge reaction.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          '+1 Attack during a turn the unit charged or the turn after a follow-up move. Auto-passes Fear, Panic, Terror tests. Lost after losing a combat round.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'pursuit',
        description:
          'Cannot make Restraint tests — must pursue.',
      },
    ],
  },

  // ─── Movement Phase ───────────────────────────────────────────────
  {
    name: 'Impetuous',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'If able to charge, must take Ld test. If failed, must declare a charge.',
      },
    ],
  },
  {
    name: 'Counter Charge',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'Charge reaction vs cavalry/chariots/monsters charging front arc. Pivot to face, move D3+1" toward charger. Both units count as having charged. Cannot use if distance < charger\'s M.',
      },
    ],
  },
  {
    name: 'Fire & Flee',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'Charge reaction: Stand & Shoot then Flee. Flee roll discards lowest D6. Cannot use if distance < charger\'s M.',
      },
    ],
  },
  {
    name: 'Feigned Flight',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'If this unit Flees (or Fire & Flees) as a charge reaction, it automatically rallies at the end of its move.',
      },
    ],
  },
  {
    name: 'Random Movement',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'compulsory-moves',
        description:
          'Moves only during Compulsory Moves (distance determined by dice roll). Cannot march, charge, or manoeuvre beyond wheeling. Contacting an enemy counts as a charge.',
      },
    ],
  },
  {
    name: 'Drilled',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        description:
          'Free "redress the ranks" before moving. Can march within 8" of enemy without Ld test. Characters joining the unit gain Drilled.',
      },
    ],
  },
  {
    name: 'Swiftstride',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'Max declarable charge range is M+6+3" (instead of M+6").',
      },
      {
        phaseId: 'movement',
        subPhaseId: 'charge-moves',
        description:
          '+3" max charge range. May add +D6 to Charge, Flee, or Pursuit rolls.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'pursuit',
        description:
          'May add +D6 to Pursuit or Flee rolls.',
      },
    ],
  },
  {
    name: 'Fly',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        description:
          'Move using Fly (X) characteristic, passing freely over models/terrain. Can march within 8" of enemy without Ld test. Must start and end on ground. Cannot join units without Fly.',
      },
      {
        phaseId: 'movement',
        subPhaseId: 'charge-moves',
        description:
          'May charge using Fly movement, passing over intervening models and terrain.',
      },
    ],
  },
  {
    name: 'Fast Cavalry',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        description:
          'In Open Order, may perform Quick Turn even after marching.',
      },
    ],
  },
  {
    name: 'Move Through Cover',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        description:
          'No movement penalty for difficult/dangerous terrain. Re-roll 1s on Dangerous Terrain tests.',
      },
    ],
  },
  {
    name: 'Lumbering',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        description:
          'After moving, unless it charged, marched or fled, a Lumbering model may pivot about its centre to change its facing by up to 90°.',
      },
    ],
  },
  {
    name: 'Dragged Along',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        description:
          'If within 1" of a friendly infantry unit (10+ models, not fleeing), may use that unit\'s Movement characteristic.',
      },
    ],
  },

  // ─── Shooting Phase ───────────────────────────────────────────────
  {
    name: 'Petrifying Gaze',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        description:
          '18" range, S2. Magical Attacks, Multiple Wounds (D3). To Wound uses target\'s Initiative instead of Toughness. No armour saves permitted (Ward and Regeneration allowed).',
      },
    ],
  },
  {
    name: 'Breath Weapon',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        description:
          'Once per round in Shooting phase. Place flame template from model\'s front arc. Cannot be used in combat or for Stand & Shoot.',
      },
    ],
  },
  {
    name: 'Volley Fire',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        description:
          'Half the models in each rank beyond the front (rounding up) may shoot, in addition to front rank. Cannot use if moved or declared Stand & Shoot.',
      },
    ],
  },
  {
    name: 'Move & Shoot',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        description:
          'Weapon can be used in the Shooting phase even if the model marched.',
      },
    ],
  },
  {
    name: 'Move or Shoot',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        description:
          'Weapon cannot be used if the model moved for any reason this turn (including rallying or reforming).',
      },
    ],
  },
  {
    name: 'Multiple Shots',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'roll-to-hit',
        description:
          'Fire X shots at -1 To Hit, or a single shot at normal BS. Entire unit must choose the same option.',
      },
    ],
  },
  {
    name: 'Quick Shot',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'roll-to-hit',
        description:
          'No -1 To Hit penalty for moving and shooting. Can Stand & Shoot regardless of distance.',
      },
    ],
  },
  {
    name: 'Ignores Cover',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'roll-to-hit',
        description:
          'Ignore To Hit modifiers from partial or full cover.',
      },
    ],
  },
  {
    name: 'Ponderous',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'roll-to-hit',
        description:
          '-2 To Hit when moving and shooting (instead of the normal -1).',
      },
    ],
  },
  {
    name: 'Cumbersome',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'Weapon cannot be used for Stand & Shoot charge reactions.',
      },
    ],
  },
  {
    name: 'Evasive',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        description:
          'When targeted during opponent\'s Shooting phase, unit may Fall Back in Good Order (flee away from the shooter then auto-rally).',
      },
    ],
  },
  {
    name: 'Reserve Move',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'remove-casualties',
        description:
          'After all shooting, if unit did not charge/march/flee, make a basic move (no march). Resolved at end of Shooting phase.',
      },
    ],
  },

  // ─── Combat Phase ─────────────────────────────────────────────────
  {
    name: 'Impact Hits',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'If charged 3"+, auto-hit at unmodified S before challenges (step 1.1). Number of hits = X.',
      },
    ],
  },
  {
    name: 'Strike First',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Initiative becomes 10 (before other modifiers). Cancelled out by Strike Last.',
      },
    ],
  },
  {
    name: 'Strike Last',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Initiative becomes 1 (before other modifiers). Cancelled out by Strike First.',
      },
    ],
  },
  {
    name: 'Stomp Attacks',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Resolved last (after I1 attacks). Auto-hit at unmodified S. Only models in base contact.',
      },
    ],
  },
  {
    name: 'Extra Attacks',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          '+X modifier to Attacks characteristic. If random, roll when combat is chosen.',
      },
    ],
  },
  {
    name: 'Random Attacks',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Roll dice to determine number of attacks each combat turn. Roll separately for each model.',
      },
    ],
  },
  {
    name: 'Furious Charge',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          '+1 Attack during a turn in which the model charged 3" or more.',
      },
    ],
  },
  {
    name: 'First Charge',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'If the unit\'s first charge of the game is successful, the charge target becomes Disrupted until end of Combat phase.',
      },
    ],
  },
  {
    name: 'Eternal Hatred',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Against High Elves, Hatred applies in every round of combat, not just the first. Does not affect mount.',
      },
    ],
  },
  {
    name: 'Murderous',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Fighting with a single hand weapon: re-roll any To Wound rolls of natural 1. Does not apply with two hand weapons or other weapon types. Does not affect mount.',
      },
    ],
  },
  {
    name: 'Hatred',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Re-roll failed To Hit rolls against hated enemies during the first round of combat.',
      },
    ],
  },
  {
    name: 'Killing Blow',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Natural 6 To Wound: infantry/cavalry target cannot take armour or Regeneration saves (Ward saves allowed). Loses all remaining Wounds.',
      },
    ],
  },
  {
    name: 'Monster Slayer',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Natural 6 To Wound vs monsters: no armour or Regeneration saves (Ward saves allowed). Monster loses all remaining Wounds.',
      },
    ],
  },
  {
    name: 'Fear',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'When charging a Fear-causing unit with higher Unit Strength, take Ld test or fail the charge.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'When fighting a Fear-causing enemy with higher Unit Strength, take Ld test or suffer -1 To Hit against that enemy.',
      },
    ],
  },
  {
    name: 'Terror',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        description:
          'When a Terror-causing unit declares a charge, the target takes Ld test — failed = must Flee. Also causes Fear.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'If the winning side includes Terror-causing units, losing units suffer -1 Ld on Break tests.',
      },
    ],
  },
  {
    name: 'Fight in Extra Rank',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Models behind the fighting rank may make supporting attacks.',
      },
    ],
  },
  {
    name: 'Shieldwall',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'Once per game, a Close Order unit with shields that is charged may Give Ground instead of Falling Back in Good Order.',
      },
    ],
  },
  {
    name: 'Stubborn',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'May decline first Break test — automatically Falls Back in Good Order instead. Does not transfer between Stubborn characters and non-Stubborn units.',
      },
    ],
  },
  {
    name: 'Unbreakable',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'Never takes Break tests. Automatically Gives Ground when losing combat. Non-Unbreakable characters cannot join.',
      },
    ],
  },
  {
    name: 'Unstable',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'Loses 1 extra Wound per point of combat result lost by. No Regeneration saves. Wounds split between characters and unit.',
      },
    ],
  },
  {
    name: 'Timmm-berrr!',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'When a behemoth is slain, roll off to determine fall direction. Units in base contact in that arc suffer D6 hits at model\'s S with AP -1.',
      },
    ],
  },

  // ─── Shooting & Combat (wound/save modifiers) ────────────────────
  {
    name: 'Armour Bane',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'wound-and-save',
        description:
          'Natural 6 To Wound: AP improves by X.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Natural 6 To Wound: AP improves by X.',
      },
    ],
  },
  {
    name: 'Poisoned Attacks',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'roll-to-hit',
        description:
          'Natural 6 To Hit: +2 To Wound modifier. Cannot use if To Hit needs 7+ or hits automatically. Does not apply to spells or magic weapons.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Natural 6 To Hit: +2 To Wound modifier. Cannot use if To Hit needs 7+ or hits automatically.',
      },
    ],
  },
  {
    name: 'Flaming Attacks',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'wound-and-save',
        description:
          'Attacks are Flaming. Causes Fear in war beasts/swarms. Does not apply to spells or magic weapons.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Attacks are Flaming. Causes Fear in war beasts/swarms. Does not apply to spells or magic weapons.',
      },
    ],
  },
  {
    name: 'Multiple Wounds',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'wound-and-save',
        description:
          'Each unsaved wound is multiplied by X. Excess wounds do not spill over to other models.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Each unsaved wound is multiplied by X. Excess wounds do not spill over to other models.',
      },
    ],
  },
  {
    name: 'Regeneration',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'wound-and-save',
        description:
          'After losing a Wound, roll D6: X+ recovers the Wound (still counts for combat result). AP rules do not affect Regeneration.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'After losing a Wound, roll D6: X+ recovers the Wound (still counts for combat result).',
      },
    ],
  },

  // ─── Passive / always-on rules ────────────────────────────────────
  {
    name: 'Armoured Hide',
    passive: true,
    phases: [],
    description:
      'Improves armour value by X. Models without armour are treated as having armour value 7+.',
  },
  {
    name: 'Close Order',
    passive: true,
    phases: [],
    description: 'Unit may adopt Close Order formation (ranks and files, base-to-base).',
  },
  {
    name: 'Open Order',
    passive: true,
    phases: [],
    description: 'Unit may adopt Open Order formation.',
  },
  {
    name: 'Skirmishers',
    passive: true,
    phases: [],
    description: 'Unit may adopt Skirmish formation (loose group, increased manoeuvrability).',
  },
  {
    name: 'Ethereal',
    passive: true,
    phases: [],
    description:
      'Treats all terrain as open ground. Can only be wounded by Magical attacks. Non-Ethereal characters cannot join.',
  },
  {
    name: 'Large Target',
    passive: true,
    phases: [],
    description:
      'No cover benefit. LoS can be drawn over/through non-Large Target units. Shooters get +1 rank when targeting.',
  },
  {
    name: 'Flammable',
    passive: true,
    phases: [],
    description: 'Cannot make Regeneration saves against Flaming attacks.',
  },
  {
    name: 'Warp-spawned',
    passive: true,
    phases: [],
    description:
      'Cannot make Regeneration saves against Magical attacks. Non-Warp-spawned characters cannot join.',
  },
  {
    name: 'Magical Attacks',
    passive: true,
    phases: [],
    description:
      'All attacks are Magical. All spells and magic item hits are inherently Magical.',
  },
  {
    name: 'Immune to Psychology',
    passive: true,
    phases: [],
    description:
      'Auto-passes Fear, Panic, Terror tests (if majority). Cannot choose Flee as a charge reaction.',
  },
  {
    name: 'Magic Resistance',
    passive: true,
    phases: [],
    description:
      'Enemy casting rolls targeting this unit suffer -X penalty. Does not stack (use highest).',
  },
  {
    name: 'Requires Two Hands',
    passive: true,
    phases: [],
    description: 'Cannot use a shield in combat. Shield still protects against shooting/magic.',
  },
  {
    name: 'Horde',
    passive: true,
    phases: [],
    description: 'Max Rank Bonus increased by 1.',
  },
  {
    name: 'Warband',
    passive: true,
    phases: [],
    description:
      'Ld bonus = current Rank Bonus (max Ld 10). May re-roll Charge rolls. Bonus does not apply to Restraint or Impetuous tests.',
  },
  {
    name: 'Levies',
    passive: true,
    phases: [],
    description:
      'Cannot benefit from Inspiring Presence or Hold your Ground. Other units ignore this unit\'s rout for Panic.',
  },
  {
    name: 'Mercenaries',
    passive: true,
    phases: [],
    description:
      'Cannot benefit from Inspiring Presence or Hold your Ground. Cannot be joined by characters from a different army list.',
  },
  {
    name: 'Loner',
    passive: true,
    phases: [],
    description:
      'Cannot be General. Cannot join a unit without Loner, and vice versa.',
  },
  {
    name: 'Veteran',
    passive: true,
    phases: [],
    description:
      'If majority, unit may re-roll failed Leadership tests (not Break tests).',
  },
  {
    name: 'Chariot Runners',
    passive: true,
    phases: [],
    description:
      'Friendly chariots can draw LoS over/through and move through this unit (Skirmish formation). Unit coherency extends to friendly chariots within 1".',
  },
  {
    name: 'Detachment',
    passive: true,
    phases: [],
    description:
      'Unit can be fielded as a detachment alongside a parent regiment.',
  },
  {
    name: 'Regimental Unit',
    passive: true,
    phases: [],
    description: 'Unit can be accompanied by detachments.',
  },
  {
    name: 'Motley Crew',
    passive: true,
    phases: [],
    description:
      'Unit may include differently equipped models or mixed troop types. Separate attack rolls per type; casualties split evenly.',
  },
  {
    name: 'Monster Handlers',
    passive: true,
    phases: [],
    description:
      'Handlers add attacks to monster. Wounds allocated: 1-4 monster, 5+ handler. If monster dies, handlers die.',
  },
  {
    name: 'Howdah',
    passive: true,
    phases: [],
    description:
      'Split profile (as chariots) and Firing Platform rules. Otherwise treated as a behemoth.',
  },
]

/**
 * Lore Familiar (Arcane Item, 30 pts)
 *
 * "The owner of a Lore Familiar does not randomly generate their spells.
 *  Instead, they may choose which spells they know from their chosen lore
 *  (including that lore's signature spell)."
 *
 * This affects army list building / spell selection — not a specific game phase.
 * Included here for reference when building spell-selection UI.
 */
export const LORE_FAMILIAR = {
  name: 'Lore Familiar',
  type: 'Arcane Item',
  points: 30,
  description:
    'The Wizard does not randomly generate spells. Instead, they choose which spells they know from their chosen lore (including the signature spell).',
}

/**
 * Arcane Familiar (Arcane Item, 15 pts)
 *
 * The bearer gains access to spells from two Lores of Magic.
 * Roll for each Lore separately; re-roll duplicates.
 * May discard one randomly generated spell and replace with that Lore's signature spell.
 */
export const ARCANE_FAMILIAR = {
  name: 'Arcane Familiar',
  type: 'Arcane Item',
  points: 15,
  description:
    'Bearer has access to two Lores of Magic. Roll for each separately, re-roll duplicates. May swap one random spell for that Lore\'s signature spell.',
}

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Return all special rules that are active during a given sub-phase.
 * @param {string} subPhaseId – e.g. 'start-of-turn', 'declare-charges'
 * @returns {Array<{name: string, description: string}>}
 */
export function rulesForSubPhase(subPhaseId) {
  const results = []
  for (const rule of SPECIAL_RULES) {
    for (const p of rule.phases) {
      if (p.subPhaseId === subPhaseId) {
        results.push({ name: rule.name, description: p.description })
      }
    }
  }
  return results
}

/**
 * Return all special rules that are active during a given phase.
 * @param {string} phaseId – e.g. 'strategy', 'movement', 'shooting', 'combat'
 * @returns {Array<{name: string, subPhaseId: string, description: string}>}
 */
export function rulesForPhase(phaseId) {
  const results = []
  for (const rule of SPECIAL_RULES) {
    for (const p of rule.phases) {
      if (p.phaseId === phaseId) {
        results.push({ name: rule.name, subPhaseId: p.subPhaseId, description: p.description })
      }
    }
  }
  return results
}

/**
 * Look up a specific rule by name (case-insensitive).
 * @param {string} name
 * @returns {object|undefined}
 */
export function findRule(name) {
  const lower = name.toLowerCase()
  return SPECIAL_RULES.find((r) => r.name.toLowerCase() === lower)
}
