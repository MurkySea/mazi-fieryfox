import { useState, useEffect, useCallback } from 'react';
import { buildCompanionPrompt, buildNegativePrompt, buildRegionPrompt, buildBossPrompt, outfitForIntimacy, portraitKey, regionKey, bossKey } from './prompts.js';
import { getImg, setImg, clearImgCache } from './cache.js';

// ─── THEME ────────────────────────────────────────────────────────────────────

const S = {
  bg:      '#06080f',
  bgCard:  '#0b1120',
  bgDeep:  '#050710',
  gold:    '#f0c040',
  goldDim: '#7a5c18',
  goldMid: '#c49a30',
  text:    '#ede0c8',
  textDim: '#7a6a52',
  red:     '#c0392b',
  green:   '#27ae60',
  blue:    '#2980b9',
  purple:  '#8e44ad',
  pink:    '#e91e8c',
  border:  '#1c2838',
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1,  title: 'Wanderer',          xp: 0 },
  { level: 2,  title: 'Initiate',          xp: 100 },
  { level: 3,  title: 'Seeker',            xp: 250 },
  { level: 4,  title: 'Adept',             xp: 500 },
  { level: 5,  title: 'Champion',          xp: 900 },
  { level: 6,  title: 'Knight',            xp: 1400 },
  { level: 7,  title: 'Warlord',           xp: 2000 },
  { level: 8,  title: 'Sovereign',         xp: 2800 },
  { level: 9,  title: 'Arcane Lord',       xp: 3800 },
  { level: 10, title: 'Shadow King',       xp: 5000 },
  { level: 11, title: 'Void Walker',       xp: 6500 },
  { level: 12, title: 'Starborn',          xp: 8500 },
  { level: 13, title: 'Abyssal Throne',    xp: 11000 },
  { level: 14, title: 'Primordial',        xp: 14000 },
  { level: 15, title: 'Eternal Architect', xp: 18000 },
];

const SKILLS = ['Faith', 'Fitness', 'Business', 'Relations', 'Discipline', 'Knowledge'];
const SKILL_COLORS = {
  Faith: '#9b59b6', Fitness: '#e74c3c', Business: '#f0c040',
  Relations: '#e91e8c', Discipline: '#2980b9', Knowledge: '#27ae60',
};

const RACES = ['Foxgirl', 'Elfborn', 'Demonkin', 'Spiritweave', 'Dragonblood', 'Shadowborn', 'Celestine', 'Voidtouched'];
const COMPANION_CLASSES = ['Enchantress', 'Rogue', 'Paladin', 'Mage', 'Berserker', 'Oracle', 'Assassin', 'Warden'];
const FLIRT_STYLES = ['bold', 'warm', 'shy', 'tsundere', 'mysterious', 'devoted'];
const HAIR_COLORS = ['crimson', 'silver', 'obsidian', 'auburn', 'ivory', 'violet', 'midnight blue', 'rose gold'];
const EYE_COLORS = ['amber', 'emerald', 'violet', 'crimson', 'ice blue', 'golden', 'shadow grey', 'topaz'];
const BODY_TYPES = ['lithe', 'athletic', 'voluptuous', 'petite', 'statuesque', 'compact'];

const INTIMACY = [
  { level: 0, name: 'Stranger',  color: '#8a7a60', bond: 0    },
  { level: 1, name: 'Noticed',   color: '#27ae60', bond: 25   },
  { level: 2, name: 'Close',     color: '#2980b9', bond: 100  },
  { level: 3, name: 'Trusted',   color: '#8e44ad', bond: 250  },
  { level: 4, name: 'Devoted',   color: '#e91e8c', bond: 500  },
  { level: 5, name: 'Bonded',    color: '#f0c040', bond: 1000 },
];

const RARITY_COLORS = {
  common: '#8a7a60', uncommon: '#27ae60', rare: '#2980b9', epic: '#8e44ad', legendary: '#f0c040',
};

const ITEMS = [
  { id: 'iron_blade',     name: 'Iron Blade of the Abyss',  type: 'weapon',     rarity: 'common',    desc: '+10% XP from quests',              cost: 150,  effect: { xpMultiplier: 1.1 } },
  { id: 'shadow_cloak',   name: 'Shadow Cloak',              type: 'armor',      rarity: 'uncommon',  desc: '+15% gold from all sources',        cost: 280,  effect: { goldMultiplier: 1.15 } },
  { id: 'foxfire_ring',   name: 'Foxfire Ring',              type: 'accessory',  rarity: 'rare',      desc: '+20% companion bond gain',          cost: 500,  effect: { bondMultiplier: 1.2 } },
  { id: 'void_amulet',    name: 'Void Amulet',               type: 'relic',      rarity: 'rare',      desc: '+25% boss damage',                  cost: 600,  effect: { bossDamage: 1.25 } },
  { id: 'tome_discipline',name: 'Tome of Discipline',        type: 'tome',       rarity: 'uncommon',  desc: '+1 streak grace day',               cost: 350,  effect: { streakGrace: 1 } },
  { id: 'crimson_elixir', name: 'Crimson Elixir',            type: 'consumable', rarity: 'common',    desc: 'Double XP for 24h',                 cost: 200,  effect: { doubleXP: true } },
  { id: 'starshard',      name: 'Starshard Pendant',         type: 'accessory',  rarity: 'epic',      desc: '+30% XP multiplier',                cost: 900,  effect: { xpMultiplier: 1.3 } },
  { id: 'sovereign_seal', name: "Sovereign's Seal",          type: 'relic',      rarity: 'legendary', desc: '+50% all gains',                    cost: 2500, effect: { xpMultiplier: 1.5, goldMultiplier: 1.5, bondMultiplier: 1.5 } },
  { id: 'whisper_blade',  name: 'Whisper Blade',             type: 'weapon',     rarity: 'epic',      desc: '+35% boss damage, +20% XP',         cost: 1200, effect: { bossDamage: 1.35, xpMultiplier: 1.2 } },
  { id: 'ember_veil',     name: 'Ember Veil',                type: 'armor',      rarity: 'legendary', desc: '+40% gold, +20% bond',              cost: 2000, effect: { goldMultiplier: 1.4, bondMultiplier: 1.2 } },
];

const WORLD_REGIONS = [
  { id: 'ashwatch',       name: 'Ashwatch Ruins',     desc: 'Ancient crumbled towers of a lost empire',          unlockLevel: 1,  icon: '🏚️' },
  { id: 'thornwood',      name: 'Thornwood Vale',     desc: 'Dense forest haunted by shadow beasts',             unlockLevel: 3,  icon: '🌲' },
  { id: 'voidmarsh',      name: 'Voidmarsh Depths',   desc: "Fog-choked wetlands at the world's edge",           unlockLevel: 5,  icon: '🌫️' },
  { id: 'ironspire',      name: 'Ironspire Citadel',  desc: 'Fortress of the Dominion warlords',                 unlockLevel: 7,  icon: '🏰' },
  { id: 'celestine_peak', name: 'Celestine Peak',     desc: 'Mountain realm where angels fell',                  unlockLevel: 9,  icon: '⛰️' },
  { id: 'void_throne',    name: 'Void Throne',        desc: 'The seat of primordial power',                      unlockLevel: 12, icon: '👁️' },
  { id: 'eternal_forge',  name: 'Eternal Forge',      desc: 'Where the Architect reshapes reality',              unlockLevel: 15, icon: '⚡' },
];

const BOSSES_INIT = [
  { id: 'procrastination', name: 'The Procrastination Wraith', desc: 'Born of unfinished tasks and lost hours',       maxHp: 100, skill: 'Discipline', obstacle: 'Putting off important work',          reward: { xp: 200, gold: 80 } },
  { id: 'self_doubt',      name: 'Lord of Self-Doubt',         desc: 'Feeds on fear and hesitation',                  maxHp: 150, skill: 'Faith',      obstacle: "Believing you can't succeed",         reward: { xp: 300, gold: 120 } },
  { id: 'chaos_titan',     name: 'Chaos Titan',                desc: 'Disorder made flesh',                           maxHp: 200, skill: 'Discipline', obstacle: 'Lack of structure or routine',        reward: { xp: 400, gold: 160 } },
  { id: 'isolation_shade', name: 'The Isolation Shade',        desc: 'Grows stronger the longer you withdraw',        maxHp: 180, skill: 'Relations', obstacle: 'Social withdrawal',                  reward: { xp: 350, gold: 140 } },
  { id: 'void_sovereign',  name: 'Void Sovereign',             desc: 'The ultimate test of the Architect',            maxHp: 500, skill: 'Faith',      obstacle: 'Losing sight of your purpose',       reward: { xp: 1000, gold: 400 } },
];

const ACHIEVEMENTS = [
  { id: 'first_quest',    name: 'First Blood',        desc: 'Complete your first quest',             check: st => st.questsCompleted >= 1 },
  { id: 'streak_7',       name: 'Week Warrior',       desc: 'Maintain a 7-day ritual streak',        check: st => st.maxStreak >= 7 },
  { id: 'level_5',        name: 'Rising Sovereign',   desc: 'Reach Level 5',                         check: st => st.level >= 5 },
  { id: 'companion_bond', name: 'Unbreakable Bond',   desc: 'Reach Bonded with any companion',       check: st => st.maxIntimacy >= 5 },
  { id: 'gold_1000',      name: 'Treasure Hoard',     desc: 'Accumulate 1000 total gold earned',     check: st => st.totalGoldEarned >= 1000 },
  { id: 'boss_first',     name: 'Demon Slayer',       desc: 'Defeat your first boss',                check: st => st.bossesDefeated >= 1 },
  { id: 'level_10',       name: 'Shadow King',        desc: 'Reach Level 10',                        check: st => st.level >= 10 },
  { id: 'level_15',       name: 'Eternal Architect',  desc: 'Reach the pinnacle: Level 15',          check: st => st.level >= 15 },
];

