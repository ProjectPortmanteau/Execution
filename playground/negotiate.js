#!/usr/bin/env node
// playground/negotiate.js
// Principled Playground v0.2 — Dual-Brain Multi-Agent Negotiation
// Two AI Spirits negotiate across 3 rounds and produce a joint Bean.
// Zero external dependencies — raw fetch, BYOK from day one.

'use strict';

const fs   = require('fs');
const path = require('path');
const { send, resolveProvider } = require('./provider');

// ---------------------------------------------------------------------------
// Minimal .env loader (zero dependencies)
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SPIRITS_DIR = path.join(__dirname, 'spirits');

function loadSpirit(filename) {
  const fp = path.join(SPIRITS_DIR, filename);
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function timestamp() {
  return new Date().toISOString();
}

function divider(label) {
  const line = '─'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${label}`);
  console.log(`${line}\n`);
}

// ---------------------------------------------------------------------------
// Negotiation Protocol
// ---------------------------------------------------------------------------

const ROUNDS = 3;

/**
 * Build the prompt for a negotiation round.
 *
 * @param {object} spirit       - The responding Spirit's config
 * @param {string} topic        - The negotiation topic
 * @param {number} round        - Current round (1-based)
 * @param {string|null} otherPos - Structured summary of the other Spirit's last position
 * @returns {string}
 */
function buildRoundPrompt(spirit, topic, round, otherPos) {
  const parts = [
    `NEGOTIATION ROUND ${round} of ${ROUNDS}`,
    `Topic: "${topic}"`,
    ''
  ];

  if (round === 1) {
    parts.push(
      'This is the opening round. Present your position on this topic.',
      'Structure your response as:',
      '1. POSITION — Your core stance, grounded in your principles',
      '2. NON-NEGOTIABLES — What you will not compromise on',
      '3. FLEXIBLE AREAS — Where you are open to synthesis',
      '',
      'Keep your response under 300 words.'
    );
  } else {
    parts.push(
      `The other Spirit's position summary:`,
      `"${otherPos}"`,
      '',
      `Respond to this position while staying true to your Soul Code.`,
      'Structure your response as:',
      '1. RESPONSE — Where you agree, disagree, or see hidden connections',
      '2. REVISED POSITION — Your updated stance after considering their view',
      '3. SYNTHESIS OPPORTUNITY — What Door Number 3 might look like',
      '',
      'Keep your response under 300 words.'
    );
  }

  return parts.join('\n');
}

/**
 * Build the prompt for the Loom synthesis step.
 * The Loom is an impartial synthesizer that weaves both positions
 * into a joint Bean with all 4 OPVS layers.
 *
 * @param {string} topic        - The negotiation topic
 * @param {string} booleanFinal - Boolean's final-round response
 * @param {string} rouxFinal    - Roux's final-round response
 * @returns {string}
 */
