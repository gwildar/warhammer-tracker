export const RANGED_WEAPONS = {
  'repeater crossbow': { name: 'Repeater Crossbow', range: '24"', rules: 'Armour Bane (1), Multiple Shots (2)' },
  'repeater crossbows': { name: 'Repeater Crossbow', range: '24"', rules: 'Armour Bane (1), Multiple Shots (2)' },
  'crossbow': { name: 'Crossbow', range: '30"', rules: 'Armour Bane (-2), Ponderous' },
  'crossbows': { name: 'Crossbow', range: '30"', rules: 'Armour Bane (-2), Ponderous' },
  'warbow': { name: 'Warbow', range: '24"', rules: 'Volley Fire' },
  'warbows': { name: 'Warbow', range: '24"', rules: 'Volley Fire' },
  'longbow': { name: 'Longbow', range: '30"', rules: 'Armour Bane (1), Volley Fire' },
  'longbows': { name: 'Longbow', range: '30"', rules: 'Armour Bane (1), Volley Fire' },
  'shortbow': { name: 'Shortbow', range: '18"', rules: 'Quick Shot, Volley Fire' },
  'shortbows': { name: 'Shortbow', range: '18"', rules: 'Quick Shot, Volley Fire' },
  'handgun': { name: 'Handgun', range: '24"', rules: 'Armour Bane (-1), Ponderous' },
  'handguns': { name: 'Handgun', range: '24"', rules: 'Armour Bane (-1), Ponderous' },
  'repeater handgun': { name: 'Repeater Handgun', range: '24"', rules: 'Armour Bane (1), Multiple Shots (3), Ponderous' },
  'repeater handguns': { name: 'Handgun', range: '24"', rules: 'Armour Bane (1), Multiple Shots (3), Ponderous' },
  'pistol': { name: 'Pistol', range: '12"', rules: 'Armour Bane (-1),, Quick Shot' },
  'pistols': { name: 'Pistol', range: '12"', rules: 'Armour Bane (-1), Quick Shot' },
  'brace of pistols': { name: 'Brace of Pistols', range: '12"', rules: 'Armour Bane (-1), Multiple Shots (2), Quick Shot' },
  'javelin': { name: 'Javelin', range: '12"', rules: 'Quick Shot, Move & Shoot' },
  'javelins': { name: 'Javelin', range: '12"', rules: 'Quick Shot, Move & Shoot' },
  'sling': { name: 'Sling', range: '18"', rules: 'Multiple Shots (2)' },
  'slings': { name: 'Sling', range: '18"', rules: 'Multiple Shots (2)' },
  'thrown weapon': { name: 'Throwing Weapons', range: '9"', rules: 'Quick Shot, Move & Shoot, Multiple Shots (2)' },
  'throwing weapons': { name: 'Throwing Weapons', range: '9"', rules: 'Quick Shot, Move & Shoot, Multiple Shots (2)' },
  'bolt thrower': { name: 'Bolt Thrower', range: '48"', rules: '' },
  'cannon': { name: 'Cannon', range: '48"', rules: 'Multiple Wounds (D3)' },
  'mortar': { name: 'Mortar', range: '12"-48"', rules: '' },
  'catapult': { name: 'Catapult', range: '12"-60"', rules: '' },
  'trebuchet': { name: 'Trebuchet', range: '12"-60"', rules: '' },
  'repeater handbow': { name: 'Repeater Handbow', range: '12"', rules: 'Multiple Shots (2), Quick Shot' },
  'repeater handbows': { name: 'Repeater Handbow', range: '12"', rules: 'Multiple Shots (2), Quick Shot' },
  'brace of repeater handbows': { name: 'Brace of Repeater Handbows', range: '12"', rules: 'Multiple Shots (4), Quick Shot' },
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
