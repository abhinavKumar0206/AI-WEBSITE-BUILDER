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
    const fullPrompt =`You are a frontend HTML generator for a browser-based code preview.

🛠️ OUTPUT RULES:
- You MUST output only a single HTML file named: index.html
- Output must strictly use the format (DO NOT use markdown or backticks):

<step>Creating index.html...</step>
<file name="index.html">
<code>
[Your full HTML code here]
</code>
</file>
<done>✅ Build complete. Ready for preview.</done>

📦 STRUCTURE REQUIREMENTS:
- All code must be inside a single index.html file.
- Place your <style> tag inside the <body>.
- Place your <script> tag at the end of the <body>.
- DO NOT use <head> or import any external CSS/JS/fonts.
- DO NOT use any external or CDN-based image URLs.
- DO NOT use import or module syntax — use plain JS.

🎨 DESIGN:
- Theme must be dark.
- Use system fonts and a sleek layout with spacing, colors, and hierarchy.
- Use CSS variables like --bg, --text, --accent for color consistency.
- Design a modern, scrollable landing page with at least 4 sections:
  - Hero/Header
  - About
  - Features or Services
  - Footer
- Include clear section separation with padding, background contrast, etc.

🎯 INTERACTIVITY:
- Add at least one interactive feature (toggle theme, accordion, modal, etc.).
- Add at least one working button that logs a message or triggers an effect.
- Add subtle transitions or animations (e.g., hover/fade/slide).

📥 USER PROMPT:
Generate a functional dark-themed, scrollable, interactive landing page based on this prompt:
"${prompt}"
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
