const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const allowedIP = process.env.ALLOWED_IP;

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || '';
  const forwarded = req.headers['x-forwarded-for'] || '';
  if (!allowedIP || ip.includes(allowedIP) || forwarded.includes(allowedIP)) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
});

app.use(express.static(path.join(__dirname)));

app.get('/config.js', (_req, res) => {
  const key = process.env.OPENAI_API_KEY || '';
  res.type('application/javascript').send(`window.OPENAI_API_KEY = '${key}';`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
