/**
 * Ridden Mounts for Warhammer: The Old World.
 *
 * Each mount has:
 *   name        – canonical name
 *   m           – base movement characteristic
 *   f           – fly movement value (null if no fly)
 *   swiftstride – true if the mount has swiftstride
 *   troopType   – troop type code (LCa, HCa, MCa, MCr, Be)
 *   stomp       – Stomp Attacks value (null if none)
 *   impactHits  – Impact Hits value (null if none)
 *   breath      – breath weapon name (null if none)
 *   weapons     – combat weapon names matching COMBAT_WEAPONS keys (empty if none)
 *
 * Source: https://tow.whfb.app
 */

export const MOUNTS = [
  // ─── Flying Mounts ───────────────────────────────────────────────────
  { name: 'Hippogryph', m: 7, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Royal Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCr', stomp: '2', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Barded Pegasus', m: 7, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Dark Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Great Eagle', m: 2, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Wyvern', m: 4, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Manticore', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Griffon', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Imperial Griffon', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D3+1', impactHits: null, breath: null, weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Chimera', m: 6, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Cockatrice', m: 4, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Great Taurus', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Lammasu', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Disc of Tzeentch', m: 1, f: 10, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Black Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Noxious Breath', weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Star Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6+1', impactHits: null, breath: 'Dragon Fire', weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Sun Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Dragon Fire', weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Moon Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Dragon Fire', weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Forest Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Soporific Breath', weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Chaos Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Dark Fire of Chaos', weapons: ['wicked claws', 'serrated maw'] },
  { name: 'Necrolith Bone Dragon', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: null, weapons: ['wicked claws'] },

  // ─── Non-Flying Mounts ───────────────────────────────────────────────
  { name: 'Bretonnian Warhorse', m: 8, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Empire Warhorse', m: 8, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Barded Warhorse', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Elven Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Barded Elven Steed', m: 8, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Dark Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Cold One', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Chaos Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Daemonic Mount', m: 8, f: null, swiftstride: true, troopType: 'MCa', stomp: '1', impactHits: null, breath: null, weapons: [] },
  { name: 'Nightmare', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Skeletal Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'War Boar', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Giant Wolf', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Gigantic Spider', m: 7, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Great Stag', m: 8, f: null, swiftstride: true, troopType: 'MCa', stomp: '1', impactHits: '1', breath: null, weapons: ['mighty antlers'] },
  { name: 'Demigryph', m: 7, f: null, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: ['wicked claws'] },
  { name: 'Juggernaut of Khorne', m: 7, f: null, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: '2', breath: null, weapons: [] },
  { name: 'Steed of Slaanesh', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [] },
  { name: 'Stonehorn', m: 7, f: null, swiftstride: true, troopType: 'Be', stomp: null, impactHits: 'D6+1', breath: null, weapons: [] },
  { name: 'Thundertusk', m: 6, f: null, swiftstride: true, troopType: 'Be', stomp: '3', impactHits: 'D3', breath: null, weapons: [] },
  { name: 'Palanquin of Nurgle', m: 4, f: null, swiftstride: false, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [] },
]

export const TROOP_TYPE_RULES = {
  LCa: [],
  HCa: [],
  MCa: ['Fear'],
  MCr: ['Fear', 'Large Target'],
  Be: ['Terror', 'Large Target', 'Lumbering'],
}

export function findMount(name) {
  if (!name) return null
  const lower = name.toLowerCase()
  return MOUNTS.find((m) => m.name.toLowerCase() === lower) ?? null
}
