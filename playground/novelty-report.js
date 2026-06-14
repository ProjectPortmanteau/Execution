#!/usr/bin/env node
// playground/novelty-report.js
// Phase 3: measure whether the Loom genuinely synthesizes on real transcripts.
// For each negotiation transcript in playground/output/:
//   1. Extract Boolean's R3 position, Roux's R3 position, and the Nucleus.
//   2. Run computeDisplacement(nucleus, boolean_r3, roux_r3).
//   3. Report d_A, d_B, novelty_lift, balance per transcript.
//   4. Apply the gate: >= 0.3 -> proceed; < 0.1 -> STOP and write LOOM_FINDING.md.
//
// Without a GEMINI_API_KEY, the parser still runs and shows the extracted text
// so the extraction logic can be verified. Displacement computation is blocked
// until a key is available.

'use strict';

const fs = require('fs');
const path = require('path');
const { extractRound3, extractNucleus } = require('./transcript-parser');
const { computeDisplacement } = require('./scoring');

// --- env loader (same minimal pattern as negotiate.js) ----------------------
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

const OUTPUT_DIR = path.join(__dirname, 'output');

// ---------------------------------------------------------------------------

function shortPath(p) { return path.relative(process.cwd(), p); }

function printBanner(title) {
 const line = '='.repeat(70);
 console.log(`\n${line}\n${title}\n${line}`);
}

