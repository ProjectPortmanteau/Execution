#!/usr/bin/env node
// playground/scoring.test.js
// Phase 2 acceptance tests for scoring.js.
// All pure-math and discrimination tests are key-free: they construct synthetic
// embedding vectors directly and call the math functions inline rather than
// going through embedText() (which needs a key or SCORING_FIXTURE=1).
// An integration block at the bottom runs with a live key if GEMINI_API_KEY set.

'use strict';

const assert = require('assert');
const { cosineSim, splitClaims, computeGroundedness, computeDisplacement, fixtureEmbed, EMBED_DIM } = require('./scoring');
const { buildJointBean, normalizeLoom } = require('./loom');

let passed = 0;
const failures = [];

function ok(name, fn) {
 try { fn(); passed++; console.log(`  ✓ ${name}`); }
 catch (e) { failures.push({ name, err: e }); console.log(`  ✗ ${name}\n    ${e.message}`); }
}

console.log('scoring.js unit checks\n');

// --- cosineSim -------------------------------------------------------------------
ok('cosineSim: identical unit vector => 1', () => {
 const v = [1, 0, 0];
 assert.strictEqual(cosineSim(v, v), 1);
});
ok('cosineSim: orthogonal vectors => 0', () => {
 assert.strictEqual(cosineSim([1, 0], [0, 1]), 0);
});
ok('cosineSim: antiparallel vectors => -1', () => {
 assert.strictEqual(cosineSim([1, 0], [-1, 0]), -1);
});
ok('cosineSim: zero vector => 0 (no divide-by-zero)', () => {
 assert.strictEqual(cosineSim([0, 0, 0], [1, 2, 3]), 0);
});
ok('cosineSim: known values', () => {
 const sim = cosineSim([1, 1], [1, 0]);
 const expected = 1 / Math.sqrt(2);
 assert.ok(Math.abs(sim - expected) < 1e-10, `expected ${expected}, got ${sim}`);
});

// --- splitClaims -----------------------------------------------------------------
ok('splitClaims: splits on sentence boundaries', () => {
 const claims = splitClaims('AI should reshape interactions. Systems, not people, need fixing. Design matters.');
 assert.ok(claims.length >= 2, `expected >=2 claims, got ${claims.length}`);
});
ok('splitClaims: filters short lines', () => {
 const claims = splitClaims('OK. Fine. AI should be designed to support constructive dialogue.');
 assert.ok(claims.every(c => c.length >= 20), 'short lines leaked through');
});
ok('splitClaims: single sentence returns at least one entry', () => {
 const claims = splitClaims('AI must never treat user disagreement as ignorance to be corrected.');
 assert.ok(claims.length >= 1);
});

// --- fixtureEmbed ----------------------------------------------------------------
ok(`fixtureEmbed: returns ${EMBED_DIM}-dim vector (EMBED_DIM)`, () => {
 const v = fixtureEmbed('hello world');
 assert.strictEqual(v.length, EMBED_DIM);
});
ok('fixtureEmbed: unit vector (magnitude ~1)', () => {
 const v = fixtureEmbed('test text');
 const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
 assert.ok(Math.abs(mag - 1) < 1e-9, `magnitude=${mag}`);
});
ok('fixtureEmbed: same text => same vector', () => {
 const a = fixtureEmbed('consistent input');
 const b = fixtureEmbed('consistent input');
 assert.deepStrictEqual(a, b);
});
ok('fixtureEmbed: different texts => different vectors', () => {
 const a = fixtureEmbed('boolean position: door number three');
 const b = fixtureEmbed('roux position: systemic causality and soil');
 const sim = cosineSim(a, b);
 assert.ok(sim < 0.99, `vectors too similar: cosine=${sim}`);
});

// --- Groundedness (delegate to loom) --------------------------------------------
ok('computeGroundedness: all grounded => 1.0', () => {
 const g = computeGroundedness([
 { derives_from: ['boolean_r3'] },
 { derives_from: ['roux_r3'] }
 ]);
 assert.strictEqual(g.groundedness, 1);
});
ok('computeGroundedness: none grounded => 0', () => {
 const g = computeGroundedness([{ derives_from: [] }, { derives_from: [] }]);
 assert.strictEqual(g.groundedness, 0);
});
ok('computeGroundedness: mixed => 0.5', () => {
 const g = computeGroundedness([{ derives_from: ['boolean_r3'] }, { derives_from: [] }]);
 assert.strictEqual(g.groundedness, 0.5);
});

// ============================================================================
// THREE-CASE DISCRIMINATION TEST
// Vectors are constructed directly (no API key) to prove the math logic.
// Each test documents its invariant so it doubles as spec commentary.
//
// Vector space (3-dim for clarity):
//   A = [1,0,0]  Boolean's position direction
//   B = [0,1,0]  Roux's position direction
//   C = [0,0,1]  orthogonal "novel" direction
// ============================================================================

console.log('\n  --- Three-case discrimination ---');

// Inline displacement logic (avoids async/key requirement for unit test)
function syntheticDisplacement(synthVec, claimVecsA, claimVecsB) {
 const maxSimA = Math.max(...claimVecsA.map(e => cosineSim(synthVec, e)));
 const maxSimB = Math.max(...claimVecsB.map(e => cosineSim(synthVec, e)));
 const d_A = Math.round((1 - maxSimA) * 1000) / 1000;
 const d_B = Math.round((1 - maxSimB) * 1000) / 1000;
 const novelty_lift = Math.round(Math.min(d_A, d_B) * 1000) / 1000;
 const balance = Math.round(Math.abs(d_A - d_B) * 1000) / 1000;
 return { d_A, d_B, novelty_lift, balance };
}

