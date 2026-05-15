import { unzipSync } from 'fflate';

const serverCache = new Map();
const NAI_NEGATIVE = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, bad feet, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, extra legs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutilated, bad proportions";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = req.headers['x-novelai-key'] || process.env.NOVELAI_KEY;
  if (!apiKey) return res.status(500).json({ error: 'NOVELAI_KEY not configured' });

  const { prompt, negative_prompt, width = 1216, height = 832, cacheKey } = req.body;

  if (cacheKey && serverCache.has(cacheKey)) {
    return res.status(200).json({ b64: serverCache.get(cacheKey), mime: 'image/png', cached: true });
  }

  try {
    const naiRes = await fetch('https://image.novelai.net/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        input: prompt,
        model: 'nai-diffusion-4-5',
        action: 'generate',
        parameters: {
          width, height, scale: 6,
          sampler: 'k_euler_ancestral',
          steps: 28, n_samples: 1,
          ucPreset: 0, qualityToggle: true,
          variety_boost: true, sm: false, sm_dyn: false,
          negative_prompt: negative_prompt || NAI_NEGATIVE,
        },
      }),
    });

    if (!naiRes.ok) {
      const text = await naiRes.text();
      return res.status(naiRes.status).json({ error: `NovelAI: ${text}` });
    }

    const buf = Buffer.from(await naiRes.arrayBuffer());
    const unzipped = unzipSync(new Uint8Array(buf));
    const pngBuf = Buffer.from(Object.values(unzipped)[0]);
    const b64 = pngBuf.toString('base64');

    if (cacheKey) serverCache.set(cacheKey, b64);
    return res.status(200).json({ b64, mime: 'image/png' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
