import { COMBAT_WEAPONS } from '../data/weapons.js'
import { findMount } from '../data/mounts.js'
import { MAGIC_ITEMS } from '../data/magic-items.js'
import { SPECIAL_RULES } from '../data/special-rules.js'
import { parseUnitRules, normaliseRuleName } from '../helpers.js'

const ARMOUR_BASE = {
  'light armour': 6,
  'heavy armour': 5,
  'full plate armour': 4,
  'full plate': 4,
  'chaos armour': 4,
  'gromril armour': 4,
}

// Build a lookup from magic item name (lowercase) → item data
const MAGIC_ITEM_MAP = {}
for (const item of MAGIC_ITEMS) {
  MAGIC_ITEM_MAP[item.name.toLowerCase()] = item
}

// Single-use defensive items worth calling out in combat
const SINGLE_USE_ITEMS = {}
for (const item of MAGIC_ITEMS) {
  if ((item.type === 'armour' || item.type === 'talisman') && item.effect?.toLowerCase().includes('single use')) {
    SINGLE_USE_ITEMS[item.name.toLowerCase()] = item
  }
}

function normaliseItemName(name) {
  return name.replace(/\s*\(.*$/, '').toLowerCase().replace(/\*$/, '')
}

// Items whose effect is fully represented by MR on the header
const MR_ITEM_NAMES = new Set(
  MAGIC_ITEMS.filter(i => i.mr && !i.ward && !i.regen && !i.armourBase && !i.armourMod)
    .map(i => i.name.toLowerCase())
)

const HAND_WEAPON = { name: 'Hand Weapon', s: 'S', ap: '—', rules: '' }

// Build lookup for special rules that modify armour save
const ARMOUR_MOD_RULES = {}
for (const rule of SPECIAL_RULES) {
  if (rule.armourMod) {
    ARMOUR_MOD_RULES[rule.id] = rule.armourMod
    if (rule.aliases) {
      for (const alias of rule.aliases) {
        ARMOUR_MOD_RULES[alias.toLowerCase()] = rule.armourMod
      }
    }
  }
}

function calculateArmourSave(unit) {
  let best = null
  let mod = 0

  // Base armour from armour list — strip (Scaly skin), *, etc. before matching
  for (const a of unit.armour) {
    for (const part of a.split(',').map(s => s.trim().toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/\*$/, '').trim())) {
      if (ARMOUR_BASE[part] !== undefined) {
        const val = ARMOUR_BASE[part]
        if (best === null || val < best) best = val
      }
    }
  }

  // Magic item armour (base or modifier)
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
    if (!mi) continue
    if (mi.armourBase !== undefined) {
      if (best === null || mi.armourBase < best) best = mi.armourBase
    }
    if (mi.armourMod !== undefined) {
      mod += mi.armourMod
    }
  }

  // Armoured Hide stacks with armour as a modifier; without armour it gives a base save of 7-X
  const armouredHide = detectArmouredHide(unit)
  if (armouredHide > 0) {
    if (best === null) {
      best = 7 - armouredHide
    } else {
      best -= armouredHide
    }
  }

  // Natural armour save from unit profile (e.g. Bastiladon 3+, Stegadon 4+)
  const naturalAS = unit.stats?.[0]?.AS
  if (naturalAS) {
    const val = parseInt(naturalAS)
    if (best === null || val < best) best = val
  }

  // Shield, barding, and modifiers only apply to the rider's own armour
  if (best !== null) {
    const allGear = [...unit.equipment, ...unit.armour].map(g => g.toLowerCase())
    const hasMundaneShield = allGear.some(g => g.split(',').some(p => p.trim() === 'shield' || p.trim() === 'shields'))
    const hasMagicShield = unit.magicItems.some(itemName => {
      const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
      return mi?.type === 'armour' && mi.effect?.startsWith('Shield.')
    })
    const hasShield = hasMundaneShield || hasMagicShield
    if (hasShield) best -= 1
    if (unit.hasBarding) best -= 1
    // Apply armour modifiers from special rules (e.g. Lion Cloak)
    if (unit.specialRules) {
      const rules = parseUnitRules(unit.specialRules)
      for (const rule of rules) {
        const normId = normaliseRuleName(rule).toLowerCase()
        if (ARMOUR_MOD_RULES[normId]) best += ARMOUR_MOD_RULES[normId]
      }
    }
    best += mod
  }

  // Ridden monster mount's natural armour save — use if better than rider's
  if (unit.mount) {
    const mount = findMount(unit.mount)
    if (mount?.as) {
      if (best === null || mount.as < best) best = mount.as
    }
  }

  if (best === null) return null
  if (best < 2) best = 2

  return `${best}+`
}

