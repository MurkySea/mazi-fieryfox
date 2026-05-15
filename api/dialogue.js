module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.body.anthropicKey || req.headers['x-anthropic-key'] || process.env.ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_KEY not configured' });

  const { system, messages, extractMemory = false } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
    if (!response.ok) return res.status(response.status).json(data);

    const reply = data.content?.[0]?.text || '...';

    // Extract a saveable memory from this exchange if meaningful
    let memory = null;
    if (extractMemory) {
      const lastUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      if (lastUser.length > 20 && reply.length > 30) {
        memory = `Murky Sea: "${lastUser.slice(0, 80)}" — she replied: "${reply.slice(0, 80)}"`;
      }
    }

    return res.status(200).json({ reply, memory });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
