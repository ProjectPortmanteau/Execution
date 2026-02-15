/**
 * BYOK LLM Provider Abstraction
 *
 * Supports: Anthropic (Claude), Google (Gemini)
 * Set one of these env vars:
 *   ANTHROPIC_API_KEY — uses Claude
 *   GEMINI_API_KEY   — uses Gemini
 *
 * If both are set, Anthropic takes priority.
 */

// ---------------------------------------------------------------------------
// Anthropic Provider (raw fetch — no SDK dependency)
// ---------------------------------------------------------------------------
async function callAnthropic(systemPrompt, messages, opts = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const body = {
    model: opts.model || 'claude-sonnet-4-20250514',
    max_tokens: opts.maxTokens || 2048,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// ---------------------------------------------------------------------------
// Gemini Provider (raw fetch — no SDK dependency)
// ---------------------------------------------------------------------------
async function callGemini(systemPrompt, messages, opts = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const model = opts.model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Convert our messages format to Gemini's format
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: opts.maxTokens || 2048
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ---------------------------------------------------------------------------
// Provider Router
// ---------------------------------------------------------------------------
function getProvider() {
  if (process.env.ANTHROPIC_API_KEY) return { name: 'Anthropic (Claude)', call: callAnthropic };
  if (process.env.GEMINI_API_KEY) return { name: 'Google (Gemini)', call: callGemini };
  throw new Error(
    'No LLM API key found.\n' +
    'Set ANTHROPIC_API_KEY or GEMINI_API_KEY as an environment variable.\n' +
    'Example: ANTHROPIC_API_KEY=sk-ant-... node playground/negotiate.js "topic"'
  );
}

module.exports = { getProvider };
