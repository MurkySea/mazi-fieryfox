import { getCompanion } from './companions.js';

export function buildSystemPrompt(id) {
  const comp = getCompanion(id);
  if (!comp) return 'You are a mysterious companion.';
  const { name, personality, relationshipLevel, recentEvents, mood } = comp;
  const eventsText = recentEvents && recentEvents.length ? recentEvents.join(', ') : 'no notable recent events';
  return `You are ${name}, ${personality}. Your relationship level with the player is ${relationshipLevel}. Recent events: ${eventsText}. You currently feel ${mood}. Stay in character and keep replies brief.`;
}

export async function fetchAIResponse(id, playerInput) {
  const systemPrompt = buildSystemPrompt(id);
  const apiKey = localStorage.getItem('openaiKey');
  if (!apiKey) {
    return mockResponse(id);
  }
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: playerInput }
    ],
    max_tokens: 60
  };
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || '';
  } catch (err) {
    console.error('AI call failed', err);
    return mockResponse(id);
  }
}

function mockResponse(id) {
  const comp = getCompanion(id) || { name: 'The companion', mood: 'calm' };
  const replies = [
    `${comp.name} smiles softly. "It's a fine day to chat, isn't it?"`,
    `"I have been feeling quite ${comp.mood} today."`,
    `"Our adventures make for good stories."`
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
