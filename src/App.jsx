import { useState, useEffect, useCallback } from 'react';

// ─── THEME ────────────────────────────────────────────────────────────────────

const S = {
  bg: '#070912',
  bgCard: '#0d1220',
  bgDeep: '#060810',
  gold: '#f0c040',
  goldDim: '#a07820',
  text: '#e8dcc8',
  textDim: '#8a7a60',
  red: '#c0392b',
  green: '#27ae60',
  blue: '#2980b9',
  purple: '#8e44ad',
  pink: '#e91e8c',
  border: '#1e2a3a',
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
  background: S.bgCard, border: `1px solid ${S.border}`,
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

function SectionTitle({ children, dim }) {
  return (
    <div style={{ fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: 2, color: dim ? S.textDim : S.gold, marginBottom: 8, marginTop: 4 }}>
      {children}
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
  const [keys, setKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem('msc_keys') || '{}'); } catch { return {}; }
  });
  const [gToken, setGToken] = useState(null);
  const [driveUploading, setDriveUploading] = useState({});
  const [driveStatus, setDriveStatus] = useState('');

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
    if (!keys.googleClientId) throw new Error('Add your Google Client ID in Settings first.');
    await loadGIS();
    const token = await requestDriveToken(keys.googleClientId, !!gToken);
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
  async function generateImage(companion) {
    set(s => ({ generatingImage: { ...s.generatingImage, [companion.id]: true }, imageError: { ...s.imageError, [companion.id]: null } }));
    try {
      const prompt = `anime style portrait, ${companion.race.toLowerCase()} girl, ${companion.hair} hair, ${companion.eyes} eyes, ${companion.body} build, ${companion.class.toLowerCase()} dark fantasy outfit, dramatic lighting, beautiful, detailed, masterpiece`;
      const imgHeaders = { 'Content-Type': 'application/json' };
      if (keys.xai) imgHeaders['x-xai-key'] = keys.xai;
      const res  = await fetch('/api/image', {
        method: 'POST',
        headers: imgHeaders,
        body: JSON.stringify({ prompt, model: 'grok-2-image', n: 1 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      const b64 = data?.data?.[0]?.b64_json;
      const mime = data?.data?.[0]?.mime || 'image/jpeg';
      if (b64) {
        const dataUrl = `data:${mime};base64,${b64}`;
        setState(s => ({
          ...s,
          companions: s.companions.map(c => c.id === companion.id ? { ...c, aiImage: dataUrl } : c),
        }));
      } else {
        throw new Error('No image data returned');
      }
    } catch (e) {
      set(s => ({ imageError: { ...s.imageError, [companion.id]: e.message } }));
    }
    set(s => ({ generatingImage: { ...s.generatingImage, [companion.id]: false } }));
  }

  // ── API: AI Dialogue ──────────────────────────────────────────────────────
  async function speak(companion, context = '') {
    set({ generatingDialogue: true });
    const haremNames = state.companions.filter(c => c.id !== companion.id).map(c => c.name).join(', ');
    const intimacyName = INTIMACY[companion.intimacy]?.name || 'Stranger';
    try {
      const dlgHeaders = { 'Content-Type': 'application/json' };
      if (keys.anthropic) dlgHeaders['x-anthropic-key'] = keys.anthropic;
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
    setState(s => {
      const updated = s.companions.map(c => {
        if (c.id !== companionId) return c;
        const newBond     = c.bond + bonus;
        const newIntimacy = intimacyForBond(newBond);
        return { ...c, bond: newBond, intimacy: newIntimacy };
      });
      const maxInti = Math.max(...updated.map(c => c.intimacy));
      return { ...s, companions: updated, stats: { ...s.stats, maxIntimacy: maxInti } };
    });
    checkAchievements();
  }

  function summonCompanion() {
    if (state.player.gold < 300) return;
    const newC = generateCompanion(state.companions.map(c => c.name));
    setState(s => ({
      ...s,
      player:     { ...s.player, gold: s.player.gold - 300 },
      companions: [...s.companions, newC],
    }));
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
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'Crimson Text, serif', maxWidth: 480, margin: '0 auto', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>

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

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', overflowX: 'auto', background: S.bgCard, borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 'calc(72px + env(safe-area-inset-top))', zIndex: 99 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => set({ activeTab: t.id })} style={{
            flex: '0 0 auto', padding: '9px 13px', background: 'none', border: 'none',
            color: state.activeTab === t.id ? S.gold : S.textDim,
            borderBottom: `2px solid ${state.activeTab === t.id ? S.gold : 'transparent'}`,
            fontFamily: 'Cinzel, serif', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{t.icon} {t.label}</button>
        ))}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, margin: 0, fontSize: 18 }}>💎 The Party</h2>
              <Btn ghost small onClick={summonCompanion} disabled={state.player.gold < 300}>Summon ◈300</Btn>
            </div>

            {/* Companion strip */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
              {state.companions.map(c => (
                <div key={c.id} onClick={() => set({ selectedCompanion: c.id })} style={{
                  flexShrink: 0, cursor: 'pointer',
                  opacity: state.selectedCompanion === c.id ? 1 : 0.45,
                  transform: state.selectedCompanion === c.id ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}>
                  {c.aiImage
                    ? <img src={c.aiImage} alt={c.name} style={{ width: 62, height: 62, borderRadius: '50%', border: `2px solid ${state.selectedCompanion === c.id ? S.gold : S.border}`, objectFit: 'cover' }} />
                    : <CompanionPortrait companion={c} size={62} />
                  }
                </div>
              ))}
            </div>

            {selComp && (
              <>
                {/* Companion card */}
                <div style={{ ...card, display: 'flex', gap: 14 }}>
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                    {selComp.aiImage
                      ? <img src={selComp.aiImage} alt={selComp.name} style={{ width: 96, height: 96, borderRadius: '50%', border: `2px solid ${S.gold}`, objectFit: 'cover' }} />
                      : <CompanionPortrait companion={selComp} size={96} />
                    }
                    <Btn ghost small disabled={!!state.generatingImage[selComp.id]} onClick={() => generateImage(selComp)}>
                      {state.generatingImage[selComp.id] ? '...' : '✨ Portrait'}
                    </Btn>
                    {state.imageError?.[selComp.id] && (
                      <div style={{ fontSize: 10, color: S.red, marginTop: 4, maxWidth: 96, wordBreak: 'break-word' }}>{state.imageError[selComp.id]}</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Cinzel, serif', color: S.gold, fontSize: 15, marginBottom: 2 }}>{selComp.name}</div>
                    <div style={{ fontSize: 12, color: S.textDim }}>{selComp.race} · {selComp.class}</div>
                    <div style={{ fontSize: 12, color: INTIMACY[selComp.intimacy]?.color, marginTop: 4, fontFamily: 'Cinzel, serif' }}>
                      {INTIMACY[selComp.intimacy]?.name}
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 6 }}>
                      <Bar pct={selComp.bond / (INTIMACY[Math.min(selComp.intimacy + 1, 5)]?.bond || 1000)} color={INTIMACY[selComp.intimacy]?.color} height={4} />
                      <div style={{ fontSize: 10, color: S.textDim, marginTop: 2 }}>{selComp.bond} bond</div>
                    </div>
                    <div style={{ fontSize: 12, color: S.textDim, fontStyle: 'italic', lineHeight: 1.4 }}>{selComp.backstory}</div>
                    <div style={{ fontSize: 11, color: S.textDim, marginTop: 6 }}>
                      Flirt: <span style={{ color: S.text }}>{selComp.flirtStyle}</span> ·
                      Hair: <span style={{ color: HAIR_HEX[selComp.hair] || S.text }}>{selComp.hair}</span> ·
                      Eyes: <span style={{ color: EYES_HEX[selComp.eyes] || S.text }}>{selComp.eyes}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <Btn ghost small onClick={() => giftBond(selComp.id, 10)}>Gift Bond +10</Btn>
                  <Btn ghost small onClick={() => giftBond(selComp.id, 50)}>Gift Bond +50</Btn>
                  <Btn ghost small disabled={state.generatingDialogue} onClick={() => speak(selComp)}>
                    {state.generatingDialogue ? 'Thinking...' : '💬 Speak'}
                  </Btn>
                  <Btn ghost small disabled={state.generatingDialogue} onClick={() => speak(selComp, 'Comment on the other companions in the harem, with your personality.')}>
                    Harem Talk
                  </Btn>
                </div>

                {/* Dialogue log */}
                {state.dialogueLog.length > 0 && (
                  <div style={card}>
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
                      <Btn ghost small onClick={e => { e.stopPropagation(); generateImage(c); }} disabled={!!state.generatingImage[c.id]}>
                        {state.generatingImage[c.id] ? '...' : '↺'}
                      </Btn>
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
                    <Btn ghost small disabled={!!state.generatingImage[c.id]} onClick={() => generateImage(c)}>
                      {state.generatingImage[c.id] ? '...' : '✨ Generate'}
                    </Btn>
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
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: S.gold, marginTop: 0, marginBottom: 4, fontSize: 18 }}>🗺️ Valdris</h2>
            <div style={{ fontSize: 13, color: S.textDim, marginBottom: 16, fontStyle: 'italic' }}>Explore the realm as your power grows.</div>
            {WORLD_REGIONS.map(r => {
              const unlocked = curLevel.level >= r.unlockLevel;
              return (
                <div key={r.id} style={{ ...card, opacity: unlocked ? 1 : 0.4, borderColor: unlocked ? S.border : '#0a0a14' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ fontSize: 34 }}>{r.icon}</div>
                    <div>
                      <div style={{ fontFamily: 'Cinzel, serif', color: unlocked ? S.gold : S.textDim, fontSize: 15 }}>{r.name}</div>
                      <div style={{ fontSize: 13, color: S.textDim, marginTop: 2 }}>{r.desc}</div>
                      <div style={{ fontSize: 11, marginTop: 4, color: unlocked ? S.green : S.red }}>
                        {unlocked ? '✦ Unlocked' : `🔒 Requires Level ${r.unlockLevel}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
                Keys are saved to your device only and sent directly to the API proxies. Required for portrait generation and companion dialogue.
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: S.text, marginBottom: 6, fontFamily: 'Cinzel, serif' }}>
                  xAI Key <span style={{ color: S.textDim, fontFamily: 'Crimson Text, serif' }}>(Portrait Generation)</span>
                </div>
                <input
                  type="password"
                  value={keys.xai || ''}
                  onChange={e => saveKey('xai', e.target.value)}
                  placeholder="xai-..."
                  style={{ width: '100%', background: S.bg, border: `1px solid ${keys.xai ? S.green : S.border}`, color: S.text, borderRadius: 6, padding: '8px 10px', fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box' }}
                />
                {keys.xai && <div style={{ fontSize: 11, color: S.green, marginTop: 4 }}>✓ Saved</div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: S.text, marginBottom: 6, fontFamily: 'Cinzel, serif' }}>
                  Anthropic Key <span style={{ color: S.textDim, fontFamily: 'Crimson Text, serif' }}>(Companion Dialogue)</span>
                </div>
                <input
                  type="password"
                  value={keys.anthropic || ''}
                  onChange={e => saveKey('anthropic', e.target.value)}
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
                  onChange={e => saveKey('googleClientId', e.target.value)}
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