function detectWard(unit) {
  // Check magic items
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
    if (mi?.ward) return mi.ward
  }
  // Check special rules for Blessings of the Lady
  if (unit.specialRules?.toLowerCase().includes('blessings of the lady')) {
    return '6+ (5+ vs S5+)'
  }
  return null
}

function detectRegen(unit) {
  // Check magic items
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
    if (mi?.regen) return mi.regen
  }
  // Check special rules for Regeneration
  const regenMatch = unit.specialRules?.match(/Regeneration\s*\((\d\+)\)/i)
  if (regenMatch) return regenMatch[1]
  return null
}


function findMagicWeapon(unit) {
  // Check unit's magic items for a combat magic weapon with s/ap fields
  for (const itemName of unit.magicItems) {
    // Skip champion weapons (handled separately)
    if (itemName.includes('(champion)') || itemName.includes('(Champion)')) continue
    const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
    if (mi?.type === 'weapon' && mi.s && mi.phases?.includes('combat')) {
      return {
        name: mi.name,
        s: mi.s,
        ap: mi.ap || '—',
        rules: mi.effect || '',
        attacks: mi.attacks || null,
      }
    }
  }
  return null
}

function matchRiderWeapons(unit) {
  const weapons = []
  const matched = new Set()

  // Magic weapon replaces mundane weapons
  const magicWeapon = findMagicWeapon(unit)
  if (magicWeapon) {
    weapons.push(magicWeapon)
    matched.add(magicWeapon.name)
    return { weapons, matched }
  }

  const parts = unit.equipment.flatMap(g => g.split(',').map(s => s.trim()))
  for (const part of parts) {
    const lower = part.toLowerCase()
    for (const [key, weapon] of Object.entries(COMBAT_WEAPONS)) {
      if (lower.includes(key) && !matched.has(weapon.name)) {
        matched.add(weapon.name)
        weapons.push(weapon)
      }
    }
  }

  return { weapons, matched }
}

function matchMountWeapons(unit, alreadyMatched) {
  const weapons = []
  if (!unit.mount) return weapons

  const mount = findMount(unit.mount)
  if (!mount?.weapons) return weapons

  for (const wKey of mount.weapons) {
    const weapon = COMBAT_WEAPONS[wKey]
    if (weapon && !alreadyMatched.has(weapon.name)) {
      alreadyMatched.add(weapon.name)
      weapons.push(weapon)
    }
  }

  return weapons
}

function renderMountWeapons(weapons, mountA, mountS, mountI, mountWS) {
  if (weapons.length === 0) return ''
  const totalA = parseInt(mountA) || 0
  const reserved = weapons.filter(w => w.reservedAttacks)
  const remaining = weapons.filter(w => !w.reservedAttacks)
  const reservedCount = reserved.reduce((sum, w) => sum + w.reservedAttacks, 0)
  const freeA = Math.max(totalA - reservedCount, 0)

  return [...remaining.map(w =>
    renderWeaponLine(mountI, mountWS, mountS, remaining.length === 1 ? freeA : '?', w, null, buildMountWeaponTags(w))
  ), ...reserved.map(w =>
    renderWeaponLine(mountI, mountWS, mountS, w.reservedAttacks, w, null, buildMountWeaponTags(w))
  )].join('')
}

function mergeStrength(baseS, weaponS) {
  if (!weaponS) return `${baseS}`
  if (weaponS === 'S') return `${baseS}`
  const mod = weaponS.match(/^S([+-]\d+)$/)
  if (mod) return `${baseS}${mod[1]}`
  return weaponS
}

// Rules already represented visually (tags, stats) — stripped from the rules text line
const REDUNDANT_RULE_PATTERNS = [
  { pattern: /,?\s*Extra Attacks\s*\([^)]*\)/i, condition: w => w.attacks },
  { pattern: /,?\s*Magical Attacks/i },
]

function stripRedundantRules(rules, w) {
  if (!rules) return ''
  let cleaned = rules
  for (const { pattern, condition } of REDUNDANT_RULE_PATTERNS) {
    if (!condition || condition(w)) cleaned = cleaned.replace(pattern, '')
  }
  return cleaned.replace(/^[,.\s]+/, '').replace(/[,.\s]+$/, '').trim()
}

function renderWeaponLine(initiative, ws, s, attacks, w, label, tags) {
  const displayS = mergeStrength(s, w.s)
  const displayA = w.attacks ? `${attacks}${w.attacks}` : attacks
  const displayRules = stripRedundantRules(w.rules, w)
  return `<div class="text-xs mb-1">
    <span class="text-wh-phase-combat font-mono">I${initiative}</span>
    <span class="text-wh-phase-combat font-mono ml-1">A${displayA}</span>
    <span class="text-wh-muted font-mono ml-1">WS${ws}</span>
    <span class="text-wh-muted font-mono ml-1">S${displayS}</span>
    ${label ? `<span class="text-wh-accent text-xs ml-1">${label}</span>` : ''}
    <span class="text-wh-text ml-1">${w.name}</span>
    ${w.ap && w.ap !== '—' ? `<span class="text-wh-muted font-mono ml-1">AP${w.ap}</span>` : ''}
    ${tags || ''}
    ${displayRules ? `<div class="text-wh-muted">${displayRules}</div>` : ''}
  </div>`
}

