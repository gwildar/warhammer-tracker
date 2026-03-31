export const RANGED_WEAPONS = {
  'repeater crossbow': { name: 'Repeater Crossbow', range: '24"', rules: 'Armour Piercing (-1), Multiple Shots (2)' },
  'repeater crossbows': { name: 'Repeater Crossbow', range: '24"', rules: 'Armour Piercing (-1), Multiple Shots (2)' },
  'crossbow': { name: 'Crossbow', range: '30"', rules: 'Armour Piercing (-1)' },
  'crossbows': { name: 'Crossbow', range: '30"', rules: 'Armour Piercing (-1)' },
  'bow': { name: 'Bow', range: '24"', rules: '' },
  'bows': { name: 'Bow', range: '24"', rules: '' },
  'longbow': { name: 'Longbow', range: '30"', rules: '' },
  'longbows': { name: 'Longbow', range: '30"', rules: '' },
  'shortbow': { name: 'Shortbow', range: '18"', rules: '' },
  'shortbows': { name: 'Shortbow', range: '18"', rules: '' },
  'handgun': { name: 'Handgun', range: '24"', rules: 'Armour Piercing (-2), Move or Shoot' },
  'handguns': { name: 'Handgun', range: '24"', rules: 'Armour Piercing (-2), Move or Shoot' },
  'pistol': { name: 'Pistol', range: '12"', rules: 'Armour Piercing (-1), Quick Shot' },
  'pistols': { name: 'Pistol', range: '12"', rules: 'Armour Piercing (-1), Quick Shot' },
  'brace of pistols': { name: 'Brace of Pistols', range: '12"', rules: 'Armour Piercing (-1), Multiple Shots (2), Quick Shot' },
  'javelin': { name: 'Javelin', range: '12"', rules: 'Quick Shot, Move & Shoot' },
  'javelins': { name: 'Javelin', range: '12"', rules: 'Quick Shot, Move & Shoot' },
  'sling': { name: 'Sling', range: '18"', rules: 'Multiple Shots (2)' },
  'slings': { name: 'Sling', range: '18"', rules: 'Multiple Shots (2)' },
  'throwing weapon': { name: 'Throwing Weapons', range: '6"', rules: 'Quick Shot, Move & Shoot' },
  'throwing weapons': { name: 'Throwing Weapons', range: '6"', rules: 'Quick Shot, Move & Shoot' },
  'bolt thrower': { name: 'Bolt Thrower', range: '48"', rules: 'Armour Piercing (-2)' },
  'cannon': { name: 'Cannon', range: '48"', rules: 'Armour Piercing (-3), Multiple Wounds (D3)' },
  'mortar': { name: 'Mortar', range: '12"-48"', rules: 'Armour Piercing (-1)' },
  'catapult': { name: 'Catapult', range: '12"-60"', rules: 'Multiple Wounds (D3)' },
  'trebuchet': { name: 'Trebuchet', range: '12"-60"', rules: 'Multiple Wounds (D6)' },
  'repeater handbow': { name: 'Repeater Handbow', range: '12"', rules: 'Armour Piercing (-1), Multiple Shots (2), Quick Shot' },
  'repeater handbows': { name: 'Repeater Handbow', range: '12"', rules: 'Armour Piercing (-1), Multiple Shots (2), Quick Shot' },
  'brace of repeater handbows': { name: 'Brace of Repeater Handbows', range: '12"', rules: 'Armour Piercing (-1), Multiple Shots (4), Quick Shot' },
  'rifle': { name: 'Rifle', range: '30"', rules: 'Armour Piercing (-2), Move or Shoot' },
  'rifles': { name: 'Rifle', range: '30"', rules: 'Armour Piercing (-2), Move or Shoot' },
  'gun': { name: 'Gun', range: '24"', rules: 'Armour Piercing (-1)' },
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
