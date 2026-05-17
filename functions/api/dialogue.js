export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  const key = env.ANTHROPIC_KEY;
  if (!key) return new Response(JSON.stringify({ error: 'ANTHROPIC_KEY not set' }), { status: 500, headers });

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { system, messages, extractMemory = false } = body;
  if (!messages?.length) return new Response(JSON.stringify({ error: 'messages required' }), { status: 400, headers });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: system || 'You are a companion in a dark fantasy RPG. Respond in character.',
        messages: messages.slice(-16),
      }),
    });

    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify(data), { status: res.status, headers });

    const reply = data.content?.[0]?.text || '...';
    let memory = null;
    if (extractMemory) {
      const lastUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      if (lastUser.length > 20 && reply.length > 30) {
        memory = `Murky Sea: "${lastUser.slice(0, 80)}" — she replied: "${reply.slice(0, 80)}"`;
      }
    }

    return new Response(JSON.stringify({ reply, memory }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
