exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      novelai:   !!process.env.NOVELAI_KEY,
      anthropic: !!process.env.ANTHROPIC_KEY,
    }),
  };
};
