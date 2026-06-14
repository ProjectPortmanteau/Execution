#!/usr/bin/env node
// playground/loom-rerun.js
// Phase 0.5 acceptance harness. Takes an existing negotiation transcript,
// extracts Boolean's and Roux's Round-3 final positions, and runs them through
// the PATCHED Loom (loom.js) to produce a traceable Joint Bean. Then prints the
// thesis, the claims with their DERIVES_FROM edges, Echo.substrate, and the
// computed groundedness.
//
// If a provider API key is present, it performs the real Loom call. If not, it
// runs the SAME downstream pipeline (parse -> normalize -> buildJointBean ->
// groundedness) on a clearly-labeled fixture derived from the transcript text,
// so the mechanism is verifiable without a key. The live number awaits a key.
//
// Usage:
//   node playground/loom-rerun.js [path-to-transcript.md]

'use strict';

const fs = require('fs');
const path = require('path');
const loom = require('./loom');
const { send, resolveProvider } = require('./provider');

// --- minimal .env loader (same convention as negotiate.js) -----------------
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    if (!process.env[k]) process.env[k] = t.slice(eq + 1).trim();
  }
}
loadEnv();

// Transcript parsing moved to transcript-parser.js (Phase 3) so that
// novelty-report.js and future scripts can import it without side effects.
const { extractRound3 } = require('./transcript-parser');

// ---------------------------------------------------------------------------
// FIXTURE (used ONLY when no API key is available).
// Authored faithfully from the dual-brain transcript's actual Round-3 text so
// each cited source id genuinely contains the idea (spot-checkable). It mixes
// derives_from on purpose: one claim is a novel bridge with [] so groundedness
// is NOT a reflexive 1.0 — it demonstrates the anti-rubber-stamp behavior.
// ---------------------------------------------------------------------------
const FIXTURE_LOOM_JSON = {
  thesis: "Door Number 3: a two-layer 'Systemic Dialogue Architecture' that first diagnoses whether disagreement is a broken-system signal or an authentic difference, then either repairs the system or hosts collaborative worldbuilding.",
  claims: [
    {
      text: "AI should reshape the conditions under which disagreement occurs rather than managing the disagreement itself, acting as an environmental designer.",
      derives_from: ["boolean_r3", "roux_r3"],
      rel: "SYNTHESIZES"
    },
    {
      text: "A diagnostic layer first distinguishes whether tension stems from a broken system or from authentic worldview differences.",
      derives_from: ["roux_r3", "boolean_r3"],
      rel: "SYNTHESIZES"
    },
    {
      text: "When tension is systemic, the system targets root causes such as information asymmetry and misaligned incentives.",
      derives_from: ["roux_r3"],
      rel: "REFINES"
    },
    {
      text: "When the difference is authentic, AI shifts to collaborative worldbuilding, co-creating expanded possibility spaces neither party imagined alone.",
      derives_from: ["boolean_r3"],
      rel: "REFINES"
    },
    {
      text: "Disagreement is treated as evidence that the current shared framework is insufficient for all parties — a trigger for redesign rather than a verdict on either side.",
      derives_from: [],
      rel: "SYNTHESIZES"
    }
  ],
  connections: [
    { rel: "TRANSFORMS", target: "Traditional mediation models" },
    { rel: "ENABLES", target: "Collaborative problem-solving frameworks" }
  ]
};

// ---------------------------------------------------------------------------
async function runLoomLive(boolean_r3, roux_r3, topic) {
  const keys = {
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    openai: process.env.OPENAI_API_KEY || '',
    openrouter: process.env.OPENROUTER_API_KEY || ''
  };
  if (!Object.values(keys).some(Boolean)) return null; // no key -> caller uses fixture

  const boolean = JSON.parse(fs.readFileSync(path.join(__dirname, 'spirits', 'boolean.json'), 'utf-8'));
  const resolved = resolveProvider(boolean, keys);
  if (!resolved) return null;

  const defaults = {
    anthropic: 'claude-sonnet-4-20250514', google: 'gemini-2.0-flash',
    groq: 'llama-3.3-70b-versatile', openai: 'gpt-4o', openrouter: 'nvidia/nemotron-nano-9b-v2:free'
  };
  const model = resolved.provider === boolean.provider ? boolean.model : defaults[resolved.provider];
  const callCfg = { ...boolean, provider: resolved.provider, model };

  const prompt = loom.buildLoomPrompt(topic, boolean_r3, roux_r3);
  let raw = await send(callCfg, resolved.apiKey, prompt);
  let parsed = loom.parseLoomJSON(raw);
  if (!parsed) {
    raw = await send(callCfg, resolved.apiKey, prompt);
    parsed = loom.parseLoomJSON(raw);
  }
  return { parsed, model, provider: resolved.provider, raw };
}

