module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    novelai:   !!process.env.NOVELAI_KEY,
    anthropic: !!process.env.ANTHROPIC_KEY,
  });
};
