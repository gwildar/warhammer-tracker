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
 *   ws          – Weapon Skill (null if no separate attacks)
 *   s           – Strength (null if no separate attacks)
 *   i           – Initiative (null if no separate attacks)
 *   a           – Attacks (null if no separate attacks)
 *   tBonus      – Toughness bonus added to rider (0 if none)
 *   wBonus      – Wounds bonus added to rider (0 if none)
 *
 * Source: https://tow.whfb.app
 */

export const MOUNTS = [
  // ─── Flying Mounts ───────────────────────────────────────────────────
  { name: 'Hippogryph', m: 7, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws', 'serrated maw'], ws: 5, s: 5, i: 5, a: 4, tBonus: 1, wBonus: 3 },
  { name: 'Royal Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCr', stomp: '2', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 4, s: 5, i: 5, a: 3, tBonus: 1, wBonus: 1 },
  { name: 'Barded Pegasus', m: 7, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 4, i: 4, a: 2, tBonus: 0, wBonus: 1 },
  { name: 'Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 4, i: 4, a: 2, tBonus: 0, wBonus: 1 },
  { name: 'Dark Pegasus', m: 8, f: 10, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 4, i: 4, a: 3, tBonus: 0, wBonus: 1 },
  { name: 'Great Eagle', m: 2, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 5, s: 4, i: 4, a: 3, tBonus: 0, wBonus: 0 },
  { name: 'Wyvern', m: 4, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 5, s: 6, i: 3, a: 3, tBonus: 1, wBonus: 4 },
  { name: 'Manticore', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 5, s: 5, i: 5, a: 4, tBonus: 1, wBonus: 4 },
  { name: 'Griffon', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws', 'serrated maw'], ws: 5, s: 5, i: 5, a: 4, tBonus: 1, wBonus: 3 },
  { name: 'Imperial Griffon', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D3+1', impactHits: null, breath: null, weapons: ['wicked claws', 'serrated maw'], ws: 5, s: 6, i: 4, a: 4, tBonus: 1, wBonus: 4 },
  { name: 'Chimera', m: 6, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 4, s: 6, i: 3, a: 6, tBonus: 0, wBonus: 0 },
  { name: 'Cockatrice', m: 4, f: 10, swiftstride: true, troopType: 'MCr', stomp: '1', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 4, s: 4, i: 6, a: 6, tBonus: 0, wBonus: 0 },
  { name: 'Great Taurus', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 5, s: 5, i: 3, a: 3, tBonus: 0, wBonus: 4 },
  { name: 'Lammasu', m: 6, f: 9, swiftstride: true, troopType: 'MCr', stomp: 'D3', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 4, s: 5, i: 2, a: 2, tBonus: 0, wBonus: 3 },
  { name: 'Disc of Tzeentch', m: 1, f: 10, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 4, i: 4, a: 3, tBonus: 0, wBonus: 0 },
  { name: 'Black Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Noxious Breath', weapons: ['wicked claws', 'serrated maw'], ws: 6, s: 7, i: 4, a: 6, tBonus: 3, wBonus: 6 },
  { name: 'Star Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6+1', impactHits: null, breath: 'Dragon Fire', weapons: ['wicked claws', 'serrated maw'], ws: 7, s: 7, i: 2, a: 6, tBonus: 3, wBonus: 6 },
  { name: 'Sun Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Dragon Fire', weapons: ['wicked claws', 'serrated maw'], ws: 5, s: 5, i: 4, a: 4, tBonus: 2, wBonus: 4 },
  { name: 'Moon Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Dragon Fire', weapons: ['wicked claws', 'serrated maw'], ws: 6, s: 6, i: 3, a: 5, tBonus: 2, wBonus: 5 },
  { name: 'Forest Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Soporific Breath', weapons: ['wicked claws', 'serrated maw'], ws: 6, s: 7, i: 4, a: 6, tBonus: 3, wBonus: 6 },
  { name: 'Chaos Dragon', m: 6, f: 10, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: 'Dark Fire of Chaos', weapons: ['wicked claws', 'serrated maw'], ws: 6, s: 7, i: 4, a: 6, tBonus: 1, wBonus: 6 },
  { name: 'Necrolith Bone Dragon', m: 6, f: 9, swiftstride: true, troopType: 'Be', stomp: 'D6', impactHits: null, breath: null, weapons: ['wicked claws'], ws: 4, s: 6, i: 2, a: 5, tBonus: 1, wBonus: 5 },

  // ─── Lizardmen Mounts ─────────────────────────────────────────────────
  { name: 'Carnosaur', m: 7, f: null, swiftstride: true, troopType: 'Be', stomp: '2', impactHits: null, breath: null, weapons: ['slashing talons'], ws: 3, s: 7, i: 2, a: 4, tBonus: 1, wBonus: 4 },
  { name: 'Ancient Stegadon', m: 6, f: null, swiftstride: false, troopType: 'Be', stomp: 'D3+2', impactHits: 'D3+1', breath: null, weapons: ['great horns'], ws: 4, s: 6, i: 1, a: 3, tBonus: 0, wBonus: 0 },

  // ─── Non-Flying Mounts ───────────────────────────────────────────────
  { name: 'Bretonnian Warhorse', m: 8, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 3, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Empire Warhorse', m: 8, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 3, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Barded Warhorse', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 3, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Elven Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 4, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Barded Elven Steed', m: 8, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 4, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Dark Steed', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 4, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Cold One', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 4, i: 2, a: 2, tBonus: 1, wBonus: 0, armourBane: 1 },
  { name: 'Chaos Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 4, i: 3, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Daemonic Mount', m: 8, f: null, swiftstride: true, troopType: 'MCa', stomp: '1', impactHits: null, breath: null, weapons: [], ws: 4, s: 5, i: 3, a: 2, tBonus: 0, wBonus: 1 },
  { name: 'Nightmare', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 4, i: 2, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Skeletal Steed', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 2, s: 3, i: 2, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'War Boar', m: 7, f: null, swiftstride: true, troopType: 'HCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 3, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Giant Wolf', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 3, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Gigantic Spider', m: 7, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 4, s: 4, i: 4, a: 3, tBonus: 0, wBonus: 1 },
  { name: 'Great Stag', m: 8, f: null, swiftstride: true, troopType: 'MCa', stomp: '1', impactHits: '1', breath: null, weapons: ['mighty antlers'], ws: 4, s: 5, i: 4, a: 2, tBonus: 1, wBonus: 1 },
  { name: 'Demigryph', m: 7, f: null, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: ['wicked claws'], ws: 4, s: 5, i: 4, a: 3, tBonus: 0, wBonus: 1 },
  { name: 'Juggernaut of Khorne', m: 7, f: null, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: '2', breath: null, weapons: [], ws: 4, s: 5, i: 2, a: 2, tBonus: 1, wBonus: 1 },
  { name: 'Steed of Slaanesh', m: 9, f: null, swiftstride: true, troopType: 'LCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 5, a: 1, tBonus: 0, wBonus: 0 },
  { name: 'Stonehorn', m: 7, f: null, swiftstride: true, troopType: 'Be', stomp: null, impactHits: 'D6+1', breath: null, weapons: [], ws: 3, s: 6, i: 2, a: 4, tBonus: 1, wBonus: 4 },
  { name: 'Thundertusk', m: 6, f: null, swiftstride: true, troopType: 'Be', stomp: '3', impactHits: 'D3', breath: null, weapons: [], ws: 3, s: 6, i: 2, a: 4, tBonus: 1, wBonus: 4 },
  { name: 'Palanquin of Nurgle', m: 4, f: null, swiftstride: false, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 3, s: 3, i: 3, a: null, tBonus: 0, wBonus: 4 },

  // ─── Named / Unique Mounts ──────────────────────────────────────────
  { name: 'Ariandir', m: 10, f: null, swiftstride: true, troopType: 'MCa', stomp: null, impactHits: null, breath: null, weapons: [], ws: 4, s: 4, i: 5, a: 2, tBonus: 0, wBonus: 0, armourBane: 2 },
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
