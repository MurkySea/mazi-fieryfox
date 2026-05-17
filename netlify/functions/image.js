const { unzipSync } = require('fflate');

const NAI_NEG = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad feet, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, extra legs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutilated, bad proportions';

async function generateNovelAI(key, prompt, negative_prompt, width, height) {
  const res = await fetch('https://image.novelai.net/ai/generate-image', {
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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`NovelAI ${res.status}: ${txt.slice(0, 120)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const unzipped = unzipSync(new Uint8Array(buf));
  const pngBuf = Buffer.from(Object.values(unzipped)[0]);
  return { b64: pngBuf.toString('base64'), mime: 'image/png' };
}

async function generatePollinations(prompt, width, height) {
  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  url.searchParams.set('width', String(width));
  url.searchParams.set('height', String(height));
  url.searchParams.set('seed', String(Math.floor(Math.random() * 999999)));
  url.searchParams.set('nologo', 'true');
  url.searchParams.set('model', 'flux');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Pollinations ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { b64: buf.toString('base64'), mime: 'image/jpeg' };
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { prompt, negative_prompt, width = 512, height = 768 } = body;
  if (!prompt) return { statusCode: 400, headers, body: JSON.stringify({ error: 'prompt required' }) };

  const novelaiKey = process.env.NOVELAI_KEY;

  try {
    // Try NovelAI first if key is set
    if (novelaiKey) {
      try {
        const result = await generateNovelAI(novelaiKey, prompt, negative_prompt, width, height);
        return { statusCode: 200, headers, body: JSON.stringify({ ...result, source: 'novelai' }) };
      } catch (e) {
        // Fall through to Pollinations
        console.log('NovelAI failed, falling back to Pollinations:', e.message);
      }
    }
    // Free fallback
    const result = await generatePollinations(prompt, width, height);
    return { statusCode: 200, headers, body: JSON.stringify({ ...result, source: 'pollinations' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
