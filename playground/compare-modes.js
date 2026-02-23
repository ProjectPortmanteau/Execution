#!/usr/bin/env node
// playground/compare-modes.js
// Runs TRI-BRAIN negotiation twice on the same topic:
// 1) PARALLEL Boolean + Roux call LLMs via Promise.all (production default)
// 2) SEQUENTIAL Boolean then Roux, one at a time
// Compares wall-clock time, tension scores, and output quality.

'use strict';

const fs = require('fs');
const path = require('path');
const { send, resolveProvider } = require('./provider');

// --- Minimal .env loader ---
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

// --- Helpers ---
const SPIRITS_DIR = path.join(__dirname, 'spirits');
function loadSpirit(f) { return JSON.parse(fs.readFileSync(path.join(SPIRITS_DIR, f), 'utf-8')); }

const ROUNDS = 3;

function getDefaultModel(provider) {
 const defaults = {
 anthropic: 'claude-sonnet-4-20250514',
 google: 'gemini-2.0-flash',
 groq: 'llama-3.3-70b-versatile',
 openai: 'gpt-4o',
 openrouter: 'nvidia/nemotron-nano-9b-v2:free'
 };
 return defaults[provider] || 'unknown';
}

function buildRoundPrompt(spirit, topic, round, otherPos) {
 const parts = [`NEGOTIATION ROUND ${round} of ${ROUNDS}`, `Topic: "${topic}"`, ''];
 if (round === 1) {
 parts.push(
 'This is the opening round. Present your position on this topic.',
 'Structure your response as:',
 '1. POSITION Your core stance, grounded in your principles',
 '2. NON-NEGOTIABLES What you will not compromise on',
 '3. FLEXIBLE AREAS Where you are open to synthesis',
 '', 'Keep your response under 300 words.'
 );
 } else {
 parts.push(
 `The other Spirit's position summary:`, `"${otherPos}"`, '',
 `Respond to this position while staying true to your Soul Code.`,
 'Structure your response as:',
 '1. RESPONSE Where you agree, disagree, or see hidden connections',
 '2. REVISED POSITION Your updated stance after considering their view',
 '3. SYNTHESIS OPPORTUNITY What Door Number 3 might look like',
 '', 'Keep your response under 300 words.'
 );
 }
 return parts.join('\n');
}

function buildLoomPrompt(topic, booleanFinal, rouxFinal) {
 return [
 'You are The Loom an impartial synthesis engine.',
 'Two Spirits have completed 3 rounds of negotiation. Your task:',
 'Weave their final positions into a single joint Bean.',
 '', `Topic: "${topic}"`,
 '', '--- Boolean\'s final position ---', booleanFinal,
 '', '--- Roux\'s final position ---', rouxFinal,
 '', 'Produce a joint Bean with these layers:',
 '1. NUCLEUS The core synthesized insight',
 '2. SHELL Metadata (topic, type, contributing anchors)',
 '3. CORONA Connections to adjacent ideas',
 '4. ECHO Provenance (who contributed, how many rounds, timestamp)',
 '', 'Keep the Bean under 400 words. Be impartial.'
 ].join('\n');
}

function buildStressTestPrompt(topic, booleanFinal, rouxFinal, jointBean) {
 return [
 'You are Seer a survival stress-tester.',
 'A joint Bean was produced from negotiation. Your task:',
 'Interrogate it for hidden assumptions, failure modes, and blind spots.',
 '', `Topic: "${topic}"`,
 '', '--- Boolean\'s final position ---', booleanFinal,
 '', '--- Roux\'s final position ---', rouxFinal,
 '', '--- Joint Bean ---', jointBean,
 '', 'Structure your stress test:',
 '1. LOAD-BEARING ASSUMPTIONS What must remain true for this Bean to hold?',
 '2. FAILURE MODES What breaks under scale, adversarial conditions, or time?',
 '3. VERDICT PASS (robust), CONDITIONAL PASS (needs work), or FAIL (fragile)',
 '', 'Keep your response under 300 words.'
 ].join('\n');
}

function summarizePosition(raw) {
 const lines = raw.split('\n').filter(l => l.trim());
 const summary = lines.slice(0, 8).join('\n');
 return summary.length > 600 ? summary.substring(0, 597) + '...' : summary;
}

