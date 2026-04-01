/**
 * Ridden Mounts for Warhammer: The Old World.
 *
 * Each mount has:
 *   name        – canonical name
 *   m           – base movement characteristic
 *   f           – fly movement value (null if no fly)
 *   swiftstride – true if the mount has swiftstride
 *   troopType   – troop type code (LCa, HCa, MCa, MCr, Be)
 *
 * Source: https://tow.whfb.app
 */

export const MOUNTS = [
  // ─── Flying Mounts ───────────────────────────────────────────────────
  { name: 'Hippogryph', m: 7, f: 9, swiftstride: true, troopType: 'MCr' },
  { name: 'Royal Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCr' },
  { name: 'Barded Pegasus', m: 7, f: 10, swiftstride: true, troopType: 'MCa' },
  { name: 'Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa' },
  { name: 'Dark Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa' },
  { name: 'Great Eagle', m: 2, f: 10, swiftstride: true, troopType: 'MCr' },
  { name: 'Wyvern', m: 4, f: 9, swiftstride: true, troopType: 'MCr' },
  { name: 'Manticore', m: 6, f: 9, swiftstride: true, troopType: 'MCr' },
  { name: 'Griffon', m: 6, f: 9, swiftstride: true, troopType: 'MCr' },
  { name: 'Imperial Griffon', m: 6, f: 9, swiftstride: true, troopType: 'Be' },
  { name: 'Chimera', m: 6, f: 10, swiftstride: true, troopType: 'MCr' },
  { name: 'Cockatrice', m: 4, f: 10, swiftstride: true, troopType: 'MCr' },
  { name: 'Great Taurus', m: 6, f: 9, swiftstride: true, troopType: 'Be' },
  { name: 'Lammasu', m: 6, f: 9, swiftstride: true, troopType: 'MCr' },
  { name: 'Disc of Tzeentch', m: 1, f: 10, swiftstride: true, troopType: 'LCa' },
  { name: 'Black Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be' },
  { name: 'Star Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be' },
  { name: 'Sun Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be' },
  { name: 'Moon Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be' },
  { name: 'Forest Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be' },
  { name: 'Chaos Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be' },
  { name: 'Necrolith Bone Dragon', m: 6, f: 9, swiftstride: true, troopType: 'Be' },

  // ─── Non-Flying Mounts ───────────────────────────────────────────────
  { name: 'Bretonnian Warhorse', m: 8, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'Empire Warhorse', m: 8, f: null, swiftstride: true, troopType: 'LCa' },
  { name: 'Barded Warhorse', m: 7, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'Elven Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa' },
  { name: 'Barded Elven Steed', m: 8, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'Dark Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa' },
  { name: 'Cold One', m: 7, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'Chaos Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'Daemonic Mount', m: 8, f: null, swiftstride: true, troopType: 'MCa' },
  { name: 'Nightmare', m: 7, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'Skeletal Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'War Boar', m: 7, f: null, swiftstride: true, troopType: 'HCa' },
  { name: 'Giant Wolf', m: 9, f: null, swiftstride: true, troopType: 'LCa' },
  { name: 'Gigantic Spider', m: 7, f: null, swiftstride: true, troopType: 'LCa' },
  { name: 'Great Stag', m: 8, f: null, swiftstride: true, troopType: 'MCa' },
  { name: 'Demigryph', m: 7, f: null, swiftstride: true, troopType: 'MCa' },
  { name: 'Juggernaut of Khorne', m: 7, f: null, swiftstride: true, troopType: 'MCa' },
  { name: 'Steed of Slaanesh', m: 9, f: null, swiftstride: true, troopType: 'LCa' },
  { name: 'Stonehorn', m: 7, f: null, swiftstride: true, troopType: 'Be' },
  { name: 'Thundertusk', m: 6, f: null, swiftstride: true, troopType: 'Be' },
  { name: 'Palanquin of Nurgle', m: 4, f: null, swiftstride: false, troopType: 'MCa' },
]

export function findMount(name) {
  if (!name) return null
  const lower = name.toLowerCase()
  return MOUNTS.find((m) => m.name.toLowerCase() === lower) ?? null
}
