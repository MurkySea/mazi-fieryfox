const QUALITY = 'best quality, amazing quality, very aesthetic, absurdres, ultra-detailed';

export const NAI_NEGATIVE = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad feet, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, extra legs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutilated, bad proportions";

const RACE_TAGS = {
  Foxgirl:     'fox ears, fox tail, fox girl',
  Elfborn:     'pointy ears, long ears, elf',
  Demonkin:    'demon horns, dark aura, demon girl',
  Dragonblood: 'dragon horns, dragon scales, draconic features',
  Spiritweave: 'ethereal body, glowing markings, spirit energy',
  Shadowborn:  'shadow aura, dark tendrils, darkness',
  Celestine:   'halo, feathered wings, divine glow',
  Voidtouched: 'void eyes, cosmic markings, starfield skin',
};

const OUTFIT_TAGS = {
  combat:   'armor, battle ready, fierce expression, dynamic pose, dramatic lighting, weapon',
  work:     'elegant coat, professional attire, confident pose, soft lighting, indoor setting',
  rest:     'casual comfortable dress, relaxed sitting pose, soft smile, warm lighting, cozy atmosphere',
  intimate: 'elegant evening gown, soft expression, gentle blush, close-up portrait, intimate lighting, romantic atmosphere, detailed eyes',
};

const INTIMACY_TAGS = {
  0: 'distant expression, looking away, neutral',
  1: 'subtle smile, glancing at viewer',
  2: 'soft smile, direct eye contact',
  3: 'warm smile, gentle gaze, slight blush',
  4: 'devoted expression, loving eyes, soft blush',
  5: 'radiant loving smile, intense eye contact, warm blush',
};

const REGION_BG = {
  ashwatch:       'ancient crumbled ruins, ash falling, dramatic orange sky, desolate wasteland',
  thornwood:      'dense dark forest, twisted ancient trees, green mystical light, fog',
  voidmarsh:      'foggy dark wetlands, purple mist over water, eerie swamp, void energy',
  ironspire:      'massive iron fortress, stone battlements, dark stormy sky, imposing castle',
  celestine_peak: 'high mountain peak, divine golden light, clouds below, angelic atmosphere',
  void_throne:    'cosmic void, swirling purple nebula, dark floating throne, primordial darkness',
  eternal_forge:  'massive arcane forge, magical golden flames, ancient machinery, power and heat',
};

const BOSS_SCENE = {
  procrastination: 'abandoned dusty library, unfinished scrolls, floating hourglasses, cobwebs, melancholic atmosphere',
  self_doubt:      'infinite mirror hall, fractured reflections, oppressive darkness, psychological horror corridor',
  chaos_titan:     'destroyed grand throne room, rubble, storm through broken ceiling, chaos and devastation',
  isolation_shade: 'empty foggy forest clearing, bare trees, lonely moonlight, mist, somber solitude',
  void_sovereign:  'primordial void throne, swirling cosmic dark energy, floating dark crystal pillars, apocalyptic',
};

export function buildCompanionPrompt(companion, outfit = 'combat') {
  const raceTags = RACE_TAGS[companion.race] || '';
  const outfitTags = OUTFIT_TAGS[outfit] || OUTFIT_TAGS.combat;
  const intimacyTags = INTIMACY_TAGS[companion.intimacy ?? 0] || '';
  const foxExtra = (companion.race === 'Foxgirl' && outfit === 'rest') ? ', tail curled around her' : '';

  return [
    QUALITY, '1girl', raceTags,
    `${companion.hair} hair`, `${companion.eyes} eyes`, `${companion.body} build`,
    `dark fantasy`, outfitTags + foxExtra, intimacyTags,
    'anime style, highly detailed face, portrait',
  ].filter(Boolean).join(', ');
}

export function buildNegativePrompt(outfit = 'combat') {
  return outfit === 'intimate' ? NAI_NEGATIVE + ', fully clothed, covered body' : NAI_NEGATIVE;
}

export function buildRegionPrompt(regionId) {
  const tags = REGION_BG[regionId] || 'dark fantasy landscape, atmospheric, cinematic';
  return `${QUALITY}, no humans, ${tags}, wide establishing shot, cinematic landscape, concept art`;
}

export function buildBossPrompt(bossId) {
  const tags = BOSS_SCENE[bossId] || 'dark dungeon, ominous, dramatic lighting';
  return `${QUALITY}, no humans, ${tags}, cinematic composition, dramatic lighting, concept art`;
}

export const portraitKey  = (c, outfit) => `p_${c.id}_${outfit}_${c.intimacy}`;
export const regionKey    = id => `r_${id}`;
export const bossKey      = id => `b_${id}`;
