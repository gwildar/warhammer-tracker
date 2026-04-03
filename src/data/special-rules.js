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
    id: 'scouts', displayName: 'Scouts',
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
    id: 'vanguard', displayName: 'Vanguard',
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
    id: 'stupidity', displayName: 'Stupidity',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'start-of-turn',
        yourTurnOnly: true,
        description:
          'Unless fleeing or in combat, test Ld. If failed: cannot move, shoot, cast, or dispel until next Start of Turn. Must Hold if charged.',
      },
    ],
  },
  {
    id: 'ambushers', displayName: 'Ambushers',
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
    id: 'invocation of nehek', displayName: 'Invocation of Nehek',
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
    id: 'rallying cry', displayName: 'Rallying Cry',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'command',
        yourTurnOnly: true,
        description:
          'During Command sub-phase, a non-engaged character nominates a fleeing friendly unit within Command range to take a Rally test. If failed, the unit may still try again in the Rally sub-phase.',
      },
    ],
  },
  {
    id: 'frenzy', displayName: 'Frenzy',
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
    id: 'impetuous', displayName: 'Impetuous',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        yourTurnOnly: true,
        description:
          'If able to charge, must take Ld test. If failed, must declare a charge.',
      },
    ],
  },
  {
    id: 'counter charge', displayName: 'Counter Charge',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        opponentOnly: true,
        description:
          'Charge reaction vs cavalry/chariots/monsters charging front arc. Pivot to face, move D3+1" toward charger. Both units count as having charged. Cannot use if distance < charger\'s M.',
      },
    ],
  },
  {
    id: 'fire & flee', displayName: 'Fire & Flee',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        opponentOnly: true,
        description:
          'Charge reaction: Stand & Shoot then Flee. Flee roll discards lowest D6. Cannot use if distance < charger\'s M.',
      },
    ],
  },
  {
    id: 'feigned flight', displayName: 'Feigned Flight',
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
    id: 'random movement', displayName: 'Random Movement',
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
    id: 'drilled', displayName: 'Drilled',
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
    id: 'swiftstride', displayName: 'Swiftstride', chargeMod: { range: 3, tag: 'Swift', color: 'green', order: 1 },
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        yourTurnOnly: true,
        description:
          'Max declarable charge range is M+6+3" (instead of M+6").',
      },
      {
        phaseId: 'movement',
        subPhaseId: 'charge-moves',
        yourTurnOnly: true,
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
    id: 'fly', displayName: 'Fly',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        yourTurnOnly: true,
        description:
          'Move using Fly (X) characteristic, passing freely over models/terrain. Can march within 8" of enemy without Ld test. Must start and end on ground. Cannot join units without Fly.',
      },
      {
        phaseId: 'movement',
        subPhaseId: 'charge-moves',
        yourTurnOnly: true,
        description:
          'May charge using Fly movement, passing over intervening models and terrain.',
      },
    ],
  },
  {
    id: 'fast cavalry', displayName: 'Fast Cavalry',
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
    id: 'move through cover', displayName: 'Move Through Cover',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        yourTurnOnly: true,
        description:
          'No movement penalty for difficult/dangerous terrain. Re-roll 1s on Dangerous Terrain tests.',
      },
    ],
  },
  {
    id: 'lumbering', displayName: 'Lumbering',
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
    id: 'dragged along', displayName: 'Dragged Along',
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
    id: 'stony stare', displayName: 'Stony Stare',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'At the start of each Combat phase, enemy models in base contact must pass an Initiative test or suffer D3 S2 hits. No armour saves (Ward and Regeneration allowed).',
      },
    ],
  },
  {
    id: 'cleaving blow', displayName: 'Cleaving Blow',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Natural 6 To Wound: regular infantry, heavy infantry, light/heavy cavalry, and war beasts cannot take armour or Regeneration saves (Ward saves allowed).',
      },
    ],
  },
  {
    id: 'breath weapon', displayName: 'Breath Weapon',
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
    id: 'volley fire', displayName: 'Volley Fire',
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
    id: 'move & shoot', displayName: 'Move & Shoot',
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
    id: 'move or shoot', displayName: 'Move or Shoot',
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
    id: 'multiple shots', displayName: 'Multiple Shots',
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
    id: 'quick shot', displayName: 'Quick Shot',
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
    id: 'ignores cover', displayName: 'Ignores Cover',
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
    id: 'ponderous', displayName: 'Ponderous',
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
    id: 'cumbersome', displayName: 'Cumbersome',
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
    id: 'evasive', displayName: 'Evasive',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        opponentOnly: true,
        description:
          'When targeted during opponent\'s Shooting phase, unit may Fall Back in Good Order (flee away from the shooter then auto-rally).',
      },
    ],
  },
  {
    id: 'reserve move', displayName: 'Reserve Move',
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
    id: 'elven reflexes', displayName: 'Elven Reflexes',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          '+1 Initiative (max 10) during the first round of any combat. Does not apply to mount.',
      },
    ],
  },
  {
    id: 'strike first', displayName: 'Strike First',
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
    id: 'strike last', displayName: 'Strike Last',
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
    id: 'extra attacks', displayName: 'Extra Attacks',
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
    id: 'random attacks', displayName: 'Random Attacks',
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
    id: 'furious charge', displayName: 'Furious Charge',
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
    id: 'first charge', displayName: 'First Charge',
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
    id: 'eternal hatred', displayName: 'Eternal Hatred',
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
    id: 'murderous', displayName: 'Murderous',
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
    id: 'hatred', displayName: 'Hatred',
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
    id: 'killing blow', displayName: 'Killing Blow',
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
    id: 'monster slayer', displayName: 'Monster Slayer',
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
    id: 'fear', displayName: 'Fear',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        opponentOnly: true,
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
    id: 'terror', displayName: 'Terror',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        yourTurnOnly: true,
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
    id: 'fight in extra rank', displayName: 'Fight in Extra Rank',
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
    id: 'shieldwall', displayName: 'Shieldwall',
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
    id: 'stubborn', displayName: 'Stubborn',
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
    id: 'unbreakable', displayName: 'Unbreakable',
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
    id: 'unstable', displayName: 'Unstable',
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
    id: 'timmm-berrr!', displayName: 'Timmm-berrr!',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'When a behemoth is slain, roll off to determine fall direction. Units in base contact in that arc suffer D6 hits at model\'s S with AP -1.',
      },
    ],
  },

  {
    id: 'wailing dirge', displayName: 'Wailing Dirge',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Range 8". Ld test at -2. Wounds = margin of failure. No armour/Regen saves. Can target units in combat.',
      },
    ],
  },

  // ─── Shooting & Combat (wound/save modifiers) ────────────────────
  {
    id: 'poisoned attacks', displayName: 'Poisoned Attacks',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'roll-to-hit',
        yourTurnOnly: true,
        description:
          'Natural 6 To Hit: +2 To Wound modifier. Cannot use if To Hit needs 7+ or hits automatically. Does not apply to spells or magic weapons.',
      },
      {
        phaseId: 'shooting',
        subPhaseId: 'wound-and-save',
        yourTurnOnly: true,
        description:
          'Natural 6 To Hit: +2 To Wound modifier. Does not apply to spells or magic weapons.',
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
    id: 'flaming attacks', displayName: 'Flaming Attacks',
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
    id: 'multiple wounds', displayName: 'Multiple Wounds',
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
    id: 'regeneration', displayName: 'Regeneration',
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

  // ─── Kingdom of Bretonnia ─────────────────────────────────────────
  {
    id: 'blessings of the lady', displayName: 'Blessings of the Lady',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          '6+ Ward save (5+ vs S5+). Lost if the unit flees or a character refuses a challenge.',
      },
    ],
  },
  {
    id: 'finest warhorses', displayName: 'Finest Warhorses',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'charge-moves',
        yourTurnOnly: true,
        description:
          'Re-roll any natural 1s on Charge, Flee, or Pursuit rolls (before discarding dice).',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'pursuit',
        description:
          'Re-roll any natural 1s on Flee or Pursuit rolls (before discarding dice).',
      },
    ],
  },
  {
    id: "crusader's zeal", displayName: "Crusader's Zeal", chargeMod: { range: 1, tag: 'Zeal', color: 'orange', order: 2 },
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        yourTurnOnly: true,
        description:
          '+1" to maximum charge range and +1 to Charge roll result. Also gains Impetuous.',
      },
      {
        phaseId: 'movement',
        subPhaseId: 'charge-moves',
        yourTurnOnly: true,
        description:
          '+1" to maximum charge range and +1 to Charge roll result.',
      },
    ],
  },
  {
    id: 'earn your spurs', displayName: 'Earn Your Spurs',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Enemy standards captured worth 100 VPs. Within 6" of a Grail Vow model or Lord of Bretonnia, re-roll natural 1s To Hit.',
      },
    ],
  },
  {
    id: 'beguiling aura', displayName: 'Beguiling Aura',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        opponentOnly: true,
        description:
          'Enemy models must pass Ld test before rolling To Hit against this model; if failed, only natural 6s hit.',
      },
    ],
  },
  {
    name: "Peasant's Duty",
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'May Give Ground instead of Fall Back in Good Order. Friendly Levies within Command range re-roll failed Panic tests.',
      },
    ],
  },
  {
    id: 'the grail vow', displayName: 'The Grail Vow',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Immune to Psychology, Magical Attacks, Stubborn. Cannot refuse challenges.',
      },
    ],
  },
  {
    id: 'the questing vow', displayName: 'The Questing Vow',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'Stubborn. Re-roll failed Fear, Panic, and Terror tests.',
      },
    ],
  },
  {
    name: "The Knight's Vow",
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'start-of-turn',
        description:
          'No Panic test when a friendly Peasantry unit is destroyed within 6" or flees through.',
      },
    ],
  },
  {
    id: 'guardian of the sacred sites', displayName: 'Guardian of the Sacred Sites',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'start-of-turn',
        yourTurnOnly: true,
        description:
          'D6 roll of 3+ to awaken the Green Knight (automatic from round 5). Place within any natural terrain feature.',
      },
    ],
  },
  {
    id: 'aura of the fay', displayName: 'Aura of the Fay',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'start-of-turn',
        yourTurnOnly: true,
        description:
          'If removed, attempt to reawaken with cumulative -1 penalty. -1 Wounds characteristic each time (min 1).',
      },
    ],
  },
  {
    id: 'arcane backlash', displayName: 'Arcane Backlash',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'conjuration',
        opponentOnly: true,
        description:
          '+1 to Dispel rolls. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.',
      },
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        opponentOnly: true,
        description:
          '+1 to Dispel rolls vs Conveyance spells. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.',
      },
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        opponentOnly: true,
        description:
          '+1 to Dispel rolls vs Magic Missiles. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.',
      },
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        opponentOnly: true,
        description:
          '+1 to Dispel rolls vs Assailment spells. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.',
      },
    ],
  },

  // ─── Passive / always-on rules ────────────────────────────────────
  {
    id: 'armoured hide', displayName: 'Armoured Hide',
    passive: true,
    phases: [],
    description:
      'Improves armour value by X. Models without armour are treated as having armour value 7+.',
  },
  {
    id: 'close order', displayName: 'Close Order',
    passive: true,
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'combat-result',
        description:
          '+1 combat result bonus when in Close Order formation.',
      },
    ],
    description: 'Unit may adopt Close Order formation (ranks and files, base-to-base).',
  },
  {
    id: 'open order', displayName: 'Open Order',
    passive: true,
    phases: [],
    description: 'Unit may adopt Open Order formation.',
  },
  {
    id: 'skirmishers', displayName: 'Skirmishers',
    passive: true,
    phases: [],
    description: 'Unit may adopt Skirmish formation (loose group, increased manoeuvrability).',
  },
  {
    id: 'ethereal', displayName: 'Ethereal',
    passive: true,
    phases: [],
    description:
      'Treats all terrain as open ground. Can only be wounded by Magical attacks. Non-Ethereal characters cannot join.',
  },
  {
    id: 'large target', displayName: 'Large Target',
    passive: true,
    phases: [],
    description:
      'No cover benefit. LoS can be drawn over/through non-Large Target units. Shooters get +1 rank when targeting.',
  },
  {
    id: 'flammable', displayName: 'Flammable',
    passive: true,
    phases: [],
    description: 'Cannot make Regeneration saves against Flaming attacks.',
  },
  {
    id: 'warp-spawned', displayName: 'Warp-spawned',
    passive: true,
    phases: [],
    description:
      'Cannot make Regeneration saves against Magical attacks. Non-Warp-spawned characters cannot join.',
  },
  {
    id: 'magical attacks', displayName: 'Magical Attacks',
    passive: true,
    phases: [],
    description:
      'All attacks are Magical. All spells and magic item hits are inherently Magical.',
  },
  {
    id: 'immune to psychology', displayName: 'Immune to Psychology',
    passive: true,
    phases: [],
    description:
      'Auto-passes Fear, Panic, Terror tests (if majority). Cannot choose Flee as a charge reaction.',
  },
  {
    id: 'magic resistance', displayName: 'Magic Resistance',
    passive: true,
    phases: [],
    description:
      'Enemy casting rolls targeting this unit suffer -X penalty. Does not stack (use highest).',
  },
  {
    id: 'requires two hands', displayName: 'Requires Two Hands',
    passive: true,
    phases: [],
    description: 'Cannot use a shield in combat. Shield still protects against shooting/magic.',
  },
  {
    id: 'horde', displayName: 'Horde',
    passive: true,
    phases: [],
    description: 'Max Rank Bonus increased by 1.',
  },
  {
    id: 'warband', displayName: 'Warband',
    passive: true,
    phases: [],
    description:
      'Ld bonus = current Rank Bonus (max Ld 10). May re-roll Charge rolls. Bonus does not apply to Restraint or Impetuous tests.',
  },
  {
    id: 'levies', displayName: 'Levies',
    passive: true,
    phases: [],
    description:
      'Cannot benefit from Inspiring Presence or Hold your Ground. Other units ignore this unit\'s rout for Panic.',
  },
  {
    id: 'mercenaries', displayName: 'Mercenaries',
    passive: true,
    phases: [],
    description:
      'Cannot benefit from Inspiring Presence or Hold your Ground. Cannot be joined by characters from a different army list.',
  },
  {
    id: 'loner', displayName: 'Loner',
    passive: true,
    phases: [],
    description:
      'Cannot be General. Cannot join a unit without Loner, and vice versa.',
  },
  {
    id: 'veteran', displayName: 'Veteran',
    passive: true,
    phases: [],
    description:
      'If majority, unit may re-roll failed Leadership tests (not Break tests).',
  },
  {
    id: 'chariot runners', displayName: 'Chariot Runners',
    passive: true,
    phases: [],
    description:
      'Friendly chariots can draw LoS over/through and move through this unit (Skirmish formation). Unit coherency extends to friendly chariots within 1".',
  },
  {
    id: 'detachment', displayName: 'Detachment',
    passive: true,
    phases: [],
    description:
      'Unit can be fielded as a detachment alongside a parent regiment.',
  },
  {
    id: 'regimental unit', displayName: 'Regimental Unit',
    passive: true,
    phases: [],
    description: 'Unit can be accompanied by detachments.',
  },
  {
    id: 'motley crew', displayName: 'Motley Crew',
    passive: true,
    phases: [],
    description:
      'Unit may include differently equipped models or mixed troop types. Separate attack rolls per type; casualties split evenly.',
  },
  {
    id: 'monster handlers', displayName: 'Monster Handlers',
    passive: true,
    phases: [],
    description:
      'Handlers add attacks to monster. Wounds allocated: 1-4 monster, 5+ handler. If monster dies, handlers die.',
  },
  {
    id: 'howdah', displayName: 'Howdah',
    passive: true,
    phases: [],
    description:
      'Split profile (as chariots) and Firing Platform rules. Otherwise treated as a behemoth.',
  },

  // ─── High Elf Realms ─────────────────────────────────────────────
  {
    id: 'arrows of isha', displayName: 'Arrows of Isha',
    passive: true,
    phases: [],
    description:
      'Any bow (longbow, shortbow, warbow, or Bow of Avelorn) gains Armour Bane (1) and AP -1.',
    armourMod: 0,
  },
  {
    id: 'blessings of asuryan', displayName: 'Blessings of Asuryan',
    passive: true,
    phases: [],
    description:
      '5+ Ward save against wounds caused by attacks with the Flaming Attacks special rule.',
  },
  {
    id: 'blizzard aura', displayName: 'Blizzard Aura',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Enemy models in base contact become subject to Strike Last.',
      },
    ],
  },
  {
    id: 'champions of chrace', displayName: 'Champions of Chrace',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Any model in a Lion Guard unit can accept challenges like a character. Once per turn, a character joined to a Lion Guard unit may re-roll a failed "Look Out, Sir!" roll.',
      },
    ],
  },
  {
    id: 'deflect shots', displayName: 'Deflect Shots',
    passive: true,
    phases: [],
    description:
      '6+ Ward save against wounds caused by non-magical shooting attacks.',
  },
  {
    id: 'dragon armour', displayName: 'Dragon Armour',
    passive: true,
    phases: [],
    description:
      '6+ Ward save against any wounds suffered. A Wizard with this rule may wear armour without penalty.',
    armourMod: 0,
  },
  {
    id: 'enfeebling cold', displayName: 'Enfeebling Cold',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Enemy models in base contact suffer -1 Strength (minimum 1).',
      },
    ],
  },
  {
    id: 'from the ashes', displayName: 'From The Ashes',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'remove-casualties',
        description:
          'When a Flamespyre Phoenix loses its last Wound, roll a D6: 1-2 removed; 3-5 explodes (D6 S3 AP-1 Flaming hits to enemies in base contact) then removed; 6 reborn, recovers D3 Wounds.',
      },
    ],
  },
  {
    id: 'horn of isha', displayName: 'Horn of Isha',
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'start-of-turn',
        description:
          'Single use. During the Command sub-phase, take a Leadership test. If passed, the character and their unit gain +1 To Hit and +1 To Wound until the next Start of Turn.',
      },
    ],
  },
  {
    id: 'ithilmar armour', displayName: 'Ithilmar Armour',
    passive: true,
    phases: [],
    description:
      'Re-roll any rolls of 1 on Dangerous Terrain tests. Wizards may wear armour without penalty.',
    aliases: ['Ithilmar Barding'],
  },
  {
    id: 'ithilmar weapons', displayName: 'Ithilmar Weapons',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'When fighting with a single, non-magical hand weapon, re-roll natural 1s To Hit. Does not apply to mount. Inactive if using two hand weapons or another weapon type.',
      },
    ],
  },
  {
    id: "king's guard", displayName: "King's Guard",
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          "Any model in a White Lions of Chrace unit joined by your General can issue and accept challenges like a character. Lost if the General leaves the unit.",
      },
    ],
  },
  {
    id: "lileath's blessing", displayName: "Lileath's Blessing",
    phases: [
      {
        phaseId: 'strategy',
        subPhaseId: 'conjuration',
        description:
          'Once per turn, re-roll a single failed Casting roll.',
      },
    ],
  },
  {
    id: 'lion cloak', displayName: 'Lion Cloak',
    passive: true,
    phases: [],
    description:
      'Improves armour value by 1 (max 2+) against non-magical shooting attacks.',
    armourMod: -1,
  },
  {
    id: 'martial prowess', displayName: 'Martial Prowess',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Unit can make supporting attacks to its flank or rear, as well as to its front.',
      },
    ],
  },
  {
    id: 'mighty constitution', displayName: 'Mighty Constitution',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'During a turn in which he charged 3"+, gains +1 Strength. Immune to Poisoned Attacks (attackers must roll To Wound normally).',
      },
    ],
  },
  {
    id: 'naval discipline', displayName: 'Naval Discipline',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'choose-target',
        description:
          'Lothern Sea Guard may Stand & Shoot regardless of how close the charging unit is. After resolving shooting, the unit may perform a free redress the ranks manoeuvre.',
      },
    ],
  },
  {
    id: 'valour of ages', displayName: 'Valour of Ages',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'break-test',
        description:
          'Re-roll any failed Panic test caused by heavy casualties or being fled through by a friendly unit.',
      },
    ],
  },
  {
    id: 'wake of fire', displayName: 'Wake of Fire',
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'remaining-moves',
        description:
          'During the Remaining Moves sub-phase, may fly over a single unengaged enemy unit. That unit suffers D6 S4 hits, AP -1, Flaming Attacks.',
      },
    ],
  },
  {
    id: 'witness to destiny', displayName: 'Witness to Destiny',
    passive: true,
    phases: [],
    description:
      '6+ Ward save against wounds caused by non-magical enemy attacks.',
  },
  {
    id: 'abyssal cloak', displayName: 'Abyssal Cloak',
    passive: true,
    phases: [],
    description:
      'Enemy models targeting this model during the Shooting phase suffer a -2 To Hit modifier for firing at long range, rather than the usual -1.',
  },
  {
    id: 'accomplished archers', displayName: 'Accomplished Archers',
    passive: true,
    phases: [],
    description:
      'Unless mounted on a Lothern Skycutter, a Sea Guard Garrison Commander gains Evasive and Fire & Flee. Any Lothern Sea Guard unit joined by this character also receives those rules.',
  },
  {
    id: 'commanding voice', displayName: 'Commanding Voice',
    passive: true,
    phases: [],
    description:
      "Ishaya's Command Range is increased by 3\" (to 12\", or 15\" if she is the General).",
  },
  {
    id: 'precision strikes', displayName: 'Precision Strikes',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'A Lothern Sea Guard unit joined by Ishaya Vess improves the AP of its weapons by 1.',
      },
    ],
  },
  {
    id: 'sons of caledor', displayName: 'Sons of Caledor',
    passive: true,
    phases: [],
    description:
      'Unit may only be joined by your General, or by a character with the Blood of Caledor Elven Honour.',
  },
  {
    id: 'chracian warriors', displayName: 'Chracian Warriors',
    passive: true,
    phases: [],
    description:
      'Unit may only be joined by your General, or by a character with the Chracian Hunter Elven Honour.',
  },
  {
    id: 'warriors of nagarythe', displayName: 'Warriors of Nagarythe',
    passive: true,
    phases: [],
    description:
      'Unit may only be joined by a character with the Shadow Stalker Elven Honour.',
  },
  {
    id: 'warriors of the white tower', displayName: 'Warriors of the White Tower',
    passive: true,
    phases: [],
    description:
      'Unit may only be joined by a High Elf Mage, or by a character with the Warden of Saphery or Loremaster Elven Honour.',
  },
  // Army of Infamy composition rules (passive, no phase trigger)
  {
    id: 'armies of the sea lord', displayName: 'Armies of the Sea Lord',
    passive: true, phases: [],
    description: 'Characters in a Sea Guard Garrison may only choose: Shadow Stalker, Pure of Heart, or Sea Guard Elven Honours.',
  },
  {
    id: 'chracian pride', displayName: 'Chracian Pride',
    passive: true, phases: [],
    description: 'Characters in a Chracian Warhost may only choose: Shadow Stalker, Chracian Hunter, or Pure of Heart Elven Honours.',
  },
  {
    id: 'from the mists', displayName: 'From the Mists',
    passive: true, phases: [],
    description: 'After deployment but before Scouts/Vanguard, you may remove one deployed unit and redeploy it anywhere in your deployment zone.',
  },
  {
    id: 'from the storm clouds', displayName: 'From the Storm Clouds',
    passive: true, phases: [],
    description: '0-1 Lothern Skycutter per 1,000 points. Skycutters may gain Ambushers for +10 points per model.',
  },
  {
    id: 'hidden trails', displayName: 'Hidden Trails',
    passive: true, phases: [],
    description: '0-1 unit of Elven Spearmen or Archers per 1,000 points may gain Move Through Cover for +1 pt/model. Once per game, +1 or -1 to an Ambushers reserve arrival roll.',
  },
  {
    id: 'old world rangers', displayName: 'Old World Rangers',
    passive: true, phases: [],
    description: '0-1 Shadow Warriors unit (10 or fewer Unit Strength) gains Ambushers for free.',
  },
  {
    id: 'pride of the fleet', displayName: 'Pride of the Fleet',
    passive: true, phases: [],
    description: 'Sea Guard gain the Regimental Unit rule. 0-1 Sea Guard unit per 1,000 points gains Drilled for free.',
  },
  {
    id: 'warriors of chrace', displayName: 'Warriors of Chrace',
    passive: true, phases: [],
    description: 'Elven Spearmen or Archers in a Chracian Warhost may purchase Lion Cloaks (+1 armour vs non-magical shooting) for +10 points per unit.',
  },
  {
    id: 'warriors of the wilderness', displayName: 'Warriors of the Wilderness',
    passive: true, phases: [],
    description: 'After terrain placement, place one additional wood (3"-9" wide) on the battlefield. Cannot be in opponent deployment zone or within 6" of special features.',
  },

  // ─── Ogre Kingdoms ──────────────────────────────────────────────────
  {
    id: 'ogre charge', displayName: 'Ogre Charge',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'The AP of any Impact Hits caused by this model (not its mount) is improved by the current Rank Bonus of its unit.',
      },
    ],
  },
  {
    id: 'bull charge', displayName: 'Bull Charge',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Impact Hits caused by this model (not its mount) have an Armour Piercing characteristic of -1.',
      },
    ],
  },
  {
    id: 'thunderous charge', displayName: 'Thunderous Charge',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Impact Hits caused by this model have an AP of -2.',
      },
    ],
  },
  {
    id: 'mournfang charge', displayName: 'Mournfang Charge',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Impact Hits caused by this model have Armour Bane (1) and AP -1.',
      },
    ],
  },
  {
    id: 'belly flop', displayName: 'Belly Flop',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Place a 3" blast template over the target unit centre. Models underneath suffer a hit at this model\'s Strength with AP -2.',
      },
    ],
  },
  {
    id: 'giant attacks', displayName: 'Giant Attacks',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Instead of normal attacks, roll D6: 1 = \'Eadbutt (D3+1 wounds, no armour/regen), 2 = Belly Flop (3" blast, S, AP -2), 3-4 = Mighty Swing (D6+1 attacks, S+1, AP -2), 5 = Thump with Club (single model, S+4, AP -4, Multiple Wounds D6), 6 = Jump Up & Down (D6+1 hits, no armour saves).',
      },
    ],
  },
  {
    id: 'pick up and', displayName: 'Pick Up And...',
    aliases: ['pick up and...'],
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Instead of normal attacks vs infantry/heavy infantry: target makes Initiative test. Fail = one model removed as casualty. Then roll D6: 4+ = repeat. 1-3 = stop.',
      },
    ],
  },
  {
    id: 'numbing chill', displayName: 'Numbing Chill',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Enemy models in base contact suffer -1 WS and -1 Initiative (minimum 1).',
      },
    ],
  },
  {
    id: "butcher's cauldron", displayName: "Butcher's Cauldron",
    aliases: ['butchers cauldron'],
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Replaces Impact Hits (2) with Impact Hits (D3+1).',
      },
      {
        phaseId: 'strategy',
        subPhaseId: 'command',
        yourTurnOnly: true,
        description:
          'If not in combat, take a Leadership test. Pass: character and joined unit gain Regeneration (5+) until next Start of Turn. Fail: lose 1 Wound.',
      },
    ],
  },
  {
    id: 'blessings of the volcano god', displayName: 'Blessings of the Volcano God',
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          '4+ Ward save against wounds caused by Flaming Attacks.',
      },
      {
        phaseId: 'shooting',
        subPhaseId: 'shoot',
        opponentTurnOnly: true,
        description:
          '4+ Ward save against wounds caused by Flaming Attacks.',
      },
    ],
  },
  {
    id: 'stone skeleton', displayName: 'Stone Skeleton',
    passive: true,
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'When suffering an unsaved wound from Multiple Wounds (X), reduce the number of wounds lost by 1 (minimum 1).',
      },
    ],
  },
  {
    id: 'ravenous hunger', displayName: 'Ravenous Hunger',
    chargeMod: { range: 0, tag: 'Ravenous', color: 'orange', order: 3 },
    phases: [
      {
        phaseId: 'movement',
        subPhaseId: 'declare-charges',
        yourTurnOnly: true,
        description:
          'When declaring a charge, may re-roll the Charge roll.',
      },
    ],
  },
  {
    id: 'look-out gnoblar', displayName: 'Look-out Gnoblar',
    phases: [
      {
        phaseId: 'shooting',
        subPhaseId: 'shoot',
        opponentTurnOnly: true,
        description:
          'Champion/character may make "Look Out, Sir!" with 2+ rank-and-file (instead of 5). With 5+, may re-roll the roll.',
      },
    ],
  },
  {
    id: 'largely insignificant', displayName: 'Largely Insignificant',
    passive: true,
    phases: [],
    description:
      'Unit never causes friendly Panic tests. Cannot be joined by a character without this rule.',
  },
  {
    id: 'running with the pack', displayName: 'Running with the Pack',
    passive: true,
    phases: [],
    description:
      'Hunter joining Sabretusks gains Swiftstride. Sabretusks lose Impetuous while the Hunter remains.',
  },
  {
    id: 'traps and snares', displayName: 'Traps & Snares',
    aliases: ['traps & snares'],
    phases: [
      {
        phaseId: 'combat',
        subPhaseId: 'choose-fight',
        description:
          'Any enemy model that ends its charge move in base contact with this model must make a Dangerous Terrain test.',
      },
    ],
  },
  {
    id: 'bellowers and musicians', displayName: 'Bellowers & Musicians',
    aliases: ['bellowers & musicians'],
    passive: true,
    phases: [],
    description:
      'Ogre musicians are Bellowers who use their voice instead of instruments. Function as standard musicians.',
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
        results.push({ name: rule.displayName, description: p.description })
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
        results.push({ name: rule.displayName, subPhaseId: p.subPhaseId, description: p.description })
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
  return SPECIAL_RULES.find((r) => r.id.toLowerCase() === lower)
}