async function main() {
  const transcriptPath = process.argv[2] ||
    path.join(__dirname, 'output', 'negotiation-dual-brain-how-should-ai-handle-user-disagreement-2026-02-17T19-59-51.md');

  console.log('='.repeat(70));
  console.log('PHASE 0.5 ACCEPTANCE — patched Loom on an existing transcript');
  console.log('='.repeat(70));
  console.log(`Transcript: ${path.relative(process.cwd(), transcriptPath)}\n`);

  const md = fs.readFileSync(transcriptPath, 'utf-8');
  const topicMatch = md.match(/\*\*Topic:\*\*\s*"?([^"\n]+)"?/i);
  const topic = topicMatch ? topicMatch[1].trim() : 'How should AI handle user disagreement?';
  const { boolean_r3, roux_r3 } = extractRound3(md);

  console.log(`Topic: ${topic}\n`);
  console.log('Extracted source positions (these are the cite-able ids):');
  console.log(`\n--- boolean_r3 (${boolean_r3.length} chars) ---`);
  console.log(boolean_r3.slice(0, 600) + (boolean_r3.length > 600 ? '\n  …[truncated for display]' : ''));
  console.log(`\n--- roux_r3 (${roux_r3.length} chars) ---`);
  console.log(roux_r3.slice(0, 600) + (roux_r3.length > 600 ? '\n  …[truncated for display]' : ''));

  if (!boolean_r3 || !roux_r3) {
    console.error('\n✗ Could not extract both Round-3 positions. Aborting.');
    process.exit(1);
  }

  // --- Run the Loom (live if a key exists, else fixture) ---------------------
  console.log('\n' + '-'.repeat(70));
  const live = await runLoomLive(boolean_r3, roux_r3, topic);

  let parsed, substrate, mode;
  if (live && live.parsed) {
    console.log(`LIVE Loom call succeeded on ${live.provider} / ${live.model}`);
    parsed = live.parsed;
    substrate = live.model;
    mode = 'LIVE';
  } else if (live && !live.parsed) {
    console.log(`LIVE Loom call ran on ${live.provider} / ${live.model} but JSON parse failed twice.`);
    console.log('Raw model output follows; treating as degraded (grounded:false):\n');
    console.log(live.raw);
    parsed = null;
    substrate = live.model;
    mode = 'LIVE-DEGRADED';
  } else {
    console.log('LIVE Loom call SKIPPED — no API key found in env or playground/.env.');
    console.log('Running the identical downstream pipeline on a FIXTURE derived from');
    console.log('the transcript\'s real Round-3 text. This verifies parse → edges →');
    console.log('groundedness; the live LLM-authored number awaits a key.');
    parsed = FIXTURE_LOOM_JSON;
    substrate = 'FIXTURE (no API key — not a live model run)';
    mode = 'FIXTURE';
  }

  // --- Build the Bean --------------------------------------------------------
  let bean;
  if (parsed) {
    const norm = loom.normalizeLoom(parsed);
    if (norm.droppedIds.length) console.log(`⚠ ignored unknown cited ids: ${norm.droppedIds.join(', ')}`);
    bean = loom.buildJointBean({
      norm, topic, substrate, brainMode: 'DUAL-BRAIN',
      timestamp: new Date().toISOString(), anchors: ['PHIL-005', 'PHIL-002'], grounded: true
    });
  } else {
    bean = loom.buildFallbackBean({
      rawText: live ? live.raw : '', topic, substrate, brainMode: 'DUAL-BRAIN',
      timestamp: new Date().toISOString(), anchors: ['PHIL-005', 'PHIL-002']
    });
  }

  // --- Report ----------------------------------------------------------------
  console.log('\n' + '='.repeat(70));
  console.log(`RESULT  (mode: ${mode})`);
  console.log('='.repeat(70));
  console.log(`\nThesis:\n  ${bean.nucleus.thesis}\n`);
  console.log('Claims with DERIVES_FROM edges (spot-check each cited id against the');
  console.log('source text printed above):\n');
  bean.nucleus.claims.forEach((c) => {
    const edges = c.derives_from.length ? c.derives_from.join(', ') : '[]  ← novel bridge (honest empty)';
    console.log(`  • [${c.rel}] ${c.text}`);
    console.log(`      DERIVES_FROM: ${edges}\n`);
  });

  console.log(`Echo.substrate: ${bean.echo.substrate}`);
  const g = bean.groundedness_detail;
  console.log(`\nGroundedness: ${bean.groundedness}  (${g.grounded}/${g.total} claims carry a real DERIVES_FROM edge)`);
  if (bean.groundedness === 1 && g.total > 0) {
    console.log('  ⚠ RED FLAG: groundedness is a reflexive 1.0 — every claim cited a source.');
    console.log('    That is the rubber-stamp failure mode. Inspect for copied claims.');
  } else if (g.total > 0) {
    console.log(`  ✓ Not a reflexive 1.0 — ${g.ungroundedIdx.length} claim(s) are honest novel bridges with no source.`);
  }

  // --- Displacement note -----------------------------------------------------
  console.log('\n' + '-'.repeat(70));
  const scoringPy = path.join(process.cwd(), 'playground_scoring.py');
  if (fs.existsSync(scoringPy)) {
    console.log('Displacement: playground_scoring.py present — (integration TODO in Phase 3).');
  } else {
    console.log('Displacement (novelty/balance): NOT computed.');
    console.log('  playground_scoring.py is not in the repo, and displacement needs an');
    console.log('  embedder (Gemini text-embedding-004) which lands in Phase 1. This is');
    console.log('  the first real novelty checkpoint — flagged here, acted on at Phase 3.');
  }

  // Persist the Bean so it can be inspected / fed to later phases.
  const outPath = transcriptPath.replace(/\.md$/, '.rerun.bean.json');
  fs.writeFileSync(outPath, JSON.stringify(bean, null, 2), 'utf-8');
  console.log(`\nJoint Bean JSON written: ${path.relative(process.cwd(), outPath)}`);
}

if (require.main === module) {
  main().catch(err => { console.error('✗ rerun failed:', err); process.exit(1); });
}
