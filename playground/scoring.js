// playground/scoring.js
// Semantic eval metrics — Phase 2 of instrument-and-validate.
// Three metrics: Tension, Displacement, Groundedness.
// All LLM/embed calls respect SCORING_FIXTURE=1 for key-free CI runs.

'use strict';

const { embed: providerEmbed, PROVIDERS } = require('./provider');
const { computeGroundedness: loomGroundedness } = require('./loom');

// ---------------------------------------------------------------------------
// Fixture mode
// When SCORING_FIXTURE=1, embedText returns a deterministic vector and
// classifyStance returns 'UNRELATED'. All downstream functions work the same
// way — no network calls, no keys required.
// ---------------------------------------------------------------------------

const FIXTURE_MODE = process.env.SCORING_FIXTURE === '1';

const EMBED_DIM = 768;

// Produces a deterministic unit vector seeded from the text's character codes.
// NOT a semantic embedding — for pipeline/math verification only.
function fixtureEmbed(text) {
 const vec = new Array(EMBED_DIM).fill(0);
 for (let i = 0; i < text.length; i++) {
 vec[i % EMBED_DIM] += text.charCodeAt(i);
 }
 const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
 return vec.map(v => v / mag);
}

// ---------------------------------------------------------------------------
// Pure math
// ---------------------------------------------------------------------------

/**
 * Cosine similarity between two numeric vectors.
 * Returns 0 for zero-magnitude inputs (safe, no divide-by-zero).
 */
function cosineSim(a, b) {
 if (a.length !== b.length) throw new Error(`cosineSim: length mismatch ${a.length} vs ${b.length}`);
 let dot = 0, magA = 0, magB = 0;
 for (let i = 0; i < a.length; i++) {
 dot += a[i] * b[i];
 magA += a[i] * a[i];
 magB += b[i] * b[i];
 }
 const denom = Math.sqrt(magA) * Math.sqrt(magB);
 return denom === 0 ? 0 : dot / denom;
}

/**
 * Split a block of text into salient claims (sentence-level).
 * Filters out lines shorter than 20 chars (headers, bullets without content).
 */
function splitClaims(text) {
 return text
 .split(/[.!?]\s+|\n+/)
 .map(s => s.trim())
 .filter(s => s.length >= 20);
}

// ---------------------------------------------------------------------------
// Embedding
// ---------------------------------------------------------------------------

/**
 * Embed a single text string. Returns a numeric vector.
 * In FIXTURE_MODE returns a deterministic vector for pipeline testing.
 *
 * @param {string} text
 * @param {string} apiKey
 * @returns {Promise<number[]>}
 */
async function embedText(text, apiKey) {
 if (FIXTURE_MODE) return fixtureEmbed(text);
 return providerEmbed(text, apiKey);
}

/**
 * Embed multiple texts in parallel (Promise.all).
 */
async function embedAll(texts, apiKey) {
 return Promise.all(texts.map(t => embedText(t, apiKey)));
}

// ---------------------------------------------------------------------------
// Stance classifier
// ---------------------------------------------------------------------------

const STANCE_PROMPT_SYSTEM =
 'You are a stance classifier. Reply with exactly one word from the set: ' +
 'SUPPORTS, CONTRADICTS, UNRELATED. No punctuation, no explanation.';

const VALID_STANCES = new Set(['SUPPORTS', 'CONTRADICTS', 'UNRELATED']);

/**
 * Classify whether claimA supports, contradicts, or is unrelated to claimB.
 *
 * @param {string} claimA
 * @param {string} claimB
 * @param {string} apiKey
 * @param {string} [model='gemini-2.0-flash']
 * @returns {Promise<'SUPPORTS'|'CONTRADICTS'|'UNRELATED'>}
 */
async function classifyStance(claimA, claimB, apiKey, model = 'gemini-2.0-flash') {
 if (FIXTURE_MODE) return 'UNRELATED';

 const callFn = PROVIDERS.gemini || PROVIDERS.google;
 if (!callFn) throw new Error('classifyStance: no google/gemini provider available');

 const userMsg = `Claim A: "${claimA}"\nClaim B: "${claimB}"\nRelationship:`;
 try {
 const raw = await callFn(apiKey, model, STANCE_PROMPT_SYSTEM, userMsg);
 const word = raw.trim().toUpperCase().replace(/[^A-Z]/, '');
 return VALID_STANCES.has(word) ? word : 'UNRELATED';
 } catch (_) {
 return 'UNRELATED'; // fail safe — never crash the scoring pipeline
 }
}

// ---------------------------------------------------------------------------
// Tension(A, B) = engagement x opposition
// engagement: mean cosine similarity of topically-engaged pairs
// opposition: fraction of engaged pairs classified CONTRADICTS
// ---------------------------------------------------------------------------

