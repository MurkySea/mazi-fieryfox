// ─── LOREBOOK ─────────────────────────────────────────────────────────────────
// Single source of truth for each companion across image gen, dialogue, and story.

const NAI_NEGATIVE = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad feet, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, extra legs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutilated, bad proportions";

// ─── Race / body / voice maps (keyed to app's actual values) ─────────────────

const RACE_FEATURES = {
  Foxgirl:     c => `fox ears, fox tail, kemono, ${c.hair} hair, ${c.eyes} eyes`,
  Elfborn:     c => `pointy ears, elf, ethereal beauty, ${c.hair} hair, ${c.eyes} eyes`,
  Demonkin:    c => `demon horns, dark aura, ${c.hair} hair, ${c.eyes} eyes`,
  Spiritweave: c => `ethereal body, glowing markings, spirit energy, ${c.hair} hair, ${c.eyes} eyes`,
  Dragonblood: c => `dragon horns, subtle scales at temples, ${c.hair} hair, ${c.eyes} eyes`,
  Shadowborn:  c => `dark aura, shadow wisps at fingertips, ${c.hair} hair, ${c.eyes} eyes`,
  Celestine:   c => `faint golden halo, radiant presence, ${c.hair} hair, ${c.eyes} eyes`,
  Voidtouched: c => `void eyes, cosmic markings, starfield skin, ${c.hair} hair, ${c.eyes} eyes`,
};

const RACE_BASE_TAGS = {
  Foxgirl:     'fox ears, fox tail, kemono',
  Elfborn:     'pointy ears, elf',
  Demonkin:    'demon horns, dark aura',
  Spiritweave: 'ethereal body, glowing markings',
  Dragonblood: 'dragon horns, scales',
  Shadowborn:  'shadow aura, dark tendrils',
  Celestine:   'halo, divine glow',
  Voidtouched: 'void eyes, cosmic markings',
};

const BODY_TAGS = {
  lithe:      'slender, lithe build, graceful',
  athletic:   'athletic build, toned',
  voluptuous: 'voluptuous figure, curvaceous',
  petite:     'petite, small build',
  statuesque: 'tall, statuesque, commanding presence',
  compact:    'compact, strong build',
};

const VOICE_MAP = {
  bold:       'speaks directly and confidently, never hesitates, teasing undertone',
  warm:       'gentle and sincere, thoughtful pauses, genuine warmth in every word',
  shy:        'soft voice, trails off sometimes, rarely finishes bold thoughts',
  tsundere:   'sharp and dismissive on the surface, cracks under emotion',
  mysterious: 'measured and deliberate, every word feels like it means more than it says',
  devoted:    'few words, each one carries weight, actions speak louder',
};

const PERSONALITY_MAP = {
  bold:       'openly flirtatious, confident, unapologetic about her interest in Murky Sea, uses humor offensively not defensively',
  warm:       'genuinely caring, remembers small details, shows love through acts of service and presence',
  shy:        'deeply introverted, overwhelmed by direct affection, expresses care through indirect actions',
  tsundere:   'denies feelings constantly, actions betray her completely, secretly terrified of being truly seen',
  mysterious: 'reveals nothing directly, communicates in layers, has seen things that changed her fundamentally',
  devoted:    'has already decided, actions are her love language, patient beyond reason',
};

const OUTFIT_TAGS = {
  combat:   'armor, battle stance, weapon, fierce expression, dynamic pose, dramatic lighting',
  work:     'elegant coat, professional attire, standing confidently, indoor setting, soft lighting',
  rest:     'casual dress, relaxed pose, sitting comfortably, soft smile, warm cozy lighting',
  intimate: 'elegant evening gown, soft expression, blush, close-up portrait, intimate lighting, romantic atmosphere',
  bonded:   'white wedding dress, flowing bridal gown, floral crown, bridal veil, soft petals, sacred ceremony, ethereal soft lighting, dreamy romantic atmosphere',
};

const INTIMACY_MODS = [
  'distant expression, looking away, cold',
  'neutral expression, slight acknowledgment',
  'soft expression, slight smile',
  'warm smile, direct eye contact, comfortable',
  'loving expression, blush, warm smile, close',
  'deeply intimate expression, devoted gaze, emotional warmth, tears of joy',
];

// ─── Outfit selection by intimacy level ───────────────────────────────────────

export function outfitForIntimacy(level) {
  if (level >= 5) return 'bonded';
  if (level >= 4) return 'intimate';
  if (level >= 3) return 'rest';
  if (level >= 2) return 'work';
  return 'combat';
}

// ─── Entry builder ────────────────────────────────────────────────────────────

export function buildLorebookEntry(companion) {
  return {
    id: companion.id,
    identity: {
      name:             companion.name,
      race:             companion.race,
      class:            companion.class,
      physicalDesc:     (RACE_FEATURES[companion.race] || (c => `${c.hair} hair, ${c.eyes} eyes`))(companion),
      voice:            VOICE_MAP[companion.flirtStyle] || 'speaks naturally',
      personalityCore:  PERSONALITY_MAP[companion.flirtStyle] || companion.personality || 'complex and layered personality',
      backstory:        companion.backstory || '',
      flirtStyle:       companion.flirtStyle,
      appreciates:      companion.appreciates || [],
    },
    relationship: {
      currentTitle:       'Stranger',
      intimacyPoints:     companion.bond || 0,
      firstMet:           new Date().toISOString(),
      lastInteraction:    null,
      totalConversations: 0,
    },
    appearanceTags: buildAppearanceTags(companion),
    memories:       [],
    storyBeats:     [],
    outfitHistory:  {},
    characterGrowth:[],
    currentMood:    'neutral',
    giftsReceived:  [],
  };
}

