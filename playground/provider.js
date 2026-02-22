// playground/provider.js
// BYOK Multi-Brain Provider Abstraction
// Routes requests to Anthropic, Google, Groq, or OpenAI based on Spirit config.
// Zero external dependencies — raw fetch + curl for DNS-challenged environments.

'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

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
// Provider: Groq (OpenAI-compatible)
// Uses curl for environments where Node.js DNS cannot resolve api.groq.com
// ---------------------------------------------------------------------------

async function callGroq(apiKey, model, systemPrompt, userMessage) {
  const payload = JSON.stringify({
    model,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });

  // Write payload to temp file to avoid shell escaping issues
  const tmpFile = '/tmp/groq_payload_' + Date.now() + '.json';
  fs.writeFileSync(tmpFile, payload);

  try {
    const result = execSync(
      `curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" ` +
      `-H "Content-Type: application/json" ` +
      `-H "Authorization: Bearer ${apiKey}" ` +
      `-d @${tmpFile}`,
      { timeout: 60000, encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    if (data.error) {
      throw new Error(`Groq API: ${data.error.message || JSON.stringify(data.error)}`);
    }
    return data.choices[0].message.content;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

// ---------------------------------------------------------------------------
// Provider: OpenAI (GPT-4o)
// Uses curl for DNS reliability (same rationale as Groq above).
// ---------------------------------------------------------------------------

async function callOpenAI(apiKey, model, systemPrompt, userMessage) {
  const payload = JSON.stringify({
    model,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });

  const tmpFile = '/tmp/openai_payload_' + Date.now() + '.json';
  fs.writeFileSync(tmpFile, payload);

  try {
    const result = execSync(
      `curl -s -X POST "https://api.openai.com/v1/chat/completions" ` +
      `-H "Content-Type: application/json" ` +
      `-H "Authorization: Bearer ${apiKey}" ` +
      `-d @${tmpFile}`,
      { timeout: 90000, encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    if (data.error) {
      throw new Error(`OpenAI API: ${data.error.message || JSON.stringify(data.error)}`);
    }
    return data.choices[0].message.content;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

// ---------------------------------------------------------------------------
// Unified dispatch
// ---------------------------------------------------------------------------

const PROVIDERS = {
  anthropic: callAnthropic,
  google: callGoogle,
  groq: callGroq,
  openai: callOpenAI
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
  const preferred = spirit.provider;               // e.g. "anthropic", "google", "groq"

  // Fallback chain: try preferred → then all others
  const allProviders = ['anthropic', 'google', 'groq', 'openai'];
  const fallbacks = allProviders.filter(p => p !== preferred);

  if (keys[preferred]) {
    return { apiKey: keys[preferred], provider: preferred, mode: 'NATIVE' };
  }
  for (const fb of fallbacks) {
    if (keys[fb]) {
      return { apiKey: keys[fb], provider: fb, mode: 'FALLBACK' };
    }
  }
  return null;
}

module.exports = { send, resolveProvider, PROVIDERS };