function detectSingleUseItems(unit) {
  const items = []
  for (const itemName of unit.magicItems) {
    const mi = SINGLE_USE_ITEMS[normaliseItemName(itemName)]
    if (mi) items.push(mi)
  }
  return items
}

function hasRiderMagicalAttacks(unit) {
  for (const itemName of unit.magicItems) {
    // Champion items only apply to the champion, not the unit
    if (itemName.includes('(champion)') || itemName.includes('(Champion)')) continue
    const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
    if (mi?.type === 'weapon' && mi.phases?.includes('combat')) return true
    if (mi?.type !== 'weapon' && mi?.effect?.includes('Magical Attacks')) return true
  }
  // Special rules or equipment
  if (unit.specialRules?.includes('Magical Attacks')) return true
  // Grail Vow grants Magical Attacks to rider
  const allText = [unit.specialRules || '', ...unit.equipment].join(',').toLowerCase()
  if (allText.includes('grail vow')) return true
  return false
}

function hasFuriousCharge(unit) {
  const allText = [unit.specialRules || '', ...unit.equipment].join(',').toLowerCase()
  return allText.includes('furious charge')
}

const RANGED_WEAPON_NAMES = ['javelin', 'bow', 'crossbow', 'handgun', 'pistol', 'sling', 'throwing', 'bolt thrower', 'cannon', 'mortar', 'catapult', 'harpoon', 'breath']

function hasPoisonedAttacks(unit) {
  if (!unit.specialRules) return false
  const match = unit.specialRules.match(/Poisoned Attacks(?:\s*\(([^)]+)\))?/i)
  if (!match) return false
  if (!match[1]) return true
  // Conditional — skip if it's a ranged weapon qualifier
  const qualifier = match[1].toLowerCase()
  return !RANGED_WEAPON_NAMES.some(w => qualifier.includes(w))
}

function detectItemBonuses(unit) {
  let armourBane = 0
  const strengthMods = []
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
    if (mi?.armourBane) armourBane += mi.armourBane
    if (mi?.strengthMod) strengthMods.push(mi.strengthMod)
  }
  return { armourBane, strengthMods }
}

function buildRiderTags(unit) {
  const tags = []
  if (hasRiderMagicalAttacks(unit)) tags.push('<span class="text-wh-phase-combat font-mono ml-1">\u2728 Magical</span>')
  if (hasFuriousCharge(unit)) tags.push('<span class="text-wh-phase-combat font-mono ml-1">\u{1F4A5} +1A furious</span>')
  if (hasPoisonedAttacks(unit)) tags.push('<span class="text-wh-phase-combat font-mono ml-1">\u2620\uFE0F Poison</span>')
  const { armourBane, strengthMods } = detectItemBonuses(unit)
  if (armourBane > 0) tags.push(`<span class="text-wh-phase-combat font-mono ml-1">AB(${armourBane})</span>`)
  for (const sm of strengthMods) tags.push(`<span class="text-wh-phase-combat font-mono ml-1">S${sm}</span>`)
  return tags.join('')
}

function isWeaponMagical(w) {
  return w.rules?.includes('Magical Attacks') || false
}

function buildMountWeaponTags(w) {
  if (isWeaponMagical(w)) return '<span class="text-wh-phase-combat font-mono ml-1">\u2728 Magical</span>'
  return ''
}

const COMBAT_VOWS = ['the grail vow', 'the questing vow']

function buildItemNames(unit) {
  const names = unit.magicItems.map(n => n.replace(/\*$/, ''))
  const parts = [...unit.equipment, ...(unit.specialRules ? unit.specialRules.split(',') : [])].flatMap(e => e.split(',').map(s => s.trim()))
  for (const part of parts) {
    if (COMBAT_VOWS.includes(part.toLowerCase()) && !names.some(n => n.toLowerCase() === part.toLowerCase())) {
      names.push(part)
    }
  }
  return names
}

function findChampion(unit) {
  if (!unit.stats || unit.stats.length < 2) return null
  // Champion is a non-mount stat line (T is a real number, not "-" or "(+N)")
  for (let idx = 1; idx < unit.stats.length; idx++) {
    const s = unit.stats[idx]
    if (s.Ld !== '-' && s.T !== '-' && !s.T?.startsWith('(+')) {
      return s
    }
  }
  return null
}

