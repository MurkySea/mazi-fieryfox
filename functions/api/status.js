export async function onRequest(context) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  return new Response(JSON.stringify({
    novelai:   !!context.env.NOVELAI_KEY,
    anthropic: !!context.env.ANTHROPIC_KEY,
  }), { headers });
}