function buildLoomPrompt(topic, booleanFinal, rouxFinal) {
  return [
    'You are The Loom — an impartial synthesis engine.',
    'Two Spirits have completed 3 rounds of negotiation. Your task:',
    'Weave their final positions into a single joint Bean.',
    '',
    `Topic: "${topic}"`,
    '',
    '--- BOOLEAN (final position) ---',
    booleanFinal,
    '',
    '--- ROUX (final position) ---',
    rouxFinal,
    '',
    'Produce a joint Bean in exactly this format:',
    '',
    '## JOINT BEAN',
    '',
    '### Nucleus (Content)',
    'The synthesized insight — the Door Number 3 neither Spirit could reach alone.',
    '',
    '### Shell (Metadata)',
    '- Topic: <topic>',
    '- Type: SOLUTION',
    '- Anchors: <list the PHIL- Bean IDs that grounded each Spirit>',
    '- Provenance: Principled Playground negotiation',
    '',
    '### Corona (Connections)',
    'Typed edges to related Beans or concepts that this synthesis connects to.',
    '',
    '### Echo (Provenance)',
    '- Participants: Boolean, Roux',
    '- Rounds: 3',
    '- Timestamp: <ISO timestamp>',
    '- Mode: <DUAL-BRAIN or SINGLE-BRAIN>',
    '',
    'Keep the total output under 400 words.'
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Position summarizer (context-window isolation)
// ---------------------------------------------------------------------------

/**
 * Produce a structured summary of a Spirit's position.
 * The other Spirit never sees raw reasoning — only this summary.
 * This implements Layer 3 of the Anti-Drift Architecture.
 *
 * @param {string} rawResponse - Full response text
 * @returns {string} Condensed position summary
 */
function summarizePosition(rawResponse) {
  // Extract just the core position — strip reasoning details
  const lines = rawResponse.split('\n').filter(l => l.trim());
  // Take up to 8 most substantive lines to preserve friction
  const summary = lines.slice(0, 8).join('\n');
  return summary.length > 600 ? summary.substring(0, 597) + '...' : summary;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function negotiate(topic, keys) {
  const boolean = loadSpirit('boolean.json');
  const roux    = loadSpirit('contrarian.json');

  // Resolve providers for each Spirit
  const booleanProvider = resolveProvider(boolean, keys);
  const rouxProvider    = resolveProvider(roux, keys);

  if (!booleanProvider) {
    console.error('✗ No API key available for Boolean. Set ANTHROPIC_API_KEY or GOOGLE_API_KEY.');
    process.exit(1);
  }
  if (!rouxProvider) {
    console.error('✗ No API key available for Roux. Set GOOGLE_API_KEY or ANTHROPIC_API_KEY.');
    process.exit(1);
  }

  // Determine brain mode
  const isDualBrain = booleanProvider.provider !== rouxProvider.provider;
  const brainMode   = isDualBrain ? 'DUAL-BRAIN' : 'SINGLE-BRAIN';

  divider(`PRINCIPLED PLAYGROUND v0.2`);
  console.log(`  Topic:    ${topic}`);
  console.log(`  Mode:     ${brainMode}`);
  console.log(`  Boolean:  ${boolean.spirit} → ${booleanProvider.provider} (${booleanProvider.mode})`);
  console.log(`  Roux:     ${roux.spirit} → ${rouxProvider.provider} (${rouxProvider.mode})`);
  console.log(`  Rounds:   ${ROUNDS}`);
  console.log(`  Started:  ${timestamp()}`);

  // Override provider in spirit config for actual API calls if in fallback mode
  const booleanForCall = { ...boolean, provider: booleanProvider.provider, model: booleanProvider.provider === boolean.provider ? boolean.model : getDefaultModel(booleanProvider.provider) };
  const rouxForCall    = { ...roux, provider: rouxProvider.provider, model: rouxProvider.provider === roux.provider ? roux.model : getDefaultModel(rouxProvider.provider) };

  let booleanPos = null;
  let rouxPos    = null;
  let booleanRaw = '';
  let rouxRaw    = '';

  // --- Negotiation Rounds ---
  for (let round = 1; round <= ROUNDS; round++) {
    divider(`ROUND ${round} of ${ROUNDS}`);

    // Boolean's turn
    const bPrompt = buildRoundPrompt(boolean, topic, round, rouxPos);
    console.log(`  ⟐ Boolean is thinking...`);
    booleanRaw = await send(booleanForCall, booleanProvider.apiKey, bPrompt);
    booleanPos = summarizePosition(booleanRaw);
    console.log(`  ✓ Boolean responded\n`);
    console.log(indent(booleanRaw));

    // Roux's turn
    const rPrompt = buildRoundPrompt(roux, topic, round, booleanPos);
    console.log(`\n  ⟐ Roux is thinking...`);
    rouxRaw = await send(rouxForCall, rouxProvider.apiKey, rPrompt);
    rouxPos = summarizePosition(rouxRaw);
    console.log(`  ✓ Roux responded\n`);
    console.log(indent(rouxRaw));
  }

  // --- Loom Synthesis ---
  divider('THE LOOM — Synthesis');

  const loomPrompt = buildLoomPrompt(topic, booleanRaw, rouxRaw);

  // The Loom runs on whichever provider is available (prefer Boolean's)
  console.log(`  ⟐ The Loom is weaving...`);
  const jointBean = await send(booleanForCall, booleanProvider.apiKey, loomPrompt);
  console.log(`  ✓ Joint Bean produced\n`);
  console.log(indent(jointBean));

  divider('NEGOTIATION COMPLETE');
  console.log(`  Mode:      ${brainMode}`);
  console.log(`  Completed: ${timestamp()}`);
  console.log(`  Rounds:    ${ROUNDS}`);
  console.log(`  Output:    Joint Bean (Nucleus / Shell / Corona / Echo)\n`);

  return { brainMode, jointBean };
}

function getDefaultModel(provider) {
  const defaults = {
    anthropic: 'claude-sonnet-4-20250514',
    google: 'gemini-2.0-flash',
    groq: 'llama-3.3-70b-versatile'
  };
  return defaults[provider] || 'unknown';
}

function indent(text, spaces) {
  const pad = ' '.repeat(spaces || 4);
  return text.split('\n').map(l => pad + l).join('\n');
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

function printUsage() {
  console.log(`
Principled Playground v0.2 — Dual-Brain Multi-Agent Negotiation

USAGE
  node playground/negotiate.js "<topic>"

ENVIRONMENT VARIABLES
  ANTHROPIC_API_KEY   API key for Anthropic (Claude) — Boolean's native provider
  GOOGLE_API_KEY      API key for Google (Gemini)
  GROQ_API_KEY        API key for Groq (Llama) — Roux's native provider

MODES
  DUAL-BRAIN          Both keys provided — each Spirit uses its native LLM
  SINGLE-BRAIN        One key provided — both Spirits share a single LLM

EXAMPLES
  # Dual-brain (recommended)
  ANTHROPIC_API_KEY=sk-... GOOGLE_API_KEY=AI... node playground/negotiate.js "How should AI handle creative ownership?"

  # Single-brain fallback
  GOOGLE_API_KEY=AI... node playground/negotiate.js "What makes a system fair?"

OUTPUT
  A joint Bean with all 4 OPVS layers:
    Nucleus  — The synthesized insight
    Shell    — Metadata (topic, type, anchors)
    Corona   — Connections to related concepts
    Echo     — Provenance (participants, rounds, timestamp, mode)
`);
}

if (require.main === module) {
  const topic = process.argv[2];

  if (!topic) {
    printUsage();
    process.exit(0);
  }

  const keys = {
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    google:    process.env.GOOGLE_API_KEY    || '',
    groq:      process.env.GROQ_API_KEY      || ''
  };

  if (!keys.anthropic && !keys.google && !keys.groq) {
    console.error('✗ No API keys provided. Set ANTHROPIC_API_KEY, GOOGLE_API_KEY, and/or GROQ_API_KEY.');
    console.error('  Run without arguments for usage info.');
    process.exit(1);
  }

  negotiate(topic, keys).catch(err => {
    console.error(`\n✗ Negotiation failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { negotiate };
