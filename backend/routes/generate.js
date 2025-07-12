// ✅ File: backend/routes/generate.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const parseGeminiOutput = require('../utils/parseGeminiOutput');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const fullPrompt =`You are a frontend HTML generator for a browser-based sandbox.

📦 Output Format:
You must return the following structure ONLY:

<step>Creating index.html...</step>
<file name="index.html">
<code>
[Insert complete single-file HTML here]
</code>
</file>
<done>✅ Build complete. Ready for preview.</done>

✅ OUTPUT MUST FOLLOW THESE RULES:
- All code inside a single HTML file
- NO <head>, NO external resources, NO image links
- Place <style> and <script> inside <body>
- Do NOT use base64 images — use text, icons (emojis), or styled <div> as illustrations
- Style everything using inline <style> inside <body>
- Place the <style> section at the TOP of <body>
- Place the <script> section at the END of <body>
- All buttons or toggles must have working JS

🎨 VISUAL REQUIREMENTS:
- Use dark background and white or soft colored text
- Use CSS variables like --bg, --text, --accent
- Use padding, borders, box-shadow, spacing
- Add multiple scrollable sections: Hero, About, Features, Footer
- Make the page layout look clean and usable

🎯 INTERACTIVITY:
- Must include one working button that toggles theme color or shows a modal or performs any DOM action
- Use onclick or addEventListener properly
- DOM elements should exist before script runs

🌐 The user's prompt is:
"Create a scrollable modern landing page for a restaurant website in dark mode."
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });

    const fullText = result.response.text();
    const events = parseGeminiOutput(fullText);

    console.log('✅ Parsed Events:', events);

    for (const event of events) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    console.error('❌ Gemini API Error:', err);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
