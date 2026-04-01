export const RANGED_WEAPONS = {
  // ─── Bows ────────────────────────────────────────────────────────────
  'longbow': { name: 'Longbow', range: '30"', s: '3', ap: '—', rules: 'Armour Bane (1), Volley Fire' },
  'longbows': { name: 'Longbow', range: '30"', s: '3', ap: '—', rules: 'Armour Bane (1), Volley Fire' },
  'shortbow': { name: 'Shortbow', range: '18"', s: '3', ap: '—', rules: 'Quick Shot, Volley Fire' },
  'shortbows': { name: 'Shortbow', range: '18"', s: '3', ap: '—', rules: 'Quick Shot, Volley Fire' },
  'warbow': { name: 'Warbow', range: '24"', s: 'S', ap: '—', rules: 'Volley Fire' },
  'warbows': { name: 'Warbow', range: '24"', s: 'S', ap: '—', rules: 'Volley Fire' },

  // ─── Black Powder ────────────────────────────────────────────────────
  'handgun': { name: 'Handgun', range: '24"', s: '4', ap: '-1', rules: 'Armour Bane (1), Ponderous' },
  'handguns': { name: 'Handgun', range: '24"', s: '4', ap: '-1', rules: 'Armour Bane (1), Ponderous' },
  'repeater handgun': { name: 'Repeater Handgun', range: '24"', s: '4', ap: '-1', rules: 'Armour Bane (1), Multiple Shots (3), Ponderous' },
  'repeater handguns': { name: 'Repeater Handgun', range: '24"', s: '4', ap: '-1', rules: 'Armour Bane (1), Multiple Shots (3), Ponderous' },
  'pistol': { name: 'Pistol', range: '12"', s: '4', ap: '-1', rules: 'Armour Bane (1), Quick Shot' },
  'pistols': { name: 'Pistol', range: '12"', s: '4', ap: '-1', rules: 'Armour Bane (1), Quick Shot' },
  'brace of pistols': { name: 'Brace of Pistols', range: '12"', s: '4', ap: '-1', rules: 'Armour Bane (1), Multiple Shots (2), Quick Shot' },
  'repeater pistol': { name: 'Repeater Pistol', range: '12"', s: '4', ap: '-1', rules: 'Armour Bane (1), Multiple Shots (3), Quick Shot' },
  'repeater pistols': { name: 'Repeater Pistol', range: '12"', s: '4', ap: '-1', rules: 'Armour Bane (1), Multiple Shots (3), Quick Shot' },

  // ─── Crossbows ───────────────────────────────────────────────────────
  'repeater crossbow': { name: 'Repeater Crossbow', range: '24"', s: '3', ap: '—', rules: 'Armour Bane (1), Multiple Shots (2)' },
  'repeater crossbows': { name: 'Repeater Crossbow', range: '24"', s: '3', ap: '—', rules: 'Armour Bane (1), Multiple Shots (2)' },
  'crossbow': { name: 'Crossbow', range: '30"', s: '4', ap: '—', rules: 'Armour Bane (2), Ponderous' },
  'crossbows': { name: 'Crossbow', range: '30"', s: '4', ap: '—', rules: 'Armour Bane (2), Ponderous' },
  'repeater handbow': { name: 'Repeater Handbow', range: '12"', s: '3', ap: '—', rules: 'Multiple Shots (2), Quick Shot' },
  'repeater handbows': { name: 'Repeater Handbow', range: '12"', s: '3', ap: '—', rules: 'Multiple Shots (2), Quick Shot' },
  'brace of repeater handbows': { name: 'Brace of Repeater Handbows', range: '12"', s: '3', ap: '—', rules: 'Multiple Shots (4), Quick Shot' },

  // ─── Thrown ──────────────────────────────────────────────────────────
  'javelin': { name: 'Javelin', range: '12"', s: 'S', ap: '—', rules: 'Move & Shoot, Quick Shot' },
  'javelins': { name: 'Javelin', range: '12"', s: 'S', ap: '—', rules: 'Move & Shoot, Quick Shot' },
  'sling': { name: 'Sling', range: '18"', s: '3', ap: '—', rules: 'Multiple Shots (2)' },
  'slings': { name: 'Sling', range: '18"', s: '3', ap: '—', rules: 'Multiple Shots (2)' },
  'thrown weapon': { name: 'Throwing Weapons', range: '9"', s: 'S', ap: '—', rules: 'Move & Shoot, Multiple Shots (2), Quick Shot' },
  'throwing weapons': { name: 'Throwing Weapons', range: '9"', s: 'S', ap: '—', rules: 'Move & Shoot, Multiple Shots (2), Quick Shot' },
  'throwing axe': { name: 'Throwing Axe', range: '9"', s: 'S+1', ap: '—', rules: 'Quick Shot' },
  'throwing axes': { name: 'Throwing Axe', range: '9"', s: 'S+1', ap: '—', rules: 'Quick Shot' },

  // ─── War Machines ────────────────────────────────────────────────────
  'bolt thrower': { name: 'Bolt Thrower', range: '48"', s: '—', ap: '—', rules: '' },
  'cannon': { name: 'Cannon', range: '48"', s: '—', ap: '—', rules: 'Multiple Wounds (D3)' },
  'mortar': { name: 'Mortar', range: '12"-48"', s: '—', ap: '—', rules: '' },
  'catapult': { name: 'Catapult', range: '12"-60"', s: '—', ap: '—', rules: '' },
  'trebuchet': { name: 'Trebuchet', range: '12"-60"', s: '—', ap: '—', rules: '' },
  'bombard': { name: 'Bombard', range: '48"', s: '8', ap: '-3', rules: 'Armour Bane (2), Cannon Fire, Cumbersome, Move or Shoot, Multiple Wounds (D3+1)' },

  // ─── Faction-specific Ranged ─────────────────────────────────────────
  'petrifying gaze': { name: 'Petrifying Gaze', range: '18"', s: '2', ap: '—', rules: 'Magical Attacks, Multiple Wounds (D3). Wounds vs Initiative not Toughness. No armour saves.' },
  'ravager harpoon': { name: 'Ravager Harpoon', range: '24"', s: '6', ap: '-3', rules: 'Cumbersome, Multiple Wounds (D3), Ponderous' },
  'ravager harpoons': { name: 'Ravager Harpoon', range: '24"', s: '6', ap: '-3', rules: 'Cumbersome, Multiple Wounds (D3), Ponderous' },

  // ─── Breath Weapons ──────────────────────────────────────────────────
  'pestilential breath': { name: 'Pestilential Breath', range: 'Template', s: '2', ap: '-3', rules: 'Breath Weapon' },
  'noxious breath': { name: 'Noxious Breath', range: 'Template', s: '4', ap: '—', rules: 'Breath Weapon. No armour saves. -1 WS on wounded models.' },
  'fiery breath': { name: 'Fiery Breath', range: 'Template', s: '—', ap: '—', rules: 'Breath Weapon, Flaming Attacks' },
  'dragon fire': { name: 'Dragon Fire', range: 'Template', s: '4', ap: '-1', rules: 'Breath Weapon, Flaming Attacks' },
  'soporific breath': { name: 'Soporific Breath', range: 'Template', s: '2', ap: '—', rules: 'Breath Weapon. No armour saves.' },
  'dark fire of chaos': { name: 'Dark Fire of Chaos', range: 'Template', s: '4', ap: '-1', rules: 'Breath Weapon, Flaming Attacks, Magical Attacks' },
}

