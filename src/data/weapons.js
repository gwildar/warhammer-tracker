export const RANGED_WEAPONS = {
  // ─── Bows ────────────────────────────────────────────────────────────
  longbow: {
    name: "Longbow",
    range: '30"',
    s: "3",
    ap: "—",
    rules: "Armour Bane (1), Volley Fire",
  },
  shortbow: {
    name: "Shortbow",
    range: '18"',
    s: "3",
    ap: "—",
    rules: "Quick Shot, Volley Fire",
  },
  warbow: {
    name: "Warbow",
    range: '24"',
    s: "S",
    ap: "—",
    rules: "Volley Fire",
  },

  // ─── Black Powder ────────────────────────────────────────────────────
  handgun: {
    name: "Handgun",
    range: '24"',
    s: "4",
    ap: "-1",
    rules: "Armour Bane (1), Ponderous",
  },
  "repeater handgun": {
    name: "Repeater Handgun",
    range: '24"',
    s: "4",
    ap: "-1",
    rules: "Armour Bane (1), Multiple Shots (3), Ponderous",
  },
  pistol: {
    name: "Pistol",
    range: '12"',
    s: "4",
    ap: "-1",
    rules: "Armour Bane (1), Quick Shot",
  },
  "brace of pistols": {
    name: "Brace of Pistols",
    range: '12"',
    s: "4",
    ap: "-1",
    rules: "Armour Bane (1), Multiple Shots (2), Quick Shot",
  },
  "repeater pistol": {
    name: "Repeater Pistol",
    range: '12"',
    s: "4",
    ap: "-1",
    rules: "Armour Bane (1), Multiple Shots (3), Quick Shot",
  },

  // ─── Crossbows ───────────────────────────────────────────────────────
  "repeater crossbow": {
    name: "Repeater Crossbow",
    range: '24"',
    s: "3",
    ap: "—",
    rules: "Armour Bane (1), Multiple Shots (2)",
  },
  crossbow: {
    name: "Crossbow",
    range: '30"',
    s: "4",
    ap: "—",
    rules: "Armour Bane (2), Ponderous",
  },
  "repeater handbow": {
    name: "Repeater Handbow",
    range: '12"',
    s: "3",
    ap: "—",
    rules: "Multiple Shots (2), Quick Shot",
  },
  "brace of repeater handbows": {
    name: "Brace of Repeater Handbows",
    range: '12"',
    s: "3",
    ap: "—",
    rules: "Multiple Shots (4), Quick Shot",
  },

  // ─── Thrown ──────────────────────────────────────────────────────────
  javelin: {
    name: "Javelin",
    range: '12"',
    s: "S",
    ap: "—",
    rules: "Move & Shoot, Quick Shot",
  },
  sling: {
    name: "Sling",
    range: '18"',
    s: "3",
    ap: "—",
    rules: "Multiple Shots (2)",
  },
  "throwing weapon": {
    name: "Throwing Weapons",
    range: '9"',
    s: "S",
    ap: "—",
    rules: "Move & Shoot, Multiple Shots (2), Quick Shot",
  },
  "throwing axe": {
    name: "Throwing Axe",
    range: '9"',
    s: "S+1",
    ap: "—",
    rules: "Quick Shot",
  },

  // ─── War Machines ────────────────────────────────────────────────────
  "bolt thrower": {
    name: "Bolt Thrower",
    range: '48"',
    s: "—",
    ap: "—",
    rules: "",
  },
  cannon: {
    name: "Cannon",
    range: '48"',
    s: "—",
    ap: "—",
    rules: "Multiple Wounds (D3)",
    misfireTable: "black-powder",
    noBS: true,
    altProfiles: ["grapeshot"],
  },
  grapeshot: {
    name: "Grapeshot",
    range: '12"',
    s: "4",
    ap: "-1",
    rules: "Cumbersome, Move or Shoot, Needs More Nails",
    noBS: true,
  },
  "grand cannon": {
    name: "Grand Cannon",
    range: '48"',
    s: "10",
    ap: "-3",
    rules:
      "Armour Bane (3), Cumbersome, Move or Shoot, Multiple Wounds (D3+1), Thunderous Impact",
    misfireTable: "black-powder",
    noBS: true,
  },
  mortar: {
    name: "Mortar",
    range: '12"-48"',
    s: "—",
    ap: "—",
    rules: "",
    noBS: true,
  },
  catapult: {
    name: "Catapult",
    range: '12"-60"',
    s: "—",
    ap: "—",
    rules: "",
    noBS: true,
  },
  "screaming skull catapult": {
    name: "Screaming Skull Catapult",
    range: '12"-60"',
    s: "4(8)",
    ap: "-1(-3)",
    rules:
      'Bombardment (3" blast), Cumbersome, Flaming Attacks, Magical Attacks, Move or Shoot, Multiple Wounds (D3+1) on central model, Screaming Skulls',
    noBS: true,
  },
  trebuchet: {
    name: "Trebuchet",
    range: '12"-60"',
    s: "—",
    ap: "—",
    rules: "",
    noBS: true,
  },
  bombard: {
    name: "Bombard",
    range: '48"',
    s: "8",
    ap: "-3",
    rules:
      "Armour Bane (2), Cannon Fire, Cumbersome, Move or Shoot, Multiple Wounds (D3+1)",
    misfireTable: "bombard",
    noBS: true,
    altProfiles: ["grapeshot"],
  },

  // ─── Ogre Kingdoms Ranged ─────────────────────────────────────────────
  "blood vulture": {
    name: "Blood Vulture",
    range: '36"',
    s: "4",
    ap: "-1",
    rules: "Ignores Cover, Move & Shoot, Quick Shot",
  },
  "brace of ogre pistols": {
    name: "Brace of Ogre Pistols",
    range: '24"',
    s: "4",
    ap: "-1",
    rules: "Armour Bane (1), Multiple Shots (2), Quick Shot",
  },
  "cannon of the sky-titans": {
    name: "Cannon of the Sky-Titans",
    range: '36"',
    s: "10",
    ap: "-3",
    rules: "Armour Bane (2), Cannon Fire, Cumbersome, Multiple Wounds (D3+1)",
    misfireTable: "ironblaster",
    noBS: true,
    altProfiles: ["cannon of the sky-titans (scatter shot)"],
  },
  "cannon of the sky-titans (scatter shot)": {
    name: "Cannon of the Sky-Titans (Scatter Shot)",
    range: "Template",
    s: "4",
    ap: "-1",
    rules: "Breath Weapon",
    noBS: true,
  },
  chaintrap: {
    name: "Chaintrap",
    range: '12"',
    s: "S+1",
    ap: "—",
    rules: "Killing Blow",
  },
  "chill breath": {
    name: "Chill Breath",
    range: "Template",
    s: "2",
    ap: "-1",
    rules: "Breath Weapon, Multiple Wounds (D3)",
  },
  "flaming breath": {
    name: "Flaming Breath",
    range: "Template",
    s: "4",
    ap: "-1",
    rules: "Breath Weapon, Flaming Attacks",
  },
  "great throwing spear": {
    name: "Great Throwing Spear",
    range: '12"',
    s: "S+1",
    ap: "-1",
    rules: "Move & Shoot, Quick Shot",
  },
  "harpoon launcher": {
    name: "Harpoon Launcher",
    range: '36"',
    s: "6",
    ap: "-2",
    rules: "Multiple Wounds (D3), Ponderous",
  },
  "leadbelcher gun": {
    name: "Leadbelcher Gun (Solid Shot)",
    range: '24"',
    s: "5",
    ap: "-2",
    rules: "Armour Bane (1), Cumbersome, Multiple Wounds (2)",
    altProfiles: ["leadbelcher gun (scatter shot)"],
  },
  "leadbelcher gun (scatter shot)": {
    name: "Leadbelcher Gun (Scatter Shot)",
    range: '18"',
    s: "3",
    ap: "—",
    rules: "Armour Bane (1), D3 hits",
  },
  "ogre pistol": {
    name: "Ogre Pistol",
    range: '24"',
    s: "4",
    ap: "-1",
    rules: "Armour Bane (1), Quick Shot",
  },
  "scraplauncher catapult": {
    name: "Scraplauncher Catapult",
    range: '12"-48"',
    s: "3(4)",
    ap: "-(-2)",
    rules:
      'Bombardment (5" blast), Cumbersome, Multiple Wounds (2) on central model',
    noBS: true,
  },

  // ─── Faction-specific Ranged ─────────────────────────────────────────
  "petrifying gaze": {
    name: "Petrifying Gaze",
    range: '18"',
    s: "2",
    ap: "—",
    rules:
      "Magical Attacks, Multiple Wounds (D3). Wounds vs Initiative not Toughness. No armour saves.",
  },
  "ravager harpoon": {
    name: "Ravager Harpoon",
    range: '24"',
    s: "6",
    ap: "-3",
    rules: "Cumbersome, Multiple Wounds (D3), Ponderous",
  },

  // ─── Breath Weapons ──────────────────────────────────────────────────
  "breath of desiccation": {
    name: "Breath of Desiccation",
    range: "Template",
    s: "3",
    ap: "-2",
    rules: "Breath Weapon, Magical Attacks, Multiple Wounds (2)",
  },
  "pestilential breath": {
    name: "Pestilential Breath",
    range: "Template",
    s: "2",
    ap: "-3",
    rules: "Breath Weapon",
  },
  "noxious breath": {
    name: "Noxious Breath",
    range: "Template",
    s: "4",
    ap: "—",
    rules: "Breath Weapon. No armour saves. -1 WS on wounded models.",
  },
  "fiery breath": {
    name: "Fiery Breath",
    range: "Template",
    s: "—",
    ap: "—",
    rules: "Breath Weapon, Flaming Attacks",
  },
  "dragon fire": {
    name: "Dragon Fire",
    range: "Template",
    s: "4",
    ap: "-1",
    rules: "Breath Weapon, Flaming Attacks",
  },
  "soporific breath": {
    name: "Soporific Breath",
    range: "Template",
    s: "2",
    ap: "—",
    rules: "Breath Weapon. No armour saves.",
  },
  "dark fire of chaos": {
    name: "Dark Fire of Chaos",
    range: "Template",
    s: "4",
    ap: "-1",
    rules: "Breath Weapon, Flaming Attacks, Magical Attacks",
  },
  "briny breath": {
    name: "Briny Breath",
    range: "Template",
    s: "2",
    ap: "-2",
    rules: "Breath Weapon. -1 Initiative on wounded models.",
  },
  "swamp breath": {
    name: "Swamp Breath",
    range: "Template",
    s: "3",
    ap: "-2",
    rules:
      "Breath Weapon. Units suffering one or more unsaved wounds must take a Panic test as if they had taken heavy casualties.",
  },

  // ─── High Elf Ranged ─────────────────────────────────────────────────
  "bow of avelorn": {
    name: "Bow of Avelorn",
    range: '30"',
    s: "S",
    ap: "—",
    rules: "Armour Bane (1), Magical Attacks, Volley Fire",
  },
  "eagle-eye bolt thrower": {
    name: "Eagle-eye Bolt Thrower",
    range: '24"',
    s: "5",
    ap: "-3",
    rules: "Cumbersome, Multiple Wounds (D3)",
  },

  // ─── Special Shooting Attacks ───────────────────────────────────────
  "wailing dirge": {
    name: "Wailing Dirge",
    range: '8"',
    s: "—",
    ap: "—",
    rules:
      "Ld test at -2. Wounds = margin of failure. No armour/Regen saves. Can target units in combat.",
  },

  // ─── Tomb Kings Ranged Weapons ───────────────────────────────────────
  greatbow: {
    name: "Greatbow",
    range: '30"',
    s: "6",
    ap: "-1",
    rules: "Armour Bane (2), Multiple Wounds (2), Volley Fire",
  },

  // ─── Grand Cathay Ranged ─────────────────────────────────────────────
  "crane gun": {
    name: "Crane Gun",
    range: '36"',
    s: "6",
    ap: "-2",
    rules: "Armour Bane (2), Cumbersome, Move or Shoot",
  },
  "dragon fire bombs": {
    name: "Dragon Fire Bombs",
    range: '9"',
    s: "3",
    ap: "-1",
    rules:
      "Armour Bane (1), Flaming Attacks, Move & Shoot, Quick Shot. D3+1 hits on successful To Hit.",
  },
  "dragon fire pistol": {
    name: "Dragon Fire Pistol",
    range: '12"',
    s: "5",
    ap: "-1",
    rules: "Flaming Attacks, Multiple Shots (2), Quick Shot",
  },
  "fire rain rocket": {
    name: "Fire Rain Rocket (Bastion Rockets)",
    range: '12"-48"',
    s: "4",
    ap: "-1",
    rules:
      'Bombardment (3"). S5, AP-3 at blast centre. Multiple Wounds (D6) at centre only.',
    misfireTable: "black-powder",
    noBS: true,
    altProfiles: ["fire rain rocket (rocket battery)"],
  },
  "fire rain rocket (rocket battery)": {
    name: "Fire Rain Rocket (Rocket Battery)",
    range: '12"-48"',
    s: "3",
    ap: "-1",
    rules:
      'Bombardment (5"), Flaming Attacks, Wailing Spirits. S4, AP-1 at blast centre.',
    misfireTable: "black-powder",
    noBS: true,
  },
  "gunpowder bombs": {
    name: "Gunpowder Bombs",
    range: '9"',
    s: "3",
    ap: "—",
    rules:
      "Armour Bane (1), Move & Shoot, Quick Shot. D3 hits on successful To Hit.",
  },
  "iron hail gun": {
    name: "Iron Hail Gun",
    range: '12"',
    s: "3",
    ap: "-1",
    rules:
      "Move & Shoot, Multiple Shots (D3). No penalties for long range, Multiple Shots, or Stand & Shoot.",
  },
  "sky lantern bombs": {
    name: "Sky Lantern Bombs",
    range: '6"',
    s: "5",
    ap: "-2",
    rules:
      'Once per game. During Remaining Moves sub-phase. Roll D6: 1=lose 1W; 2=enemy loses 1W; 3-4=5" template scatters D6"; 5-6=two 3" templates scatter D6" each.',
    noBS: true,
  },
  "sky lantern crane gun": {
    name: "Sky Lantern Crane Gun",
    range: '36"',
    s: "6",
    ap: "-2",
    rules: "Armour Bane (2), Cumbersome",
  },
};

