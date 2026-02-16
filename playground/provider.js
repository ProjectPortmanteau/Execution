// playground/provider.js
// BYOK Dual-Brain Provider Abstraction
// Routes requests to Anthropic (Claude) or Google (Gemini) based on Spirit config.
// Zero external dependencies — raw fetch only.

'use strict';

// ---------------------------------------------------------------------------
// Provider: Anthropic (Claude)
// ---------------------------------------------------------------------------

async function callAnthropic(apiKey, model, systemPrompt, userMessage) {
  const url = 'https://api.anthropic.com/v1/messages';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic ${res.status}: ${body}`);
  }

  const data = await res.json();
  // Claude returns content as an array of content blocks
  return data.content.map(b => b.text).join('');
}

// ---------------------------------------------------------------------------
// Provider: Google (Gemini)
// ---------------------------------------------------------------------------

async function callGoogle(apiKey, model, systemPrompt, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 1024 }
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts.map(p => p.text).join('');
}

// ---------------------------------------------------------------------------
// Unified dispatch
// ---------------------------------------------------------------------------

const PROVIDERS = {
  anthropic: callAnthropic,
  google: callGoogle
};

/**
 * Send a prompt to the provider specified in a Spirit's config.
 *
 * @param {object} spirit     - Parsed spirit JSON (must include .provider, .model, .soul_code)
 * @param {string} apiKey     - User-supplied API key for the provider
 * @param {string} userMessage - The prompt / negotiation round content
 * @returns {Promise<string>}  Raw text response from the LLM
 */
async function send(spirit, apiKey, userMessage) {
  const providerFn = PROVIDERS[spirit.provider];
  if (!providerFn) {
    throw new Error(`Unknown provider "${spirit.provider}". Supported: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  const sc = spirit.soul_code;
  const systemPrompt = [
    `You are ${sc.identity}`,
    '',
    'Core principles:',
    ...sc.principles.map(p => `- ${p}`),
    '',
    'Hard constraints (never violate):',
    ...sc.constraints.map(c => `- ${c}`),
    '',
    `Negotiation style: ${sc.negotiation_style}`
  ].join('\n');

  return providerFn(apiKey, spirit.model, systemPrompt, userMessage);
}

/**
 * Resolve which API key + provider to use for a given spirit.
 * Returns { apiKey, provider, mode } or null if no key is available.
 *
 * @param {object} spirit - Parsed spirit JSON
 * @param {object} keys   - { anthropic?: string, google?: string }
 * @returns {{ apiKey: string, provider: string, mode: string } | null}
 */
function resolveProvider(spirit, keys) {
  const preferred = spirit.provider;               // e.g. "anthropic"
  const fallback  = preferred === 'anthropic' ? 'google' : 'anthropic';

  if (keys[preferred]) {
    return { apiKey: keys[preferred], provider: preferred, mode: 'NATIVE' };
  }
  if (keys[fallback]) {
    return { apiKey: keys[fallback], provider: fallback, mode: 'FALLBACK' };
  }
  return null;
}

module.exports = { send, resolveProvider, PROVIDERS };