function getChampionWeapons(unit) {
  // Check if champion has a magic weapon from command group items
  // Format in magicItems: "Spelleater Axe (Dread Knight (champion))"
  for (const itemName of unit.magicItems) {
    if (!itemName.includes('(champion)')) continue
    const baseName = itemName.replace(/\s*\(.*$/, '')
    const mi = MAGIC_ITEM_MAP[normaliseItemName(baseName)]
    if (mi?.type === 'weapon') {
      return [{
        name: mi.name,
        s: mi.s || 'S',
        ap: mi.ap || '—',
        rules: mi.effect || '',
        attacks: mi.attacks || null,
      }]
    }
  }
  return null
}

function findCrewProfiles(unit) {
  if (!unit.stats?.[0]?.crewed || unit.stats.length < 2) return []
  return unit.stats.slice(1).filter(s => s.A && s.A !== '-')
}

function findEmbeddedMount(unit) {
  if (!unit.stats || unit.stats.length < 2) return null
  // Look for a mount profile: T is "-" or "(+N)", Ld is "-", not the first line
  for (let idx = 1; idx < unit.stats.length; idx++) {
    const s = unit.stats[idx]
    if (s.Ld === '-' && (s.T === '-' || s.T?.startsWith('(+'))) {
      // Try to match name against known mounts, stripping "(xN)" suffixes
      const cleanName = s.Name.replace(/\s*\(x?\d+\)$/i, '').trim()
      const mount = findMount(cleanName) || findMount(s.Name)
      return { statLine: s, mountData: mount }
    }
  }
  return null
}

const COMBAT_RELEVANT_RULES = [
  'armour bane', 'beguiling aura', 'killing blow',
  'poisoned attacks', 'flaming attacks', 'immune to psychology',
  'stubborn', 'unbreakable', 'frenzy', 'hatred', 'eternal hatred',
  'first charge', 'counter charge',
  'cleaving blow', 'multiple wounds', 'shield of the lady',
  'aura of the lady', 'living saints', 'murderous',
  'elven reflexes', 'mighty constitution', 'valour of ages'
]

function extractCombatRules(unit) {
  if (!unit.specialRules) return []
  const parts = unit.specialRules.split(',').map(s => s.trim()).filter(Boolean)
  const results = []
  for (const rule of parts) {
    const lower = rule.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/\s*\{[^}]*\}/g, '').trim()
    if (COMBAT_RELEVANT_RULES.some(cr => lower.includes(cr))) {
      // Clean: strip {renegade} etc, keep (X) params
      results.push(rule.replace(/\s*\{[^}]*\}/g, '').trim())
    }
  }
  return results
}

function detectMagicResistance(unit) {
  let total = 0
  // From special rules
  const match = unit.specialRules?.match(/Magic Resistance\s*\((-?\d+)\)/i)
  if (match) total += parseInt(match[1])
  // From magic items
  for (const itemName of unit.magicItems) {
    const mi = MAGIC_ITEM_MAP[normaliseItemName(itemName)]
    if (mi?.mr) total += mi.mr
  }
  return total !== 0 ? `${total}` : null
}

function detectArmouredHide(unit) {
  if (!unit.specialRules) return 0
  const match = unit.specialRules.match(/Armoured Hide\s*\((\d+)\)/i)
  return match ? parseInt(match[1]) : 0
}

function detectStompFromRules(unit) {
  if (!unit.specialRules) return null
  const match = unit.specialRules.match(/Stomp Attacks\s*\(([^)]+)\)/i)
  return match ? match[1] : null
}

function detectImpactHitsFromRules(unit) {
  if (!unit.specialRules) return null
  const match = unit.specialRules.match(/Impact Hits\s*\(([^)]+)\)/i)
  return match ? match[1] : null
}