export const COMBAT_WEAPONS = {
  // ─── Core Combat Weapons ─────────────────────────────────────────────
  'great weapon': { name: 'Great Weapon', s: 'S+2', ap: '-2', rules: 'Armour Bane (1), Requires Two Hands, Strike Last' },
  'great weapons': { name: 'Great Weapon', s: 'S+2', ap: '-2', rules: 'Armour Bane (1), Requires Two Hands, Strike Last' },
  'halberd': { name: 'Halberd', s: 'S+1', ap: '-1', rules: 'Armour Bane (1), Requires Two Hands. AP -2 vs charged enemies.' },
  'halberds': { name: 'Halberd', s: 'S+1', ap: '-1', rules: 'Armour Bane (1), Requires Two Hands. AP -2 vs charged enemies.' },
  'flail': { name: 'Flail', s: 'S+2', ap: '-2', rules: 'Armour Bane (1), Requires Two Hands. S and Armour Bane only vs charged enemies.' },
  'flails': { name: 'Flail', s: 'S+2', ap: '-2', rules: 'Armour Bane (1), Requires Two Hands. S and Armour Bane only vs charged enemies.' },
  'morning star': { name: 'Morning Star', s: 'S+1', ap: '-1', rules: 'Armour Bane (1). S and Armour Bane only vs charged enemies.' },
  'morning stars': { name: 'Morning Star', s: 'S+1', ap: '-1', rules: 'Armour Bane (1). S and Armour Bane only vs charged enemies.' },
  'lance': { name: 'Lance', s: 'S+2', ap: '-2', rules: 'Armour Bane (1). Cavalry/monster only, charge turn only.' },
  'lances': { name: 'Lance', s: 'S+2', ap: '-2', rules: 'Armour Bane (1). Cavalry/monster only, charge turn only.' },
  'cavalry spear': { name: 'Cavalry Spear', s: 'S+1', ap: '-1', rules: 'Fight In Extra Rank. Cavalry/monster/chariot only, charge turn only.' },
  'cavalry spears': { name: 'Cavalry Spear', s: 'S+1', ap: '-1', rules: 'Fight In Extra Rank. Cavalry/monster/chariot only, charge turn only.' },
  'thrusting spear': { name: 'Thrusting Spear', s: 'S', ap: '—', rules: 'Fight In Extra Rank. Infantry only. +1 Initiative when charged in front arc.' },
  'thrusting spears': { name: 'Thrusting Spear', s: 'S', ap: '—', rules: 'Fight In Extra Rank. Infantry only. +1 Initiative when charged in front arc.' },
  'throwing spear': { name: 'Throwing Spear', s: 'S', ap: '—', rules: 'Fight In Extra Rank. Charge turn only, use hand weapon otherwise.' },
  'throwing spears': { name: 'Throwing Spear', s: 'S', ap: '—', rules: 'Fight In Extra Rank. Charge turn only, use hand weapon otherwise.' },
  'whip': { name: 'Whip', s: 'S', ap: '—', rules: 'Fight In Extra Rank, Strike First' },
  'whips': { name: 'Whip', s: 'S', ap: '—', rules: 'Fight In Extra Rank, Strike First' },
  'additional hand weapon': { name: 'Additional Hand Weapon', s: 'S', ap: '—', rules: 'Extra Attacks (+1), Requires Two Hands' },
  'two hand weapons': { name: 'Additional Hand Weapon', s: 'S', ap: '—', rules: 'Extra Attacks (+1), Requires Two Hands' },

  // ─── Dark Elf Weapons ────────────────────────────────────────────────
  'dread halberd': { name: 'Dread Halberd', s: 'S+1', ap: '-1', rules: 'Armour Bane (1), Fight In Extra Rank, Requires Two Hands. No supporting attacks on charge turn.' },
  'dread halberds': { name: 'Dread Halberd', s: 'S+1', ap: '-1', rules: 'Armour Bane (1), Fight In Extra Rank, Requires Two Hands. No supporting attacks on charge turn.' },
  'har ganeth greatsword': { name: 'Har Ganeth Greatsword', s: 'S+2', ap: '-1', rules: 'Cleaving Blow, Requires Two Hands' },
  'har ganeth greatswords': { name: 'Har Ganeth Greatsword', s: 'S+2', ap: '-1', rules: 'Cleaving Blow, Requires Two Hands' },
  'lash & buckler': { name: 'Lash & Buckler', s: 'S', ap: '-1', rules: 'Armour Bane (1), Fight In Extra Rank, Requires Two Hands. +1 armour value.' },
  'lash and buckler': { name: 'Lash & Buckler', s: 'S', ap: '-1', rules: 'Armour Bane (1), Fight In Extra Rank, Requires Two Hands. +1 armour value.' },

  // ─── Vampire Counts Weapons ──────────────────────────────────────────
  'filth-encrusted claws': { name: 'Filth-encrusted Claws', s: 'S', ap: '-1', rules: 'Poisoned Attacks' },
  'filth-encrusted talons': { name: 'Filth-encrusted Talons', s: 'S', ap: '-1', rules: 'Armour Bane (1), Poisoned Attacks' },
  'poisonous tail': { name: 'Poisonous Tail', s: 'S', ap: '—', rules: 'Poisoned Attacks, Strike First. One attack per turn with this weapon.' },
  'rancid maw': { name: 'Rancid Maw', s: 'S', ap: '-2', rules: 'Armour Bane (1), Multiple Wounds (2). One attack per turn with this weapon.' },
  'spectral scythe': { name: 'Spectral Scythe', s: 'S', ap: '—', rules: 'Magical Attacks, Multiple Wounds (D3). No armour saves (Ward and Regeneration allowed).' },
  'wicked claws': { name: 'Wicked Claws', s: 'S', ap: '-2', rules: '' },
}

/**
 * Match a unit's equipment strings against known ranged weapons.
 * Returns the matched weapon key (normalised name from RANGED_WEAPONS) or null.
 */
export function matchWeapon(equipmentStr) {
  const lower = equipmentStr.toLowerCase()
  for (const [key, weapon] of Object.entries(RANGED_WEAPONS)) {
    if (lower.includes(key)) {
      return weapon.name
    }
  }
  return null
}
