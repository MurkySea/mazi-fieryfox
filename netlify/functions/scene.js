const { unzipSync } = require('fflate');

const NAI_NEG = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad feet, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, extra legs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutilated, bad proportions';

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const key = process.env.NOVELAI_KEY;
  if (!key) return { statusCode: 500, headers, body: JSON.stringify({ error: 'NOVELAI_KEY env var not set' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { prompt, negative_prompt, width = 768, height = 512 } = body;
  if (!prompt) return { statusCode: 400, headers, body: JSON.stringify({ error: 'prompt required' }) };

  try {
    const naiRes = await fetch('https://image.novelai.net/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        input: prompt,
        model: 'nai-diffusion-3',
        action: 'generate',
        parameters: {
          width, height, scale: 6, sampler: 'k_euler_ancestral', steps: 20, n_samples: 1,
          ucPreset: 0, qualityToggle: true, sm: false, sm_dyn: false,
          negative_prompt: negative_prompt || NAI_NEG,
        },
      }),
    });

    if (!naiRes.ok) {
      const txt = await naiRes.text();
      return { statusCode: naiRes.status, headers, body: JSON.stringify({ error: `NovelAI ${naiRes.status}: ${txt.slice(0, 200)}` }) };
    }

    const buf = Buffer.from(await naiRes.arrayBuffer());
    const unzipped = unzipSync(new Uint8Array(buf));
    const pngBuf = Buffer.from(Object.values(unzipped)[0]);
    const b64 = pngBuf.toString('base64');

    return { statusCode: 200, headers, body: JSON.stringify({ b64, mime: 'image/png' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