const FIRST_NAMES = ['Lyra','Seris','Zara','Nova','Ember','Vesper','Iris','Cleo','Mira','Sable','Riven','Nyx','Astra','Vex','Orla'];
const LAST_NAMES  = ['Ashveil','Moonwhisper','Dawnforge','Nightthorn','Stargaze','Voidbane','Crimsonfall','Embermark','Duskraven','Ironveil'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getLevel(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xp) cur = l; else break; }
  return cur;
}

function getNextLevel(xp) {
  const cur = getLevel(xp);
  return LEVELS.find(l => l.level === cur.level + 1) || null;
}

function xpBarPct(xp) {
  const cur = getLevel(xp);
  const nxt = getNextLevel(xp);
  if (!nxt) return 1;
  return Math.min((xp - cur.xp) / (nxt.xp - cur.xp), 1);
}

function getEffects(equipped) {
  const fx = { xpMultiplier: 1, goldMultiplier: 1, bondMultiplier: 1, bossDamage: 1, streakGrace: 0, doubleXP: false };
  for (const id of equipped) {
    const item = ITEMS.find(i => i.id === id);
    if (!item) continue;
    const e = item.effect;
    if (e.xpMultiplier)   fx.xpMultiplier   *= e.xpMultiplier;
    if (e.goldMultiplier) fx.goldMultiplier  *= e.goldMultiplier;
    if (e.bondMultiplier) fx.bondMultiplier  *= e.bondMultiplier;
    if (e.bossDamage)     fx.bossDamage      *= e.bossDamage;
    if (e.streakGrace)    fx.streakGrace     += e.streakGrace;
    if (e.doubleXP)       fx.doubleXP        = true;
  }
  return fx;
}

function intimacyForBond(bond) {
  let cur = INTIMACY[0];
  for (const l of INTIMACY) { if (bond >= l.bond) cur = l; else break; }
  return cur.level;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  return new Date(Date.now() - 86400000).toISOString().split('T')[0];
}

function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCompanion(existingNames = []) {
  let name = `${randItem(FIRST_NAMES)} ${randItem(LAST_NAMES)}`;
  if (existingNames.includes(name)) name += ' II';
  return {
    id: `companion_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    race:       randItem(RACES),
    class:      randItem(COMPANION_CLASSES),
    backstory:  `A ${randItem(RACES).toLowerCase()} drawn to Valdris by fate and the pull of something ancient.`,
    body:       randItem(BODY_TYPES),
    hair:       randItem(HAIR_COLORS),
    eyes:       randItem(EYE_COLORS),
    flirtStyle: randItem(FLIRT_STYLES),
    personality:'Enigmatic and fiercely independent, yet drawn to strength and purpose.',
    intimacy:   0,
    bond:       0,
    outfit:     'combat',
    aiImage:    null,
  };
}

// ─── KIRA (starter companion) ─────────────────────────────────────────────────

const KIRA = {
  id:          'kira_foxveil',
  name:        'Kira Foxveil',
  race:        'Foxgirl',
  class:       'Rogue',
  backstory:   "A fox spirit who crossed the Veil to hunt legendary prey — and found you instead. She claims it's business. Her eyes say otherwise.",
  body:        'lithe',
  hair:        'crimson',
  eyes:        'amber',
  flirtStyle:  'bold',
  personality: 'Sharp-tongued, fearless, deeply loyal once trust is earned. Teases constantly but never without affection.',
  intimacy:    1,
  bond:        30,
  outfit:      'combat',
  aiImage:     null,
};

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

function buildInitial() {
  return {
    player: {
      name:   'Murky Sea',
      class:  'Sovereign Architect',
      level:  1,
      xp:     0,
      gold:   200,
      skills: { Faith: 0, Fitness: 0, Business: 0, Relations: 0, Discipline: 0, Knowledge: 0 },
    },
    quests: [
      { id: 'q1', text: 'Define the 3 most important moves for this week', type: 'priority', xp: 50, gold: 15, done: false, skill: 'Business' },
      { id: 'q2', text: 'Train or move your body for 30+ minutes',         type: 'priority', xp: 40, gold: 12, done: false, skill: 'Fitness' },
      { id: 'q3', text: 'Connect meaningfully with someone today',          type: 'side',     xp: 30, gold: 10, done: false, skill: 'Relations' },
      { id: 'q4', text: 'Read or study for 20+ minutes',                   type: 'side',     xp: 25, gold: 8,  done: false, skill: 'Knowledge' },
    ],
    rituals: [
      { id: 'r1', text: 'Morning meditation or prayer',            group: 'morning', streak: 0, lastDone: null, xp: 20, skill: 'Faith' },
      { id: 'r2', text: 'Cold shower or intentional breath work',  group: 'morning', streak: 0, lastDone: null, xp: 25, skill: 'Fitness' },
      { id: 'r3', text: 'Review goals and plan the day',           group: 'morning', streak: 0, lastDone: null, xp: 20, skill: 'Discipline' },
      { id: 'r4', text: 'Deep work block (2+ focused hours)',      group: 'work',    streak: 0, lastDone: null, xp: 35, skill: 'Business' },
      { id: 'r5', text: 'No social media until noon',              group: 'work',    streak: 0, lastDone: null, xp: 30, skill: 'Discipline' },
      { id: 'r6', text: 'Evening journal entry',                   group: 'evening', streak: 0, lastDone: null, xp: 20, skill: 'Knowledge' },
      { id: 'r7', text: 'Screen-free wind down',                   group: 'evening', streak: 0, lastDone: null, xp: 15, skill: 'Discipline' },
    ],
    companions:     [KIRA],
    inventory:      [],
    equipped:       [],
    bosses:         BOSSES_INIT.map(b => ({ ...b, hp: b.maxHp })),
    stats: {
      questsCompleted:  0,
      ritualsCompleted: 0,
      totalGoldEarned:  200,
      bossesDefeated:   0,
      maxStreak:        0,
      maxIntimacy:      1,
    },
    achievements:       [],
    activeTab:          'warplan',
    selectedCompanion:  'kira_foxveil',
    dialogueLog:        [],
    newQuestText:       '',
    newQuestType:       'priority',
    newQuestSkill:      'Discipline',
    generatingImage:    {},
    generatingDialogue: false,
  };
}

// ─── SVG COMPANION PORTRAIT ───────────────────────────────────────────────────

const HAIR_HEX = {
  crimson: '#c0392b', silver: '#bdc3c7', obsidian: '#2c3e50', auburn: '#a04030',
  ivory: '#fdebd0', violet: '#8e44ad', 'midnight blue': '#1a237e', 'rose gold': '#e8a0a0',
};
const EYES_HEX = {
  amber: '#f0c040', emerald: '#27ae60', violet: '#8e44ad', crimson: '#c0392b',
  'ice blue': '#85c1e9', golden: '#f39c12', 'shadow grey': '#7f8c8d', topaz: '#f0a030',
};
const SKIN_HEX = {
  Foxgirl: '#fde8d0', Elfborn: '#e8f0e0', Demonkin: '#c090a0', Spiritweave: '#e0d0f0',
  Dragonblood: '#d0e8d0', Shadowborn: '#909098', Celestine: '#f0f0e8', Voidtouched: '#a0a0c0',
};

function CompanionPortrait({ companion, size = 120 }) {
  const hair = HAIR_HEX[companion.hair] || '#c0392b';
  const eyes = EYES_HEX[companion.eyes] || '#f0c040';
  const skin = SKIN_HEX[companion.race]  || '#fde8d0';
  const isFox    = companion.race === 'Foxgirl';
  const isDemon  = companion.race === 'Demonkin';
  const isElf    = companion.race === 'Elfborn';
  const isDragon = companion.race === 'Dragonblood';

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ borderRadius: '50%', border: `2px solid ${S.gold}`, display: 'block' }}>
      <circle cx="60" cy="60" r="60" fill="#0d1220" />
      {/* Ambient glow for high intimacy */}
      {companion.intimacy >= 4 && <circle cx="60" cy="60" r="58" fill="none" stroke={INTIMACY[companion.intimacy]?.color || S.gold} strokeWidth="4" opacity="0.35" />}
      {/* Body */}
      <ellipse cx="60" cy="108" rx="36" ry="22" fill={skin} opacity="0.85" />
      <rect x="53" y="84" width="14" height="18" rx="4" fill={skin} />
      {/* Race extras — behind head */}
      {isFox && <>
        <polygon points="34,52 27,33 46,49" fill={hair} />
        <polygon points="86,52 93,33 74,49" fill={hair} />
        <polygon points="36,50 31,38 44,49" fill="#fde8d0" opacity="0.55" />
        <polygon points="84,50 89,38 76,49" fill="#fde8d0" opacity="0.55" />
      </>}
      {isDemon && <>
        <path d="M45,51 Q37,28 42,22" stroke={hair} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M75,51 Q83,28 78,22" stroke={hair} strokeWidth="5" fill="none" strokeLinecap="round" />
      </>}
      {isDragon && <>
        <path d="M40,54 Q32,36 38,28" stroke="#e74c3c" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M80,54 Q88,36 82,28" stroke="#e74c3c" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>}
      {/* Hair back */}
      <ellipse cx="60" cy="55" rx="27" ry="17" fill={hair} />
      <ellipse cx="36" cy="72" rx="8" ry="20" fill={hair} />
      <ellipse cx="84" cy="72" rx="8" ry="20" fill={hair} />
      {/* Head */}
      <ellipse cx="60" cy="73" rx="26" ry="27" fill={skin} />
      {/* Elf ears */}
      {isElf && <>
        <ellipse cx="34" cy="73" rx="5" ry="11" fill={skin} />
        <ellipse cx="86" cy="73" rx="5" ry="11" fill={skin} />
      </>}
      {/* Hair front */}
      <rect x="44" y="55" width="32" height="10" fill={hair} />
      <ellipse cx="60" cy="56" rx="26" ry="10" fill={hair} />
      {/* Eyes */}
      <ellipse cx="50" cy="74" rx="7" ry="6"   fill="white" />
      <ellipse cx="70" cy="74" rx="7" ry="6"   fill="white" />
      <ellipse cx="50" cy="74" rx="4" ry="4.5" fill={eyes} />
      <ellipse cx="70" cy="74" rx="4" ry="4.5" fill={eyes} />
      <ellipse cx="51" cy="73" rx="1.5" ry="1.5" fill="white" opacity="0.9" />
      <ellipse cx="71" cy="73" rx="1.5" ry="1.5" fill="white" opacity="0.9" />
      {/* Nose */}
      <ellipse cx="58.5" cy="81" r="1" fill="#c09080" />
      <ellipse cx="61.5" cy="81" r="1" fill="#c09080" />
      {/* Mouth */}
      <path d="M54,87 Q60,92 66,87" stroke="#c08070" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────

const card = {
  background: `linear-gradient(160deg, #0e1428 0%, #080e1c 100%)`,
  border: `1px solid ${S.border}`,
  borderTop: `1px solid #253045`,
  borderRadius: 12, padding: 16, marginBottom: 12,
};

function Btn({ onClick, disabled, children, color = S.gold, ghost = false, small = false }) {
  const base = {
    border: ghost ? `1px solid ${color}` : 'none',
    background: ghost ? 'transparent' : disabled ? '#333' : color,
    color: ghost ? color : disabled ? '#666' : '#070912',
    borderRadius: 8,
    padding: small ? '5px 12px' : '8px 16px',
    fontFamily: 'Cinzel, serif',
    fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer',
    fontSize: small ? 11 : 13,
    opacity: disabled ? 0.6 : 1,
    flexShrink: 0,
  };
  return <button onClick={disabled ? undefined : onClick} style={base}>{children}</button>;
}

function Bar({ pct, color = S.gold, height = 4 }) {
  return (
    <div style={{ background: S.border, borderRadius: height / 2, height }}>
      <div style={{ background: color, height, borderRadius: height / 2, width: `${Math.min(Math.max(pct, 0), 1) * 100}%`, transition: 'width 0.4s ease' }} />
    </div>
  );
}

function Shimmer({ width = '100%', height = 120, radius = 8 }) {
  return (
    <div style={{
      width, height, borderRadius: radius, flexShrink: 0,
      background: 'linear-gradient(90deg, #0d1220 0%, #1e2e4a 50%, #0d1220 100%)',
      backgroundSize: '200% 100%',
      animation: 'msc-shimmer 1.4s ease-in-out infinite',
    }} />
  );
}

function SectionTitle({ children, dim }) {
  const c = dim ? S.textDim : S.goldMid;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 6 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${c}55)` }} />
      <div style={{ fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: 2.5, color: c, whiteSpace: 'nowrap' }}>{children}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${c}55)` }} />
    </div>
  );
}

