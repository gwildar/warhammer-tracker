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
 *
 * Source: https://tow.whfb.app
 */

export const MOUNTS = [
  // ─── Flying Mounts ───────────────────────────────────────────────────
  { name: 'Hippogryph', m: 7, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null },
  { name: 'Royal Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCr', stomp: '2', impactHits: null },
  { name: 'Barded Pegasus', m: 7, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null },
  { name: 'Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null },
  { name: 'Dark Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null },
  { name: 'Great Eagle', m: 2, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null },
  { name: 'Wyvern', m: 4, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null },
  { name: 'Manticore', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null },
  { name: 'Griffon', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null },
  { name: 'Imperial Griffon', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D3+1', impactHits: null },
  { name: 'Chimera', m: 6, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null },
  { name: 'Cockatrice', m: 4, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null },
  { name: 'Great Taurus', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D3', impactHits: null },
  { name: 'Lammasu', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null },
  { name: 'Disc of Tzeentch', m: 1, f: 10, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null },
  { name: 'Black Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null },
  { name: 'Star Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6+1', impactHits: null },
  { name: 'Sun Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null },
  { name: 'Moon Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null },
  { name: 'Forest Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null },
  { name: 'Chaos Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null },
  { name: 'Necrolith Bone Dragon', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null },

  // ─── Non-Flying Mounts ───────────────────────────────────────────────
  { name: 'Bretonnian Warhorse', m: 8, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'Empire Warhorse', m: 8, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null },
  { name: 'Barded Warhorse', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'Elven Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null },
  { name: 'Barded Elven Steed', m: 8, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'Dark Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null },
  { name: 'Cold One', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'Chaos Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'Daemonic Mount', m: 8, f: null, swiftstride: true, troopType: 'MCa', stomp: '1', impactHits: null },
  { name: 'Nightmare', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'Skeletal Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'War Boar', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null },
  { name: 'Giant Wolf', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null },
  { name: 'Gigantic Spider', m: 7, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null },
  { name: 'Great Stag', m: 8, f: null, swiftstride: true, troopType: 'MCa', stomp: '1', impactHits: '1' },
  { name: 'Demigryph', m: 7, f: null, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null },
  { name: 'Juggernaut of Khorne', m: 7, f: null, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: '2' },
  { name: 'Steed of Slaanesh', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null },
  { name: 'Stonehorn', m: 7, f: null, swiftstride: true, troopType: 'Be', stomp: null, impactHits: 'D6+1' },
  { name: 'Thundertusk', m: 6, f: null, swiftstride: true, troopType: 'Be', stomp: '3', impactHits: 'D3' },
  { name: 'Palanquin of Nurgle', m: 4, f: null, swiftstride: false, troopType: 'MCa', stomp: null, impactHits: null },
]

export const TROOP_TYPE_RULES = {
  LCa: [],
  HCa: [],
  MCa: ['Fear'],
  MCr: ['Fear', 'Large Target'],
  Be: ['Terror', 'Large Target'],
}

export function findMount(name) {
  if (!name) return null
  const lower = name.toLowerCase()
  return MOUNTS.find((m) => m.name.toLowerCase() === lower) ?? null
}
