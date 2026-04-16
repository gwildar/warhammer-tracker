/**
 * Universal Special Rules mapped to game phases/sub-phases.
 *
 * Each rule has:
 *   name        – canonical name (as it appears on army lists)
 *   phases      – string array of sub-phase IDs (simple rules), or object array of { subPhaseId, description, table?, yourTurnOnly?, opponentOnly?, fromRound? } (complex rules with per-phase descriptions), or [] (passive rules)
 *   passive     – true if the rule has no phase-specific trigger (always-on modifier)
 *
 * Phase/sub-phase IDs match those defined in phases.js.
 *
 * Source: https://tow.whfb.app/special-rules
 */

export const SPECIAL_RULES = [
  {
    id: "scouts",
    displayName: "Scouts",
    passive: true,
    description:
      'Deploy after all other units from both armies. Must be placed >12" from enemy models. Cannot charge on first turn.',
    phases: [],
  },
  {
    id: "vanguard",
    displayName: "Vanguard",
    passive: true,
    description:
      "After deployment, make a Vanguard move (basic movement, no march). Cannot declare charges on first turn.",
    phases: [],
  },
  {
    id: "stupidity",
    displayName: "Stupidity",
    description:
      "Unless fleeing or in combat, test Ld. If failed: cannot move, shoot, cast, or dispel until next Start of Turn. Must Hold if charged.",
    phases: ["start-of-turn"],
    yourTurnOnly: true,
  },
  {
    id: "ambushers",
    displayName: "Ambushers",
    aliases: ["Ambush"],
    phases: [
      {
        subPhaseId: "start-of-turn",
        fromRound: 2,
        description:
          "Roll D6 for each unit in reserve. 4+: arrives during Compulsory Moves. Auto-arrives round 5.",
      },
      {
        subPhaseId: "compulsory-moves",
        fromRound: 2,
        description:
          'Arriving Ambushers enter from any board edge chosen by controlling player, >8" from enemy. Cannot march; count as having moved for shooting.',
      },
    ],
  },
  {
    id: "invocation of nehek",
    displayName: "Invocation of Nehek",
    description:
      'If not engaged, resurrect D3 + Wizard Level Wounds of Infantry, or Wizard Level Wounds of Monstrous/Cavalry, or 1 Wound of Behemoth/War Machine, in a friendly Necromantic Undead unit within 12". Requires Ld test.',
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "rallying cry",
    displayName: "Rallying Cry",
    description:
      "During Command sub-phase, a non-engaged character nominates a fleeing friendly unit within Command range to take a Rally test. If failed, the unit may still try again in the Rally sub-phase.",
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "frenzy",
    displayName: "Frenzy",
    phases: [
      {
        subPhaseId: "declare-charges",
        description:
          "If majority Frenzied, unit must declare a charge if able. Cannot choose Flee as a charge reaction.",
      },
      {
        subPhaseId: "choose-fight",
        description:
          "+1 Attack during a turn the unit charged or the turn after a follow-up move. Auto-passes Fear, Panic, Terror tests. Lost after losing a combat round.",
      },
      {
        subPhaseId: "pursuit",
        description: "Cannot make Restraint tests — must pursue.",
      },
    ],
  },
  {
    id: "impetuous",
    displayName: "Impetuous",
    description:
      "If able to charge, must take Ld test. If failed, must declare a charge.",
    phases: ["declare-charges"],
    yourTurnOnly: true,
  },
  {
    id: "counter charge",
    displayName: "Counter Charge",
    description:
      "Charge reaction vs cavalry/chariots/monsters charging front arc. Pivot to face, move D3+1\" toward charger. Both units count as having charged. Cannot use if distance < charger's M.",
    phases: ["declare-charges"],
    opponentOnly: true,
  },
  {
    id: "fire & flee",
    displayName: "Fire & Flee",
    description:
      "Charge reaction: Stand & Shoot then Flee. Flee roll discards lowest D6. Cannot use if distance < charger's M.",
    phases: ["declare-charges"],
    opponentOnly: true,
  },
  {
    id: "feigned flight",
    displayName: "Feigned Flight",
    description:
      "If this unit Flees (or Fire & Flees) as a charge reaction, it automatically rallies at the end of its move.",
    phases: ["declare-charges"],
  },
  {
    id: "random movement",
    displayName: "Random Movement",
    description:
      "Moves only during Compulsory Moves (distance determined by dice roll). Cannot march, charge, or manoeuvre beyond wheeling. Contacting an enemy counts as a charge.",
    phases: ["compulsory-moves"],
  },
  {
    id: "drilled",
    displayName: "Drilled",
    description:
      'Free "redress the ranks" before moving. Can march within 8" of enemy without Ld test. Characters joining the unit gain Drilled.',
    phases: ["remaining-moves"],
  },
  {
    id: "swiftstride",
    displayName: "Swiftstride",
    chargeMod: { range: 3, tag: "Swift", color: "green", order: 1 },
    phases: [
      {
        subPhaseId: "declare-charges",
        yourTurnOnly: true,
        description: 'Max declarable charge range is M+6+3" (instead of M+6").',
      },
      {
        subPhaseId: "charge-moves",
        yourTurnOnly: true,
        description:
          '+3" max charge range. May add +D6 to Charge, Flee, or Pursuit rolls.',
      },
      {
        subPhaseId: "pursuit",
        description: "May add +D6 to Pursuit or Flee rolls.",
      },
    ],
  },
  {
    id: "fly",
    displayName: "Fly",
    phases: [
      {
        subPhaseId: "remaining-moves",
        yourTurnOnly: true,
        description:
          'Move using Fly (X) characteristic, passing freely over models/terrain. Can march within 8" of enemy without Ld test. Must start and end on ground. Cannot join units without Fly.',
      },
      {
        subPhaseId: "charge-moves",
        yourTurnOnly: true,
        description:
          "May charge using Fly movement, passing over intervening models and terrain.",
      },
    ],
  },
  {
    id: "fast cavalry",
    displayName: "Fast Cavalry",
    description: "In Open Order, may perform Quick Turn even after marching.",
    phases: ["remaining-moves"],
  },
  {
    id: "move through cover",
    displayName: "Move Through Cover",
    description:
      "No movement penalty for difficult/dangerous terrain. Re-roll 1s on Dangerous Terrain tests.",
    phases: ["remaining-moves"],
    yourTurnOnly: true,
  },
  {
    id: "lumbering",
    displayName: "Lumbering",
    description:
      "After moving, unless it charged, marched or fled, a Lumbering model may pivot about its centre to change its facing by up to 90°.",
    phases: ["remaining-moves"],
  },
  {
    id: "dragged along",
    displayName: "Dragged Along",
    description:
      "If within 1\" of a friendly infantry unit (10+ models, not fleeing), may use that unit's Movement characteristic.",
    phases: ["remaining-moves"],
  },
  {
    id: "stony stare",
    displayName: "Stony Stare",
    description:
      "At the start of each Combat phase, enemy models in base contact must pass an Initiative test or suffer D3 S2 hits. No armour saves (Ward and Regeneration allowed).",
    phases: ["choose-fight"],
  },
  {
    id: "cleaving blow",
    displayName: "Cleaving Blow",
    description:
      "Natural 6 To Wound: regular infantry, heavy infantry, light/heavy cavalry, and war beasts cannot take armour or Regeneration saves (Ward saves allowed).",
    phases: ["choose-fight"],
  },
  {
    id: "breath weapon",
    displayName: "Breath Weapon",
    description:
      "Once per round in Shooting phase. Place flame template from model's front arc. Cannot be used in combat or for Stand & Shoot.",
    phases: ["shoot"],
  },
  {
    id: "volley fire",
    displayName: "Volley Fire",
    description:
      "Half the models in each rank beyond the front (rounding up) may shoot, in addition to front rank. Cannot use if moved or declared Stand & Shoot.",
    phases: ["shoot"],
  },
  {
    id: "move & shoot",
    displayName: "Move & Shoot",
    description:
      "Weapon can be used in the Shooting phase even if the model marched.",
    phases: ["shoot"],
  },
  {
    id: "move or shoot",
    displayName: "Move or Shoot",
    description:
      "Weapon cannot be used if the model moved for any reason this turn (including rallying or reforming).",
    phases: ["shoot"],
  },
  {
    id: "thunderous impact",
    displayName: "Thunderous Impact",
    description:
      'Until your next Start of Turn sub-phase, any unit (friend or foe) within 2D6" of the strike point suffers -1 Movement and cannot use Swiftstride.',
    phases: ["shoot"],
  },
  {
    id: "multiple shots",
    displayName: "Multiple Shots",
    description:
      "Fire X shots at -1 To Hit, or a single shot at normal BS. Entire unit must choose the same option.",
    phases: ["shoot"],
  },
  {
    id: "quick shot",
    displayName: "Quick Shot",
    description:
      "No -1 To Hit penalty for moving and shooting. Can Stand & Shoot regardless of distance.",
    phases: ["shoot"],
  },
  {
    id: "ignores cover",
    displayName: "Ignores Cover",
    description: "Ignore To Hit modifiers from partial or full cover.",
    phases: ["shoot"],
  },
  {
    id: "ponderous",
    displayName: "Ponderous",
    description:
      "-2 To Hit when moving and shooting (instead of the normal -1).",
    phases: ["shoot"],
  },
  {
    id: "cumbersome",
    displayName: "Cumbersome",
    description: "Weapon cannot be used for Stand & Shoot charge reactions.",
    phases: ["declare-charges"],
  },
  {
    id: "evasive",
    displayName: "Evasive",
    description:
      "When targeted during opponent's Shooting phase, unit may Fall Back in Good Order (flee away from the shooter then auto-rally).",
    phases: ["shoot"],
    opponentOnly: true,
  },
  {
    id: "reserve move",
    displayName: "Reserve Move",
    description:
      "After all shooting, if unit did not charge/march/flee, make a basic move (no march). Resolved at end of Shooting phase.",
    phases: ["reserve-moves"],
  },
  {
    id: "elven reflexes",
    displayName: "Elven Reflexes",
    description:
      "+1 Initiative (max 10) during the first round of any combat. Does not apply to mount.",
    phases: ["choose-fight"],
  },
  {
    id: "strike first",
    displayName: "Strike First",
    description:
      "Initiative becomes 10 (before other modifiers). Cancelled out by Strike Last.",
    phases: ["choose-fight"],
  },
  {
    id: "strike last",
    displayName: "Strike Last",
    description:
      "Initiative becomes 1 (before other modifiers). Cancelled out by Strike First.",
    phases: ["choose-fight"],
  },
  {
    id: "extra attacks",
    displayName: "Extra Attacks",
    description:
      "+X modifier to Attacks characteristic. If random, roll when combat is chosen.",
    phases: ["choose-fight"],
  },
  {
    id: "random attacks",
    displayName: "Random Attacks",
    description:
      "Roll dice to determine number of attacks each combat turn. Roll separately for each model.",
    phases: ["choose-fight"],
  },
  {
    id: "furious charge",
    displayName: "Furious Charge",
    description:
      '+1 Attack during a turn in which the model charged 3" or more.',
    phases: ["choose-fight"],
  },
  {
    id: "first charge",
    displayName: "First Charge",
    description:
      "If the unit's first charge of the game is successful, the charge target becomes Disrupted until end of Combat phase.",
    phases: ["choose-fight"],
  },
  {
    id: "dark runes",
    displayName: "Dark Runes",
    passive: true,
    description: "5+ Ward save against non-magical shooting attacks.",
    phases: [],
  },
  {
    id: "eternal hatred",
    displayName: "Eternal Hatred",
    description:
      "Against High Elves, Hatred applies in every round of combat, not just the first. Does not affect mount.",
    phases: ["choose-fight"],
  },
  {
    id: "murderous",
    displayName: "Murderous",
    description:
      "Fighting with a single hand weapon: re-roll any To Wound rolls of natural 1. Does not apply with two hand weapons or other weapon types. Does not affect mount.",
    phases: ["choose-fight"],
  },
  {
    id: "abyssal howl",
    displayName: "Abyssal Howl",
    passive: true,
    description:
      'Enemy units within 6" suffer -1 Leadership when making Fear, Panic, or Terror tests (min 2). Does not stack with similar effects.',
    phases: [],
  },
  {
    id: "black lotus",
    displayName: "Black Lotus",
    passive: true,
    description:
      "For each unsaved Wound inflicted by this character, the enemy character suffers -1 Leadership for the remainder of the game.",
    phases: [],
  },
  {
    id: "blessings of khaine",
    displayName: "Blessings of Khaine",
    passive: true,
    description:
      "Bound spell (9+). Until next Start of Turn, caster and friendly Death Hags, Witch Elves, and Sisters of Slaughter within Command range gain one of: Fury of Khaine (Furious Charge), Strength of Khaine (Cleaving Blow), or Bloodshield of Khaine (5+ Ward save).",
    phases: [],
  },
  {
    id: "cry of war",
    displayName: "Cry of War",
    passive: true,
    description:
      "Enemy units suffer -1 Leadership whilst within Command range of a non-fleeing Death Hag with this rule.",
    phases: [],
  },
  {
    id: "cursed coven",
    displayName: "Cursed Coven",
    passive: true,
    description:
      "The unit knows one spell from Dark Magic or Daemonology (chosen before deployment). Power Level is 2 (US 10+ with Master), 1 (US ≤9 with Master), or 0 (no Master).",
    phases: [],
  },
  {
    id: "vortex of souls",
    displayName: "Vortex of Souls",
    passive: true,
    description:
      'May cast Light of Death (Magic Missile, 7+, 36") or Light of Protection (Enchantment, 8+, Self, Remains in Play) as bound spells with Power Level 2. Light of Protection immediately expires if Light of Death is cast.',
    phases: [],
  },
  {
    id: "dance of death",
    displayName: "Dance of Death",
    description:
      "If this unit makes a successful charge, the charge target suffers -1 to its Maximum Rank Bonus until the end of the Combat phase.",
    phases: ["combat-result"],
  },
  {
    id: "dark venom",
    displayName: "Dark Venom",
    description:
      "Gains Killing Blow. On a natural 6 To Wound, infantry and cavalry cannot use armour or Regeneration saves (Ward saves allowed). An unsaved Killing Blow wound removes all remaining wounds.",
    phases: ["choose-fight"],
  },
  {
    id: "forbidden poisons",
    displayName: "Forbidden Poisons",
    passive: true,
    description:
      "Khainite Assassin may select one poison: Black Lotus, Dark Venom, or Manbane.",
    phases: [],
  },
  {
    id: "gifts of khaine",
    displayName: "Gifts of Khaine",
    passive: true,
    description:
      "Death Hag selects one gift: Cry of War, Rune of Khaine (Extra Attacks +D3), or Witchbrew.",
    phases: [],
  },
  {
    id: "goad beast",
    displayName: "Goad Beast",
    description:
      "During Command sub-phase, one friendly monster within Command range (including own mount) gains +D3 Attacks (max 10) until end of turn.",
    phases: ["start-of-turn"],
    yourTurnOnly: true,
  },
  {
    id: "hekarti's blessing",
    displayName: "Hekarti's Blessing",
    passive: true,
    description: "Once per game, may re-roll a single failed Casting roll.",
    phases: [],
  },
  {
    id: "hidden (dark elves)",
    displayName: "Hidden",
    passive: true,
    description:
      "Khainite Assassin starts hidden in a friendly Dark Elf infantry unit (US 10+). Revealed during any Start of Turn sub-phase or at start of any Combat phase. Destroyed with host if host is destroyed before revelation. Cannot be General.",
    phases: [],
  },
  {
    id: "manbane",
    displayName: "Manbane",
    description:
      "To Wound rolls of 4+ always succeed, regardless of the target's Toughness.",
    phases: ["choose-fight"],
  },
  {
    id: "rune of khaine",
    displayName: "Rune of Khaine",
    description:
      "Extra Attacks (+D3). Roll during the Choose & Fight Combat sub-phase.",
    phases: ["choose-fight"],
  },
  {
    id: "sea dragon cloak",
    displayName: "Sea Dragon Cloak",
    passive: true,
    description:
      "+1 armour save against non-magical shooting attacks (max 2+).",
    phases: [],
  },
  {
    id: "wilful beast",
    displayName: "Wilful Beast",
    description:
      "At Start of Turn, mount makes a Leadership test (unmodified). If failed, the mount gains Frenzy (not the rider, and no +1 Attack for rider) until next Start of Turn.",
    phases: ["start-of-turn"],
  },
  {
    id: "witchbrew",
    displayName: "Witchbrew",
    passive: true,
    description:
      "This character, their mount, and any unit they have joined cannot lose the Frenzy special rule.",
    phases: [],
  },
  {
    id: "hatred",
    displayName: "Hatred",
    description:
      "Re-roll failed To Hit rolls against hated enemies during the first round of combat.",
    phases: ["choose-fight"],
  },
  {
    id: "killing blow",
    displayName: "Killing Blow",
    description:
      "Natural 6 To Wound: infantry/cavalry target cannot take armour or Regeneration saves (Ward saves allowed). Loses all remaining Wounds.",
    phases: ["choose-fight"],
  },
  {
    id: "monster slayer",
    displayName: "Monster Slayer",
    description:
      "Natural 6 To Wound vs monsters: no armour or Regeneration saves (Ward saves allowed). Monster loses all remaining Wounds.",
    phases: ["choose-fight"],
  },
  {
    id: "fear",
    displayName: "Fear",
    phases: [
      {
        subPhaseId: "declare-charges",
        opponentOnly: true,
        description:
          "When charging a Fear-causing unit with higher Unit Strength, take Ld test or fail the charge.",
      },
      {
        subPhaseId: "choose-fight",
        description:
          "When fighting a Fear-causing enemy with higher Unit Strength, take Ld test or suffer -1 To Hit against that enemy.",
      },
    ],
  },
  {
    id: "terror",
    displayName: "Terror",
    phases: [
      {
        subPhaseId: "declare-charges",
        yourTurnOnly: true,
        description:
          "When a Terror-causing unit declares a charge, the target takes Ld test — failed = must Flee. Also causes Fear.",
      },
      {
        subPhaseId: "break-test",
        description:
          "If the winning side includes Terror-causing units, losing units suffer -1 Ld on Break tests.",
      },
    ],
  },
  {
    id: "fight in extra rank",
    displayName: "Fight in Extra Rank",
    description: "Models behind the fighting rank may make supporting attacks.",
    phases: ["choose-fight"],
  },
  {
    id: "shieldwall",
    displayName: "Shieldwall",
    description:
      "Once per game, a Close Order unit with shields that is charged may Give Ground instead of Falling Back in Good Order.",
    phases: ["break-test"],
  },
  {
    id: "stubborn",
    displayName: "Stubborn",
    description:
      "May decline first Break test — automatically Falls Back in Good Order instead. Does not transfer between Stubborn characters and non-Stubborn units.",
    phases: ["break-test"],
  },
  {
    id: "unbreakable",
    displayName: "Unbreakable",
    description:
      "Never takes Break tests. Automatically Gives Ground when losing combat. Non-Unbreakable characters cannot join.",
    phases: ["break-test"],
  },
  {
    id: "unstable",
    displayName: "Unstable",
    description:
      "Loses 1 extra Wound per point of combat result lost by. No Regeneration saves. Wounds split between characters and unit.",
    phases: ["break-test"],
  },
  {
    id: "untutored arcanist",
    displayName: "Untutored Arcanist",
    description:
      "When rolling on the Miscast table, roll an extra D6 and discard the highest result.",
    phases: ["conjuration", "remaining-moves", "shoot", "choose-fight"],
  },
  {
    id: "timmm-berrr!",
    displayName: "Timmm-berrr!",
    description:
      "When a behemoth is slain, roll off to determine fall direction. Units in base contact in that arc suffer D6 hits at model's S with AP -1.",
    phases: ["choose-fight"],
  },
  {
    id: "wailing dirge",
    displayName: "Wailing Dirge",
    description:
      'Range 8". Ld test at -2. Wounds = margin of failure. No armour/Regen saves. Can target units in combat.',
    phases: ["choose-fight"],
  },
  {
    id: "poisoned attacks",
    displayName: "Poisoned Attacks",
    phases: [
      {
        subPhaseId: "shoot",
        yourTurnOnly: true,
        description:
          "Natural 6 To Hit: +2 To Wound modifier. Cannot use if To Hit needs 7+ or hits automatically. Does not apply to spells or magic weapons.",
      },
      {
        subPhaseId: "choose-fight",
        description:
          "Natural 6 To Hit: +2 To Wound modifier. Cannot use if To Hit needs 7+ or hits automatically.",
      },
    ],
  },
  {
    id: "flaming attacks",
    displayName: "Flaming Attacks",
    description:
      "Attacks are Flaming. Causes Fear in war beasts/swarms. Does not apply to spells or magic weapons.",
    phases: ["shoot", "choose-fight"],
  },
  {
    id: "multiple wounds",
    displayName: "Multiple Wounds",
    description:
      "Each unsaved wound is multiplied by X. Excess wounds do not spill over to other models.",
    phases: ["shoot", "choose-fight"],
  },
  {
    id: "regeneration",
    displayName: "Regeneration",
    phases: [
      {
        subPhaseId: "shoot",
        description:
          "After losing a Wound, roll D6: X+ recovers the Wound (still counts for combat result). AP rules do not affect Regeneration.",
      },
      {
        subPhaseId: "choose-fight",
        description:
          "After losing a Wound, roll D6: X+ recovers the Wound (still counts for combat result).",
      },
    ],
  },
  {
    id: "blessings of the lady",
    displayName: "Blessings of the Lady",
    description:
      "6+ Ward save (5+ vs S5+). Lost if the unit flees or a character refuses a challenge.",
    phases: ["choose-fight"],
  },
  {
    id: "finest warhorses",
    displayName: "Finest Warhorses",
    phases: [
      {
        subPhaseId: "charge-moves",
        yourTurnOnly: true,
        description:
          "Re-roll any natural 1s on Charge, Flee, or Pursuit rolls (before discarding dice).",
      },
      {
        subPhaseId: "pursuit",
        description:
          "Re-roll any natural 1s on Flee or Pursuit rolls (before discarding dice).",
      },
    ],
  },
  {
    id: "crusader's zeal",
    displayName: "Crusader's Zeal",
    chargeMod: { range: 1, tag: "Zeal", color: "orange", order: 2 },
    phases: [
      {
        subPhaseId: "declare-charges",
        yourTurnOnly: true,
        description:
          '+1" to maximum charge range and +1 to Charge roll result. Also gains Impetuous.',
      },
      {
        subPhaseId: "charge-moves",
        yourTurnOnly: true,
        description:
          '+1" to maximum charge range and +1 to Charge roll result.',
      },
    ],
  },
  {
    id: "earn your spurs",
    displayName: "Earn Your Spurs",
    description:
      'Enemy standards captured worth 100 VPs. Within 6" of a Grail Vow model or Lord of Bretonnia, re-roll natural 1s To Hit.',
    phases: ["choose-fight"],
  },
  {
    id: "beguiling aura",
    displayName: "Beguiling Aura",
    description:
      "Enemy models must pass Ld test before rolling To Hit against this model; if failed, only natural 6s hit.",
    phases: ["choose-fight"],
    opponentOnly: true,
  },
  {
    id: "Peasant's Duty",
    displayName: "Peasant's Duty",
    description:
      "May Give Ground instead of Fall Back in Good Order. Friendly Levies within Command range re-roll failed Panic tests.",
    phases: ["break-test"],
  },
  {
    id: "the grail vow",
    displayName: "The Grail Vow",
    description:
      "Immune to Psychology, Magical Attacks, Stubborn. Cannot refuse challenges.",
    phases: ["choose-fight"],
  },
  {
    id: "the questing vow",
    displayName: "The Questing Vow",
    description: "Stubborn. Re-roll failed Fear, Panic, and Terror tests.",
    phases: ["break-test"],
  },
  {
    id: "peasantry",
    displayName: "Peasantry",
    description:
      "Within 6\" of a non-fleeing Knight's/Questing/Grail Vow model, may use that model's Ld. Standard cannot be taken as a trophy.",
    phases: ["command", "rally", "break-test"],
  },
  {
    id: "guardian of the sacred sites",
    displayName: "Guardian of the Sacred Sites",
    description:
      "D6 roll of 3+ to awaken the Green Knight (automatic from round 5). Place within any natural terrain feature.",
    phases: ["start-of-turn"],
    yourTurnOnly: true,
  },
  {
    id: "aura of the fay",
    displayName: "Aura of the Fay",
    description:
      "If removed, attempt to reawaken with cumulative -1 penalty. -1 Wounds characteristic each time (min 1).",
    phases: ["start-of-turn"],
    yourTurnOnly: true,
  },
  {
    id: "arcane backlash",
    displayName: "Arcane Backlash",
    phases: [
      {
        subPhaseId: "conjuration",
        opponentOnly: true,
        description:
          "+1 to Dispel rolls. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.",
      },
      {
        subPhaseId: "remaining-moves",
        opponentOnly: true,
        description:
          "+1 to Dispel rolls vs Conveyance spells. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.",
      },
      {
        subPhaseId: "shoot",
        opponentOnly: true,
        description:
          "+1 to Dispel rolls vs Magic Missiles. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.",
      },
      {
        subPhaseId: "choose-fight",
        description:
          "+1 to Dispel rolls vs Assailment spells. On any natural double (except double 1), the spell is unbound and the casting Wizard loses a Wound.",
      },
    ],
  },
  {
    id: "armoured hide",
    displayName: "Armoured Hide",
    passive: true,
    phases: [],
    description:
      "Improves armour value by X. Models without armour are treated as having armour value 7+.",
  },
  {
    id: "close order",
    displayName: "Close Order",
    passive: true,
    phases: [
      {
        subPhaseId: "combat-result",
        description: "+1 combat result bonus when in Close Order formation.",
      },
    ],
    description:
      "Unit may adopt Close Order formation (ranks and files, base-to-base).",
  },
  {
    id: "open order",
    displayName: "Open Order",
    passive: true,
    phases: [],
    description: "Unit may adopt Open Order formation.",
  },
  {
    id: "skirmishers",
    displayName: "Skirmishers",
    passive: true,
    phases: [],
    description:
      "Unit may adopt Skirmish formation (loose group, increased manoeuvrability).",
  },
  {
    id: "ethereal",
    displayName: "Ethereal",
    passive: true,
    phases: [],
    description:
      "Treats all terrain as open ground. Can only be wounded by Magical attacks. Non-Ethereal characters cannot join.",
  },
  {
    id: "large target",
    displayName: "Large Target",
    passive: true,
    phases: [],
    description:
      "No cover benefit. LoS can be drawn over/through non-Large Target units. Shooters get +1 rank when targeting.",
  },
  {
    id: "flammable",
    displayName: "Flammable",
    passive: true,
    phases: [],
    description: "Cannot make Regeneration saves against Flaming attacks.",
  },
  {
    id: "warp-spawned",
    displayName: "Warp-spawned",
    passive: true,
    phases: [],
    description:
      "Cannot make Regeneration saves against Magical attacks. Non-Warp-spawned characters cannot join.",
  },
  {
    id: "magical attacks",
    displayName: "Magical Attacks",
    passive: true,
    phases: [],
    description:
      "All attacks are Magical. All spells and magic item hits are inherently Magical.",
  },
  {
    id: "immune to psychology",
    displayName: "Immune to Psychology",
    passive: true,
    phases: [],
    description:
      "Auto-passes Fear, Panic, Terror tests (if majority). Cannot choose Flee as a charge reaction.",
  },
  {
    id: "magic resistance",
    displayName: "Magic Resistance",
    passive: true,
    phases: [],
    description:
      "Enemy casting rolls targeting this unit suffer -X penalty. Does not stack (use highest).",
  },
  {
    id: "requires two hands",
    displayName: "Requires Two Hands",
    passive: true,
    phases: [],
    description:
      "Cannot use a shield in combat. Shield still protects against shooting/magic.",
  },
  {
    id: "horde",
    displayName: "Horde",
    passive: true,
    phases: [],
    description: "Max Rank Bonus increased by 1.",
  },
  {
    id: "warband",
    displayName: "Warband",
    passive: true,
    phases: [],
    description:
      "Ld bonus = current Rank Bonus (max Ld 10). May re-roll Charge rolls. Bonus does not apply to Restraint or Impetuous tests.",
  },
  {
    id: "levies",
    displayName: "Levies",
    passive: true,
    phases: [],
    description:
      "Cannot benefit from Inspiring Presence or Hold your Ground. Other units ignore this unit's rout for Panic.",
  },
  {
    id: "mercenaries",
    displayName: "Mercenaries",
    passive: true,
    phases: [],
    description:
      "Cannot benefit from Inspiring Presence or Hold your Ground. Cannot be joined by characters from a different army list.",
  },
  {
    id: "loner",
    displayName: "Loner",
    passive: true,
    phases: [],
    description:
      "Cannot be General. Cannot join a unit without Loner, and vice versa.",
  },
  {
    id: "veteran",
    displayName: "Veteran",
    passive: true,
    phases: [],
    description:
      "If majority, unit may re-roll failed Leadership tests (not Break tests).",
  },
  {
    id: "chariot runners",
    displayName: "Chariot Runners",
    passive: true,
    phases: [],
    description:
      'Friendly chariots can draw LoS over/through and move through this unit (Skirmish formation). Unit coherency extends to friendly chariots within 1".',
  },
  {
    id: "detachment",
    displayName: "Detachment",
    passive: true,
    phases: [],
    description:
      "Unit can be fielded as a detachment alongside a parent regiment.",
  },
  {
    id: "regimental unit",
    displayName: "Regimental Unit",
    passive: true,
    phases: [],
    description: "Unit can be accompanied by detachments.",
  },
  {
    id: "motley crew",
    displayName: "Motley Crew",
    passive: true,
    phases: [],
    description:
      "Unit may include differently equipped models or mixed troop types. Separate attack rolls per type; casualties split evenly.",
  },
  {
    id: "monster handlers",
    displayName: "Monster Handlers",
    passive: true,
    phases: [],
    description:
      "Handlers add attacks to monster. Wounds allocated: 1-4 monster, 5+ handler. If monster dies, handlers die.",
  },
  {
    id: "howdah",
    displayName: "Howdah",
    passive: true,
    phases: [],
    description:
      "Split profile (as chariots) and Firing Platform rules. Otherwise treated as a behemoth.",
  },
  {
    id: "arrows of isha",
    displayName: "Arrows of Isha",
    description: "Bows gain Armour Bane (1) and AP -1.",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "blessings of asuryan",
    displayName: "Blessings of Asuryan",
    passive: true,
    phases: [],
    description:
      "5+ Ward save against wounds caused by attacks with the Flaming Attacks special rule.",
  },
  {
    id: "blizzard aura",
    displayName: "Blizzard Aura",
    description: "Enemy models in base contact become subject to Strike Last.",
    phases: ["choose-fight"],
  },
  {
    id: "champions of chrace",
    displayName: "Champions of Chrace",
    description:
      'Any model in a Lion Guard unit can accept challenges like a character. Once per turn, a character joined to a Lion Guard unit may re-roll a failed "Look Out, Sir!" roll.',
    phases: ["choose-fight"],
  },
  {
    id: "deflect shots",
    displayName: "Deflect Shots",
    passive: true,
    phases: [],
    description:
      "6+ Ward save against wounds caused by non-magical shooting attacks.",
  },
  {
    id: "dragon armour",
    displayName: "Dragon Armour",
    passive: true,
    phases: [],
    description:
      "6+ Ward save against any wounds suffered. A Wizard with this rule may wear armour without penalty.",
    armourMod: 0,
  },
  {
    id: "enfeebling cold",
    displayName: "Enfeebling Cold",
    description: "Enemy models in base contact suffer -1 Strength (minimum 1).",
    phases: ["choose-fight"],
  },
  {
    id: "from the ashes",
    displayName: "From The Ashes",
    description:
      "When a Flamespyre Phoenix loses its last Wound, roll a D6: 1-2 removed; 3-5 explodes (D6 S3 AP-1 Flaming hits to enemies in base contact) then removed; 6 reborn, recovers D3 Wounds.",
    phases: ["remove-casualties"],
  },
  {
    id: "horn of isha",
    displayName: "Horn of Isha",
    description:
      "Single use. During the Command sub-phase, take a Leadership test. If passed, the character and their unit gain +1 To Hit and +1 To Wound until the next Start of Turn.",
    phases: ["start-of-turn"],
  },
  {
    id: "ithilmar armour",
    displayName: "Ithilmar Armour",
    passive: true,
    phases: [],
    description:
      "Re-roll any rolls of 1 on Dangerous Terrain tests. Wizards may wear armour without penalty.",
    aliases: ["Ithilmar Barding"],
  },
  {
    id: "ithilmar barding",
    displayName: "Ithilmar Barding",
    passive: true,
    phases: [],
    description:
      "Re-roll any rolls of 1 on Dangerous Terrain tests. Wizards may wear armour without penalty.",
    aliases: ["Ithilmar Armour"],
  },
  {
    id: "ithilmar weapons",
    displayName: "Ithilmar Weapons",
    description:
      "When fighting with a single, non-magical hand weapon, re-roll natural 1s To Hit. Does not apply to mount. Inactive if using two hand weapons or another weapon type.",
    phases: ["choose-fight"],
  },
  {
    id: "king's guard",
    displayName: "King's Guard",
    description:
      "Any model in a White Lions of Chrace unit joined by your General can issue and accept challenges like a character. Lost if the General leaves the unit.",
    phases: ["choose-fight"],
  },
  {
    id: "lileath's blessing",
    displayName: "Lileath's Blessing",
    description: "Once per turn, re-roll a single failed Casting roll.",
    phases: ["conjuration"],
  },
  {
    id: "lion cloak",
    displayName: "Lion Cloak",
    passive: true,
    phases: [],
    description:
      "Improves armour value by 1 (max 2+) against non-magical shooting attacks.",
    armourMod: -1,
  },
  {
    id: "martial prowess",
    displayName: "Martial Prowess",
    description:
      "Unit can make supporting attacks to its flank or rear, as well as to its front.",
    phases: ["choose-fight"],
  },
  {
    id: "mighty constitution",
    displayName: "Mighty Constitution",
    description:
      'During a turn in which he charged 3"+, gains +1 Strength. Immune to Poisoned Attacks (attackers must roll To Wound normally).',
    phases: ["choose-fight"],
  },
  {
    id: "naval discipline",
    displayName: "Naval Discipline",
    description:
      "Lothern Sea Guard may Stand & Shoot regardless of how close the charging unit is. After resolving shooting, the unit may perform a free redress the ranks manoeuvre.",
    phases: ["shoot"],
  },
  {
    id: "valour of ages",
    displayName: "Valour of Ages",
    description:
      "Re-roll any failed Panic test caused by heavy casualties or being fled through by a friendly unit.",
    phases: ["break-test"],
  },
  {
    id: "wake of fire",
    displayName: "Wake of Fire",
    description:
      "During the Remaining Moves sub-phase, may fly over a single unengaged enemy unit. That unit suffers D6 S4 hits, AP -1, Flaming Attacks.",
    phases: ["remaining-moves"],
  },
  {
    id: "witness to destiny",
    displayName: "Witness to Destiny",
    passive: true,
    phases: [],
    description:
      "6+ Ward save against wounds caused by non-magical enemy attacks.",
  },
  {
    id: "abyssal cloak",
    displayName: "Abyssal Cloak",
    passive: true,
    phases: [],
    description:
      "Enemy models targeting this model during the Shooting phase suffer a -2 To Hit modifier for firing at long range, rather than the usual -1.",
  },
  {
    id: "accomplished archers",
    displayName: "Accomplished Archers",
    passive: true,
    phases: [],
    description:
      "Unless mounted on a Lothern Skycutter, a Sea Guard Garrison Commander gains Evasive and Fire & Flee. Any Lothern Sea Guard unit joined by this character also receives those rules.",
  },
  {
    id: "commanding voice",
    displayName: "Commanding Voice",
    passive: true,
    phases: [],
    description:
      'Ishaya\'s Command Range is increased by 3" (to 12", or 15" if she is the General).',
  },
  {
    id: "precision strikes",
    displayName: "Precision Strikes",
    description:
      "A Lothern Sea Guard unit joined by Ishaya Vess improves the AP of its weapons by 1.",
    phases: ["choose-fight"],
  },
  {
    id: "sons of caledor",
    displayName: "Sons of Caledor",
    passive: true,
    phases: [],
    description:
      "Unit may only be joined by your General, or by a character with the Blood of Caledor Elven Honour.",
  },
  {
    id: "chracian warriors",
    displayName: "Chracian Warriors",
    passive: true,
    phases: [],
    description:
      "Unit may only be joined by your General, or by a character with the Chracian Hunter Elven Honour.",
  },
  {
    id: "warriors of nagarythe",
    displayName: "Warriors of Nagarythe",
    passive: true,
    phases: [],
    description:
      "Unit may only be joined by a character with the Shadow Stalker Elven Honour.",
  },
  {
    id: "warriors of the white tower",
    displayName: "Warriors of the White Tower",
    passive: true,
    phases: [],
    description:
      "Unit may only be joined by a High Elf Mage, or by a character with the Warden of Saphery or Loremaster Elven Honour.",
  },
  {
    id: "armies of the sea lord",
    displayName: "Armies of the Sea Lord",
    passive: true,
    phases: [],
    description:
      "Characters in a Sea Guard Garrison may only choose: Shadow Stalker, Pure of Heart, or Sea Guard Elven Honours.",
  },
  {
    id: "chracian pride",
    displayName: "Chracian Pride",
    passive: true,
    phases: [],
    description:
      "Characters in a Chracian Warhost may only choose: Shadow Stalker, Chracian Hunter, or Pure of Heart Elven Honours.",
  },
  {
    id: "from the mists",
    displayName: "From the Mists",
    passive: true,
    phases: [],
    description:
      "After deployment but before Scouts/Vanguard, you may remove one deployed unit and redeploy it anywhere in your deployment zone.",
  },
  {
    id: "from the storm clouds",
    displayName: "From the Storm Clouds",
    passive: true,
    phases: [],
    description:
      "0-1 Lothern Skycutter per 1,000 points. Skycutters may gain Ambushers for +10 points per model.",
  },
  {
    id: "hidden trails",
    displayName: "Hidden Trails",
    passive: true,
    phases: [],
    description:
      "0-1 unit of Elven Spearmen or Archers per 1,000 points may gain Move Through Cover for +1 pt/model. Once per game, +1 or -1 to an Ambushers reserve arrival roll.",
  },
  {
    id: "old world rangers",
    displayName: "Old World Rangers",
    passive: true,
    phases: [],
    description:
      "0-1 Shadow Warriors unit (10 or fewer Unit Strength) gains Ambushers for free.",
  },
  {
    id: "pride of the fleet",
    displayName: "Pride of the Fleet",
    passive: true,
    phases: [],
    description:
      "Sea Guard gain the Regimental Unit rule. 0-1 Sea Guard unit per 1,000 points gains Drilled for free.",
  },
  {
    id: "warriors of chrace",
    displayName: "Warriors of Chrace",
    passive: true,
    phases: [],
    description:
      "Elven Spearmen or Archers in a Chracian Warhost may purchase Lion Cloaks (+1 armour vs non-magical shooting) for +10 points per unit.",
  },
  {
    id: "warriors of the wilderness",
    displayName: "Warriors of the Wilderness",
    passive: true,
    phases: [],
    description:
      'After terrain placement, place one additional wood (3"-9" wide) on the battlefield. Cannot be in opponent deployment zone or within 6" of special features.',
  },
  {
    id: "ogre charge",
    displayName: "Ogre Charge",
    description:
      "The AP of any Impact Hits caused by this model (not its mount) is improved by the current Rank Bonus of its unit.",
    phases: ["choose-fight"],
  },
  {
    id: "bull charge",
    displayName: "Bull Charge",
    description:
      "Impact Hits caused by this model (not its mount) have an Armour Piercing characteristic of -1.",
    phases: ["choose-fight"],
  },
  {
    id: "thunderous charge",
    displayName: "Thunderous Charge",
    description: "Impact Hits caused by this model have an AP of -2.",
    phases: ["choose-fight"],
  },
  {
    id: "mournfang charge",
    displayName: "Mournfang Charge",
    description:
      "Impact Hits caused by this model have Armour Bane (1) and AP -1.",
    phases: ["choose-fight"],
  },
  {
    id: "belly flop",
    displayName: "Belly Flop",
    description:
      "Place a 3\" blast template over the target unit centre. Models underneath suffer a hit at this model's Strength with AP -2.",
    phases: ["choose-fight"],
  },
  {
    id: "giant attacks",
    displayName: "Giant Attacks",
    phases: [
      {
        subPhaseId: "choose-fight",
        description: "Instead of normal attacks, roll a D6:",
        table: [
          {
            roll: "1",
            result: "'Eadbutt",
            effect: "D3+1 wounds, no armour or regeneration saves.",
          },
          {
            roll: "2",
            result: "Belly Flop",
            effect: '3" blast, Strength, AP -2.',
          },
          {
            roll: "3-4",
            result: "Mighty Swing",
            effect: "D6+1 attacks, S+1, AP -2.",
          },
          {
            roll: "5",
            result: "Thump with Club",
            effect: "One model, S+4, AP -4, Multiple Wounds (D6).",
          },
          {
            roll: "6",
            result: "Jump Up and Down",
            effect: "D6+1 hits, no armour saves allowed.",
          },
        ],
      },
    ],
  },
  {
    id: "pick up and",
    displayName: "Pick Up And...",
    aliases: ["pick up and..."],
    description:
      "Instead of normal attacks vs infantry/heavy infantry: target makes Initiative test. Fail = one model removed as casualty. Then roll D6: 4+ = repeat. 1-3 = stop.",
    phases: ["choose-fight"],
  },
  {
    id: "numbing chill",
    displayName: "Numbing Chill",
    description:
      "Enemy models in base contact suffer -1 WS and -1 Initiative (minimum 1).",
    phases: ["choose-fight"],
  },
  {
    id: "butcher's cauldron",
    displayName: "Butcher's Cauldron",
    aliases: ["butchers cauldron"],
    phases: [
      {
        subPhaseId: "choose-fight",
        description: "Replaces Impact Hits (2) with Impact Hits (D3+1).",
      },
      {
        subPhaseId: "command",
        yourTurnOnly: true,
        description:
          "If not in combat, take a Leadership test. Pass: character and joined unit gain Regeneration (5+) until next Start of Turn. Fail: lose 1 Wound.",
      },
    ],
  },
  {
    id: "blessings of the volcano god",
    displayName: "Blessings of the Volcano God",
    description: "4+ Ward save against wounds caused by Flaming Attacks.",
    phases: ["choose-fight", "shoot"],
  },
  {
    id: "stone skeleton",
    displayName: "Stone Skeleton",
    passive: true,
    phases: [
      {
        subPhaseId: "choose-fight",
        description:
          "When suffering an unsaved wound from Multiple Wounds (X), reduce the number of wounds lost by 1 (minimum 1).",
      },
    ],
  },
  {
    id: "ravenous hunger",
    displayName: "Ravenous Hunger",
    chargeMod: { range: 0, tag: "Ravenous", color: "orange", order: 3 },
    description: "When declaring a charge, may re-roll the Charge roll.",
    phases: ["declare-charges"],
    yourTurnOnly: true,
  },
  {
    id: "look-out gnoblar",
    displayName: "Look-out Gnoblar",
    description:
      'Champion/character may make "Look Out, Sir!" with 2+ rank-and-file (instead of 5). With 5+, may re-roll the roll.',
    phases: ["shoot"],
  },
  {
    id: "largely insignificant",
    displayName: "Largely Insignificant",
    passive: true,
    phases: [],
    description:
      "Unit never causes friendly Panic tests. Cannot be joined by a character without this rule.",
  },
  {
    id: "running with the pack",
    displayName: "Running with the Pack",
    passive: true,
    phases: [],
    description:
      "Hunter joining Sabretusks gains Swiftstride. Sabretusks lose Impetuous while the Hunter remains.",
  },
  {
    id: "traps and snares",
    displayName: "Traps & Snares",
    aliases: ["traps & snares"],
    description:
      "Any enemy model that ends its charge move in base contact with this model must make a Dangerous Terrain test.",
    phases: ["choose-fight"],
  },
  {
    id: "bellowers and musicians",
    displayName: "Bellowers & Musicians",
    aliases: ["bellowers & musicians"],
    passive: true,
    phases: [],
    description:
      "Ogre musicians are Bellowers who use their voice instead of instruments. Function as standard musicians.",
  },
  {
    id: "arise!",
    displayName: "Arise!",
    description:
      'If not engaged, take a Leadership test. Pass: a single friendly Nehekharan Undead unit within 12" recovers Wounds — Infantry/Swarms: Wizard Level + D3; Cavalry/War Beasts: Wizard Level + 1; Monstrous Infantry/Cavalry/Light Chariot: Wizard Level; Behemoth/Heavy Chariot/War Machine: 1 Wound.',
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "the terrors below",
    displayName: "The Terrors Below",
    description:
      "When this unit enters via From Beneath the Sands, nominate one enemy regular or heavy infantry unit within 8\". That unit makes Initiative tests equal to this unit's Unit Strength — each failed test removes one model as a casualty.",
    phases: ["compulsory-moves"],
  },
  {
    id: "from beneath the sands",
    displayName: "From Beneath the Sands",
    description:
      'If not engaged, choose a friendly unit with Nehekharan Undead and Ambushers in reserve and take a Leadership test. Pass: place the unit within 12" of this model and outside 6" of enemies — it cannot charge this turn and counts as having moved. Fail: unit is delayed until your next turn. Ambushers units still arrive automatically at Round 5.',
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "my will be done",
    displayName: "My Will Be Done",
    description:
      'Take a Leadership test. Pass: choose one bonus lasting until next Start of Turn for this model, its mount, and joined unit — "Forward to Glory!": +D3 Movement; "My Worthy Champions!": +1 Weapon Skill; "Strike like the Cobra!": +D3 Initiative. Not cumulative (no effect if used again on same unit this turn).',
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "eternal taskmaster",
    displayName: "Eternal Taskmaster",
    description:
      "Once per Command sub-phase, take a Leadership test. Pass: character and joined unit gain Extra Attacks (+1) and Hatred (all enemies) until next Start of Turn.",
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "nehekharan phalanx",
    displayName: "Nehekharan Phalanx",
    description:
      "Units in Close Order with shields may choose not to Give Ground when losing combat. This protection fails if the winner's Unit Strength exceeds twice the loser's.",
    phases: ["combat-result"],
  },
  {
    id: "grind them down!",
    displayName: "Grind Them Down!",
    aliases: ["grind them down"],
    description:
      "Friendly Chariot-type models within General's Command range may re-roll dice when determining Impact Hits.",
    phases: ["choose-fight"],
    yourTurnOnly: true,
  },
  {
    id: "steadfast discipline",
    displayName: "Steadfast Discipline",
    description:
      "Unit may perform Volley Fire even after moving this turn, or while performing a Stand & Shoot charge reaction.",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "arrows of asaph",
    displayName: "Arrows of Asaph",
    description: "Disregard all modifiers when making ranged attack rolls.",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "dry as dust",
    displayName: "Dry as Dust",
    description:
      "When this model suffers an unsaved Wound from a Flaming Attack, opponent rolls D6: 1–3 wound is harmless; 4+ model suffers 1 additional Wound. Excess wounds don't spill over to the unit.",
    phases: ["shoot", "choose-fight"],
  },
  {
    id: "curse of the necropolis",
    displayName: "Curse of the Necropolis",
    description:
      "When this model loses its final Wound to an enemy attack, the enemy unit that dealt the killing blow must immediately take a Leadership test. If failed, that unit suffers D3 Strength 2 hits with AP −.",
    phases: ["choose-fight"],
  },
  {
    id: "daughters of eternity",
    displayName: "Daughters of Eternity",
    passive: true,
    description: "4+ Ward save.",
    phases: [],
  },
  {
    id: "aspect of the hound",
    displayName: "Aspect of the Hound",
    passive: true,
    description:
      "The character and their unit may re-roll any To Hit rolls of a natural 1 during the Combat phase.",
    phases: [],
  },
  {
    id: "aspect of the bear",
    displayName: "Aspect of the Bear",
    passive: true,
    description: "+1 Strength and +1 Toughness. Infantry or cavalry only.",
    phases: [],
  },
  {
    id: "aspect of the boar",
    displayName: "Aspect of the Boar",
    passive: true,
    description:
      "Impact Hits (1). Weapon AP improves by 1 on a turn in which the character charged.",
    phases: [],
  },
  {
    id: "aspect of the cat",
    displayName: "Aspect of the Cat",
    passive: true,
    description:
      "Armour Bane (1). May re-roll failed To Hit rolls during a challenge.",
    phases: [],
  },
  {
    id: "nehekharan undead",
    displayName: "Nehekharan Undead",
    phases: [
      {
        subPhaseId: "remaining-moves",
        description:
          "Cannot march (unless possessing Fly and choosing to fly). Immune to Psychology. Unbreakable — gives ground instead of breaking.",
      },
      {
        subPhaseId: "combat-result",
        description:
          "Unstable: if combat is lost, unit suffers additional Wounds equal to the combat result points lost (no saves of any kind allowed). Characters with this rule cannot join units without it.",
      },
    ],
  },
  {
    id: "bonegrinder giant attacks",
    displayName: "Bonegrinder Giant Attacks",
    phases: [
      {
        subPhaseId: "choose-fight",
        description: "Instead of normal attacks, roll a D6:",
        table: [
          {
            roll: "1",
            result: "'Eadbutt",
            effect: "D6+1 wounds, no armour or regeneration saves.",
          },
          {
            roll: "2",
            result: "Belly Flop",
            effect: '5" blast, Strength, AP -2.',
          },
          {
            roll: "3-4",
            result: "Mighty Swing",
            effect: "2D6 attacks, S+2, AP -3.",
          },
          {
            roll: "5",
            result: "Grind its Bones",
            effect:
              "Each base-contact infantry model tests Strength or is removed as a casualty; repeat on 4+.",
          },
          {
            roll: "6",
            result: "Crush Underfoot",
            effect: "All base-contact models suffer D6 hits at S+3, AP -3.",
          },
        ],
      },
    ],
  },
  {
    id: "choppas",
    displayName: "Choppas",
    description:
      "During a turn in which it charged, a model with this special rule may re-roll any rolls To Wound of a natural 1, and improves the Armour Piercing characteristic of its weapon(s) by 1.",
    phases: ["choose-fight"],
  },
  {
    id: "da troll calla",
    displayName: "Da Troll Calla",
    description:
      "Unless he is fleeing, friendly Troll Mobs within Ogdruz's Command range may use his Leadership characteristic instead of their own.",
    phases: ["command"],
  },
  {
    id: "ignore goblin panic",
    displayName: "Ignore Goblin Panic",
    passive: true,
    phases: [],
    description:
      "Does not take Panic tests caused by friendly Goblinoid units being destroyed or fleeing through the unit.",
  },
  {
    id: "indiscriminate hunger",
    displayName: "Indiscriminate Hunger",
    description:
      'At Start of Turn, if within 1" of a friendly unit, take a Leadership test. If failed, the unit attacks the nearest friendly unit this turn instead of the nearest enemy.',
    phases: ["start-of-turn"],
    yourTurnOnly: true,
  },
  {
    id: "motherly love",
    displayName: "Motherly Love",
    passive: true,
    phases: [],
    description:
      "Friendly Troll units within Command range may use this model's Leadership for Leadership tests and may re-roll failed Regeneration saves.",
  },
  {
    id: "protect da boss",
    displayName: "Protect Da Boss",
    description:
      "A character joined to this unit improves their armour save by 1 (max 1+). The character may use Look Out, Sir! with only 2 rank-and-file models present (instead of 5).",
    phases: ["choose-fight"],
  },
  {
    id: "slimy shanks",
    displayName: "Slimy Shanks",
    passive: true,
    phases: [],
    description:
      "Unit ignores the movement penalties for difficult terrain. Enemy models moving into base contact with this unit treat that movement as difficult terrain.",
  },

  // ─── Grand Cathay ────────────────────────────────────────────────────

  {
    id: "celestial forged armour",
    displayName: "Celestial Forged Armour (X+)",
    passive: true,
    phases: [],
    description:
      "Ward save (X+) against any wounds suffered. Wizards may wear this armour without penalty to their casting rolls.",
  },
  {
    id: "mastery of the elemental winds",
    displayName: "Mastery of the Elemental Winds",
    description:
      'Once per turn, if within 6" of one or more friendly Wizards with this rule, apply a +1 modifier to a casting roll. This modifier does not negate a natural double 1.',
    phases: ["conjuration"],
    yourTurnOnly: true,
  },
  {
    id: "will of the dragons",
    displayName: "Will of the Dragons",
    description:
      'May re-roll a failed Panic test when a friendly unit is destroyed within 6", or when fled through by a friendly unit.',
    phases: ["break-test"],
  },
  {
    id: "eye of the dragon",
    displayName: "Eye of the Dragon",
    description:
      "Friendly models with Bombardment weapons may shoot using this model's line of sight rather than their own.",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "heavenly beacon",
    displayName: "Heavenly Beacon",
    description:
      'Unless fleeing, friendly units within 12" may re-roll failed Panic or Rally tests. Apply a +1 or -1 modifier when rolling for friendly Ambushers to arrive or be delayed. A Lord Magistrate or Strategist mounted on this model gains a 12" command range.',
    phases: ["rally", "break-test"],
  },
  {
    id: "disengage",
    displayName: "Disengage",
    description:
      'When losing combat and would Give Ground, may Fall Back in Good Order instead (enemy may follow up 2" but cannot pursue). When winning combat and choosing to restrain and reform, may Fall Back in Good Order instead.',
    phases: ["choose-fight"],
  },
  {
    id: "defensive stance",
    displayName: "Defensive Stance",
    description:
      "Unless the unit charged or counts as having charged this turn, re-roll Armour Save rolls of a natural 1 during the Combat phase.",
    phases: ["choose-fight"],
  },
  {
    id: "cathayan black powder",
    displayName: "Cathayan Black Powder",
    description:
      "The first time any unit in a Jade Fleet army armed with a handgun, pistol, brace of pistols, repeater handgun, or repeater pistol shoots, that weapon's range is increased by 3\".",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "cathayan cataphracts",
    displayName: "Cathayan Cataphracts",
    description:
      "When a unit in which the majority of models have this rule makes a follow up move, the unit counts as having charged during the next turn.",
    phases: ["choose-fight"],
    yourTurnOnly: true,
  },
  {
    id: "unity and harmony",
    displayName: "Unity & Harmony",
    aliases: ["unity & harmony", "unity and harmony"],
    description:
      'Any unit of Jade Warriors or Jade Lancers within 3" of a friendly Mercenary unit may re-roll To Hit rolls of 1 during the Combat phase.',
    phases: ["choose-fight"],
    yourTurnOnly: true,
  },
  {
    id: "wailing spirits",
    displayName: "Wailing Spirits",
    description:
      "Any unit that suffers one or more unsaved wounds from this weapon must make a Panic test as if it had taken heavy casualties.",
    phases: ["shoot", "choose-fight"],
  },
  {
    id: "tower shields",
    displayName: "Tower Shields",
    passive: true,
    phases: [],
    description:
      "Improves armour value by 3 (instead of the standard +1) against attacks from enemy models in the front arc. Offers no protection against attacks from the flank or rear arc.",
  },
  {
    id: "harmony of stone and steel",
    displayName: "Harmony of Stone & Steel",
    aliases: ["harmony of stone & steel"],
    description:
      "Friendly units within Command range may re-roll failed Leadership tests when attempting to reform after running down a foe, when redirecting a charge, or when making a Restraint test.",
    phases: ["movement"],
    yourTurnOnly: true,
  },
  {
    id: "the elemental winds",
    displayName: "The Elemental Winds",
    description:
      'At the start of each turn, roll a D6. 1-2: no effect. 3-4: Winds of Yang — Lore of Yang wizards gain +3" range for Dispel/Enchantment spells; models with Will of the Dragons gain +1M or +1I. 5-6: Winds of Yin — Lore of Yin wizards gain +3" range for Hex/Magic Missile spells; models with Will of the Dragons gain +1WS or +1Ld.',
    phases: ["start-of-turn"],
    yourTurnOnly: true,
  },
  {
    id: "discipline of the dragon",
    displayName: "Discipline of the Dragon",
    description:
      'Once per game during the Command sub-phase, each Sky Lantern not in combat may attempt a Grand Strategy (Leadership test). Success: choose Defiance of the Dragon (Stubborn/Unbreakable), Strength of the Everlasting Empire (cannot be wounded on a 2 to wound), or Fury of the Falling Blade (+1M, re-roll Charge/Flee/Pursuit) for all friendly Cathayan units within 12" until next Start of Turn.',
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "disdain of the dragons",
    displayName: "Disdain of the Dragons",
    description:
      "Enemy models wishing to issue a challenge within Command range must pass a Leadership test (+1 modifier in Human form, +2 in Dragon form). Challenges issued by this model cannot be refused.",
    phases: ["choose-fight"],
  },
  {
    id: "dragon form",
    displayName: "Dragon Form",
    passive: true,
    phases: [],
    description:
      "Troop type is Behemoth. Does not have Inspiring Presence, even if the army's General.",
  },
  {
    id: "human form",
    displayName: "Human Form",
    passive: true,
    phases: [],
    description:
      "Troop type is Heavy Infantry. Follows all rules for a Heavy Infantry character.",
  },
  {
    id: "transformation",
    displayName: "Transformation",
    description:
      'During the Command sub-phase, place the new form\'s model within 6" of the current form (not within 1" of friendly or 3" of enemy models). Remove previous form, recover D3 Wounds. Cannot charge that turn; counts as having moved for shooting.',
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "transformation of the dragon",
    displayName: "Transformation of the Dragon",
    description:
      "May switch between Human form (Heavy Infantry character) and Dragon form (Behemoth, no Inspiring Presence) during the Command sub-phase. Wounds are shared. Reduced to 0W in Dragon form: transform to Human form, recover D3W, cannot return to Dragon form. Human to Dragon transformation allows escaping combat.",
    phases: ["command"],
    yourTurnOnly: true,
  },
  {
    id: "death of a dragon",
    displayName: "Death of a Dragon",
    passive: true,
    phases: [],
    description:
      "Wounds apply to both character profiles simultaneously. Reduced to 0W in Dragon form: transform to Human form, recover D3W, cannot return to Dragon form. Reduced to 0W in Human form: removed as a casualty.",
  },
  {
    id: "enough for everyone",
    displayName: "Enough for Everyone",
    description:
      "When an Ogre Loader has gunpowder bombs, the entire war machine crew also gains access to those weapons.",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "grand strategist",
    displayName: "Grand Strategist",
    description:
      "Unless fleeing, all friendly units within Command range (except your General) may use this character's Leadership. Once per turn, a friendly unit that wins combat within Command range may Fall Back in Good Order instead of pursuing or following up.",
    phases: ["break-test", "choose-fight"],
  },
  {
    id: "granite sentinel",
    displayName: "Granite Sentinel",
    passive: true,
    phases: [],
    description:
      "Armour value improved by 1. Immune to Multiple Wounds (X): if suffering an unsaved wound from a Multiple Wounds attack, loses only 1 Wound.",
  },
  {
    id: "implacable",
    displayName: "Implacable",
    description:
      "Once per game when charged, may choose not to Give Ground if combat is lost. Once per game, may re-roll its Charge roll.",
    phases: ["movement", "choose-fight"],
  },
  {
    id: "jade sentinel",
    displayName: "Jade Sentinel",
    description:
      "Knows one spell (chosen before deployment) from Battle Magic or Elementalism, cast as a Bound spell with Power Level 3.",
    phases: ["conjuration"],
    yourTurnOnly: true,
  },
  {
    id: "mastery of the storm winds",
    displayName: "Mastery of the Storm Winds",
    description:
      "May discard up to two randomly generated spells (instead of one), replacing them with spells from Lore of Yang, Lore of Yin, a signature spell, or The Storm Dragon's Fury (Magic Missile, CV 10+, 18\", 2D3 S5 AP-3 Flaming Attacks hits; target must Give Ground).",
    phases: ["conjuration"],
    yourTurnOnly: true,
  },
  {
    id: "mercenary crew",
    displayName: "Mercenary Crew",
    description:
      "Ogre Loader grants the war machine crew +1 Movement and Stubborn. Once per game, the war machine may fire twice during the Shooting phase, or re-roll a single Artillery dice.",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "mercenary handgun drill",
    displayName: "Mercenary Handgun Drill",
    description:
      "Once per game, each unit or detachment of State Missile Troops in a Jade Fleet army can fire with one additional rank.",
    phases: ["shoot"],
    yourTurnOnly: true,
  },
  {
    id: "obsidian sentinel",
    displayName: "Obsidian Sentinel",
    description:
      'Magic Resistance (-2). Enemy wizards within 12" must make a Leadership test before casting: failed = -3 to casting roll; passed = -1 to casting roll.',
    phases: ["conjuration"],
    opponentOnly: true,
  },
  {
    id: "supreme matriarch of nan-gau",
    displayName: "Supreme Matriarch of Nan-Gau",
    passive: true,
    phases: [],
    description:
      "If Miao Ying is included, she becomes the General. One unit of Jade Warriors or Jade Lancers may be upgraded to Celestial Dragon Guard (+2 pts/model): +1WS and +1Ld (max 10), and Celestial Armour (6+) Ward save.",
  },
  {
    id: "terracotta sentinel",
    displayName: "Terracotta Sentinel",
    passive: true,
    phases: [],
    description: "Gains the Regeneration (6+) special rule.",
  },
  {
    id: "war balloons",
    displayName: "War Balloons",
    passive: true,
    phases: [],
    description:
      "Up to one Sky Lantern per 1,000 points may gain Ambushers (+15 pts). Once per game, a Sky Lantern held in reserve may re-roll the dice when rolling to arrive as reinforcements or be delayed.",
  },
  {
    id: "sky lantern bombs",
    displayName: "Sky Lantern Bombs",
    phases: [
      {
        subPhaseId: "shoot",
        description: "Roll a D6 to determine the bombing run result:",
        table: [
          {
            roll: "1",
            result: "Premature Detonation",
            effect:
              "The release mechanism jams and a bomb explodes prematurely. This model loses a single Wound.",
          },
          {
            roll: "2",
            result: "Dud",
            effect:
              "A solitary bomb is released but fails to detonate, landing on an enemy model. The enemy unit loses a single Wound.",
          },
          {
            roll: "3-4",
            result: "Direct Hit",
            effect:
              'Place a large (5") blast template over the centre of the enemy unit; it scatters D6". Any model underneath risks a Strength 5 hit, AP -2.',
          },
          {
            roll: "5-6",
            result: "Bombs Away",
            effect:
              'Place two small (3") blast templates over the enemy unit; each scatters D6". Any model underneath risks a Strength 5 hit, AP -2.',
          },
        ],
      },
    ],
  },
  {
    id: "warpstone sentinel",
    displayName: "Warpstone Sentinel",
    passive: true,
    phases: [],
    description:
      "Magical Attacks. Enemy units in base contact suffer -1 Toughness (minimum 1).",
  },
  {
    id: "warriors of the field",
    displayName: "Warriors of the Field",
    passive: true,
    phases: [],
    description:
      "Units of Peasant Levy do not become Disrupted by difficult or dangerous terrain. Up to one Peasant Levy unit per 1,000 points may purchase Move Through Cover for +20 pts.",
  },
  {
    id: "warriors of the land",
    displayName: "Warriors of the Land",
    description:
      "When Falling Back in Good Order, may choose which dice to discard when making the Flee roll rather than automatically discarding the lowest.",
    phases: ["movement"],
  },
  {
    id: "warriors of the wind",
    displayName: "Warriors of the Wind",
    passive: true,
    phases: [],
    description:
      "Up to one Peasant Levy unit per 1,000 points may have Reserve Move and Scouts for +2 pts per model.",
  },
  {
    id: "wrath of the storm",
    displayName: "Wrath of the Storm",
    description:
      "All units of Jade Warriors and Jade Lancers in an army led by Miao Ying gain Hatred (Warriors of Chaos & Daemonic models).",
    phases: ["choose-fight"],
    yourTurnOnly: true,
  },
  {
    id: "gaze of the gods",
    displayName: "Gaze of the Gods",
    phases: [
      {
        subPhaseId: "command",
        yourTurnOnly: true,
        description:
          "May roll on the Gaze of the Gods table. Applies to the Champion only, not any mount:",
        table: [
          {
            roll: "1",
            result: "Damned by Chaos",
            effect:
              "Gains Stupidity for the remainder of the game. If already affected, suffers -1 Leadership (minimum 2).",
          },
          {
            roll: "2",
            result: "Unnatural Quickness",
            effect:
              "+1 Initiative until the next Start of Turn sub-phase (maximum 10).",
          },
          {
            roll: "3",
            result: "Iron Skin",
            effect:
              "+1 Toughness until the next Start of Turn sub-phase (maximum 10).",
          },
          {
            roll: "4",
            result: "Murderous Mutation",
            effect:
              "+1 Weapon Skill for the remainder of the game (maximum 10).",
          },
          {
            roll: "5",
            result: "Dark Fury",
            effect: "+1 Attacks for the remainder of the game (maximum 10).",
          },
          {
            roll: "6",
            result: "Apotheosis",
            effect:
              "+1 Strength and +1 Leadership for the remainder of the game (maximum 10).",
          },
        ],
      },
    ],
  },
  {
    id: "explosive demise",
    displayName: "Explosive Demise",
    description:
      'When this model loses its last Wound, before it is removed from play, every unit (friend or foe) within 6" suffers D6 Strength 5 hits, each with AP -2.',
    phases: ["choose-fight"],
  },
  {
    id: "warpfire aura",
    displayName: "Warpfire Aura",
    description:
      'Other models (friend and foe) cannot make Ward saves while within 3" of this model.',
    phases: ["choose-fight", "shoot"],
  },
  {
    id: "fire and chaos",
    displayName: "Fire and Chaos",
    description:
      "5+ Ward save against wounds caused by attacks with the Magical Attacks or Flaming Attacks special rule.",
    phases: ["choose-fight"],
  },
];

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
  name: "Lore Familiar",
  type: "Arcane Item",
  points: 30,
  description:
    "The Wizard does not randomly generate spells. Instead, they choose which spells they know from their chosen lore (including the signature spell).",
};

/**
 * Arcane Familiar (Arcane Item, 15 pts)
 *
 * The bearer gains access to spells from two Lores of Magic.
 * Roll for each Lore separately; re-roll duplicates.
 * May discard one randomly generated spell and replace with that Lore's signature spell.
 */
export const ARCANE_FAMILIAR = {
  name: "Arcane Familiar",
  type: "Arcane Item",
  points: 15,
  description:
    "Bearer has access to two Lores of Magic. Roll for each separately, re-roll duplicates. May swap one random spell for that Lore's signature spell.",
};

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Look up a specific rule by name (case-insensitive).
 * @param {string} name
 * @returns {object|undefined}
 */
export function findRule(name) {
  const lower = name.toLowerCase();
  return SPECIAL_RULES.find((r) => r.id.toLowerCase() === lower);
}
