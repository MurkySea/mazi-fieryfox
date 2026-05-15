export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = req.headers['x-xai-key'] || process.env.XAI_KEY;
  if (!apiKey) return res.status(500).json({ error: 'XAI_KEY not configured' });
  try {
    const { prompt, model, n } = req.body;
    const xaiRes = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ prompt, model, n, response_format: 'url' }),
    });
    const data = await xaiRes.json();
    if (!xaiRes.ok) return res.status(xaiRes.status).json(data);

    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) return res.status(500).json({ error: 'No image URL in xAI response' });

    // Fetch the image and convert to base64 so the client gets a permanent data URL
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return res.status(500).json({ error: 'Failed to fetch generated image' });
    const buffer = await imgRes.arrayBuffer();
    const b64 = Buffer.from(buffer).toString('base64');
    const mime = imgRes.headers.get('content-type') || 'image/jpeg';

    return res.status(200).json({ data: [{ b64_json: b64, mime }] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
