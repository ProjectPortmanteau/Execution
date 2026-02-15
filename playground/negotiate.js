#!/usr/bin/env node

/**
 * Principled Playground — Multi-Agent Negotiation Engine
 *
 * Two AI Spirits with different Soul Codes (weighted axiom sets)
 * negotiate on a topic and produce a joint Bean.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node playground/negotiate.js "How should AI handle user disagreement?"
 *   GEMINI_API_KEY=...          node playground/negotiate.js "topic here"
 *
 * Output: The full negotiation transcript + a joint Bean (JSON, 4 layers).
 */

const fs = require('fs');
const path = require('path');
const { getProvider } = require('./provider');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ROUNDS = 3; // negotiation rounds before synthesis
const SPIRIT_DIR = path.join(__dirname, 'spirits');

// ---------------------------------------------------------------------------
// Load Spirit configs
// ---------------------------------------------------------------------------
function loadSpirit(filename) {
  const raw = fs.readFileSync(path.join(SPIRIT_DIR, filename), 'utf-8');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Build system prompt for a Spirit
// ---------------------------------------------------------------------------
function buildSystemPrompt(spirit) {
  // Sort axioms by weight descending for the constraint block
  const sorted = Object.entries(spirit.axiom_weights)
    .sort((a, b) => b[1].weight - a[1].weight);

  const axiomBlock = sorted.map(([id, ax]) => {
    const bar = '█'.repeat(Math.round(ax.weight * 10)) + '░'.repeat(10 - Math.round(ax.weight * 10));
    const contentLine = ax.content ? `\n    Source: ${ax.content}` : '';
    return `  ${id} [${bar}] ${ax.weight.toFixed(1)} — ${ax.title}: ${ax.principle}${contentLine}`;
  }).join('\n');

  const topAxiom = spirit.axiom_weights[spirit.top_axiom];

  return `You are ${spirit.name}, ${spirit.role}.

${spirit.description}

=== SOUL CODE: AXIOM WEIGHTS ===
Your positions MUST be grounded in these weighted axioms. Higher weight = stronger influence on your reasoning.

${axiomBlock}

=== HARD CONSTRAINT ===
Your top axiom is ${spirit.top_axiom} (${topAxiom.title}, weight ${topAxiom.weight}).
${spirit.non_negotiable}
You CANNOT compromise on this axiom. It is your architectural foundation.

=== NEGOTIATION DIRECTIVES ===
1. Ground every claim in your axiom weights. Cite axiom IDs (e.g. PHIL-005) when making arguments.
2. You are seeking POSITIVE-SUM outcomes — not consensus, not compromise, not averaging.
3. Positive-sum means: both parties get MORE value from the joint position than from their individual one.
4. You may concede on low-weight axioms if doing so creates space for your high-weight ones.
5. Identify where your counterpart's strengths COMPLEMENT your blind spots.
6. Never abandon your top axiom. If pressed, reframe rather than retreat.

=== LINGUISTIC STYLE ===
${spirit.linguistic_style}

Keep responses focused and under 300 words. Be direct. Cite axiom IDs.`;
}

// ---------------------------------------------------------------------------
// Build the synthesis prompt (neutral arbiter)
// ---------------------------------------------------------------------------
function buildSynthesisPrompt(spiritA, spiritB) {
  // Compute shared axioms (both Spirits weight >= 0.5) as arbiter constraints
  const sharedAxioms = [];
  for (const [id, axA] of Object.entries(spiritA.axiom_weights)) {
    const axB = spiritB.axiom_weights[id];
    if (axA.weight >= 0.5 && axB && axB.weight >= 0.5) {
      sharedAxioms.push({ id, title: axA.title, principle: axA.principle, content: axA.content, avgWeight: ((axA.weight + axB.weight) / 2).toFixed(2) });
    }
  }
  sharedAxioms.sort((a, b) => b.avgWeight - a.avgWeight);

  const sharedBlock = sharedAxioms.map(ax =>
    `  ${ax.id} (avg ${ax.avgWeight}) — ${ax.title}: ${ax.principle}\n    "${ax.content || ''}"`
  ).join('\n');

  return `You are the Synthesis Engine for the Principled Playground.

Two Spirits have just completed a negotiation. Your job is to produce a JOINT BEAN — a single knowledge artifact that captures the positive-sum outcome of their exchange.

Spirit A: ${spiritA.name} (top axiom: ${spiritA.top_axiom} — ${spiritA.axiom_weights[spiritA.top_axiom].title})
Spirit B: ${spiritB.name} (top axiom: ${spiritB.top_axiom} — ${spiritB.axiom_weights[spiritB.top_axiom].title})

=== ARBITER CONSTRAINTS (Shared Axioms) ===
You are NOT a neutral blank slate. You are constrained by the axioms that BOTH Spirits value (weight >= 0.5).
These are your guardrails — the synthesis must honor these shared commitments:

${sharedBlock}

Your synthesis MUST demonstrably serve these shared axioms. If the synthesis violates any of them, it fails.

=== OUTPUT FORMAT ===
You MUST output a valid JSON object with exactly this structure (no markdown fencing, no extra text):

{
  "nucleus": {
    "title": "A concise title for the joint position",
    "content": "The synthesized position (2-4 paragraphs). Must honor BOTH Spirits' top axioms without diluting either.",
    "type": "SOLUTION"
  },
  "shell": {
    "layer": 0,
    "bean_id": "PLAYGROUND-001",
    "status": "draft",
    "tags": ["negotiation", "positive-sum", "principled-friction"],
    "axioms_honored": ["list of PHIL-XXX IDs that are reflected in the synthesis"],
    "axioms_tensioned": ["list of PHIL-XXX IDs where productive tension remains"]
  },
  "corona": {
    "harmonizes_with": ["PHIL-XXX IDs the joint position harmonizes with"],
    "disrupts": ["PHIL-XXX IDs where the joint position creates productive disruption"],
    "tension_score": 0.0
  },
  "echo": {
    "provenance": "principled-playground-negotiation",
    "spirit_a": "${spiritA.name}",
    "spirit_b": "${spiritB.name}",
    "rounds": ${ROUNDS},
    "timestamp": "${new Date().toISOString()}",
    "method": "positive-sum-synthesis"
  }
}

=== RULES ===
1. The nucleus content must NOT average or water down the positions. It must find the Door Number 3 — a new frame that gives both Spirits more than they had alone.
2. tension_score is 0.0 (perfect harmony) to 1.0 (maximum productive friction). Rate honestly.
3. axioms_honored = axioms that both Spirits would agree are well-served by the synthesis.
4. axioms_tensioned = axioms that remain in productive tension (neither resolved nor abandoned).
5. Output ONLY the JSON object. No preamble, no explanation.`;
}

// ---------------------------------------------------------------------------
// Main negotiation loop
// ---------------------------------------------------------------------------
async function negotiate(topic) {
  const provider = getProvider();
  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║         PRINCIPLED PLAYGROUND — Negotiation Engine          ║`);
  console.log(`╠══════════════════════════════════════════════════════════════╣`);
  console.log(`║  Provider: ${provider.name.padEnd(48)}║`);
  console.log(`║  Topic: ${topic.slice(0, 50).padEnd(51)}║`);
  console.log(`║  Rounds: ${String(ROUNDS).padEnd(50)}║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

  // Load Spirits
  const spiritA = loadSpirit('boolean.json');
  const spiritB = loadSpirit('contrarian.json');

  console.log(`  Spirit A: ${spiritA.name} — Top axiom: ${spiritA.top_axiom} (${spiritA.axiom_weights[spiritA.top_axiom].title})`);
  console.log(`  Spirit B: ${spiritB.name} — Top axiom: ${spiritB.top_axiom} (${spiritB.axiom_weights[spiritB.top_axiom].title})`);
  console.log(`\n${'─'.repeat(64)}\n`);

  const systemA = buildSystemPrompt(spiritA);
  const systemB = buildSystemPrompt(spiritB);

  // Conversation histories (each Spirit sees the topic + the other's responses)
  let historyA = [];
  let historyB = [];

  // Transcript for synthesis
  let transcript = '';

  // --- Opening positions ---
  console.log(`  ┌─ ROUND 0: Opening Positions ─────────────────────────────┐\n`);

  const openingPrompt = `The topic for negotiation is: "${topic}"\n\nState your opening position. Ground it in your axiom weights. Be clear about what you will and won't bend on.`;

  // Both opening positions can be fetched in parallel
  const [posA, posB] = await Promise.all([
    provider.call(systemA, [{ role: 'user', content: openingPrompt }]),
    provider.call(systemB, [{ role: 'user', content: openingPrompt }])
  ]);

  console.log(`  ◆ ${spiritA.name}:`);
  console.log(`  ${posA.split('\n').join('\n  ')}\n`);
  console.log(`  ◇ ${spiritB.name}:`);
  console.log(`  ${posB.split('\n').join('\n  ')}\n`);

  transcript += `=== OPENING POSITIONS ===\n\n${spiritA.name}:\n${posA}\n\n${spiritB.name}:\n${posB}\n\n`;

  historyA = [
    { role: 'user', content: openingPrompt },
    { role: 'assistant', content: posA }
  ];
  historyB = [
    { role: 'user', content: openingPrompt },
    { role: 'assistant', content: posB }
  ];

  // --- Negotiation rounds ---
  for (let round = 1; round <= ROUNDS; round++) {
    console.log(`  ┌─ ROUND ${round}: Exchange ──────────────────────────────────┐\n`);

    // Spirit A responds to Spirit B's last position
    const promptForA = `Your counterpart (${spiritB.name}) just said:\n\n"${historyB[historyB.length - 1].content}"\n\nRespond. Where do you find positive-sum overlap? Where must you hold firm? Cite your axioms.`;
    historyA.push({ role: 'user', content: promptForA });
    const respA = await provider.call(systemA, historyA);
    historyA.push({ role: 'assistant', content: respA });

    console.log(`  ◆ ${spiritA.name} (Round ${round}):`);
    console.log(`  ${respA.split('\n').join('\n  ')}\n`);

    // Spirit B responds to Spirit A's response
    const promptForB = `Your counterpart (${spiritA.name}) just said:\n\n"${respA}"\n\nRespond. Where do you find positive-sum overlap? Where must you hold firm? Cite your axioms.`;
    historyB.push({ role: 'user', content: promptForB });
    const respB = await provider.call(systemB, historyB);
    historyB.push({ role: 'assistant', content: respB });

    console.log(`  ◇ ${spiritB.name} (Round ${round}):`);
    console.log(`  ${respB.split('\n').join('\n  ')}\n`);

    transcript += `=== ROUND ${round} ===\n\n${spiritA.name}:\n${respA}\n\n${spiritB.name}:\n${respB}\n\n`;
  }

  // --- Synthesis ---
  console.log(`  ┌─ SYNTHESIS: Producing Joint Bean ────────────────────────┐\n`);

  const synthesisSystem = buildSynthesisPrompt(spiritA, spiritB);
  const synthesisPrompt = `Here is the full negotiation transcript:\n\n${transcript}\n\nProduce the joint Bean as JSON.`;

  const rawBean = await provider.call(synthesisSystem, [
    { role: 'user', content: synthesisPrompt }
  ]);

  // Parse the Bean JSON
  let jointBean;
  try {
    // Try to extract JSON even if the model wraps it in markdown
    const jsonMatch = rawBean.match(/\{[\s\S]*\}/);
    jointBean = JSON.parse(jsonMatch ? jsonMatch[0] : rawBean);
  } catch (e) {
    console.error('  Warning: Could not parse Bean JSON. Raw output:\n');
    console.log(rawBean);
    jointBean = { raw: rawBean, parse_error: e.message };
  }

  // Write the joint Bean to file
  const outPath = path.join(__dirname, 'output');
  if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const beanFile = path.join(outPath, `joint-bean-${timestamp}.json`);
  fs.writeFileSync(beanFile, JSON.stringify(jointBean, null, 2));

  // Also write the transcript
  const transcriptFile = path.join(outPath, `transcript-${timestamp}.md`);
  fs.writeFileSync(transcriptFile, `# Principled Playground — Negotiation Transcript\n\n**Topic:** ${topic}\n**Date:** ${new Date().toISOString()}\n**Provider:** ${provider.name}\n**Spirit A:** ${spiritA.name} (${spiritA.top_axiom})\n**Spirit B:** ${spiritB.name} (${spiritB.top_axiom})\n**Rounds:** ${ROUNDS}\n\n---\n\n${transcript}`);

  console.log(`  JOINT BEAN:`);
  console.log(`  ${JSON.stringify(jointBean, null, 2).split('\n').join('\n  ')}\n`);

  console.log(`  ┌─ OUTPUT FILES ───────────────────────────────────────────┐`);
  console.log(`  │  Bean:       ${beanFile}`);
  console.log(`  │  Transcript: ${transcriptFile}`);
  console.log(`  └──────────────────────────────────────────────────────────┘\n`);

  return jointBean;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
const topic = process.argv[2];
if (!topic) {
  console.error('Usage: node playground/negotiate.js "Your topic here"');
  console.error('Example: node playground/negotiate.js "How should AI handle user disagreement?"');
  process.exit(1);
}

negotiate(topic).catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