// Source position vectors
const vecA = [1, 0, 0]; // Boolean
const vecB = [0, 1, 0]; // Roux
const vecNovel = [0, 0, 1]; // orthogonal to both
const vecBlend = [0.5, 0.5, 0.707]; // draws from both + novel direction (normalized approx)

ok('CASE 1 — real synthesis: novelty_lift > 0, balance low', () => {
 // A synthesis drawn from both parents and bridging into new territory.
 // It should be noticeably displaced from BOTH A and B.
 const { d_A, d_B, novelty_lift, balance } = syntheticDisplacement(
 vecBlend,
 [vecA], [vecB]
 );
 console.log(`    d_A=${d_A}, d_B=${d_B}, novelty_lift=${novelty_lift}, balance=${balance}`);
 assert.ok(novelty_lift > 0, `novelty_lift should be >0, got ${novelty_lift}`);
 assert.ok(balance < novelty_lift + 0.3, `balance should be modest, got ${balance}`);
});

ok('CASE 2 — echo synthesis (copy of A): d_A ~0, novelty_lift ~0, balance high', () => {
 // Synthesis is identical to Boolean's position. d_A is ~0.
 const { d_A, d_B, novelty_lift, balance } = syntheticDisplacement(
 vecA,    // synthesis = copy of A
 [vecA],  // A's claims
 [vecB]   // B's claims
 );
 console.log(`    d_A=${d_A}, d_B=${d_B}, novelty_lift=${novelty_lift}, balance=${balance}`);
 assert.ok(d_A < 0.01, `d_A should be ~0 (echo of A), got ${d_A}`);
 assert.strictEqual(novelty_lift, 0, `novelty_lift should be 0 for echo, got ${novelty_lift}`);
 assert.ok(balance > 0, `balance should be > 0 when synthesis echoes only one parent`);
});

ok('CASE 3 — word salad: novelty_lift high BUT groundedness=0 catches it', () => {
 // The synthesis is in a completely novel direction (orthogonal to both parents).
 // Displacement alone looks great. Groundedness = 0 because no DERIVES_FROM edges.
 const { d_A, d_B, novelty_lift } = syntheticDisplacement(
 vecNovel, // synthesis = random novel direction
 [vecA],
 [vecB]
 );
 console.log(`    d_A=${d_A}, d_B=${d_B}, novelty_lift=${novelty_lift}`);

 // Word salad claims have no DERIVES_FROM edges
 const wordSaladBean = buildJointBean({
 norm: normalizeLoom({
 thesis: 'Incoherent nonsense',
 claims: [
 { text: 'Quantum entanglement governs all disagreement', derives_from: [], rel: 'SYNTHESIZES' },
 { text: 'The blockchain of consciousness emerges naturally', derives_from: [], rel: 'SYNTHESIZES' }
 ],
 connections: []
 }),
 topic: 'test',
 substrate: 'fixture',
 brainMode: 'FIXTURE',
 timestamp: '2026-06-14T00:00:00Z'
 });

 const g = computeGroundedness(wordSaladBean.nucleus.claims);
 console.log(`    groundedness=${g.groundedness}`);

 // KEY INVARIANT: novelty_lift is high, but groundedness is 0.
 // Displacement alone does NOT catch word salad. Groundedness is required.
 assert.ok(novelty_lift > 0.2, `expected high novelty_lift for novel vector, got ${novelty_lift}`);
 assert.strictEqual(g.groundedness, 0, `groundedness MUST be 0 for ungrounded salad, got ${g.groundedness}`);
 // Explicit assertion that both checks together catch what neither catches alone:
 const isRealSynthesis = novelty_lift > 0.2 && g.groundedness > 0;
 assert.strictEqual(isRealSynthesis, false,
 'Word salad passes displacement check but FAILS combined check (groundedness=0) — correct');
});

// ============================================================================
// Integration tests (requires GEMINI_API_KEY, skipped otherwise)
// ============================================================================

async function runIntegration() {
 const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
 if (!apiKey) {
 console.log('\n  Integration tests skipped (no GEMINI_API_KEY or GOOGLE_API_KEY).');
 return;
 }

 console.log('\n  --- Integration (live Gemini embed) ---');
 const { embedText, computeDisplacement: cd } = require('./scoring');

 let intPassed = 0;
 async function okAsync(name, fn) {
 try { await fn(); intPassed++; console.log(`  ✓ ${name}`); }
 catch (e) { failures.push({ name: `[integration] ${name}`, err: e }); console.log(`  ✗ [integration] ${name}\n    ${e.message}`); }
 }

 await okAsync('embedText("hello") returns a numeric vector (>= 512 dims)', async () => {
 const vec = await embedText('hello', apiKey);
 assert.ok(vec.length >= 512, `expected >= 512 dims, got ${vec.length}`);
 assert.ok(vec.every(x => typeof x === 'number'), 'all values should be numbers');
 console.log(`    embed dim=${vec.length}`);
 });

 await okAsync('computeDisplacement: echo synthesis has novelty_lift ~0', async () => {
 const pos = 'AI should use constructive dialogue to engage with user disagreement and find shared ground.';
 const { novelty_lift } = await cd(pos, pos, 'different position about systemic redesign', apiKey);
 assert.ok(novelty_lift < 0.3, `echo should have low novelty_lift, got ${novelty_lift}`);
 });

 passed += intPassed;
}

// --- Summary ------------------------------------------------------------------

runIntegration().then(() => {
 console.log(`\n${passed} checks passed.`);
 if (failures.length) {
 console.log(`\n${failures.length} FAILED:`);
 failures.forEach(f => console.log(` ✗ ${f.name}: ${f.err.message}`));
 process.exit(1);
 }
}).catch(err => {
 console.error('Test runner crashed:', err);
 process.exit(1);
});
