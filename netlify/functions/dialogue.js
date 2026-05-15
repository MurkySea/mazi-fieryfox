exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const key = process.env.ANTHROPIC_KEY;
  if (!key) return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_KEY env var not set' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { system, messages, extractMemory = false } = body;
  if (!messages?.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'messages required' }) };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: system || 'You are a companion in a dark fantasy RPG. Respond in character.',
        messages: messages.slice(-16),
      }),
    });

    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, headers, body: JSON.stringify(data) };

    const reply = data.content?.[0]?.text || '...';

    let memory = null;
    if (extractMemory) {
      const lastUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      if (lastUser.length > 20 && reply.length > 30) {
        memory = `Murky Sea: "${lastUser.slice(0, 80)}" — she replied: "${reply.slice(0, 80)}"`;
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ reply, memory }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
