import { unzipSync } from 'fflate';

const NAI_NEG = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad feet, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, extra legs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutilated, bad proportions';

function toBase64(bytes) {
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

async function generateNovelAI(key, prompt, negative_prompt, width, height) {
  const res = await fetch('https://image.novelai.net/ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      input: prompt, model: 'nai-diffusion-3', action: 'generate',
      parameters: { width, height, scale: 6, sampler: 'k_euler_ancestral', steps: 20, n_samples: 1,
        ucPreset: 0, qualityToggle: true, sm: false, sm_dyn: false, negative_prompt: negative_prompt || NAI_NEG },
    }),
  });
  if (!res.ok) throw new Error(`NovelAI ${res.status}: ${(await res.text()).slice(0, 120)}`);
  const unzipped = unzipSync(new Uint8Array(await res.arrayBuffer()));
  return { b64: toBase64(Object.values(unzipped)[0]), mime: 'image/png' };
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
  return { b64: toBase64(new Uint8Array(await res.arrayBuffer())), mime: 'image/jpeg' };
}

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { prompt, negative_prompt, width = 768, height = 512 } = body;
  if (!prompt) return new Response(JSON.stringify({ error: 'prompt required' }), { status: 400, headers });

  try {
    if (env.NOVELAI_KEY) {
      try {
        const result = await generateNovelAI(env.NOVELAI_KEY, prompt, negative_prompt, width, height);
        return new Response(JSON.stringify({ ...result, source: 'novelai' }), { headers });
      } catch (e) { console.log('NovelAI failed, using Pollinations:', e.message); }
    }
    const result = await generatePollinations(prompt, width, height);
    return new Response(JSON.stringify({ ...result, source: 'pollinations' }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
