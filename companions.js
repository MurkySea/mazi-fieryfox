export const companions = {
  selene: {
    id: 'selene',
    name: 'Selene Graytail',
    personality: 'playful fox spirit who loves moonlit strolls',
    relationshipLevel: 3,
    recentEvents: ['gifted a silver pendant'],
    mood: 'cheerful'
  },
  nyx: {
    id: 'nyx',
    name: 'Nyx Shadowtail',
    personality: 'brooding rogue with a soft spot for humor',
    relationshipLevel: 2,
    recentEvents: ['completed a stealth mission together'],
    mood: 'mischievous'
  },
  lilith: {
    id: 'lilith',
    name: 'Lilith Flamesworn',
    personality: 'fiery mage who respects strength',
    relationshipLevel: 1,
    recentEvents: [],
    mood: 'irritable'
  },
  felina: {
    id: 'felina',
    name: 'Felina Moonshade',
    personality: 'quiet healer with a caring heart',
    relationshipLevel: 4,
    recentEvents: ['shared a quiet evening watching the stars'],
    mood: 'serene'
  }
};

export function getCompanion(id) {
  return companions[id] || null;
}

export function updateMood(id, mood) {
  if (companions[id]) companions[id].mood = mood;
}

export function addRecentEvent(id, event) {
  if (!companions[id]) return;
  const events = companions[id].recentEvents;
  events.unshift(event);
  if (events.length > 3) events.pop();
}