function median(arr) {
 if (!arr.length) return null;
 const s = [...arr].sort((a, b) => a - b);
 const mid = Math.floor(s.length / 2);
 return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

async function main() {
 printBanner('PHASE 3 — Novelty Report on Real Transcripts');

 const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
 const hasKey = Boolean(apiKey);

 if (!hasKey) {
 console.log('[NO KEY] GEMINI_API_KEY and GOOGLE_API_KEY are both unset.');
 console.log(' Displacement scores will NOT be computed. The parser will run');
 console.log(' and show extracted text so extraction logic can be verified.\n');
 } else {
 console.log(`[KEY] Using key ${apiKey.slice(0, 8)}...${apiKey.slice(-4)} for embeddings.\n`);
 }

 // Find all negotiation transcripts
 const files = fs.readdirSync(OUTPUT_DIR)
 .filter(f => f.startsWith('negotiation-') && f.endsWith('.md'))
 .map(f => path.join(OUTPUT_DIR, f))
 .sort();

 if (!files.length) {
 console.log('No negotiation-*.md files found in playground/output/. Exiting.');
 process.exit(0);
 }

 console.log(`Found ${files.length} transcript(s):\n`);
 files.forEach(f => console.log(` ${shortPath(f)}`));

 const results = [];

 for (const fp of files) {
 console.log(`\n${'─'.repeat(70)}`);
 console.log(`Transcript: ${shortPath(fp)}`);

 const md = fs.readFileSync(fp, 'utf-8');
 const { boolean_r3, roux_r3 } = extractRound3(md);
 const nucleus = extractNucleus(md);

 const extracted = {
 boolean_r3_chars: boolean_r3.length,
 roux_r3_chars: roux_r3.length,
 nucleus_chars: nucleus.length
 };

 if (!boolean_r3 || !roux_r3) {
 console.log(` SKIP: could not extract both Round-3 positions`);
 console.log(` boolean_r3=${boolean_r3.length} chars, roux_r3=${roux_r3.length} chars`);
 results.push({ file: path.basename(fp), skipped: true, reason: 'missing R3 positions' });
 continue;
 }
 if (!nucleus) {
 console.log(` SKIP: could not extract Nucleus section`);
 console.log(` boolean_r3=${boolean_r3.length} chars, roux_r3=${roux_r3.length} chars`);
 results.push({ file: path.basename(fp), skipped: true, reason: 'missing Nucleus' });
 continue;
 }

 console.log(` boolean_r3: ${extracted.boolean_r3_chars} chars`);
 console.log(` roux_r3:    ${extracted.roux_r3_chars} chars`);
 console.log(` nucleus:    ${extracted.nucleus_chars} chars`);

 if (hasKey) {
 try {
 const disp = await computeDisplacement(nucleus, boolean_r3, roux_r3, apiKey);
 console.log(` d_A=${disp.d_A}  d_B=${disp.d_B}  novelty_lift=${disp.novelty_lift}  balance=${disp.balance}`);
 results.push({ file: path.basename(fp), ...disp, ...extracted });
 } catch (err) {
 console.log(` ERROR computing displacement: ${err.message}`);
 results.push({ file: path.basename(fp), skipped: true, reason: err.message });
 }
 } else {
 // Show first 300 chars of each for manual verification
 console.log(`\n  boolean_r3 preview:\n    ${boolean_r3.slice(0, 300).replace(/\n/g, '\n    ')}`);
 console.log(`\n  nucleus preview:\n    ${nucleus.slice(0, 300).replace(/\n/g, '\n    ')}`);
 results.push({ file: path.basename(fp), skipped: 'no-key', ...extracted });
 }
 }

 // --- Summary table ----------------------------------------------------------
 printBanner('RESULTS SUMMARY');

 const scored = results.filter(r => typeof r.novelty_lift === 'number');

 if (!hasKey) {
 console.log('Displacement: BLOCKED (no key). Parser verification above.\n');
 console.log('Transcripts parsed successfully:');
 results.forEach(r => {
 const status = (r.boolean_r3_chars > 0 && r.roux_r3_chars > 0 && r.nucleus_chars > 0)
 ? 'OK' : 'MISSING SECTIONS';
 console.log(` ${r.file.slice(0, 55).padEnd(56)} ${status}`);
 });
 } else if (!scored.length) {
 console.log('No transcripts scored successfully.');
 } else {
 // Print results table
 const cols = ['File', 'd_A', 'd_B', 'novelty_lift', 'balance'];
 const rows = scored.map(r => [
 r.file.slice(0, 45),
 String(r.d_A),
 String(r.d_B),
 String(r.novelty_lift),
 String(r.balance)
 ]);
 const widths = cols.map((c, i) => Math.max(c.length, ...rows.map(r => r[i].length)));
 const header = cols.map((c, i) => c.padEnd(widths[i])).join(' | ');
 const sep = widths.map(w => '-'.repeat(w)).join('-+-');
 console.log(header);
 console.log(sep);
 rows.forEach(row => console.log(row.map((c, i) => c.padEnd(widths[i])).join(' | ')));

 // Distribution
 const lifts = scored.map(r => r.novelty_lift);
 const med = median(lifts);
 const mean = lifts.reduce((s, v) => s + v, 0) / lifts.length;
 const min = Math.min(...lifts);
 const max = Math.max(...lifts);
 console.log(`\nnovelty_lift distribution (N=${lifts.length}):`);
 console.log(` min=${min}  max=${max}  mean=${Math.round(mean * 1000) / 1000}  median=${med}`);

 // --- Gate ------------------------------------------------------------------
 printBanner('GATE VERDICT');

 const THRESHOLD_PASS = 0.3;
 const THRESHOLD_FAIL = 0.1;

 let gateText;
 if (med >= THRESHOLD_PASS) {
 gateText = `PASS — median novelty_lift ${med} >= ${THRESHOLD_PASS}.\n` +
 'The Loom synthesizes genuinely on these transcripts (N=' + lifts.length + ').\n' +
 'Proceed to Phase 4 (control matrix).';
 console.log(gateText);
 } else if (med < THRESHOLD_FAIL) {
 gateText = `STOP — median novelty_lift ${med} < ${THRESHOLD_FAIL}.\n` +
 'The Loom is echoing, not synthesizing.\n' +
 'Writing playground/LOOM_FINDING.md with diagnosis and fix proposal.';
 console.log(gateText);
 writeLoomFinding(scored);
 } else {
 gateText = `AMBIGUOUS — median novelty_lift ${med} is between ${THRESHOLD_FAIL} and ${THRESHOLD_PASS}.\n` +
 'Review per-transcript breakdown above before proceeding to Phase 4.';
 console.log(gateText);
 }

 // Write report file
 const reportPath = path.join(OUTPUT_DIR, 'NOVELTY_REPORT.md');
 const reportContent = buildReport(scored, lifts, med, mean, min, max, gateText);
 fs.writeFileSync(reportPath, reportContent, 'utf-8');
 console.log(`\nReport written: ${shortPath(reportPath)}`);
 }
}

function writeLoomFinding(scored) {
 const content = [
 '# LOOM_FINDING.md',
 '',
 '## Finding',
 '',
 `Median novelty_lift across ${scored.length} transcript(s) is below 0.1.`,
 'The Loom is paraphrasing the final positions rather than synthesizing them.',
 '',
 '## Root cause',
 '',
 'The current Loom prompt asks the model to "weave their final positions into a single',
 'joint Bean" and produce a "synthesized insight." This language invites paraphrase.',
 'A model optimizing for coherence will blend the two positions into a smooth summary',
 'that is statistically close to both — which is precisely the echo signature.',
 '',
 '## Proposed fix (before/after)',
 '',
 '### Before (current prompt fragment)',
 '',
 '```',
 'Weave their final positions into a single joint Bean.',
 '```',
 '',
 '### After (Door Number 3 lift function)',
 '',
 '```',
 'Do NOT summarize the two positions. Instead:',
 '1. Find the hidden assumption that each Spirit makes about the topic.',
 '2. Identify the constraint that, if dissolved, would allow both positions to coexist.',
 '3. Construct a claim that neither Spirit stated, which makes both positions LESS necessary',
 '   once it is accepted — this is Door Number 3.',
 'Your thesis must name what changed, not who said what.',
 '```',
 '',
 '## Predicted effect',
 '',
 'This reframing shifts the output from "blend of A and B" to "claim that supersedes',
 'A and B." Displacement (d_A and d_B) should both rise above 0.3 after the fix.',
 'Groundedness will still constrain the claim to draw from real positions.',
 ''
 ].join('\n');

 const findingPath = path.join(__dirname, 'LOOM_FINDING.md');
 fs.writeFileSync(findingPath, content, 'utf-8');
 console.log(`LOOM_FINDING.md written: ${shortPath(findingPath)}`);
}

function buildReport(scored, lifts, med, mean, min, max, verdict) {
 const rows = scored.map(r =>
 `| ${r.file.slice(0, 50)} | ${r.d_A} | ${r.d_B} | ${r.novelty_lift} | ${r.balance} |`
 ).join('\n');

 return [
 '# Novelty Report — Phase 3',
 '',
 `Generated: ${new Date().toISOString()}`,
 '',
 '## Per-transcript results',
 '',
 '| File | d_A | d_B | novelty_lift | balance |',
 '|------|-----|-----|-------------|---------|',
 rows,
 '',
 '## Distribution',
 '',
 `| Metric | Value |`,
 `|--------|-------|`,
 `| N | ${lifts.length} |`,
 `| min | ${min} |`,
 `| max | ${max} |`,
 `| mean | ${Math.round(mean * 1000) / 1000} |`,
 `| median | ${med} |`,
 '',
 '## Gate verdict',
 '',
 verdict,
 ''
 ].join('\n');
}

main().catch(err => {
 console.error('novelty-report crashed:', err);
 process.exit(1);
});