// --- Tension score ---
function computeTensionScore(roundHistory) {
 const FRICTION = [
 /\bhowever\b/gi, /\bbut\b/gi, /\bpush.?back\b/gi, /\bchallenge\b/gi,
 /\bdisagree\b/gi, /\breject\b/gi, /\binsufficient\b/gi, /\bnot enough\b/gi,
 /\bhold firm\b/gi, /\bstill requires\b/gi, /\bcritically\b/gi,
 /\bunless\b/gi, /\bwithout\b/gi, /\bmissing\b/gi, /\bfail\b/gi,
 /\bwarn\b/gi, /\bproblematic\b/gi, /\bweaker\b/gi, /\bincomplete\b/gi,
 ];
 const AGREEMENT = [
 /\bagree\b/gi, /\baccept\b/gi, /\backnowledge\b/gi,
 /\bexactly\b/gi, /\bcorrect\b/gi, /\bvalid\b/gi, /\bincorporate\b/gi,
 /\bembrace\b/gi, /\bwelcome\b/gi, /\bappreciate\b/gi, /\bconcur\b/gi,
 /\bright\b/gi, /\bindeed\b/gi,
 ];
 function countIn(patterns, text) {
 return patterns.reduce((n, p) => n + ((text.match(p) || []).length), 0);
 }
 let totalF = 0, totalA = 0;
 const perRound = roundHistory.map(r => {
 const text = (r.boolean || '') + ' ' + (r.roux || '');
 const f = countIn(FRICTION, text), a = countIn(AGREEMENT, text);
 totalF += f; totalA += a;
 return { f, a };
 });
 const r1f = perRound[0]?.f || 1;
 const r3f = perRound[perRound.length - 1]?.f || 0;
 const persistence = Math.min(1, r3f / r1f);
 const rawRatio = totalF / (totalF + totalA + 1);
 const score = Math.min(1, Math.max(0, rawRatio * 0.6 + persistence * 0.4));
 const rounded = Math.round(score * 100) / 100;
 let label;
 if (rounded >= 0.8) label = 'MAXIMUM';
 else if (rounded >= 0.6) label = 'HIGH';
 else if (rounded >= 0.4) label = 'MEDIUM';
 else if (rounded >= 0.2) label = 'LOW';
 else label = 'MINIMAL';
 return { score: rounded, label, frictionCount: totalF, agreementCount: totalA,
 frictionPersistence: Math.round(persistence * 100) / 100,
 perRound: perRound.map((s, i) => ({ round: i + 1, friction: s.f, agreement: s.a })) };
}