export const COMBAT_WEAPONS = {
  // ─── Core Combat Weapons ─────────────────────────────────────────────
  "hand weapon": {
    name: "Hand Weapon",
    s: "S",
    ap: "—",
    rules: "",
  },
  "great weapon": {
    name: "Great Weapon",
    s: "S+2",
    ap: "-2",
    rules: "Armour Bane (1), Requires Two Hands, Strike Last",
  },
  halberd: {
    name: "Halberd",
    s: "S+1",
    ap: "-1",
    rules: "Armour Bane (1), Requires Two Hands. AP -2 vs charged enemies.",
  },
  flail: {
    name: "Flail",
    s: "S+2",
    ap: "-2",
    rules:
      "Armour Bane (1), Requires Two Hands. S and Armour Bane only vs charged enemies.",
  },
  "morning star": {
    name: "Morning Star",
    s: "S+1",
    ap: "-1",
    rules: "Armour Bane (1). S and Armour Bane only vs charged enemies.",
  },
  lance: {
    name: "Lance",
    s: "S+2",
    ap: "-2",
    rules: "Armour Bane (1). Charge turn only.",
  },
  "cavalry spear": {
    name: "Cavalry Spear",
    s: "S+1",
    ap: "-1",
    rules: "Fight In Extra Rank. Charge turn only.",
  },
  "thrusting spear": {
    name: "Thrusting Spear",
    s: "S",
    ap: "—",
    rules:
      "Fight In Extra Rank. Infantry only. +1 Initiative when charged in front arc.",
  },
  "throwing spear": {
    name: "Throwing Spear",
    s: "S",
    ap: "—",
    rules: "Fight In Extra Rank. Charge turn only, use hand weapon otherwise.",
  },
  whip: {
    name: "Whip",
    s: "S",
    ap: "—",
    rules: "Fight In Extra Rank, Strike First",
  },
  "additional hand weapon": {
    name: "Additional Hand Weapon",
    s: "S",
    ap: "—",
    rules: "Extra Attacks (+1), Requires Two Hands",
  },
  "two hand weapons": {
    name: "Additional Hand Weapon",
    s: "S",
    ap: "—",
    rules: "Extra Attacks (+1), Requires Two Hands",
  },

  // ─── Dark Elf Weapons ────────────────────────────────────────────────
  "dread halberd": {
    name: "Dread Halberd",
    s: "S+1",
    ap: "-1",
    rules:
      "Armour Bane (1), Fight In Extra Rank, Requires Two Hands. No supporting attacks on charge turn.",
  },
  "har ganeth greatsword": {
    name: "Har Ganeth Greatsword",
    s: "S+2",
    ap: "-1",
    rules: "Cleaving Blow, Requires Two Hands",
  },
  "lash & buckler": {
    name: "Lash & Buckler",
    s: "S",
    ap: "-1",
    rules:
      "Armour Bane (1), Fight In Extra Rank, Requires Two Hands. +1 armour value.",
  },
  "lash and buckler": {
    name: "Lash & Buckler",
    s: "S",
    ap: "-1",
    rules:
      "Armour Bane (1), Fight In Extra Rank, Requires Two Hands. +1 armour value.",
  },

  // ─── Vampire Counts Weapons ──────────────────────────────────────────
  "filth-encrusted claws": {
    name: "Filth-encrusted Claws",
    s: "S",
    ap: "-1",
    rules: "Poisoned Attacks",
  },
  "filth-encrusted talons": {
    name: "Filth-encrusted Talons",
    s: "S",
    ap: "-1",
    rules: "Armour Bane (1), Poisoned Attacks",
  },
  "poisonous tail": {
    name: "Poisonous Tail",
    s: "S",
    ap: "—",
    rules:
      "Poisoned Attacks, Strike First. One attack per turn with this weapon.",
  },
  "rancid maw": {
    name: "Rancid Maw",
    s: "S",
    ap: "-2",
    rules:
      "Armour Bane (1), Multiple Wounds (2). One attack per turn with this weapon.",
  },
  "spectral scythe": {
    name: "Spectral Scythe",
    s: "S",
    ap: "—",
    rules:
      "Magical Attacks, Multiple Wounds (D3). No armour saves (Ward and Regeneration allowed).",
  },
  "wicked claws": { name: "Wicked Claws", s: "S", ap: "-2", rules: "" },

  // ─── Mount Weapons ───────────────────────────────────────────────────
  "serrated maw": {
    name: "Serrated Maw",
    s: "S",
    ap: "—",
    rules: "Armour Bane (2), Multiple Wounds (2).",
    reservedAttacks: 1,
  },
  "mighty antlers": {
    name: "Mighty Antlers",
    s: "S",
    ap: "-1",
    rules: "Armour Bane (1)",
  },
  "lashing talons": {
    name: "Lashing Talons",
    s: "S",
    ap: "-1",
    rules: "Armour Bane (1)",
  },
  "slashing talons": {
    name: "Slashing Talons",
    s: "S",
    ap: "—",
    rules: "Multiple Wounds (D3) vs Monsters.",
  },
  "great horns": {
    name: "Great Horns",
    s: "S+1",
    ap: "-1",
    rules: "Armour Bane (1). Charge turn only.",
  },
  "serpentine tail": {
    name: "Serpentine Tail",
    s: "S+2",
    ap: "-2",
    rules: "Strike Last. Must make one attack per turn with this weapon.",
  },

  // ─── Ogre Kingdoms Combat ─────────────────────────────────────────────
  "brace of ogre pistols (combat)": {
    name: "Brace of Ogre Pistols",
    s: "S",
    ap: "—",
    rules: "Extra Attacks (+1), Requires Two Hands",
  },
  "distensible jaw": {
    name: "Distensible Jaw",
    s: "S",
    ap: "—",
    rules: "Killing Blow. Must make one attack per turn with this weapon.",
  },
  "giant's club": {
    name: "Giant's Club",
    s: "*",
    ap: "*",
    rules: "See Giant Attacks table.",
  },
  "great tusks": {
    name: "Great Tusks",
    s: "S",
    ap: "-1",
    rules: "Armour Bane (2)",
  },
  "grimfrost weapon": {
    name: "Grimfrost Weapon",
    s: "S",
    ap: "-1",
    rules: "Armour Bane (1), Magical Attacks",
  },
  "horns of stone": { name: "Horns of Stone", s: "S", ap: "-2", rules: "" },
  ironfist: {
    name: "Ironfist",
    s: "S",
    ap: "—",
    rules: "Extra Attacks (+1), Requires Two Hands. +1 armour value.",
  },
  "monstrous tusks": {
    name: "Monstrous Tusks",
    s: "S",
    ap: "-1",
    rules: "Armour Bane (1)",
  },

  // ─── High Elf Weapons ────────────────────────────────────────────────
  "ceremonial halberd": {
    name: "Ceremonial Halberd",
    s: "S+1",
    ap: "-1",
    rules:
      "Armour Bane (1), Fight In Extra Rank, Magical Attacks, Requires Two Hands. No supporting attacks on charge turn.",
  },
  "chracian great blade": {
    name: "Chracian Great Blade",
    s: "S+2",
    ap: "-3",
    rules: "Requires Two Hands, Strike Last",
  },
  "handmaiden's spear": {
    name: "Handmaiden's Spear",
    s: "S",
    ap: "-1",
    rules: "+1 Initiative when charged in front arc.",
  },
  "sword of hoeth": {
    name: "Sword of Hoeth",
    s: "S+2",
    ap: "-2",
    rules: "Magical Attacks, Requires Two Hands",
  },

  // ─── Tomb Kings Combat Weapons ───────────────────────────────────────
  "ritual blade": {
    name: "Ritual Blade",
    s: "S+2",
    ap: "-3",
    rules: "Requires Two Hands, Strike Last",
  },
  "swarming mass": {
    name: "Swarming Mass",
    range: "Template",
    s: "2",
    ap: "—",
    rules: "Breath Weapon. Wounds on 4+ regardless of Toughness.",
  },
  "writhing tail": {
    name: "Writhing Tail",
    s: "S",
    ap: "-1",
    rules: "Extra Attacks (+D3)",
  },
  "envenomed sting": {
    name: "Envenomed Sting",
    s: "S",
    ap: "—",
    rules: "Poisoned Attacks, Strike First",
    reservedAttacks: 1,
  },
  "fiery roar": {
    name: "Fiery Roar",
    range: "Template",
    s: "4",
    ap: "-1",
    rules: "Breath Weapon, Flaming Attacks",
  },
  "decapitating claws": {
    name: "Decapitating Claws",
    s: "S",
    ap: "-2",
    rules: "Killing Blow, Monster Slayer",
  },
  "paired great khopeshes": {
    name: "Paired Great Khopeshes",
    s: "S",
    ap: "-2",
    rules: "Killing Blow, Requires Two Hands",
  },
  "cleaving blades": {
    name: "Cleaving Blades",
    s: "S",
    ap: "-1",
    rules: "Killing Blow",
  },
  "decapitating strike": {
    name: "Decapitating Strike",
    s: "S+5",
    ap: "-4",
    rules: "Killing Blow, Monster Slayer, Strike Last",
  },

  // ─── Grand Cathay Combat ─────────────────────────────────────────────
  "cathayan lance": {
    name: "Cathayan Lance",
    s: "S+1",
    ap: "-1",
    rules:
      "Armour Bane (1), Fight In Extra Rank. S+1 and AP-1 on charge turn only. Cavalry, monster, and chariot models only.",
  },
  "celestial blade": {
    name: "Celestial Blade",
    s: "S+1",
    ap: "-1",
    rules: "Strike First",
  },
  "crown of horns": {
    name: "Crown of Horns",
    s: "S",
    ap: "-1",
    rules: "Armour Bane (1)",
  },
  "great blade": {
    name: "Great Blade",
    s: "S / S+1",
    ap: "-2 / -4",
    rules:
      "Choose at start of each combat round. Scything Blow (S, AP-2): Armour Bane (1), Extra Attacks (+2D3), Strike Last. Deadly Strike (S+1, AP-4): Killing Blow, Monster Slayer, Multiple Wounds (D3).",
  },
  "iron talons": {
    name: "Iron Talons",
    s: "S",
    ap: "-1",
    rules: "Strike First",
  },
  "long spear": {
    name: "Long Spear",
    s: "S",
    ap: "—",
    rules:
      "Fight In Extra Rank, Strike First (vs charging enemies only). Infantry only; cannot use on a turn the model charged.",
  },
  "troll vomit": {
    name: "Troll Vomit",
    s: "3",
    ap: "-2",
    rules:
      "One bonus attack per turn. Hits automatically. Must be made last, after all other attacks including Stomp Attacks.",
  },
};