function buildAppearanceTags(companion) {
  const race   = RACE_BASE_TAGS[companion.race] || '';
  const hair   = `${companion.hair} hair`;
  const eyes   = `${companion.eyes} eyes`;
  const body   = BODY_TAGS[companion.body] || '';
  return [race, hair, eyes, body].filter(Boolean).join(', ');
}

// ─── Lorebook operations ──────────────────────────────────────────────────────

export function addMemory(lorebook, memory) {
  const entry = {
    timestamp:        new Date().toISOString(),
    content:          memory,
    intimacyAtTime:   lorebook.relationship.intimacyPoints,
  };
  const memories = [...lorebook.memories, entry].slice(-50);
  return { ...lorebook, memories };
}

export function updateRelationshipState(lorebook, newPoints, newTitle) {
  const oldTitle  = lorebook.relationship.currentTitle;
  const rel       = {
    ...lorebook.relationship,
    intimacyPoints:     newPoints,
    lastInteraction:    new Date().toISOString(),
    totalConversations: lorebook.relationship.totalConversations + 1,
    currentTitle:       newTitle,
  };

  let storyBeats     = lorebook.storyBeats;
  let characterGrowth = lorebook.characterGrowth;

  if (newTitle !== oldTitle) {
    storyBeats = [...storyBeats, {
      timestamp:    new Date().toISOString(),
      beat:         `Relationship reached: ${newTitle}`,
      previousLevel: oldTitle,
    }];
    characterGrowth = [...characterGrowth, {
      timestamp: new Date().toISOString(),
      growth:    `${lorebook.identity.name} and Murky Sea's bond deepened to ${newTitle}`,
    }];
  }

  return { ...lorebook, relationship: rel, storyBeats, characterGrowth };
}

export function addStoryBeat(lorebook, chapterTitle, summary) {
  const beat = { timestamp: new Date().toISOString(), chapter: chapterTitle, summary };
  return { ...lorebook, storyBeats: [...lorebook.storyBeats, beat] };
}

export function touchConversation(lorebook) {
  return {
    ...lorebook,
    relationship: {
      ...lorebook.relationship,
      lastInteraction:    new Date().toISOString(),
      totalConversations: lorebook.relationship.totalConversations + 1,
    },
  };
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

export function buildLorebookContext(lorebook) {
  const { identity: id, relationship: rel } = lorebook;
  const recentMemories = lorebook.memories.slice(-8);
  const recentBeats    = lorebook.storyBeats.slice(-5);

  return [
    `CHARACTER: ${id.name}`,
    `Race/Class: ${id.race} ${id.class}`,
    `Appearance: ${id.physicalDesc}`,
    `Personality: ${id.personalityCore}`,
    `Voice: ${id.voice}`,
    `Backstory: ${id.backstory}`,
    `Flirt Style: ${id.flirtStyle}`,
    id.appreciates?.length ? `Appreciates in Murky Sea: ${id.appreciates.join(', ')}` : '',
    '',
    `RELATIONSHIP WITH MURKY SEA:`,
    `Status: ${rel.currentTitle} (${rel.intimacyPoints} bond points)`,
    `Conversations: ${rel.totalConversations}`,
    `Last interaction: ${rel.lastInteraction ? new Date(rel.lastInteraction).toLocaleDateString() : 'first time'}`,
    recentMemories.length ? `\nSHARED MEMORIES:\n${recentMemories.map(m => `- ${m.content}`).join('\n')}` : '',
    recentBeats.length    ? `\nSTORY SO FAR:\n${recentBeats.map(b => `- ${b.summary || b.beat}`).join('\n')}` : '',
    lorebook.currentMood !== 'neutral' ? `\nCURRENT MOOD: ${lorebook.currentMood}` : '',
    '',
    'Respond in character. Keep responses under 80 words. Speak directly to Murky Sea.',
  ].filter(s => s !== undefined).join('\n').trim();
}

export function buildImagePrompt(lorebook, outfitKey, intimacyIdx) {
  const QUALITY = 'best quality, amazing quality, very aesthetic, absurdres, ultra-detailed, masterpiece';
  const outfit   = OUTFIT_TAGS[outfitKey] || OUTFIT_TAGS.combat;
  const intimacy = INTIMACY_MODS[Math.min(intimacyIdx ?? 0, 5)] || '';
  const foxExtra = lorebook.identity.race === 'Foxgirl' && outfitKey === 'rest' ? ', tail curled around her' : '';

  return [
    QUALITY, '1girl',
    lorebook.appearanceTags,
    'dark fantasy',
    outfit + foxExtra,
    intimacy,
    'anime style, highly detailed face, portrait',
  ].filter(Boolean).join(', ');
}

// Alias used by dialogue calls — same context, clearer name at call site
export const buildDialoguePrompt = buildLorebookContext;

export function buildImageNegative(outfitKey) {
  return outfitKey === 'intimate' ? NAI_NEGATIVE + ', fully clothed, covered body' : NAI_NEGATIVE;
}

export const portraitKey = (companion, outfit) => `p_${companion.id}_${outfit}_${companion.intimacy}`;