export function renderCombatWeaponsContext(army) {
  if (army.units.length === 0) return ''

  const entries = []

  for (const u of army.units) {
    const stats = u.stats?.[0]
    if (!stats) {
      const suItems = detectSingleUseItems(u)
      const suNames = new Set(suItems.map(i => i.name.toLowerCase()))
      entries.push({
        unitName: u.name, strength: u.strength, mount: null,
        riderI: '?', riderWS: '?', riderS: '?', t: '?', w: '?',
        as: calculateArmourSave(u), mr: detectMagicResistance(u), ward: detectWard(u), regen: detectRegen(u), iNum: 0,
        riderWeapons: [HAND_WEAPON], riderA: '?',
        mountWeapons: [], mountA: null, mountS: null, mountI: null, mountWS: null, mountName: null,
        stomp: detectStompFromRules(u),
        impactHits: detectImpactHitsFromRules(u),
        singleUseItems: suItems,
        itemNames: buildItemNames(u).filter(n => {
          if (suNames.has(n.toLowerCase()) || MR_ITEM_NAMES.has(n.toLowerCase())) return false
          const mi = MAGIC_ITEM_MAP[normaliseItemName(n)]
          if (mi?.type === 'weapon' && mi.phases && !mi.phases.includes('combat')) return false
          return true
        }),
        riderTags: buildRiderTags(u),
        combatRules: extractCombatRules(u),
        crew: [],
      })
      continue
    }

    const mount = u.mount ? findMount(u.mount) : null
    const isRiddenMonster = mount && mount.wBonus > 0

    // Check for embedded mount profile in unit stats (e.g. Knights Errant, Pegasus Knights)
    // Skip for crewed units — their creature weapons come from stat line weapons field
    const embedded = !isRiddenMonster && !stats.crewed ? findEmbeddedMount(u) : null
    const hasEmbeddedMount = embedded && (embedded.statLine.A && embedded.statLine.A !== '-')

    // Check for champion profile (non-character units only)
    const champion = u.category !== 'characters' ? findChampion(u) : null
    const championWeapons = champion ? getChampionWeapons(u) : null

    // Check for crew profiles (crewed units like chariots)
    const crew = findCrewProfiles(u)

    const baseT = parseInt(stats.T) || 0
    const baseW = parseInt(stats.W) || 0

    const { weapons: riderWeapons, matched } = matchRiderWeapons(u)
    let mountWeapons = matchMountWeapons(u, matched)

    // For embedded mounts, get weapons from the mount data if available
    if (hasEmbeddedMount && mountWeapons.length === 0 && embedded.mountData?.weapons) {
      for (const wKey of embedded.mountData.weapons) {
        const weapon = COMBAT_WEAPONS[wKey]
        if (weapon && !matched.has(weapon.name)) {
          matched.add(weapon.name)
          mountWeapons.push(weapon)
        }
      }
    }

    // For crewed units with weapons on stat lines, remove those from riderWeapons (they belong to creatures)
    if (stats.crewed) {
      const crewWeaponNames = new Set()
      if (stats.weapons) stats.weapons.forEach(wKey => { const w = COMBAT_WEAPONS[wKey]; if (w) crewWeaponNames.add(w.name) })
      for (const c of crew) {
        if (c.weapons) c.weapons.forEach(wKey => { const w = COMBAT_WEAPONS[wKey]; if (w) crewWeaponNames.add(w.name) })
      }
      if (crewWeaponNames.size > 0) {
        const filtered = riderWeapons.filter(w => !crewWeaponNames.has(w.name))
        riderWeapons.length = 0
        riderWeapons.push(...filtered)
      }
    }

    // Crewed units with weapons on stats[0] have no rider — mount is in crew array
    if (stats.crewed && stats.weapons) riderWeapons.length = 0

    // Default to hand weapon if no combat weapons matched
    if (riderWeapons.length === 0 && !(stats.crewed && stats.weapons)) riderWeapons.push(HAND_WEAPON)

    const riderI = stats.I || '?'
    const riderWS = stats.WS || '?'
    const riderS = stats.S || '?'

    let mountI = null, mountWS = null, mountA = null, mountS = null, mountName = null, mountStomp = null, mountArmourBane = null

    if (isRiddenMonster) {
      mountI = mount.i
      mountWS = mount.ws
      mountA = mount.a
      mountS = mount.s
      mountName = u.mount
      mountStomp = mount.stomp
      mountArmourBane = mount.armourBane || null
    } else if (mount && mount.a) {
      // Mount exists but doesn't grant T/W (e.g. howdah mounts like Ancient Stegadon)
      mountI = mount.i
      mountWS = mount.ws
      mountA = mount.a
      mountS = mount.s
      mountName = u.mount
      mountStomp = mount.stomp
      mountArmourBane = mount.armourBane || null
    } else if (stats.crewed && stats.A && stats.A !== '-' && !stats.weapons) {
      // Crewed unit without explicit weapons: stats[0] is the mount/vehicle itself
      mountI = parseInt(stats.I) || null
      mountWS = parseInt(stats.WS) || null
      mountA = parseInt(stats.A) || stats.A
      mountS = parseInt(stats.S) || stats.S
      mountName = stats.Name
      const cleanName = stats.Name.replace(/\s*\(x?\d+\)$/i, '').trim()
      const crewedMount = findMount(cleanName)
      mountStomp = crewedMount?.stomp || null
      mountArmourBane = crewedMount?.armourBane || null
    } else if (hasEmbeddedMount) {
      const es = embedded.statLine
      mountI = parseInt(es.I) || null
      mountWS = parseInt(es.WS) || null
      mountA = parseInt(es.A) || es.A
      mountS = parseInt(es.S) || es.S
      mountName = es.Name
      mountStomp = embedded.mountData?.stomp || null
      mountArmourBane = embedded.mountData?.armourBane || null
    }

    entries.push({
      unitName: u.name,
      strength: u.strength,
      mount: (isRiddenMonster || (mount && mount.a)) ? u.mount : null,
      riderI,
      riderWS,
      riderS,
      t: isRiddenMonster ? `${baseT + mount.tBonus}` : stats.T || '?',
      w: isRiddenMonster ? `${baseW + mount.wBonus}` : stats.W || '?',
      as: calculateArmourSave(u),
      mr: detectMagicResistance(u),
      ward: detectWard(u),
      regen: detectRegen(u),
      iNum: Math.max(parseInt(riderI) || 0, mountI || 0),
      riderWeapons,
      riderA: stats.A || '?',
      mountWeapons,
      mountA,
      mountS,
      mountI,
      mountWS,
      mountName,
      mountArmourBane,
      stomp: mount?.stomp || mountStomp || detectStompFromRules(u),
      impactHits: mount?.impactHits || embedded?.mountData?.impactHits || detectImpactHitsFromRules(u),
      singleUseItems: (() => { const items = detectSingleUseItems(u); return items })(),
      itemNames: (() => {
        const suItems = detectSingleUseItems(u)
        const suNames = new Set(suItems.map(i => i.name.toLowerCase()))
        return buildItemNames(u).filter(n => {
          if (suNames.has(n.toLowerCase()) || MR_ITEM_NAMES.has(n.toLowerCase())) return false
          const mi = MAGIC_ITEM_MAP[normaliseItemName(n)]
          if (mi?.type === 'weapon' && mi.phases && !mi.phases.includes('combat')) return false
          return true
        })
      })(),
      riderTags: buildRiderTags(u),
      combatRules: extractCombatRules(u),
      crew: [
        ...(stats.crewed && stats.weapons && stats.A && stats.A !== '-'
          ? [{ name: stats.Name, i: stats.I, ws: stats.WS, s: stats.S, a: stats.A,
               weapons: stats.weapons.map(wKey => COMBAT_WEAPONS[wKey]).filter(Boolean) }]
          : []),
        ...crew.map(c => ({
          name: c.Name, i: c.I, ws: c.WS, s: c.S, a: c.A,
          weapons: (c.weapons || []).map(wKey => COMBAT_WEAPONS[wKey]).filter(Boolean),
        })),
      ],
      champion: champion ? {
        name: champion.Name,
        i: champion.I || riderI,
        ws: champion.WS || riderWS,
        s: champion.S || riderS,
        a: champion.A || '?',
        weapons: championWeapons || riderWeapons,
        tags: championWeapons
          ? (championWeapons.some(w => isWeaponMagical(w)) ? '<span class="text-wh-phase-combat font-mono ml-1">\u2728 Magical</span>' : '')
          : null,
      } : null,
      riderName: champion ? stats.Name : null,
    })
  }

  // Deduplicate
  const deduped = {}
  for (const e of entries) {
    const riderWKey = e.riderWeapons.map(w => w.name).sort().join(',')
    const mountWKey = e.mountWeapons.map(w => w.name).sort().join(',')
    const key = `${e.unitName}||${e.riderI}||${e.riderA}||${e.t}||${e.w}||${e.as}||${riderWKey}||${mountWKey}`
    if (!deduped[key]) {
      deduped[key] = { ...e, merged: false }
    } else {
      deduped[key].merged = true
    }
  }

  const rows = Object.values(deduped).sort((a, b) => b.iNum - a.iNum)
  if (rows.length === 0) return ''

  const hasRegen = rows.some(r => r.regen)

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Combat Units</h3>
      <div class="space-y-2">
        ${rows.map(r => `
          <div class="p-2 rounded bg-wh-card">
            <div class="text-wh-text font-semibold text-sm">${r.unitName}${r.mount ? ` (${r.mount})` : ''}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ''}</div>
            <div class="flex items-center gap-2 flex-wrap mt-0.5">
              <span class="text-wh-muted font-mono text-xs">T:${r.t}</span>
              <span class="text-wh-muted font-mono text-xs">W:${r.w}</span>
              ${r.as ? `<span class="text-blue-400 font-mono text-xs">\u{1F6E1}\uFE0FAS:${r.as}</span>` : ''}
              ${r.mr ? `<span class="text-wh-phase-combat font-mono text-xs">\u2728MR:${r.mr}</span>` : ''}
              ${r.ward ? `<span class="text-purple-400 font-mono text-xs">\u{1F52E}Ward:${r.ward}</span>` : ''}
              ${r.regen ? `<span class="text-green-400 font-mono text-xs">\u{1F49A}Regen:${r.regen}</span>` : ''}
            </div>
              ${r.singleUseItems.length > 0 ? `
                <div class="mt-1 ml-2">
                  ${r.singleUseItems.map(item => `<div class="text-xs"><span class="text-wh-accent">\u{1F6E1} ${item.name}</span> <span class="text-wh-muted">(single use)</span></div>`).join('')}
                </div>
              ` : ''}
              <div class="mt-1">
                ${r.champion ? r.champion.weapons.map(w => renderWeaponLine(r.champion.i, r.champion.ws, r.champion.s, r.champion.a, w, r.champion.name, r.champion.tags !== null ? r.champion.tags : r.riderTags)).join('') : ''}
                ${r.riderWeapons.map(w => renderWeaponLine(r.riderI, r.riderWS, r.riderS, r.riderA, w, r.riderName, r.riderTags)).join('')}
                ${r.crew.map(c => c.weapons.length > 0
                  ? c.weapons.map(w => renderWeaponLine(c.i, c.ws, c.s, c.a, w, c.name)).join('')
                  : renderWeaponLine(c.i, c.ws, c.s, c.a, HAND_WEAPON, c.name)
                ).join('')}
                ${r.mountWeapons.length > 0
                  ? renderMountWeapons(r.mountWeapons, r.mountA, r.mountS, r.mountI || r.riderI, r.mountWS || r.riderWS)
                  : r.mountA ? renderWeaponLine(r.mountI || r.riderI, r.mountWS || r.riderWS, r.mountS, r.mountA, { name: r.mountName || 'Mount', s: '', ap: '—', rules: r.mountArmourBane ? `Armour Bane (${r.mountArmourBane})` : '' }) : ''}
                ${r.stomp || r.impactHits ? `<div class="text-xs text-wh-phase-combat">${r.impactHits ? `\u{1F4A5} Impact ${r.impactHits}` : ''}${r.stomp && r.impactHits ? ' | ' : ''}${r.stomp ? `\u{1F9B6} Stomp ${r.stomp}` : ''}</div>` : ''}
                ${r.itemNames.length > 0 ? `<div class="text-xs text-wh-muted mt-0.5">${r.itemNames.join(', ')}</div>` : ''}
                ${r.combatRules.length > 0 ? `<div class="text-xs text-wh-accent mt-0.5">${r.combatRules.join(', ')}</div>` : ''}
              </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

export function renderCombatResultContext(army) {
  if (army.units.length === 0) return ''

  const entries = []
  for (const u of army.units) {
    const bonuses = []
    let total = 0

    const hasCloseOrder = u.specialRules?.toLowerCase().includes('close order')
    if (hasCloseOrder) { bonuses.push('Close Order +1'); total += 1 }
    if (u.hasStandard) { bonuses.push('Standard +1'); total += 1 }
    if (u.hasMusician) { bonuses.push('Musician') }

    if (total === 0 && !u.hasMusician) continue

    entries.push({
      name: u.name, strength: u.strength,
      total, bonuses,
    })
  }

  const deduped = {}
  for (const e of entries) {
    const key = `${e.name}||${e.total}||${e.bonuses.join(',')}`
    if (!deduped[key]) deduped[key] = { ...e, merged: false }
    else deduped[key].merged = true
  }

  const rows = Object.values(deduped).sort((a, b) => b.total - a.total)
  if (rows.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Static Combat Bonuses</h3>
      <div class="space-y-1">
        ${rows.map(r => `
          <div class="p-2 rounded bg-wh-card text-sm">
            <div class="flex items-center gap-2">
              <span class="text-wh-text">${r.name}${!r.merged && r.strength > 1 ? ` x${r.strength}` : ''}</span>
              <span class="text-wh-phase-combat font-mono text-xs ml-auto">+${r.total}</span>
            </div>
            ${r.bonuses.length > 0 ? `<p class="text-xs text-wh-muted mt-0.5">${r.bonuses.join(', ')}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `
}

export function renderCombatLeadershipContext(army) {
  if (army.units.length === 0) return ''

  const deduped = {}
  for (const u of army.units) {
    let ld = '?'
    if (u.stats) {
      for (const profile of u.stats) {
        if (profile.Ld && profile.Ld !== '-') { ld = profile.Ld; break }
      }
    }
    const key = `${u.name}||${ld}`
    if (!deduped[key]) deduped[key] = { name: u.name, ld, ldNum: parseInt(ld) || 0 }
  }

  const rows = Object.values(deduped).sort((a, b) => b.ldNum - a.ldNum)
  if (rows.length === 0) return ''

  // Find General and BSB for Inspiring Presence / Hold Your Ground
  const general = army.units.find(u => u.isGeneral)
  const bsb = army.units.find(u => u.isBSB)

  let generalLd = null
  let generalRange = 12
  if (general) {
    if (general.stats) {
      for (const profile of general.stats) {
        if (profile.Ld && profile.Ld !== '-') { generalLd = profile.Ld; break }
      }
    }
    const hasLargeTarget = general.specialRules?.toLowerCase().includes('large target')
      || (general.mount && findMount(general.mount)?.largeTarget)
    if (hasLargeTarget) generalRange = 18
  }

  let bsbRange = 12
  if (bsb) {
    const hasLargeTarget = bsb.specialRules?.toLowerCase().includes('large target')
      || (bsb.mount && findMount(bsb.mount)?.largeTarget)
    if (hasLargeTarget) bsbRange = 18
  }

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-combat/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-combat mb-3">Break Test</h3>
      ${general ? `
        <div class="p-2 rounded bg-wh-card mb-2">
          <p class="text-xs"><span class="font-semibold text-wh-text">Inspiring Presence:</span> <span class="text-wh-muted">Units within ${generalRange}" of ${general.name} (Ld${generalLd}) may use their Ld.</span></p>
          ${bsb ? `<p class="text-xs mt-1"><span class="font-semibold text-wh-text">Hold Your Ground:</span> <span class="text-wh-muted">Units within ${bsbRange}" of ${bsb.name} may re-roll Break tests.</span></p>` : ''}
        </div>
      ` : ''}
      <div class="space-y-1">
        ${rows.map(r => `
          <div class="flex items-center gap-2 p-2 rounded bg-wh-card text-sm">
            <span class="text-wh-text">${r.name}</span>
            <span class="text-wh-phase-combat font-mono text-xs ml-auto">Ld${r.ld}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

export function renderDefensiveStatsContext(army) {
  if (army.units.length === 0) return ''

  const deduped = {}
  for (const u of army.units) {
    const stats = u.stats?.[0]
    const mount = u.mount ? findMount(u.mount) : null
    const isRiddenMonster = mount && mount.wBonus > 0

    const baseT = parseInt(stats?.T) || 0
    const baseW = parseInt(stats?.W) || 0
    const t = isRiddenMonster ? `${baseT + mount.tBonus}` : stats?.T || '?'
    const w = isRiddenMonster ? `${baseW + mount.wBonus}` : stats?.W || '?'
    const as = calculateArmourSave(u)
    const ward = detectWard(u)
    const regen = detectRegen(u)

    let ld = '?'
    if (u.stats) {
      for (const profile of u.stats) {
        if (profile.Ld && profile.Ld !== '-') { ld = profile.Ld; break }
      }
    }

    const hasEvasive = u.specialRules?.toLowerCase().includes('evasive') || false

    const key = `${u.name}||${t}||${w}||${as}`
    if (!deduped[key]) {
      deduped[key] = { name: u.name, strength: u.strength, mount: isRiddenMonster ? u.mount : null, t, w, as, ward, regen, ld, ldNum: parseInt(ld) || 0, hasEvasive, merged: false }
    } else {
      deduped[key].merged = true
    }
  }

  const rows = Object.values(deduped).sort((a, b) => b.ldNum - a.ldNum)
  if (rows.length === 0) return ''

  return `
    <div class="bg-wh-surface rounded-lg border border-wh-phase-shooting/30 p-4 mb-4">
      <h3 class="text-sm font-bold text-wh-phase-shooting mb-3">Your Units</h3>
      <div class="space-y-1">
        ${rows.map(r => `
          <div class="p-2 rounded bg-wh-card">
            <div class="flex items-center gap-2 flex-wrap text-sm">
              <span class="text-wh-text font-semibold">${r.name}${r.mount ? ` (${r.mount})` : ''}${!r.merged && r.strength > 1 ? ` <span class="text-wh-muted font-normal">x${r.strength}</span>` : ''}</span>
              <span class="text-wh-muted font-mono text-xs">T:${r.t}</span>
              <span class="text-wh-muted font-mono text-xs">W:${r.w}</span>
              ${r.as ? `<span class="text-blue-400 font-mono text-xs">\u{1F6E1}\uFE0FAS:${r.as}</span>` : ''}
              ${r.ward ? `<span class="text-purple-400 font-mono text-xs">\u{1F52E}Ward:${r.ward}</span>` : ''}
              ${r.regen ? `<span class="text-green-400 font-mono text-xs">\u{1F49A}Regen:${r.regen}</span>` : ''}
              ${r.hasEvasive ? '<span class="text-green-400 font-mono text-xs">\u{1F3C3}\u200D\u2640\uFE0FEvasive</span>' : ''}
              <span class="text-wh-muted font-mono text-xs ml-auto">Ld${r.ld}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}
