/**
 * Common Magic Items from Warhammer: The Old World.
 *
 * Each item has:
 *   name        – canonical name
 *   type        – weapon | armour | talisman | arcane-item | enchanted-item | banner
 *   points      – points cost
 *   effect      – full rules text
 *   phases      – array of phase IDs where the item is relevant (matches phases.js)
 *                 'combat' | 'shooting' | 'movement' | 'strategy' | 'passive'
 *   extremely   – true if the item is an "Extremely Common" magic item (no duplicate limit)
 *
 * Source: https://tow.whfb.app/magic-items
 */

export const MAGIC_ITEMS = [
  // ─── Magic Weapons ──────────────────────────────────────────────────
  {
    name: 'Ogre Blade',
    type: 'weapon',
    points: 75,
    effect: 'S+2, -2 AP. Armour Bane (1), Magical Attacks, Multiple Wounds (D3).',
    phases: ['combat'],
  },
  {
    name: 'Cackling Blade',
    type: 'weapon',
    points: 65,
    effect: 'S+1, -1 AP. Extra Attacks (+D6), Magical Attacks. If a natural 6 is rolled for the Extra Attacks (+D6) special rule, the wielder immediately loses a single Wound.',
    phases: ['combat'],
  },
  {
    name: 'Sword of Battle',
    type: 'weapon',
    points: 60,
    effect: 'S+1, -1 AP. Armour Bane (1), Extra Attacks (+1), Magical Attacks.',
    phases: ['combat'],
  },
  {
    name: "Duellist's Blades",
    type: 'weapon',
    points: 55,
    effect: 'S, -1 AP. Extra Attacks (+2), Magical Attacks, Requires Two Hands.',
    phases: ['combat'],
  },
  {
    name: 'Dragon Slaying Sword',
    type: 'weapon',
    points: 50,
    effect: 'S, no AP. Magical Attacks, Monster Slayer.',
    phases: ['combat'],
  },
  {
    name: 'Meteor Hammer',
    type: 'weapon',
    points: 50,
    effect: 'S, -3 AP. Magical Attacks, Requires Two Hands. When making a roll To Wound with this weapon, a roll of 3+ is always a success, regardless of the target\'s Toughness.',
    phases: ['combat'],
  },
  {
    name: "Headsman's Axe",
    type: 'weapon',
    points: 45,
    effect: 'S+1, -1 AP. Killing Blow, Magical Attacks, Requires Two Hands.',
    phases: ['combat'],
  },
  {
    name: 'Spelleater Axe',
    type: 'weapon',
    points: 35,
    effect: 'S, -1 AP. Magical Attacks, Magic Resistance (-2).',
    phases: ['combat', 'strategy'],
  },
  {
    name: 'Giant Blade',
    type: 'weapon',
    points: 30,
    effect: 'S+1, no AP. Armour Bane (2), Magical Attacks, Multiple Wounds (2).',
    phases: ['combat'],
  },
  {
    name: 'Hell-forged Axe',
    type: 'weapon',
    points: 30,
    effect: 'S+1, -1 AP. Armour Bane (3), Flaming Attacks, Magical Attacks.',
    phases: ['combat'],
  },
  {
    name: 'Sword of Sorrow',
    type: 'weapon',
    points: 30,
    effect: 'Range 30", Strength 5, -1 AP. Armour Bane (2), Magical Attacks, Multiple Wounds (2). Missile weapon only; cannot be used in combat. No Ward or Regeneration saves permitted against wounds caused.',
    phases: ['shooting'],
  },
  {
    name: 'Sword of Swiftness',
    type: 'weapon',
    points: 25,
    effect: 'S, no AP. Magical Attacks, Strike First.',
    phases: ['combat'],
  },
  {
    name: 'Berserker Blade',
    type: 'weapon',
    points: 20,
    effect: 'S+1, no AP. Extra Attacks (+1), Impetuous, Magical Attacks.',
    phases: ['combat', 'movement'],
    extremely: true,
  },
  {
    name: 'Sword of Might',
    type: 'weapon',
    points: 20,
    effect: 'S+1, -1 AP. Magical Attacks.',
    phases: ['combat'],
    extremely: true,
  },
  {
    name: 'Biting Blade',
    type: 'weapon',
    points: 15,
    effect: 'S, -2 AP. Armour Bane (1), Magical Attacks.',
    phases: ['combat'],
  },
  {
    name: 'Sword of Striking',
    type: 'weapon',
    points: 15,
    effect: 'S, no AP. Magical Attacks. During the Combat phase, the wielder has a +1 modifier to their rolls To Hit.',
    phases: ['combat'],
    extremely: true,
  },
  {
    name: 'Burning Blade',
    type: 'weapon',
    points: 5,
    effect: 'S, no AP. Flaming Attacks, Magical Attacks.',
    phases: ['combat'],
    extremely: true,
  },

  // ─── Magic Armour ───────────────────────────────────────────────────
  {
    name: 'Armour of Destiny',
    type: 'armour',
    points: 70,
    effect: 'Heavy armour. The wearer has a 4+ Ward save against any wounds suffered.',
    phases: ['combat', 'shooting'],
  },
  {
    name: 'Bedazzling Helm',
    type: 'armour',
    points: 60,
    effect: 'Infantry or cavalry only. May be worn with other armour. Improves armour value by 1 (max 2+). Any enemy model directing attacks against the wearer during the Combat phase suffers -1 To Hit.',
    phases: ['combat'],
  },
  {
    name: 'Armour of Silvered Steel',
    type: 'armour',
    points: 40,
    effect: 'Gives the wearer an armour value of 3+ which cannot be improved in any way.',
    phases: ['passive'],
  },
  {
    name: 'Glittering Scales',
    type: 'armour',
    points: 35,
    effect: 'Light armour. Once per turn, you may make your opponent re-roll a single roll To Hit made against the wearer.',
    phases: ['combat', 'shooting'],
  },
  {
    name: 'Shield of the Warrior True',
    type: 'armour',
    points: 30,
    effect: 'Shield. The bearer has a 5+ Ward save against any wounds suffered during the Shooting phase.',
    phases: ['shooting'],
  },
  {
    name: 'Levitating Shield',
    type: 'armour',
    points: 25,
    effect: 'Infantry only. Shield. The bearer may use it alongside a weapon with the Requires Two Hands special rule during combat.',
    phases: ['combat'],
  },
  {
    name: 'Spellshield',
    type: 'armour',
    points: 25,
    effect: 'Shield. The bearer has a 5+ Ward save against any wounds suffered that were caused by a Magic Missile, a Magical Vortex, or an Assailment spell.',
    phases: ['shooting', 'strategy'],
  },
  {
    name: 'Armour of Meteoric Iron',
    type: 'armour',
    points: 20,
    effect: 'Gives the wearer an armour value of 5+ which cannot be improved or reduced in any way.',
    phases: ['passive'],
  },
  {
    name: "Trailblazer's Hauberk",
    type: 'armour',
    points: 20,
    effect: 'Infantry only. Heavy armour. The wearer gains Move Through Cover and Scouts special rules.',
    phases: ['movement', 'passive'],
  },
  {
    name: 'Enchanted Shield',
    type: 'armour',
    points: 10,
    effect: 'Shield. The bearer has a 6+ Ward save against any wounds suffered that were caused by a non-magical enemy attack.',
    phases: ['combat', 'shooting'],
  },
  {
    name: 'Charmed Shield',
    type: 'armour',
    points: 5,
    effect: 'Shield. Single use. Gives the bearer a 5+ Ward save against a single wound. After use, becomes an ordinary non-magical shield.',
    phases: ['combat', 'shooting'],
  },

  // ─── Talismans ──────────────────────────────────────────────────────
  {
    name: 'Dawnstone',
    type: 'talisman',
    points: 35,
    effect: 'The bearer may re-roll any Armour Save roll of a natural 1.',
    phases: ['combat', 'shooting'],
  },
  {
    name: 'Icon of Fortitude',
    type: 'talisman',
    points: 35,
    effect: 'Infantry or cavalry only. The bearer is immune to the Multiple Wounds (X) special rule. If wounded by such an attack, they suffer a single wound.',
    phases: ['combat', 'shooting'],
  },
  {
    name: 'Ironhide Talisman',
    type: 'talisman',
    points: 30,
    effect: 'Infantry only. Any enemy model that makes a successful roll To Hit against the bearer during the Shooting phase or Combat phase must re-roll any rolls To Wound of a natural 6. Does not work against attacks that hit automatically.',
    phases: ['combat', 'shooting'],
  },
  {
    name: 'Talisman of Protection',
    type: 'talisman',
    points: 30,
    effect: 'Gives the bearer a 5+ Ward save against any wounds suffered.',
    phases: ['combat', 'shooting'],
  },
  {
    name: "Paymaster's Coin",
    type: 'talisman',
    points: 25,
    effect: 'Single use. The bearer can re-roll any failed rolls To Hit made during the Combat phase.',
    phases: ['combat'],
    extremely: true,
  },
  {
    name: 'Obsidian Lodestone',
    type: 'talisman',
    points: 20,
    effect: 'May purchase up to three. One gives Magic Resistance (-1), two gives (-2), three gives (-3).',
    phases: ['strategy'],
    extremely: true,
  },
  {
    name: 'Luckstone',
    type: 'talisman',
    points: 15,
    effect: 'Single use. The bearer can re-roll a single failed Armour Save roll.',
    phases: ['combat', 'shooting'],
    extremely: true,
  },

  // ─── Arcane Items ───────────────────────────────────────────────────
  {
    name: 'Feedback Scroll',
    type: 'arcane-item',
    points: 60,
    effect: 'Single use. May be used instead of a Wizardly dispel attempt. The spell is cast as normal. Once resolved, roll 2D6; for each 4+, the casting Wizard loses a single Wound.',
    phases: ['strategy'],
  },
  {
    name: 'Scroll of Transmogrification',
    type: 'arcane-item',
    points: 50,
    effect: 'Single use. May be used instead of a Wizardly dispel attempt. The spell is cast as normal. The casting player must then roll equal to or lower than the Wizard\'s Level on a D6. If failed, the Wizard turns into a frog (all characteristics except Wounds become 1, cannot cast/dispel/use equipment). Roll D6 each Start of Turn sub-phase; on 4+ the Wizard returns to normal.',
    phases: ['strategy'],
  },
  {
    name: 'Wand of Jet',
    type: 'arcane-item',
    points: 45,
    effect: 'The bearer may apply a +1 modifier to any Casting or Dispel roll. If any natural double is rolled, the Wand is destroyed. Does not negate a natural double 1.',
    phases: ['strategy', 'shooting'],
  },
  {
    name: 'Staff of Quietude',
    type: 'arcane-item',
    points: 35,
    effect: 'During the Command sub-phase, the bearer can attempt a Leadership test. If passed, all Remains in Play spells currently in play are dispelled, including friendly ones.',
    phases: ['strategy'],
  },
  {
    name: 'Lore Familiar',
    type: 'arcane-item',
    points: 30,
    effect: 'The owner does not randomly generate spells. Instead, they may choose which spells they know from their chosen lore (including the signature spell).',
    phases: ['passive'],
  },
  {
    name: 'Scroll of Disruption',
    type: 'arcane-item',
    points: 30,
    effect: 'Once per turn, the bearer may re-roll a Dispel roll. All dice are re-rolled, including any bonus or discard dice.',
    phases: ['strategy', 'shooting'],
  },
  {
    name: 'Tome of Spellcraft',
    type: 'arcane-item',
    points: 30,
    effect: 'Once per turn, the bearer may re-roll a Casting roll. All dice are re-rolled, including any bonus or discard dice.',
    phases: ['strategy', 'shooting'],
  },
  {
    name: 'Dispel Scroll',
    type: 'arcane-item',
    points: 20,
    effect: 'Single use. May be used when attempting a Wizardly dispel. Roll an extra D6 on the Dispel roll and discard the lowest. If double 1 is rolled on any two dice, the Wizard is outclassed.',
    phases: ['strategy', 'shooting'],
  },
  {
    name: 'Power Scroll',
    type: 'arcane-item',
    points: 20,
    effect: 'Single use. May be used when attempting to cast a spell. Roll an extra D6 on the Casting roll and discard the lowest. If double 1 is rolled on any two dice, the spell is miscast.',
    phases: ['strategy', 'shooting'],
  },
  {
    name: 'Arcane Familiar',
    type: 'arcane-item',
    points: 15,
    effect: 'The owner knows spells from two Lores of Magic rather than one. Roll for each Lore separately. May discard one randomly generated spell and replace it with the signature spell of the same Lore.',
    phases: ['passive'],
  },
  {
    name: 'Earthing Rod',
    type: 'arcane-item',
    points: 5,
    effect: 'Single use. If the Wizard miscasts, they may re-roll the result on the Miscast table.',
    phases: ['strategy', 'shooting'],
  },

  // ─── Enchanted Items ────────────────────────────────────────────────
  {
    name: 'Wizarding Hat',
    type: 'enchanted-item',
    points: 45,
    effect: 'The wearer is a Level 1 Wizard and knows one randomly generated spell from a Lore of Magic of your choosing. The wearer also becomes subject to the Stupidity special rule.',
    phases: ['strategy', 'shooting'],
  },
  {
    name: 'Arch-Lightning Rod',
    type: 'enchanted-item',
    points: 40,
    effect: 'Single use. During the Command sub-phase, if not engaged in combat, the bearer may attempt a Leadership test (unmodified). If passed, until your next Start of Turn sub-phase enemy units cannot use the Fly (X) special rule.',
    phases: ['strategy'],
  },
  {
    name: 'Flying Carpet',
    type: 'enchanted-item',
    points: 40,
    effect: 'Regular infantry or heavy infantry only. The bearer gains Fly (8) and Swiftstride. However, the bearer cannot join a unit.',
    phases: ['movement'],
  },
  {
    name: 'Healing Potion',
    type: 'enchanted-item',
    points: 35,
    effect: 'Single use. During the Command sub-phase, the bearer can consume it. The model immediately recovers D3 lost Wounds.',
    phases: ['strategy'],
    extremely: true,
  },
  {
    name: 'Ruby Ring of Ruin',
    type: 'enchanted-item',
    points: 35,
    effect: 'The wielder can cast the Fireball spell from the Lore of Battle Magic as a Bound spell, with a Power Level of 1.',
    phases: ['shooting'],
  },
  {
    name: 'Potion of Fervour',
    type: 'enchanted-item',
    points: 30,
    effect: 'Single use. During the Command sub-phase, the bearer can consume it. Until the end of that turn, the model has a +D3 modifier to its Attacks characteristic (max 10).',
    phases: ['strategy', 'combat'],
  },
  {
    name: 'Potion of Strength',
    type: 'enchanted-item',
    points: 25,
    effect: 'Single use. During the Command sub-phase, the bearer can consume it. Until the end of that turn, the model has a +D3 modifier to its Strength characteristic (max 10).',
    phases: ['strategy', 'combat'],
    extremely: true,
  },
  {
    name: 'Becalming Orb',
    type: 'enchanted-item',
    points: 20,
    effect: 'Single use. The bearer may cast a Bound spell (Power Level 1): Hex, Casting Value 8+, Range: Self. Until your next Start of Turn sub-phase, enemy Wizards within 15" when attempting to cast must increase that spell\'s casting value by 2.',
    phases: ['strategy'],
  },
  {
    name: 'Potion of Toughness',
    type: 'enchanted-item',
    points: 20,
    effect: 'Single use. During the Command sub-phase, the bearer can consume it. Until the end of that turn, the model has a +D3 modifier to its Toughness characteristic (max 10).',
    phases: ['strategy', 'combat', 'shooting'],
    extremely: true,
  },
  {
    name: 'Potion of Speed',
    type: 'enchanted-item',
    points: 10,
    effect: 'Single use. During the Command sub-phase, the bearer can consume it. Until the end of that turn, the model has a +D3 modifier to its Initiative characteristic (max 10).',
    phases: ['strategy', 'combat'],
    extremely: true,
  },
  {
    name: 'Potion of Foolhardiness',
    type: 'enchanted-item',
    points: 5,
    effect: 'Single use. During the Command sub-phase, the bearer can consume it. Until the end of that turn, the model gains the Immune To Psychology special rule.',
    phases: ['strategy'],
    extremely: true,
  },

  // ─── Magic Standards (Banners) ──────────────────────────────────────
  {
    name: 'Banner of Iron Resolve',
    type: 'banner',
    points: 50,
    effect: 'The unit gains the Stubborn special rule.',
    phases: ['combat'],
  },
  {
    name: 'Banner of the Steadfast',
    type: 'banner',
    points: 50,
    effect: 'Infantry only. If the unit belongs to the losing side of a Combat, it can Fall Back in Good Order even if the winning side has more than twice its Unit Strength.',
    phases: ['combat'],
  },
  {
    name: 'Totem of Wrath',
    type: 'banner',
    points: 50,
    effect: 'During a turn in which the unit charged, models improve the Armour Piercing characteristic of their weapons by 1, and may re-roll any rolls To Wound of a natural 1.',
    phases: ['combat'],
  },
  {
    name: 'Razor Standard',
    type: 'banner',
    points: 40,
    effect: 'The unit gains the Armour Bane (2) special rule.',
    phases: ['combat'],
  },
  {
    name: 'Banner of Swirling Wind',
    type: 'banner',
    points: 30,
    effect: 'Any enemy model that shoots at the unit suffers an additional -1 To Hit modifier.',
    phases: ['shooting'],
  },
  {
    name: 'Rampaging Banner',
    type: 'banner',
    points: 30,
    effect: 'When the unit declares a charge, it may re-roll its Charge roll.',
    phases: ['movement'],
  },
  {
    name: 'The Blazing Banner',
    type: 'banner',
    points: 25,
    effect: 'The unit gains the Flaming Attacks special rule.',
    phases: ['combat', 'shooting'],
  },
  {
    name: "Monster Hunter's Tapestry",
    type: 'banner',
    points: 25,
    effect: 'Enemy units may not make Stomp Attacks against the unit.',
    phases: ['combat'],
  },
  {
    name: 'War Banner',
    type: 'banner',
    points: 25,
    effect: 'When calculating combat result, the unit may claim an additional +1 combat result point.',
    phases: ['combat'],
  },
]

/**
 * Look up a magic item by name (case-insensitive).
 */
export function findMagicItem(name) {
  const lower = name.toLowerCase()
  return MAGIC_ITEMS.find((item) => item.name.toLowerCase() === lower) ?? null
}

/**
 * Return all magic items relevant to a given phase ID.
 */
export function itemsForPhase(phaseId) {
  return MAGIC_ITEMS.filter((item) => item.phases.includes(phaseId))
}

/**
 * Return all magic items of a given type.
 */
export function itemsByType(type) {
  return MAGIC_ITEMS.filter((item) => item.type === type)
}