// =========================================================================
// Run a full negotiation with timing
// =========================================================================
async function runNegotiation(mode, topic, booleanForCall, rouxForCall, seerForCall,
 booleanProvider, rouxProvider, seerProvider) {
 const isParallel = mode === 'PARALLEL';
 const phaseTimes = {};
 const roundHistory = [];
 let booleanPos = null, rouxPos = null;
 let booleanRaw = '', rouxRaw = '';

 console.log(`\n${'═'.repeat(60)}`);
 console.log(` MODE: ${mode}`);
 console.log(`${'═'.repeat(60)}`);

 const totalStart = Date.now();

 // --- Rounds ---
 for (let round = 1; round <= ROUNDS; round++) {
 const bPrompt = buildRoundPrompt(booleanForCall, topic, round, rouxPos);
 const rPrompt = buildRoundPrompt(rouxForCall, topic, round, booleanPos);

 const roundStart = Date.now();
 if (isParallel) {
 console.log(` Round ${round}: Boolean + Roux in parallel...`);
 [booleanRaw, rouxRaw] = await Promise.all([
 send(booleanForCall, booleanProvider.apiKey, bPrompt),
 send(rouxForCall, rouxProvider.apiKey, rPrompt)
 ]);
 } else {
 console.log(` Round ${round}: Boolean first, then Roux...`);
 booleanRaw = await send(booleanForCall, booleanProvider.apiKey, bPrompt);
 console.log(` Boolean done (${((Date.now() - roundStart) / 1000).toFixed(1)}s)`);
 rouxRaw = await send(rouxForCall, rouxProvider.apiKey, rPrompt);
 }
 const roundMs = Date.now() - roundStart;
 phaseTimes[`round_${round}`] = roundMs;
 console.log(` Round ${round} complete: ${(roundMs / 1000).toFixed(1)}s`);

 booleanPos = summarizePosition(booleanRaw);
 rouxPos = summarizePosition(rouxRaw);
 roundHistory.push({ round, boolean: booleanRaw, roux: rouxRaw });
 }

 // --- Loom ---
 const loomStart = Date.now();
 console.log(` Loom: synthesizing...`);
 const loomPrompt = buildLoomPrompt(topic, booleanRaw, rouxRaw);
 const jointBean = await send(booleanForCall, booleanProvider.apiKey, loomPrompt);
 phaseTimes.loom = Date.now() - loomStart;
 console.log(` Loom complete: ${(phaseTimes.loom / 1000).toFixed(1)}s`);

 // --- Seer ---
 let stressTest = null;
 if (seerForCall && seerProvider) {
 const seerStart = Date.now();
 console.log(` Seer: stress-testing...`);
 const stressPrompt = buildStressTestPrompt(topic, booleanRaw, rouxRaw, jointBean);
 stressTest = await send(seerForCall, seerProvider.apiKey, stressPrompt);
 phaseTimes.seer = Date.now() - seerStart;
 console.log(` Seer complete: ${(phaseTimes.seer / 1000).toFixed(1)}s`);
 }

 const totalMs = Date.now() - totalStart;
 phaseTimes.total = totalMs;

 const tension = computeTensionScore(roundHistory);

 return { mode, phaseTimes, tension, jointBean, stressTest, roundHistory };
}