// ─── WORLD MAP ───────────────────────────────────────────────────────────────

const MAP_NODES = [
  { id: 'ashwatch',       x: 120, y: 355, icon: '🏚️' },
  { id: 'thornwood',      x: 58,  y: 232, icon: '🌲' },
  { id: 'voidmarsh',      x: 192, y: 382, icon: '🌫️' },
  { id: 'ironspire',      x: 252, y: 218, icon: '🏰' },
  { id: 'celestine_peak', x: 145, y: 118, icon: '⛰️' },
  { id: 'void_throne',    x: 258, y: 68,  icon: '👁️' },
  { id: 'eternal_forge',  x: 52,  y: 68,  icon: '⚡' },
];
const MAP_EDGES = [
  ['ashwatch','thornwood'], ['ashwatch','voidmarsh'], ['ashwatch','ironspire'],
  ['thornwood','celestine_peak'], ['ironspire','void_throne'],
  ['celestine_peak','eternal_forge'], ['celestine_peak','void_throne'],
  ['thornwood','voidmarsh'],
];
const NODE_MAP = Object.fromEntries(MAP_NODES.map(n => [n.id, n]));

function WorldMap({ curLevel, sceneImages, generatingScene, generateScene }) {
  const [sel, setSel] = useState(null);
  const regionData = Object.fromEntries(WORLD_REGIONS.map(r => [r.id, r]));
  const isUnlocked = id => curLevel >= (regionData[id]?.unlockLevel ?? 99);
  const selR = sel ? regionData[sel] : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 16px' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, margin: 0, fontSize: 18 }}>🗺️ Valdris</h2>
        <div style={{ fontSize: 11, color: S.textDim, fontStyle: 'italic' }}>Tap a region to explore</div>
      </div>

      {/* ── SVG MAP ── */}
      <div style={{ marginLeft: -16, marginRight: -16 }}>
        <svg viewBox="0 0 320 440" style={{ width: '100%', display: 'block' }}>
          <defs>
            <radialGradient id="mapbg" cx="38%" cy="62%" r="75%">
              <stop offset="0%" stopColor="#0a1428" /><stop offset="100%" stopColor="#040810" />
            </radialGradient>
            <pattern id="mgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="#0d1830" strokeWidth="0.4" />
            </pattern>
            <filter id="glo" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glo2" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="fog" cx="50%" cy="50%" r="50%">
              <stop offset="30%" stopColor="#070912" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#070912" stopOpacity="0.85"/>
            </radialGradient>
          </defs>

          {/* Background */}
          <rect width="320" height="440" fill="url(#mapbg)" />
          <rect width="320" height="440" fill="url(#mgrid)" opacity="0.7" />

          {/* ── Decorative terrain ── */}
          {/* Mountains — Celestine Peak */}
          <g opacity="0.35" fill="#182c48" stroke="#243858" strokeWidth="0.8">
            <polygon points="112,145 138,100 164,145"/>
            <polygon points="126,145 150,105 172,145"/>
            <polygon points="96,145 118,120 140,145"/>
          </g>
          {/* Mountains — Eternal Forge (glowing) */}
          <g opacity="0.35" fill="#2a1505" stroke="#3d2208" strokeWidth="0.8">
            <polygon points="22,95 52,50 82,95"/>
            <polygon points="36,95 60,58 84,95"/>
          </g>
          {/* Void spires — Void Throne */}
          <g opacity="0.3" fill="#120520" stroke="#1e0a32" strokeWidth="0.8">
            <polygon points="232,92 258,42 284,92"/>
            <polygon points="246,92 265,55 290,92"/>
          </g>
          {/* Forest — Thornwood */}
          <g opacity="0.4" fill="#081a0e" stroke="#142a1a" strokeWidth="0.7">
            <circle cx="20" cy="225" r="14"/><circle cx="36" cy="240" r="12"/>
            <circle cx="16" cy="248" r="10"/><circle cx="34" cy="212" r="11"/>
          </g>
          {/* Marsh — Voidmarsh */}
          <g opacity="0.35" stroke="#1a2535" fill="none" strokeWidth="1.5">
            <path d="M162,408 Q172,400 182,408 Q192,400 205,408 Q215,400 222,408"/>
            <path d="M158,418 Q170,410 183,418 Q196,410 208,418"/>
          </g>
          {/* Ruins — Ashwatch */}
          <g opacity="0.3" fill="none" stroke="#2a2015" strokeWidth="1">
            <rect x="90" y="374" width="8" height="13"/><rect x="103" y="370" width="6" height="11"/>
            <rect x="133" y="372" width="7" height="12"/>
          </g>
          {/* Decorative border */}
          <rect x="4" y="4" width="312" height="432" rx="8" fill="none" stroke="#1c2838" strokeWidth="1" opacity="0.6"/>
          <rect x="8" y="8" width="304" height="424" rx="6" fill="none" stroke="#141e2c" strokeWidth="0.5" opacity="0.4"/>

          {/* ── Edges ── */}
          {MAP_EDGES.map(([a, b]) => {
            const na = NODE_MAP[a], nb = NODE_MAP[b];
            const both = isUnlocked(a) && isUnlocked(b);
            const cx = (na.x + nb.x) / 2 + (nb.y - na.y) * 0.12;
            const cy = (na.y + nb.y) / 2 - (nb.x - na.x) * 0.12;
            return (
              <path key={`${a}-${b}`}
                d={`M${na.x} ${na.y} Q${cx} ${cy} ${nb.x} ${nb.y}`}
                fill="none"
                stroke={both ? S.goldDim : '#182030'}
                strokeWidth={both ? 1.5 : 0.8}
                strokeDasharray={both ? '5 3' : '2 5'}
                opacity={both ? 0.65 : 0.35}
              />
            );
          })}

          {/* ── Region nodes ── */}
          {MAP_NODES.map(node => {
            const r = regionData[node.id]; if (!r) return null;
            const unlocked = isUnlocked(node.id);
            const selected = sel === node.id;
            const nr = selected ? 26 : 22;
            return (
              <g key={node.id} style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setSel(sel === node.id ? null : node.id); }}>
                {/* Outer pulse ring */}
                {unlocked && <circle cx={node.x} cy={node.y} r={nr + 12} fill="none" stroke={selected ? S.gold : S.goldDim} strokeWidth={selected ? 1.5 : 0.8} opacity={selected ? 0.35 : 0.12} />}
                {/* Glow halo */}
                {unlocked && <circle cx={node.x} cy={node.y} r={nr + 4} fill={selected ? '#f0c04008' : '#f0c04004'} stroke={selected ? S.gold : S.goldDim} strokeWidth={selected ? 1.5 : 0.8} opacity={selected ? 0.6 : 0.2} filter="url(#glo)" />}
                {/* Node body */}
                <circle cx={node.x} cy={node.y} r={nr}
                  fill={selected ? '#162540' : unlocked ? '#0d1c30' : '#07090f'}
                  stroke={selected ? S.gold : unlocked ? '#2a3d58' : '#121820'}
                  strokeWidth={selected ? 2 : 1.5}
                />
                {/* Fog overlay */}
                {!unlocked && <circle cx={node.x} cy={node.y} r={nr} fill="url(#fog)" />}
                {/* Icon */}
                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={selected ? 18 : 15} opacity={unlocked ? 1 : 0.25}>{node.icon}</text>
                {/* Lock badge */}
                {!unlocked && <text x={node.x + 13} y={node.y - 13} textAnchor="middle" dominantBaseline="middle" fontSize="10" opacity="0.7">🔒</text>}
                {/* Label */}
                <text x={node.x} y={node.y + nr + 11} textAnchor="middle"
                  fontSize="7.5" fontFamily="Cinzel, serif" letterSpacing="0.5"
                  fill={selected ? S.gold : unlocked ? '#9a8460' : '#2a2a2a'}
                  opacity={unlocked ? 0.95 : 0.35}
                >{r.name.split(' ').slice(0, 2).join(' ')}</text>
              </g>
            );
          })}

          {/* Compass rose */}
          <g transform="translate(288,422)" opacity="0.3">
            <circle r="10" fill="none" stroke={S.goldDim} strokeWidth="0.8"/>
            <line x1="0" y1="-7" x2="0" y2="7" stroke={S.goldDim} strokeWidth="1"/>
            <line x1="-7" y1="0" x2="7" y2="0" stroke={S.goldDim} strokeWidth="1"/>
            <polygon points="0,-9 2,-4 -2,-4" fill={S.goldDim} opacity="0.8"/>
            <text x="0" y="-12" textAnchor="middle" fontSize="6" fill={S.goldDim} fontFamily="Cinzel, serif">N</text>
          </g>
        </svg>
      </div>

      {/* ── Selected region detail ── */}
      {selR && (
        <div style={{ ...card, margin: '0 0 12px', borderColor: isUnlocked(sel) ? `${S.goldDim}88` : S.border, position: 'relative', overflow: 'hidden' }}>
          {sceneImages[sel] && (
            <img src={sceneImages[sel]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
          )}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 40, lineHeight: 1 }}>{selR.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Cinzel, serif', color: isUnlocked(sel) ? S.gold : S.textDim, fontSize: 16, marginBottom: 4 }}>{selR.name}</div>
                <div style={{ fontSize: 13, color: S.textDim, lineHeight: 1.55 }}>{selR.desc}</div>
                <div style={{ fontSize: 11, marginTop: 6, color: isUnlocked(sel) ? S.green : S.red, fontFamily: 'Cinzel, serif' }}>
                  {isUnlocked(sel) ? '✦ Realm Accessible' : `🔒 Requires Level ${selR.unlockLevel}`}
                </div>
              </div>
            </div>
            {isUnlocked(sel) && (
              <div style={{ display: 'flex', gap: 8 }}>
                {!sceneImages[sel] && (
                  <Btn ghost small disabled={!!generatingScene[sel]} onClick={() => generateScene('region', sel)}>
                    {generatingScene[sel] ? '...' : '🎨 Generate Scene'}
                  </Btn>
                )}
                {sceneImages[sel] && <div style={{ fontSize: 11, color: S.green }}>✦ Scene generated</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

// ─── GOOGLE DRIVE HELPERS ─────────────────────────────────────────────────────

function loadGIS() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise(resolve => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

function requestDriveToken(clientId, skipConsent) {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: r => r.error ? reject(new Error(r.error)) : resolve(r.access_token),
    });
    client.requestAccessToken({ prompt: skipConsent ? '' : 'consent' });
  });
}

async function uploadPortraitToDrive(dataUrl, filename, token) {
  if (!dataUrl?.startsWith('data:')) {
    throw new Error('Portrait was generated before the fix — regenerate it first using ✨ Portrait, then retry.');
  }
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify({ name: filename, mimeType: mime })], { type: 'application/json' }));
  form.append('file', blob);
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const file = await res.json();
  if (!file.id) throw new Error(file.error?.message || 'Drive upload failed');
  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });
  return file.id;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = '@keyframes msc-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }';
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const [keys, setKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem('msc_keys') || '{}'); } catch { return {}; }
  });
  const [gToken, setGToken] = useState(null);
  const [driveUploading, setDriveUploading] = useState({});
  const [driveStatus, setDriveStatus] = useState('');
  const [sceneImages, setSceneImages] = useState({});
  const [generatingScene, setGeneratingScene] = useState({});

  function saveKey(k, v) {
    setKeys(prev => {
      const next = { ...prev, [k]: v };
      try { localStorage.setItem('msc_keys', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem('msc_v1');
      if (raw) {
        const saved = JSON.parse(raw);
        const fresh = buildInitial();
        return {
          ...fresh,
          ...saved,
          // always strip ephemeral fields
          dialogueLog:        saved.dialogueLog        || [],
          generatingImage:    {},
          generatingDialogue: false,
          newQuestText:       '',
        };
      }
    } catch {}
    return buildInitial();
  });

  // Persist (strip ephemeral fields)
  useEffect(() => {
    try {
      const { generatingImage, generatingDialogue, newQuestText, newQuestType, newQuestSkill, ...toSave } = state;
      localStorage.setItem('msc_v1', JSON.stringify(toSave));
    } catch {}
  }, [state]);

  const set = useCallback((patch) => setState(s => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);

  // ── Google Drive backup ───────────────────────────────────────────────────
  async function getToken() {
    const clientId = keys.googleClientId?.trim();
    if (!clientId) throw new Error('Add your Google Client ID in Settings first.');
    if (!clientId.endsWith('.apps.googleusercontent.com')) throw new Error('Invalid Client ID — should end in .apps.googleusercontent.com');
    await loadGIS();
    const token = await requestDriveToken(clientId, !!gToken);
    setGToken(token);
    return token;
  }

  async function backupOne(companion, token) {
    setDriveUploading(u => ({ ...u, [companion.id]: true }));
    try {
      const fileId = await uploadPortraitToDrive(companion.aiImage, `${companion.name}_portrait.jpg`, token);
      setState(s => ({
        ...s,
        companions: s.companions.map(c => c.id === companion.id ? { ...c, driveFileId: fileId } : c),
      }));
    } finally {
      setDriveUploading(u => ({ ...u, [companion.id]: false }));
    }
  }

  async function backupAllToDrive() {
    const pending = state.companions.filter(c => c.aiImage && !c.driveFileId);
    if (!pending.length) { setDriveStatus('All portraits already backed up.'); return; }
    setDriveStatus('');
    try {
      const token = await getToken();
      setDriveStatus(`Uploading 0 / ${pending.length}…`);
      for (let i = 0; i < pending.length; i++) {
        await backupOne(pending[i], token);
        setDriveStatus(`Uploading ${i + 1} / ${pending.length}…`);
      }
      setDriveStatus(`✓ ${pending.length} portrait${pending.length > 1 ? 's' : ''} saved to Drive.`);
    } catch (e) {
      setDriveStatus(`Error: ${e.message}`);
    }
  }

  async function backupSingleToDrive(companion) {
    setDriveStatus('');
    try {
      const token = await getToken();
      await backupOne(companion, token);
      setDriveStatus(`✓ ${companion.name} saved to Drive.`);
    } catch (e) {
      setDriveStatus(`Error: ${e.message}`);
    }
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const curLevel  = getLevel(state.player.xp);
  const nxtLevel  = getNextLevel(state.player.xp);
  const xpPct     = xpBarPct(state.player.xp);
  const fx        = getEffects(state.equipped);
  const selComp   = state.companions.find(c => c.id === state.selectedCompanion) || state.companions[0];

  // ── XP / Gold / Skill mutators ────────────────────────────────────────────
  function gainXP(base) {
    const amount = Math.round(base * fx.xpMultiplier * (fx.doubleXP ? 2 : 1));
    setState(s => {
      const newXP  = s.player.xp + amount;
      const newLvl = getLevel(newXP).level;
      return { ...s, player: { ...s.player, xp: newXP, level: newLvl } };
    });
    return amount;
  }

  function gainGold(base) {
    const amount = Math.round(base * fx.goldMultiplier);
    setState(s => ({
      ...s,
      player: { ...s.player, gold: s.player.gold + amount },
      stats:  { ...s.stats,  totalGoldEarned: s.stats.totalGoldEarned + amount },
    }));
    return amount;
  }

  function gainSkill(skill, pts = 1) {
    setState(s => ({
      ...s,
      player: { ...s.player, skills: { ...s.player.skills, [skill]: (s.player.skills[skill] || 0) + pts } },
    }));
  }

  function checkAchievements(extraStats = {}) {
    setState(s => {
      const check = { ...s.stats, ...extraStats, level: getLevel(s.player.xp).level };
      const newUnlocked = ACHIEVEMENTS
        .filter(a => !s.achievements.includes(a.id) && a.check(check))
        .map(a => a.id);
      if (!newUnlocked.length) return s;
      return { ...s, achievements: [...s.achievements, ...newUnlocked] };
    });
  }

  // ── API: AI Image ─────────────────────────────────────────────────────────
  async function generatePortrait(companion, outfit) {
    const ot = outfit || outfitForIntimacy(companion.intimacy);
    const cKey = portraitKey(companion, ot);
    const cached = getImg(cKey);
    if (cached) {
      setState(s => ({ ...s, companions: s.companions.map(c => c.id === companion.id ? { ...c, aiImage: cached } : c) }));
      return;
    }
    set(s => ({ generatingImage: { ...s.generatingImage, [companion.id]: true }, imageError: { ...s.imageError, [companion.id]: null } }));
    try {
      const prompt = buildCompanionPrompt(companion, ot);
      const negative_prompt = buildNegativePrompt(ot);
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, negative_prompt, cacheKey: cKey, novelaiKey: keys.novelai?.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      const dataUrl = `data:${data.mime || 'image/png'};base64,${data.b64}`;
      setImg(cKey, dataUrl);
      setState(s => ({ ...s, companions: s.companions.map(c => c.id === companion.id ? { ...c, aiImage: dataUrl } : c) }));
    } catch (e) {
      set(s => ({ imageError: { ...s.imageError, [companion.id]: e.message } }));
    }
    set(s => ({ generatingImage: { ...s.generatingImage, [companion.id]: false } }));
  }

  async function generateScene(type, id) {
    const cKey = type === 'region' ? regionKey(id) : bossKey(id);
    const cached = getImg(cKey);
    if (cached) { setSceneImages(p => ({ ...p, [id]: cached })); return; }
    setGeneratingScene(p => ({ ...p, [id]: true }));
    try {
      const prompt = type === 'region' ? buildRegionPrompt(id) : buildBossPrompt(id);
      const res = await fetch('/api/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width: 1216, height: 832, cacheKey: cKey, novelaiKey: keys.novelai?.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);
      const dataUrl = `data:${data.mime || 'image/png'};base64,${data.b64}`;
      setImg(cKey, dataUrl);
      setSceneImages(p => ({ ...p, [id]: dataUrl }));
    } catch (e) { console.error('Scene error:', e); }
    setGeneratingScene(p => ({ ...p, [id]: false }));
  }

  // ── API: AI Dialogue ──────────────────────────────────────────────────────
  async function speak(companion, context = '') {
    if (!companion.aiImage && !state.generatingImage?.[companion.id]) {
      generatePortrait(companion, outfitForIntimacy(companion.intimacy));
    }
    set({ generatingDialogue: true });
    const haremNames = state.companions.filter(c => c.id !== companion.id).map(c => c.name).join(', ');
    const intimacyName = INTIMACY[companion.intimacy]?.name || 'Stranger';
    try {
      const dlgHeaders = { 'Content-Type': 'application/json' };
      if (keys.anthropic) dlgHeaders['x-anthropic-key'] = keys.anthropic.trim();
      const res = await fetch('/api/dialogue', {
        method: 'POST',
        headers: dlgHeaders,
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `You are ${companion.name}, a ${companion.race} ${companion.class} in the dark fantasy world of Valdris. Flirt style: ${companion.flirtStyle}. Personality: ${companion.personality}. Intimacy with ${state.player.name} (the Sovereign Architect): ${intimacyName}.${haremNames ? ` Other companions in the harem: ${haremNames}.` : ''} ${context || 'Greet the player in character.'} Keep response under 80 words. Speak directly to them.`,
          }],
        }),
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text || 'The arcane channel is silent...';
      setState(s => ({
        ...s,
        dialogueLog: [{ id: Date.now(), companion: companion.name, text, ts: new Date().toLocaleTimeString() }, ...s.dialogueLog].slice(0, 15),
      }));
    } catch {
      setState(s => ({
        ...s,
        dialogueLog: [{ id: Date.now(), companion: companion.name, text: '...the connection fades into static.', ts: new Date().toLocaleTimeString() }, ...s.dialogueLog].slice(0, 15),
      }));
    }
    set({ generatingDialogue: false });
  }

  // ── War Plan actions ──────────────────────────────────────────────────────
  function completeQuest(q) {
    if (q.done) return;
    gainXP(q.xp);
    gainGold(q.gold);
    gainSkill(q.skill);
    setState(s => ({
      ...s,
      quests: s.quests.map(x => x.id === q.id ? { ...x, done: true } : x),
      stats:  { ...s.stats, questsCompleted: s.stats.questsCompleted + 1 },
    }));
    checkAchievements({ questsCompleted: state.stats.questsCompleted + 1 });
  }

  function addQuest() {
    if (!state.newQuestText.trim()) return;
    const isPriority = state.newQuestType === 'priority';
    setState(s => ({
      ...s,
      quests: [...s.quests, {
        id:   `q_${Date.now()}`,
        text:  s.newQuestText.trim(),
        type:  s.newQuestType,
        xp:    isPriority ? 50 : 25,
        gold:  isPriority ? 15 : 8,
        done:  false,
        skill: s.newQuestSkill,
      }],
      newQuestText: '',
    }));
  }

  function deleteQuest(id) {
    setState(s => ({ ...s, quests: s.quests.filter(q => q.id !== id) }));
  }

  // ── Ritual actions ────────────────────────────────────────────────────────
  function completeRitual(r) {
    const today = todayStr();
    if (r.lastDone === today) return;
    const newStreak  = r.lastDone === yesterdayStr() ? r.streak + 1 : 1;
    const streakXP   = Math.round(r.xp * (1 + newStreak * 0.1));
    const streakGold = 5 + Math.floor(newStreak / 3) * 3;
    gainXP(streakXP);
    gainGold(streakGold);
    gainSkill(r.skill);
    setState(s => ({
      ...s,
      rituals: s.rituals.map(x => x.id === r.id ? { ...x, streak: newStreak, lastDone: today } : x),
      stats:   { ...s.stats, ritualsCompleted: s.stats.ritualsCompleted + 1, maxStreak: Math.max(s.stats.maxStreak, newStreak) },
    }));
    checkAchievements({ maxStreak: Math.max(state.stats.maxStreak, newStreak) });
  }

  // ── Party actions ─────────────────────────────────────────────────────────
  function giftBond(companionId, amount = 10) {
    const bonus = Math.round(amount * fx.bondMultiplier);
    let levelUpCompanion = null;
    setState(s => {
      const updated = s.companions.map(c => {
        if (c.id !== companionId) return c;
        const newBond     = c.bond + bonus;
        const newIntimacy = intimacyForBond(newBond);
        if (newIntimacy > c.intimacy) levelUpCompanion = { ...c, intimacy: newIntimacy };
        return { ...c, bond: newBond, intimacy: newIntimacy };
      });
      const maxInti = Math.max(...updated.map(c => c.intimacy));
      return { ...s, companions: updated, stats: { ...s.stats, maxIntimacy: maxInti } };
    });
    checkAchievements();
    if (levelUpCompanion) {
      setTimeout(() => generatePortrait(levelUpCompanion, outfitForIntimacy(levelUpCompanion.intimacy)), 100);
    }
  }

  function summonCompanion() {
    if (state.player.gold < 300) return;
    const newC = generateCompanion(state.companions.map(c => c.name));
    setState(s => ({
      ...s,
      player:     { ...s.player, gold: s.player.gold - 300 },
      companions: [...s.companions, newC],
      selectedCompanion: newC.id,
    }));
    setTimeout(() => generatePortrait(newC, 'combat'), 100);
  }

  // ── Boss actions ──────────────────────────────────────────────────────────
  function attackBoss(bossId) {
    const dmg = Math.round((20 + Math.random() * 20) * fx.bossDamage);
    setState(s => {
      const boss = s.bosses.find(b => b.id === bossId);
      if (!boss || boss.hp <= 0) return s;
      const newHp      = Math.max(0, boss.hp - dmg);
      const justKilled = newHp === 0 && boss.hp > 0;
      let newPlayer    = { ...s.player };
      let newStats     = { ...s.stats };
      if (justKilled) {
        newPlayer.xp    += boss.reward.xp;
        newPlayer.gold  += boss.reward.gold;
        newPlayer.level  = getLevel(newPlayer.xp).level;
        newPlayer.skills = { ...newPlayer.skills, [boss.skill]: (newPlayer.skills[boss.skill] || 0) + 3 };
        newStats.bossesDefeated += 1;
        newStats.totalGoldEarned += boss.reward.gold;
      }
      return {
        ...s,
        bosses: s.bosses.map(b => b.id === bossId ? { ...b, hp: newHp } : b),
        player: newPlayer,
        stats:  newStats,
      };
    });
    checkAchievements({ bossesDefeated: state.stats.bossesDefeated + 1 });
  }

  function resetBoss(bossId) {
    setState(s => ({ ...s, bosses: s.bosses.map(b => b.id === bossId ? { ...b, hp: b.maxHp } : b) }));
  }

  // ── Shop actions ──────────────────────────────────────────────────────────
  function buyItem(shopItem) {
    if (state.player.gold < shopItem.cost) return;
    setState(s => {
      let newPlayer     = { ...s.player, gold: s.player.gold - shopItem.cost };
      let newInventory  = [...s.inventory];
      let newCompanions = [...s.companions];
      let newStats      = { ...s.stats };

      if (shopItem.shopType === 'scroll') {
        newCompanions = [...s.companions, generateCompanion(s.companions.map(c => c.name))];
      } else if (shopItem.id === 'xp_cache') {
        newPlayer.xp    += 200;
        newPlayer.level  = getLevel(newPlayer.xp).level;
      } else if (shopItem.id === 'gold_cache') {
        newPlayer.gold  += 100;
        newStats.totalGoldEarned += 100;
      } else if (shopItem.id === 'bond_token') {
        newCompanions = s.companions.map(c => {
          if (c.id !== s.selectedCompanion) return c;
          const newBond     = c.bond + 50;
          const newIntimacy = intimacyForBond(newBond);
          return { ...c, bond: newBond, intimacy: newIntimacy };
        });
      } else if (shopItem.shopType === 'item' && !newInventory.includes(shopItem.id)) {
        newInventory.push(shopItem.id);
      }
      return { ...s, player: newPlayer, inventory: newInventory, companions: newCompanions, stats: newStats };
    });
  }

  function toggleEquip(id) {
    setState(s => {
      if (s.equipped.includes(id)) return { ...s, equipped: s.equipped.filter(x => x !== id) };
      if (s.equipped.length >= 3) return s;
      return { ...s, equipped: [...s.equipped, id] };
    });
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'warplan',  label: 'War Plan', icon: '⚔️' },
    { id: 'rituals',  label: 'Rituals',  icon: '🔥' },
    { id: 'party',    label: 'Party',    icon: '💎' },
    { id: 'gallery',  label: 'Gallery',  icon: '🖼️' },
    { id: 'world',    label: 'World',    icon: '🗺️' },
    { id: 'bosses',   label: 'Bosses',   icon: '💀' },
    { id: 'shop',     label: 'Shop',     icon: '🏪' },
    { id: 'glory',    label: 'Glory',    icon: '🏆' },
  ];

  const SHOP_CATALOG = [
    { id: 'companion_scroll', name: 'Companion Scroll',  desc: 'Summon a random companion to your party',    cost: 300, shopType: 'scroll' },
    { id: 'xp_cache',         name: 'XP Cache',          desc: 'Gain 200 XP instantly',                      cost: 150, shopType: 'consumable' },
    { id: 'gold_cache',       name: "Raider's Cache",    desc: 'Gain 100 gold instantly',                    cost: 80,  shopType: 'consumable' },
    { id: 'bond_token',       name: 'Bond Token',        desc: '+50 bond with selected companion',           cost: 200, shopType: 'consumable' },
    ...ITEMS.map(i => ({ ...i, shopType: 'item' })),
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'Crimson Text, serif', maxWidth: 480, margin: '0 auto', paddingBottom: 'calc(148px + env(safe-area-inset-bottom))' }}>

      {/* ── HEADER ── */}
      <div style={{ background: S.bgCard, borderBottom: `1px solid ${S.border}`, padding: '12px 16px', paddingTop: 'calc(12px + env(safe-area-inset-top))', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel Decorative, serif', color: S.gold, fontSize: 15, lineHeight: 1.2 }}>Murky Sea Chronicles</div>
            <div style={{ fontSize: 11, color: S.textDim }}>Valdris · {state.player.name} · {curLevel.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: S.gold, fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 14 }}>⚡ Lv {curLevel.level}</div>
              <div style={{ color: S.gold, fontSize: 12 }}>◈ {state.player.gold}</div>
            </div>
            <button onClick={() => set({ activeTab: state.activeTab === 'settings' ? 'warplan' : 'settings' })} style={{
              background: state.activeTab === 'settings' ? S.gold : 'none',
              border: `1px solid ${state.activeTab === 'settings' ? S.gold : S.border}`,
              color: state.activeTab === 'settings' ? S.bg : S.textDim,
              borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 16, lineHeight: 1,
            }}>⚙️</button>
          </div>
        </div>
        <Bar pct={xpPct} color={S.gold} height={4} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: S.textDim, marginTop: 2 }}>
          <span>{state.player.xp} XP</span>
          <span>{nxtLevel ? `${nxtLevel.xp} → ${nxtLevel.title}` : '✦ MAX LEVEL'}</span>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, zIndex: 200,
        background: S.bgDeep,
        borderTop: `2px solid ${S.border}`,
        padding: `8px 8px calc(8px + env(safe-area-inset-bottom))`,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {TABS.map(t => {
            const active = state.activeTab === t.id;
            return (
              <button key={t.id} onClick={() => set({ activeTab: t.id })} style={{
                background: active
                  ? 'linear-gradient(180deg, #1a2540 0%, #0f1828 100%)'
                  : 'linear-gradient(180deg, #0d1220 0%, #080c14 100%)',
                border: `1px solid ${active ? S.gold : S.border}`,
                borderRadius: 10,
                padding: '8px 4px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                cursor: 'pointer',
                boxShadow: active ? `0 0 10px ${S.goldDim}55` : 'none',
                transition: 'all 0.15s ease',
              }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
                <span style={{
                  fontSize: 9, fontFamily: 'Cinzel, serif', letterSpacing: 0.5,
                  color: active ? S.gold : S.textDim, whiteSpace: 'nowrap',
                }}>{t.label}</span>
                {active && <div style={{ position: 'absolute', bottom: 0, width: 24, height: 2, background: S.gold, borderRadius: 1 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: 16 }}>

        {/* ══════════ WAR PLAN ══════════ */}
        {state.activeTab === 'warplan' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, margin: 0, fontSize: 18 }}>⚔️ War Plan</h2>
              <Btn ghost small onClick={() => setState(s => ({ ...s, quests: s.quests.map(q => ({ ...q, done: false })) }))}>Reset</Btn>
            </div>

            {/* Skill summary */}
            <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: '6px 14px', padding: 12, marginBottom: 14 }}>
              {SKILLS.map(sk => (
                <span key={sk} style={{ fontSize: 11 }}>
                  <span style={{ color: SKILL_COLORS[sk] }}>{sk.slice(0, 3)}</span>
                  <span style={{ color: S.textDim }}> {state.player.skills[sk] || 0}</span>
                </span>
              ))}
            </div>

            <SectionTitle>PRIORITY QUESTS</SectionTitle>
            {state.quests.filter(q => q.type === 'priority').map(q => (
              <div key={q.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, opacity: q.done ? 0.45 : 1 }}>
                <div onClick={() => completeQuest(q)} style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${q.done ? S.gold : SKILL_COLORS[q.skill] || S.border}`,
                  background: q.done ? S.gold : 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#070912',
                }}>{q.done && '✓'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, textDecoration: q.done ? 'line-through' : 'none' }}>{q.text}</div>
                  <div style={{ fontSize: 11, color: S.textDim, marginTop: 2 }}>
                    <span style={{ color: SKILL_COLORS[q.skill] }}>{q.skill}</span> · ⚡{q.xp} XP · ◈{q.gold}
                  </div>
                </div>
                <div onClick={() => deleteQuest(q.id)} style={{ color: S.textDim, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</div>
              </div>
            ))}

            <SectionTitle dim>SIDE QUESTS</SectionTitle>
            {state.quests.filter(q => q.type === 'side').map(q => (
              <div key={q.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, opacity: q.done ? 0.45 : 1 }}>
                <div onClick={() => completeQuest(q)} style={{
                  width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${q.done ? S.gold : S.border}`,
                  background: q.done ? S.gold : 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#070912',
                }}>{q.done && '✓'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, textDecoration: q.done ? 'line-through' : 'none' }}>{q.text}</div>
                  <div style={{ fontSize: 11, color: S.textDim, marginTop: 2 }}>
                    <span style={{ color: SKILL_COLORS[q.skill] }}>{q.skill}</span> · ⚡{q.xp} XP · ◈{q.gold}
                  </div>
                </div>
                <div onClick={() => deleteQuest(q.id)} style={{ color: S.textDim, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</div>
              </div>
            ))}

            {/* Add Quest */}
            <div style={{ ...card, marginTop: 16 }}>
              <SectionTitle>+ ADD QUEST</SectionTitle>
              <input
                value={state.newQuestText}
                onChange={e => set({ newQuestText: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addQuest()}
                placeholder="Quest description..."
                style={{ width: '100%', background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 6, padding: '8px 10px', fontFamily: 'Crimson Text, serif', fontSize: 14, boxSizing: 'border-box', marginBottom: 8 }}
              />
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select value={state.newQuestType} onChange={e => set({ newQuestType: e.target.value })} style={{ flex: 1, background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 6, padding: '7px 8px', fontFamily: 'Crimson Text, serif' }}>
                  <option value="priority">Priority</option>
                  <option value="side">Side Quest</option>
                </select>
                <select value={state.newQuestSkill} onChange={e => set({ newQuestSkill: e.target.value })} style={{ flex: 1, background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 6, padding: '7px 8px', fontFamily: 'Crimson Text, serif' }}>
                  {SKILLS.map(sk => <option key={sk} value={sk}>{sk}</option>)}
                </select>
              </div>
              <Btn onClick={addQuest}>Add Quest</Btn>
            </div>
          </div>
        )}

        {/* ══════════ RITUALS ══════════ */}
        {state.activeTab === 'rituals' && (
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, marginTop: 0, marginBottom: 16, fontSize: 18 }}>🔥 Sacred Rituals</h2>
            {['morning', 'work', 'evening'].map(group => (
              <div key={group}>
                <SectionTitle>{group.toUpperCase()}</SectionTitle>
                {state.rituals.filter(r => r.group === group).map(r => {
                  const done = r.lastDone === todayStr();
                  const streakXP = Math.round(r.xp * (1 + r.streak * 0.1));
                  return (
                    <div key={r.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, opacity: done ? 0.55 : 1 }}>
                      <div onClick={() => completeRitual(r)} style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${done ? S.gold : SKILL_COLORS[r.skill]}`,
                        background: done ? S.gold : 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#070912',
                      }}>{done && '✓'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14 }}>{r.text}</div>
                        <div style={{ fontSize: 11, color: S.textDim, marginTop: 2, display: 'flex', gap: 10 }}>
                          <span style={{ color: SKILL_COLORS[r.skill] }}>{r.skill}</span>
                          <span>🔥 {r.streak}d streak</span>
                          <span>⚡ {streakXP} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ══════════ PARTY ══════════ */}
        {state.activeTab === 'party' && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, margin: 0, fontSize: 18 }}>💎 My Room</h2>
              <Btn ghost small onClick={summonCompanion} disabled={state.player.gold < 300}>Summon ◈300</Btn>
            </div>

            {/* ── Companion Card Carousel ── */}
            <div style={{
              display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8,
              scrollSnapType: 'x mandatory',
              marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16,
            }}>
              {state.companions.map(c => {
                const isSel = state.selectedCompanion === c.id;
                const intData = INTIMACY[c.intimacy] || INTIMACY[0];
                const nextInt = INTIMACY[Math.min(c.intimacy + 1, 5)];
                const bondPct = nextInt ? Math.min(c.bond / nextInt.bond, 1) : 1;
                const maxBond = nextInt?.bond || 1000;
                return (
                  <div key={c.id} onClick={() => set({ selectedCompanion: c.id })}
                    style={{
                      flexShrink: 0, width: 150, scrollSnapAlign: 'start', cursor: 'pointer',
                      borderRadius: 14, overflow: 'hidden', position: 'relative',
                      border: `2px solid ${isSel ? S.gold : '#1a2236'}`,
                      boxShadow: isSel ? `0 0 22px ${intData.color}55` : '0 2px 8px rgba(0,0,0,0.5)',
                      background: '#080d1a',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}>

                    {/* Portrait area */}
                    <div style={{ position: 'relative', height: 210 }}>
                      {state.generatingImage[c.id] ? (
                        <Shimmer width="100%" height={210} radius={0} />
                      ) : c.aiImage ? (
                        <img src={c.aiImage} alt={c.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1525' }}>
                          <CompanionPortrait companion={c} size={110} />
                        </div>
                      )}
                      {/* Top gradient */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 70,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
                      {/* Name + heart badge */}
                      <div style={{ position: 'absolute', top: 7, left: 8, right: 8 }}>
                        <div style={{ fontSize: 11, fontFamily: 'Cinzel, serif', color: intData.color,
                          fontWeight: 700, textShadow: '0 1px 5px rgba(0,0,0,1)', lineHeight: 1.2 }}>
                          {c.name.split(' ')[0]}
                        </div>
                        <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: 'rgba(0,0,0,0.55)', border: `1px solid ${intData.color}55`,
                          borderRadius: 20, padding: '2px 7px' }}>
                          <span style={{ fontSize: 9, color: intData.color }}>❤</span>
                          <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{c.intimacy}</span>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>/{INTIMACY.length - 1}</span>
                        </div>
                      </div>
                      {/* Selected glow overlay */}
                      {isSel && <div style={{ position: 'absolute', inset: 0, border: `2px solid ${S.gold}44`, pointerEvents: 'none' }} />}
                    </div>

                    {/* Bottom panel */}
                    <div style={{ padding: '8px 8px 8px', background: 'linear-gradient(180deg, #0d1528 0%, #060a14 100%)' }}>
                      {/* Bond progress */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 7 }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>🌸</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 5, background: '#141e32', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${bondPct * 100}%`, height: '100%', borderRadius: 3,
                              background: `linear-gradient(90deg, ${intData.color}77, ${intData.color})`,
                              transition: 'width 0.4s' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{c.bond}/{maxBond}</span>
                            <span style={{ fontSize: 9, color: S.goldDim, fontFamily: 'Cinzel, serif' }}>Gift</span>
                          </div>
                        </div>
                        {/* Level circle */}
                        <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: `radial-gradient(circle, ${intData.color}33, #06090f)`,
                          border: `1.5px solid ${intData.color}99`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: '#fff', fontWeight: 700 }}>
                          {c.intimacy}
                        </div>
                      </div>
                      {/* Bond Up button */}
                      <button onClick={e => { e.stopPropagation(); giftBond(c.id, 50); }}
                        style={{
                          width: '100%', padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                          fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                          background: isSel
                            ? `linear-gradient(135deg, ${intData.color}dd, ${intData.color}88)`
                            : 'linear-gradient(135deg, #1c2a44, #0f1a2e)',
                          color: isSel ? '#fff' : S.textDim,
                          boxShadow: isSel ? `0 2px 10px ${intData.color}44` : 'none',
                          transition: 'all 0.2s',
                        }}>
                        {c.intimacy < 5 ? '✦ Bond Up' : '✦ Bonded'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Bottom CTA row (Date once / Auto Date style) ── */}
            {selComp && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14, marginBottom: 14 }}>
                <button onClick={() => speak(selComp)} disabled={state.generatingDialogue}
                  style={{
                    flex: 1, padding: '13px 0', borderRadius: 28, border: 'none', cursor: 'pointer',
                    background: state.generatingDialogue
                      ? '#1a2030'
                      : 'linear-gradient(135deg, #e91e8c 0%, #9b1068 100%)',
                    color: '#fff', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700,
                    boxShadow: state.generatingDialogue ? 'none' : '0 4px 18px rgba(233,30,140,0.4)',
                    opacity: state.generatingDialogue ? 0.6 : 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    transition: 'all 0.2s',
                  }}>
                  <span>{state.generatingDialogue ? '…' : '💬 Speak'}</span>
                  <span style={{ fontSize: 10, opacity: 0.75, fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
                    Bond {selComp.bond}
                  </span>
                </button>
                <button onClick={() => giftBond(selComp.id, 25)}
                  style={{
                    flex: 1, padding: '13px 0', borderRadius: 28, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #c49a30 0%, #7a5c18 100%)',
                    color: '#fff', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700,
                    boxShadow: '0 4px 18px rgba(196,154,48,0.35)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  }}>
                  <span>🎁 Gift</span>
                  <span style={{ fontSize: 10, opacity: 0.75, fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
                    Bond +25
                  </span>
                </button>
              </div>
            )}

            {/* ── Selected companion details ── */}
            {selComp && (
              <>
                {/* Portrait status */}
                {state.imageError?.[selComp.id] && (
                  <div style={{ ...card, marginBottom: 10, background: '#1a0808', borderColor: S.red }}>
                    <div style={{ fontSize: 12, color: S.red }}>Portrait error: {state.imageError[selComp.id]}</div>
                  </div>
                )}

                {/* Lore */}
                <div style={{ ...card, marginBottom: 10 }}>
                  <SectionTitle>LORE</SectionTitle>
                  <div style={{ fontSize: 12, color: S.textDim, fontStyle: 'italic', lineHeight: 1.55, marginBottom: 8 }}>{selComp.backstory}</div>
                  <div style={{ fontSize: 11, color: S.textDim }}>
                    <span style={{ color: HAIR_HEX[selComp.hair] || S.text }}>◆ {selComp.hair} hair</span>
                    {' · '}
                    <span style={{ color: EYES_HEX[selComp.eyes] || S.text }}>{selComp.eyes} eyes</span>
                    {' · '}
                    <span style={{ color: S.text }}>{selComp.flirtStyle}</span>
                  </div>
                </div>

                {/* Dialogue log */}
                {state.dialogueLog.length > 0 && (
                  <div style={{ ...card, marginBottom: 10 }}>
                    <SectionTitle>DIALOGUE</SectionTitle>
                    {state.dialogueLog.slice(0, 4).map(d => (
                      <div key={d.id} style={{ marginBottom: 12, borderBottom: `1px solid ${S.border}`, paddingBottom: 10 }}>
                        <div style={{ fontSize: 11, color: S.gold, fontFamily: 'Cinzel, serif', marginBottom: 4 }}>
                          {d.companion} <span style={{ color: S.textDim, fontFamily: 'Crimson Text, serif', fontWeight: 400 }}>· {d.ts}</span>
                        </div>
                        <div style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 1.5 }}>"{d.text}"</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Harem dynamics */}
                {state.companions.length > 1 && (
                  <div style={{ ...card, background: S.bgDeep }}>
                    <SectionTitle>HAREM DYNAMICS</SectionTitle>
                    {state.companions.filter(c => c.id !== selComp.id).map(c => (
                      <div key={c.id} style={{ fontSize: 12, color: S.textDim, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: S.text }}>{c.name}</span>
                        <span>{INTIMACY[c.intimacy]?.name} · <span style={{ fontStyle: 'italic' }}>{c.flirtStyle}</span></span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════ GALLERY ══════════ */}
        {state.activeTab === 'gallery' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, margin: 0, fontSize: 18 }}>🖼️ Portrait Gallery</h2>
              {keys.googleClientId && state.companions.some(c => c.aiImage) && (
                <Btn ghost small onClick={backupAllToDrive}>☁ Backup All</Btn>
              )}
            </div>
            <div style={{ fontSize: 13, color: S.textDim, marginBottom: driveStatus ? 8 : 16, fontStyle: 'italic' }}>AI-generated portraits of your companions.</div>
            {driveStatus && (
              <div style={{ fontSize: 12, color: driveStatus.startsWith('Error') ? S.red : S.green, marginBottom: 12, padding: '6px 10px', background: S.bgCard, borderRadius: 6 }}>
                {driveStatus}
              </div>
            )}

            {state.companions.filter(c => c.aiImage).length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎨</div>
                <div style={{ fontFamily: 'Cinzel, serif', color: S.textDim, fontSize: 14, marginBottom: 8 }}>No portraits yet</div>
                <div style={{ fontSize: 12, color: S.textDim }}>Go to Party, select a companion, and tap ✨ Portrait to generate one.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {state.companions.filter(c => c.aiImage).map(c => (
                  <div key={c.id} style={{ ...card, padding: 10, cursor: 'pointer' }}
                    onClick={() => { set({ selectedCompanion: c.id, activeTab: 'party' }); }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={c.aiImage}
                        alt={c.name}
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 8 }}
                      />
                      {c.driveFileId && (
                        <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(7,9,18,0.75)', borderRadius: 4, padding: '2px 5px', fontSize: 11, color: S.green }}>☁ Saved</div>
                      )}
                    </div>
                    <div style={{ fontFamily: 'Cinzel, serif', color: S.gold, fontSize: 12, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: S.textDim }}>{c.race} · {c.class}</div>
                    <div style={{ fontSize: 11, color: INTIMACY[c.intimacy]?.color, marginTop: 2, marginBottom: 6 }}>{INTIMACY[c.intimacy]?.name}</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {keys.googleClientId && !c.driveFileId && (
                        <Btn ghost small onClick={e => { e.stopPropagation(); backupSingleToDrive(c); }} disabled={!!driveUploading[c.id]} color={S.blue}>
                          {driveUploading[c.id] ? '...' : '☁'}
                        </Btn>
                      )}
                      {c.driveFileId && (
                        <a href={`https://drive.google.com/file/d/${c.driveFileId}/view`} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: 11, fontFamily: 'Cinzel, serif', color: S.blue, padding: '5px 8px', border: `1px solid ${S.blue}`, borderRadius: 8, textDecoration: 'none' }}>
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Companions without portraits */}
            {state.companions.filter(c => !c.aiImage).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <SectionTitle dim>WITHOUT PORTRAIT</SectionTitle>
                {state.companions.filter(c => !c.aiImage).map(c => (
                  <div key={c.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CompanionPortrait companion={c} size={52} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Cinzel, serif', color: S.gold, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: S.textDim }}>{c.race} · {c.class}</div>
                    </div>
                    <div style={{ fontSize: 11, color: S.textDim, fontStyle: 'italic' }}>
                      {state.generatingImage[c.id] ? '⏳ Painting…' : '📖 Speak to reveal'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!keys.googleClientId && (
              <div style={{ ...card, marginTop: 16, background: S.bgDeep, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: S.textDim, marginBottom: 8 }}>Add a Google Client ID in ⚙️ Settings to enable Drive backup.</div>
                <Btn ghost small onClick={() => set({ activeTab: 'settings' })} color={S.blue}>Open Settings</Btn>
              </div>
            )}
          </div>
        )}

        {/* ══════════ WORLD ══════════ */}
        {state.activeTab === 'world' && (
          <WorldMap curLevel={curLevel.level} sceneImages={sceneImages} generatingScene={generatingScene} generateScene={generateScene} />
        )}

        {/* ══════════ BOSSES ══════════ */}
        {state.activeTab === 'bosses' && (
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, marginTop: 0, marginBottom: 4, fontSize: 18 }}>💀 Boss Battles</h2>
            <div style={{ fontSize: 13, color: S.textDim, marginBottom: 16, fontStyle: 'italic' }}>Face the forces that hold you back.</div>
            {state.bosses.map(boss => {
              const dead   = boss.hp <= 0;
              const hpPct  = boss.hp / boss.maxHp;
              return (
                <div key={boss.id} style={{ ...card, borderColor: dead ? S.goldDim : S.border }}>
                  {/* Boss scene image */}
                  {sceneImages[boss.id] ? (
                    <img src={sceneImages[boss.id]} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                  ) : generatingScene[boss.id] ? (
                    <Shimmer height={120} radius={8} style={{ marginBottom: 10 }} />
                  ) : (
                    <div style={{ marginBottom: 8 }}>
                      <Btn ghost small disabled={!!generatingScene[boss.id]} onClick={() => generateScene('boss', boss.id)}>
                        {generatingScene[boss.id] ? '...' : '🎨 Generate Scene'}
                      </Btn>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Cinzel, serif', color: dead ? S.gold : S.red, fontSize: 15 }}>{boss.name}</div>
                      <div style={{ fontSize: 12, color: S.textDim, marginTop: 2 }}>{boss.desc}</div>
                      <div style={{ fontSize: 11, color: S.textDim, marginTop: 2 }}>⚡ Obstacle: {boss.obstacle}</div>
                    </div>
                    {dead && <div style={{ fontSize: 22, marginLeft: 8 }}>✓</div>}
                  </div>
                  <Bar pct={hpPct} color={dead ? S.green : S.red} height={8} />
                  <div style={{ fontSize: 11, color: S.textDim, marginTop: 6, marginBottom: 10 }}>
                    {boss.hp}/{boss.maxHp} HP · Reward: ⚡{boss.reward.xp} XP + ◈{boss.reward.gold}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!dead && <Btn color={S.red} onClick={() => attackBoss(boss.id)}>⚔️ Attack</Btn>}
                    <Btn ghost small onClick={() => resetBoss(boss.id)}>Reset</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════ SHOP ══════════ */}
        {state.activeTab === 'shop' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, margin: 0, fontSize: 18 }}>🏪 Valdris Market</h2>
              <span style={{ fontFamily: 'Cinzel, serif', color: S.gold }}>◈ {state.player.gold}</span>
            </div>

            {/* Equipped / Inventory */}
            {state.inventory.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <SectionTitle>INVENTORY · {state.equipped.length}/3 equipped</SectionTitle>
                {state.inventory.map(id => {
                  const item = ITEMS.find(i => i.id === id);
                  if (!item) return null;
                  const equipped = state.equipped.includes(id);
                  return (
                    <div key={id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, borderColor: equipped ? S.gold : S.border }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: RARITY_COLORS[item.rarity] }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: S.textDim }}>{item.type} · {item.rarity} · {item.desc}</div>
                      </div>
                      <Btn ghost={!equipped} small onClick={() => toggleEquip(id)} color={equipped ? S.gold : S.gold}>
                        {equipped ? 'Unequip' : 'Equip'}
                      </Btn>
                    </div>
                  );
                })}
              </div>
            )}

            <SectionTitle dim>SHOP</SectionTitle>
            {SHOP_CATALOG.map(si => {
              const owned     = si.shopType === 'item' && state.inventory.includes(si.id);
              const canBuy    = state.player.gold >= si.cost && !owned;
              return (
                <div key={si.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: si.rarity ? RARITY_COLORS[si.rarity] : S.text }}>{si.name}</div>
                    <div style={{ fontSize: 11, color: S.textDim }}>{si.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: S.gold, fontSize: 12, marginBottom: 4 }}>◈ {si.cost}</div>
                    <Btn small disabled={!canBuy} onClick={() => buyItem(si)}>{owned ? 'Owned' : 'Buy'}</Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════ GLORY ══════════ */}
        {state.activeTab === 'glory' && (
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, marginTop: 0, marginBottom: 16, fontSize: 18 }}>🏆 Hall of Glory</h2>

            {/* Stats */}
            <div style={card}>
              <SectionTitle>LIFETIME STATS</SectionTitle>
              {[
                ['Level', `${curLevel.level} — ${curLevel.title}`],
                ['Total XP', state.player.xp.toLocaleString()],
                ['Gold Earned', state.stats.totalGoldEarned.toLocaleString()],
                ['Quests Done', state.stats.questsCompleted],
                ['Rituals Done', state.stats.ritualsCompleted],
                ['Bosses Slain', state.stats.bossesDefeated],
                ['Best Streak', `${state.stats.maxStreak} days`],
                ['Companions', state.companions.length],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: S.textDim }}>{label}</span>
                  <span style={{ fontFamily: 'Cinzel, serif', color: S.text }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={card}>
              <SectionTitle>SKILL MASTERY</SectionTitle>
              {SKILLS.map(sk => {
                const pts = state.player.skills[sk] || 0;
                return (
                  <div key={sk} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: SKILL_COLORS[sk] }}>{sk}</span>
                      <span style={{ color: S.text }}>{pts}</span>
                    </div>
                    <Bar pct={Math.min(pts / 50, 1)} color={SKILL_COLORS[sk]} height={4} />
                  </div>
                );
              })}
            </div>

            {/* Achievements */}
            <div style={card}>
              <SectionTitle>ACHIEVEMENTS</SectionTitle>
              {ACHIEVEMENTS.map(a => {
                const unlocked = state.achievements.includes(a.id);
                return (
                  <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, opacity: unlocked ? 1 : 0.35 }}>
                    <div style={{ fontSize: 22 }}>{unlocked ? '🏆' : '🔒'}</div>
                    <div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: unlocked ? S.gold : S.textDim }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: S.textDim }}>{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ SETTINGS ══════════ */}
        {state.activeTab === 'settings' && (
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, marginTop: 0, marginBottom: 16, fontSize: 18 }}>⚙️ Settings</h2>

            <div style={card}>
              <SectionTitle>API KEYS</SectionTitle>
              <p style={{ fontSize: 12, color: S.textDim, marginTop: 0, marginBottom: 16 }}>
                Keys are saved to your device only and sent directly to the API proxies. Required for portrait/scene generation (NovelAI) and companion dialogue (Anthropic).
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: S.text, marginBottom: 6, fontFamily: 'Cinzel, serif' }}>
                  NovelAI Key <span style={{ color: S.textDim, fontFamily: 'Crimson Text, serif' }}>(Portrait &amp; Scene Generation)</span>
                </div>
                <input
                  type="password"
                  value={keys.novelai || ''}
                  onChange={e => saveKey('novelai', e.target.value.trim())}
                  placeholder="pst-..."
                  style={{ width: '100%', background: S.bg, border: `1px solid ${keys.novelai ? S.green : S.border}`, color: S.text, borderRadius: 6, padding: '8px 10px', fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box' }}
                />
                {keys.novelai && <div style={{ fontSize: 11, color: S.green, marginTop: 4 }}>✓ Saved</div>}
                <div style={{ marginTop: 8 }}>
                  <Btn ghost small onClick={async () => {
                    try {
                      const res = await fetch('/api/image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: 'best quality, 1girl, simple background, test', width: 512, height: 512, novelaiKey: keys.novelai?.trim() }),
                      });
                      const data = await res.json();
                      if (data.error) alert('Error: ' + data.error);
                      else alert('✓ NovelAI key works!');
                    } catch (e) { alert('Error: ' + e.message); }
                  }}>Test Key</Btn>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: S.text, marginBottom: 6, fontFamily: 'Cinzel, serif' }}>
                  Anthropic Key <span style={{ color: S.textDim, fontFamily: 'Crimson Text, serif' }}>(Companion Dialogue)</span>
                </div>
                <input
                  type="password"
                  value={keys.anthropic || ''}
                  onChange={e => saveKey('anthropic', e.target.value.trim())}
                  placeholder="sk-ant-..."
                  style={{ width: '100%', background: S.bg, border: `1px solid ${keys.anthropic ? S.green : S.border}`, color: S.text, borderRadius: 6, padding: '8px 10px', fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box' }}
                />
                {keys.anthropic && <div style={{ fontSize: 11, color: S.green, marginTop: 4 }}>✓ Saved</div>}
              </div>

              <Btn ghost small onClick={() => { setKeys({}); localStorage.removeItem('msc_keys'); }}>Clear Keys</Btn>
            </div>

            <div style={card}>
              <SectionTitle>GOOGLE DRIVE BACKUP</SectionTitle>
              <p style={{ fontSize: 12, color: S.textDim, marginTop: 0, marginBottom: 16 }}>
                Portraits are backed up to your Google Drive. Create a project at console.cloud.google.com, enable the Drive API, create an OAuth 2.0 Web Client ID, and add your site domain as an authorized JavaScript origin.
              </p>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: S.text, marginBottom: 6, fontFamily: 'Cinzel, serif' }}>Google OAuth Client ID</div>
                <input
                  type="text"
                  value={keys.googleClientId || ''}
                  onChange={e => saveKey('googleClientId', e.target.value.trim())}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  style={{ width: '100%', background: S.bg, border: `1px solid ${keys.googleClientId ? S.green : S.border}`, color: S.text, borderRadius: 6, padding: '8px 10px', fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }}
                />
                {keys.googleClientId && <div style={{ fontSize: 11, color: S.green, marginTop: 4 }}>✓ Saved — go to the Gallery tab to back up portraits.</div>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