// ─── Misfire Tables ─────────────────────────────────────────────────
export const MISFIRE_TABLES = {
  "black-powder": {
    name: "Black Powder Misfire Table",
    rows: [
      {
        roll: "1",
        result: "Destroyed!",
        effect:
          "The weapon explodes. The model is destroyed and removed from play.",
      },
      {
        roll: "2-4",
        result: "Malfunction",
        effect:
          "Crew loses one Wound. Cannot shoot this turn or until end of next round.",
      },
      {
        roll: "5-6",
        result: "Pffft",
        effect: "Fuse goes out. Fails to shoot this turn.",
      },
    ],
  },
  bombard: {
    name: "Bombard Misfire Table",
    rows: [
      {
        roll: "1",
        result: "Destroyed!",
        effect:
          "The weapon explodes. The model is destroyed and removed from play.",
      },
      {
        roll: "2-3",
        result: "Malfunction",
        effect:
          "Charge misfires. Crew loses one Wound. Fails to shoot this turn.",
      },
      {
        roll: "4-5",
        result: "Pffft",
        effect: "Fuse goes out. Fails to shoot this turn.",
      },
      {
        roll: "6",
        result: "Boom!",
        effect:
          "Shoots as if a 2 was rolled on the Artillery dice, but cannot shoot during the next round.",
      },
    ],
  },
  ironblaster: {
    name: "Ironblaster Misfire Table",
    rows: [
      {
        roll: "1",
        result: "Kaboom!",
        effect:
          "The cannon explodes. The model is destroyed and removed from play.",
      },
      {
        roll: "2-3",
        result: "Krrack!",
        effect:
          "Cannon splits along its length. Cannot shoot with this weapon for the remainder of the game.",
      },
      {
        roll: "4-6",
        result: "Ack!",
        effect:
          "Gnoblar Scrapper stuck in mechanism. Cannot shoot this turn or during the next round.",
      },
    ],
  },
};

/**
 * Match a unit's equipment strings against known ranged weapons.
 * Returns the matched weapon key (normalised name from RANGED_WEAPONS) or null.
 */
export function matchWeapon(equipmentStr) {
  const lower = equipmentStr.toLowerCase();
  for (const [key, weapon] of Object.entries(RANGED_WEAPONS)) {
    if (lower.includes(key)) {
      return weapon.name;
    }
  }
  return null;
}

export function getWeapon(dict, key) {
  return dict[key] ?? dict[key.replace(/s$/, "")];
}