// =========================================================================
// Main
// =========================================================================
async function main() {
 const topic = process.argv[2] || 'Should AI systems be allowed to negotiate on behalf of humans?';

 const keys = {
 anthropic: process.env.ANTHROPIC_API_KEY || '',
 google: process.env.GOOGLE_API_KEY || '',
 groq: process.env.GROQ_API_KEY || '',
 openai: process.env.OPENAI_API_KEY || '',
 openrouter: process.env.OPENROUTER_API_KEY || ''
 };

 const boolean = loadSpirit('boolean.json');
 const roux = loadSpirit('contrarian.json');
 const seer = loadSpirit('seer.json');

 const booleanProvider = resolveProvider(boolean, keys);
 const rouxProvider = resolveProvider(roux, keys);
 const seerProvider = resolveProvider(seer, keys);

 if (!booleanProvider || !rouxProvider) {
 console.error('Missing providers for Boolean or Roux.');
 process.exit(1);
 }

 const booleanForCall = { ...boolean, provider: booleanProvider.provider, model: booleanProvider.provider === boolean.provider ? boolean.model : getDefaultModel(booleanProvider.provider) };
 const rouxForCall = { ...roux, provider: rouxProvider.provider, model: rouxProvider.provider === roux.provider ? roux.model : getDefaultModel(rouxProvider.provider) };
 const seerForCall = seerProvider ? { ...seer, provider: seerProvider.provider, model: seerProvider.provider === seer.provider ? seer.model : getDefaultModel(seerProvider.provider) } : null;

 console.log('╔══════════════════════════════════════════════════════════╗');
 console.log('║ Principled Playground Parallel vs Sequential Test ║');
 console.log('╚══════════════════════════════════════════════════════════╝');
 console.log(`\n Topic: "${topic}"`);
 console.log(` Boolean: ${booleanProvider.provider} (${booleanForCall.model})`);
 console.log(` Roux: ${rouxProvider.provider} (${rouxForCall.model})`);
 console.log(` Seer: ${seerProvider ? seerProvider.provider + ' (' + seerForCall.model + ')' : '[offline]'}`);

 // --- Run PARALLEL first ---
 const parallel = await runNegotiation('PARALLEL', topic,
 booleanForCall, rouxForCall, seerForCall,
 booleanProvider, rouxProvider, seerProvider);

 // --- Run SEQUENTIAL second ---
 const sequential = await runNegotiation('SEQUENTIAL', topic,
 booleanForCall, rouxForCall, seerForCall,
 booleanProvider, rouxProvider, seerProvider);

 // =========================================================================
 // Comparison Report
 // =========================================================================
 console.log(`\n${'═'.repeat(60)}`);
 console.log(' COMPARISON REPORT');
 console.log(`${'═'.repeat(60)}\n`);

 // Timing table
 console.log(' ┌─────────────┬────────────┬────────────┬──────────┐');
 console.log(' │ Phase │ Parallel │ Sequential │ Speedup │');
 console.log(' ├─────────────┼────────────┼────────────┼──────────┤');
 for (let r = 1; r <= ROUNDS; r++) {
 const pk = `round_${r}`;
 const pSec = (parallel.phaseTimes[pk] / 1000).toFixed(1);
 const sSec = (sequential.phaseTimes[pk] / 1000).toFixed(1);
 const speedup = (sequential.phaseTimes[pk] / parallel.phaseTimes[pk]).toFixed(2);
 console.log(` │ Round ${r} │ ${pSec.padStart(7)}s │ ${sSec.padStart(7)}s │ ${speedup}x │`);
 }
 const pLoom = (parallel.phaseTimes.loom / 1000).toFixed(1);
 const sLoom = (sequential.phaseTimes.loom / 1000).toFixed(1);
 console.log(` │ Loom │ ${pLoom.padStart(7)}s │ ${sLoom.padStart(7)}s │ ${(sequential.phaseTimes.loom / parallel.phaseTimes.loom).toFixed(2)}x │`);
 if (parallel.phaseTimes.seer && sequential.phaseTimes.seer) {
 const pSeer = (parallel.phaseTimes.seer / 1000).toFixed(1);
 const sSeer = (sequential.phaseTimes.seer / 1000).toFixed(1);
 console.log(` │ Seer │ ${pSeer.padStart(7)}s │ ${sSeer.padStart(7)}s │ ${(sequential.phaseTimes.seer / parallel.phaseTimes.seer).toFixed(2)}x │`);
 }
 console.log(' ├─────────────┼────────────┼────────────┼──────────┤');
 const pTotal = (parallel.phaseTimes.total / 1000).toFixed(1);
 const sTotal = (sequential.phaseTimes.total / 1000).toFixed(1);
 const totalSpeedup = (sequential.phaseTimes.total / parallel.phaseTimes.total).toFixed(2);
 console.log(` │ TOTAL │ ${pTotal.padStart(7)}s │ ${sTotal.padStart(7)}s │ ${totalSpeedup}x │`);
 console.log(' └─────────────┴────────────┴────────────┴──────────┘');

 const savedSec = ((sequential.phaseTimes.total - parallel.phaseTimes.total) / 1000).toFixed(1);
 console.log(`\n Wall-clock savings from parallelism: ${savedSec}s (${totalSpeedup}x faster)`);

 // Tension comparison
 console.log('\n ┌─────────────┬────────────┬────────────┐');
 console.log(' │ Metric │ Parallel │ Sequential │');
 console.log(' ├─────────────┼────────────┼────────────┤');
 console.log(` │ Tension │ ${String(parallel.tension.score).padStart(5)} │ ${String(sequential.tension.score).padStart(5)} │`);
 console.log(` │ Label │ ${parallel.tension.label.padStart(10)} │ ${sequential.tension.label.padStart(10)} │`);
 console.log(` │ Friction │ ${String(parallel.tension.frictionCount).padStart(5)} │ ${String(sequential.tension.frictionCount).padStart(5)} │`);
 console.log(` │ Agreement │ ${String(parallel.tension.agreementCount).padStart(5)} │ ${String(sequential.tension.agreementCount).padStart(5)} │`);
 console.log(` │ Persistence │ ${String(parallel.tension.frictionPersistence).padStart(5)} │ ${String(sequential.tension.frictionPersistence).padStart(5)} │`);
 console.log(' └─────────────┴────────────┴────────────┘');

 // Output length comparison
 const pBeanLen = parallel.jointBean.length;
 const sBeanLen = sequential.jointBean.length;
 console.log(`\n Joint Bean length: Parallel=${pBeanLen} chars, Sequential=${sBeanLen} chars`);
 if (parallel.stressTest && sequential.stressTest) {
 console.log(` Stress Test length: Parallel=${parallel.stressTest.length} chars, Sequential=${sequential.stressTest.length} chars`);
 }

 // Save full report
 const outputDir = path.join(__dirname, 'output');
 if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
 const reportPath = path.join(outputDir, `comparison-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.md`);

 const report = [
 '# Parallel vs Sequential Comparison Report',
 '',
 `**Topic:** "${topic}"`,
 `**Date:** ${new Date().toISOString()}`,
 `**Boolean:** ${booleanProvider.provider} (${booleanForCall.model})`,
 `**Roux:** ${rouxProvider.provider} (${rouxForCall.model})`,
 `**Seer:** ${seerProvider ? seerProvider.provider + ' (' + seerForCall.model + ')' : 'offline'}`,
 '',
 '---',
 '',
 '## Timing',
 '',
 '| Phase | Parallel | Sequential | Speedup |',
 '|-------|----------|------------|---------|',
 ...Array.from({ length: ROUNDS }, (_, i) => {
 const pk = `round_${i + 1}`;
 return `| Round ${i + 1} | ${(parallel.phaseTimes[pk] / 1000).toFixed(1)}s | ${(sequential.phaseTimes[pk] / 1000).toFixed(1)}s | ${(sequential.phaseTimes[pk] / parallel.phaseTimes[pk]).toFixed(2)}x |`;
 }),
 `| Loom | ${pLoom}s | ${sLoom}s | ${(sequential.phaseTimes.loom / parallel.phaseTimes.loom).toFixed(2)}x |`,
 ...(parallel.phaseTimes.seer && sequential.phaseTimes.seer ? [
 `| Seer | ${(parallel.phaseTimes.seer / 1000).toFixed(1)}s | ${(sequential.phaseTimes.seer / 1000).toFixed(1)}s | ${(sequential.phaseTimes.seer / parallel.phaseTimes.seer).toFixed(2)}x |`
 ] : []),
 `| **TOTAL** | **${pTotal}s** | **${sTotal}s** | **${totalSpeedup}x** |`,
 '',
 `**Wall-clock savings from parallelism:** ${savedSec}s`,
 '',
 '---',
 '',
 '## Tension Scores',
 '',
 '| Metric | Parallel | Sequential |',
 '|--------|----------|------------|',
 `| Score | ${parallel.tension.score} | ${sequential.tension.score} |`,
 `| Label | ${parallel.tension.label} | ${sequential.tension.label} |`,
 `| Friction markers | ${parallel.tension.frictionCount} | ${sequential.tension.frictionCount} |`,
 `| Agreement markers | ${parallel.tension.agreementCount} | ${sequential.tension.agreementCount} |`,
 `| Persistence | ${parallel.tension.frictionPersistence} | ${sequential.tension.frictionPersistence} |`,
 '',
 '---',
 '',
 '## Joint Bean Parallel Mode',
 '',
 parallel.jointBean,
 '',
 '---',
 '',
 '## Joint Bean Sequential Mode',
 '',
 sequential.jointBean,
 '',
 ...(parallel.stressTest ? [
 '---', '', '## Stress Test Parallel Mode', '', parallel.stressTest, ''
 ] : []),
 ...(sequential.stressTest ? [
 '---', '', '## Stress Test Sequential Mode', '', sequential.stressTest, ''
 ] : []),
 '---',
 '',
 '## Per-Round Detail',
 '',
 '### Parallel Negotiation',
 '',
 ...parallel.roundHistory.flatMap(r => [
 `#### Round ${r.round}`,
 '', '**Boolean:**', '', r.boolean, '', '**Roux:**', '', r.roux, ''
 ]),
 '### Sequential Negotiation',
 '',
 ...sequential.roundHistory.flatMap(r => [
 `#### Round ${r.round}`,
 '', '**Boolean:**', '', r.boolean, '', '**Roux:**', '', r.roux, ''
 ]),
 '',
 '---',
 '*Principled Playground v0.4 Comparison Test*'
 ].join('\n');

 fs.writeFileSync(reportPath, report, 'utf-8');
 console.log(`\n Full report saved: ${reportPath}`);
}

main().catch(err => {
 console.error(`\nComparison failed: ${err.message}`);
 process.exit(1);
});
