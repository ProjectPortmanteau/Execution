/**
 * BYOK LLM Provider Abstraction — Dual-Brain Mode
 *
 * Supports per-Spirit provider routing:
 *   - Boolean -> Anthropic (Claude) — the San Francisco ghost
 *   - Roux    -> Google (Gemini)    — the Mountain View ghost
 *   - Arbiter -> defaults to Anthropic, configurable
 *
 * Both keys loaded simultaneously:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   GEMINI_API_KEY=AIza...
 *
 * Single-key mode still works — if only one key is set, all calls
 * route through that provider regardless of Spirit config.
 *
 * Zero external dependencies. Raw fetch only.
 */

// ---------------------------------------------------------------------------
// Anthropic Provider (raw fetch)
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
// Gemini Provider (raw fetch)
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
// Provider Registry
// ---------------------------------------------------------------------------
const PROVIDERS = {
  anthropic: { name: 'Anthropic (Claude)', call: callAnthropic, key: 'ANTHROPIC_API_KEY' },
  gemini:    { name: 'Google (Gemini)',     call: callGemini,    key: 'GEMINI_API_KEY' }
};

// ---------------------------------------------------------------------------
// Detect which providers are available
// ---------------------------------------------------------------------------
function getAvailableProviders() {
  const available = {};
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    if (process.env[provider.key]) {
      available[id] = provider;
    }
  }
  return available;
}

// ---------------------------------------------------------------------------
// Unified call interface — routes to the right provider
//
//   callLLM(systemPrompt, messages, { provider: 'anthropic' })
//   callLLM(systemPrompt, messages, { provider: 'gemini' })
//   callLLM(systemPrompt, messages) // auto-detect: anthropic > gemini
// ---------------------------------------------------------------------------
async function callLLM(systemPrompt, messages, opts = {}) {
  const available = getAvailableProviders();

  if (Object.keys(available).length === 0) {
    throw new Error(
      'No LLM API key found.\n' +
      'Set ANTHROPIC_API_KEY and/or GEMINI_API_KEY as environment variables.\n' +
      'Dual-brain mode: ANTHROPIC_API_KEY=... GEMINI_API_KEY=... node playground/negotiate.js "topic"'
    );
  }

  // If a specific provider is requested, use it
  if (opts.provider) {
    const requested = PROVIDERS[opts.provider];
    if (!requested) throw new Error(`Unknown provider: "${opts.provider}". Valid: ${Object.keys(PROVIDERS).join(', ')}`);
    if (!process.env[requested.key]) throw new Error(`Provider "${opts.provider}" requested but ${requested.key} is not set.`);
    return requested.call(systemPrompt, messages, opts);
  }

  // Auto-detect: prefer anthropic, fall back to gemini
  if (available.anthropic) return available.anthropic.call(systemPrompt, messages, opts);
  return available.gemini.call(systemPrompt, messages, opts);
}

module.exports = { callLLM, getAvailableProviders, PROVIDERS };
