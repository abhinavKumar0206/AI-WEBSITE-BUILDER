// backend/utils/parseGeminiOutput.js

/**
 * Parses Gemini output in custom XML-like format.
 * Expected tags:
 * - <file name="FILENAME"><code>...</code></file>
 * - <step>...</step>
 * - <done>...</done>
 */

function parseGeminiOutput(rawText) {
  const events = [];

  // 1. Parse steps first
  const stepRegex = /<step>([\s\S]*?)<\/step>/g;
  let stepMatch;
  while ((stepMatch = stepRegex.exec(rawText)) !== null) {
    events.push({
      type: 'thinking',
      message: stepMatch[1].trim()
    });
  }

  // 2. Parse files next
  const fileRegex = /<file name="([^"]+)">\s*<code>([\s\S]*?)<\/code>\s*<\/file>/g;
  let fileMatch;
  while ((fileMatch = fileRegex.exec(rawText)) !== null) {
    const filename = fileMatch[1].trim();
    const codeBlock = fileMatch[2].trim();

    // Validate content
    if (filename && codeBlock) {
      events.push({
        type: 'file-create',
        filename,
        content: codeBlock.split(/\r?\n/)
      });
    }
  }

  // 3. Final done tag
  const doneRegex = /<done>([\s\S]*?)<\/done>/g;
  let doneMatch;
  while ((doneMatch = doneRegex.exec(rawText)) !== null) {
    events.push({
      type: 'thinking',
      message: doneMatch[1].trim()
    });
  }

  return events;
}

module.exports = parseGeminiOutput;