/**
 * Compute semantic tension between two positions.
 *
 * @param {string} textA - Boolean's final position
 * @param {string} textB - Roux's final position
 * @param {string} apiKey
 * @param {object} [opts]
 * @param {number} [opts.engagementThreshold=0.3] - min cosine sim to consider "engaged"
 * @param {number} [opts.maxPairs=20] - cap on stance-classifier calls (O(N^2) guard)
 * @param {string} [opts.model='gemini-2.0-flash']
 * @returns {Promise<{engagement, opposition, tension, pairs, classifiedPairs}>}
 */
async function computeSemanticTension(textA, textB, apiKey, opts = {}) {
 const {
 engagementThreshold = 0.3,
 maxPairs = 20,
 model = 'gemini-2.0-flash'
 } = opts;

 const claimsA = splitClaims(textA);
 const claimsB = splitClaims(textB);

 if (!claimsA.length || !claimsB.length) {
 return { engagement: 0, opposition: 0, tension: 0, pairs: 0, classifiedPairs: 0 };
 }

 const [embsA, embsB] = await Promise.all([embedAll(claimsA, apiKey), embedAll(claimsB, apiKey)]);

 // Collect engaged pairs
 const engaged = [];
 for (let i = 0; i < claimsA.length; i++) {
 for (let j = 0; j < claimsB.length; j++) {
 const sim = cosineSim(embsA[i], embsB[j]);
 if (sim >= engagementThreshold) engaged.push({ i, j, sim });
 }
 }

 // Sort by similarity descending and cap to avoid O(N^2) API calls
 engaged.sort((a, b) => b.sim - a.sim);
 const capped = engaged.slice(0, maxPairs);

 if (!capped.length) {
 return { engagement: 0, opposition: 0, tension: 0, pairs: 0, classifiedPairs: 0 };
 }

 const engagement = capped.reduce((s, p) => s + p.sim, 0) / capped.length;

 // Classify each engaged pair
 const stances = await Promise.all(
 capped.map(p => classifyStance(claimsA[p.i], claimsB[p.j], apiKey, model))
 );
 const contradictCount = stances.filter(s => s === 'CONTRADICTS').length;
 const opposition = contradictCount / stances.length;

 const tension = Math.round(engagement * opposition * 1000) / 1000;

 return {
 engagement: Math.round(engagement * 1000) / 1000,
 opposition: Math.round(opposition * 1000) / 1000,
 tension,
 pairs: engaged.length,
 classifiedPairs: capped.length
 };
}

// ---------------------------------------------------------------------------
// Displacement(synthesis, A, B)
// d_X = 1 - max cosine(synthesis_emb, claims_X_embs)
// novelty_lift = min(d_A, d_B) — how far the synthesis is from its nearest parent
// balance = |d_A - d_B|      — how even the distance is (low = drew equally from both)
// ---------------------------------------------------------------------------

/**
 * Compute displacement of a synthesis relative to two source positions.
 *
 * @param {string} synthText - The synthesis (Joint Bean Nucleus)
 * @param {string} textA - Boolean's final position
 * @param {string} textB - Roux's final position
 * @param {string} apiKey
 * @returns {Promise<{d_A, d_B, novelty_lift, balance}>}
 */
async function computeDisplacement(synthText, textA, textB, apiKey) {
 const claimsA = splitClaims(textA);
 const claimsB = splitClaims(textB);

 const [synthEmb, embsA, embsB] = await Promise.all([
 embedText(synthText, apiKey),
 embedAll(claimsA.length ? claimsA : [textA], apiKey),
 embedAll(claimsB.length ? claimsB : [textB], apiKey)
 ]);

 const maxSimA = Math.max(...embsA.map(e => cosineSim(synthEmb, e)));
 const maxSimB = Math.max(...embsB.map(e => cosineSim(synthEmb, e)));

 const d_A = Math.round((1 - maxSimA) * 1000) / 1000;
 const d_B = Math.round((1 - maxSimB) * 1000) / 1000;
 const novelty_lift = Math.round(Math.min(d_A, d_B) * 1000) / 1000;
 const balance = Math.round(Math.abs(d_A - d_B) * 1000) / 1000;

 return { d_A, d_B, novelty_lift, balance };
}

// ---------------------------------------------------------------------------
// Groundedness — delegates to loom.js so callers have one import
// ---------------------------------------------------------------------------

/**
 * Fraction of synthesis claims that carry at least one DERIVES_FROM edge
 * to a real source (boolean_r3 or roux_r3).
 *
 * @param {Array<{derives_from: string[]}>} claims - from bean.nucleus.claims
 * @returns {{ groundedness, grounded, total, ungroundedIdx }}
 */
function computeGroundedness(claims) {
 return loomGroundedness(claims);
}

module.exports = {
 // Pure math (exported for tests)
 cosineSim,
 splitClaims,
 fixtureEmbed,
 // Core scoring
 embedText,
 embedAll,
 classifyStance,
 computeSemanticTension,
 computeDisplacement,
 computeGroundedness,
 // Constants
 EMBED_DIM,
 FIXTURE_MODE
};
