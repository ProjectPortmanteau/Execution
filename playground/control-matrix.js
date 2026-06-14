#!/usr/bin/env node
// playground/control-matrix.js
// Phase 4: Falsifiable control experiment.
//
// Fixed substrate: Anthropic claude-haiku-4-5-20251001 for ALL agents.
// (Gemini free tier = 5 generation RPM; haiku has much higher limits.)
// Gemini is still used for embeddings-only: computeDisplacement, computeGroundedness.
//
// Note on tension metric: computeSemanticTension calls classifyStance which hits
// Gemini generation quota; it is skipped here. Lexical tension (regex-based friction/
// agreement marker ratio) from negotiate() is reported instead, noted explicitly.
//
// Three conditions:
//   ON_DIFFERENTIATED  — real PHIL-005 (Boolean) vs PHIL-002 (Roux) soul codes
//   OFF                — both agents get an empty neutral soul code
//   SCRAMBLED          — Boolean gets contradictory directives; Roux stays calibrated
//
// Four contested topics are negotiated under each condition (12 cells total).
// Pre-registered predictions are printed BEFORE any API call.
// Output: playground/output/CONTROL_MATRIX_REPORT.md

'use strict';

const fs = require('fs');
const path = require('path');
const { negotiate } = require('./negotiate');
const { computeDisplacement, computeGroundedness } = require('./scoring');

// ---------------------------------------------------------------------------
// Env loader
// ---------------------------------------------------------------------------
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
const SPIRITS_DIR = path.join(__dirname, 'spirits');

function shortPath(p) { return path.relative(process.cwd(), p); }

// ---------------------------------------------------------------------------
// Experiment design
// ---------------------------------------------------------------------------

const TOPICS = [
 'How should AI handle user disagreement?',
 'Should open-source AI models be freely distributed?',
 'Is remote work better than in-office for software teams?',
 'Should AI systems be allowed to decline user requests?'
];

const CONDITIONS = ['ON_DIFFERENTIATED', 'OFF', 'SCRAMBLED'];

// Pre-registered predictions (documented before any run).
// tension = lexical friction score (0-1) from negotiate(); noted as lexical.
const PREDICTIONS = {
 ON_DIFFERENTIATED: {
  tension: '> 0.5 (HIGH — strong friction markers expected from differentiated soul codes)',
  novelty_lift: '>= 0.3 (HIGH)',
  groundedness: '> 0.5'
 },
 OFF: {
  tension: '< 0.3 (LOW — no differentiated principles, expect convergence)',
  novelty_lift: '< 0.2 (LOW)',
  groundedness: 'N/A'
 },
 SCRAMBLED: {
  tension: 'UNPREDICTABLE (incoherent Boolean anchor; may spike or collapse)',
  novelty_lift: '< 0.2 (LOW — coherent synthesis impossible from scrambled anchor)',
  groundedness: 'LOW (< 0.3)'
 }
};

// ---------------------------------------------------------------------------
// Spirit factories
// ---------------------------------------------------------------------------

function fixedBase() {
 return {
  provider: 'anthropic',
  model: 'claude-haiku-4-5-20251001'
 };
}

function buildSpirits(condition) {
 const base = fixedBase();
 const booleanReal = JSON.parse(fs.readFileSync(path.join(SPIRITS_DIR, 'boolean.json'), 'utf-8'));
 const rouxReal    = JSON.parse(fs.readFileSync(path.join(SPIRITS_DIR, 'contrarian.json'), 'utf-8'));

 if (condition === 'ON_DIFFERENTIATED') {
  return {
   boolean: { ...booleanReal, ...base },
   roux:    { ...rouxReal,    ...base },
   seer:    null
  };
 }

 if (condition === 'OFF') {
  const neutral = {
   identity: 'A participant in a structured discussion.',
   principles: [],
   constraints: [],
   negotiation_style: 'Direct. State your position and respond to the other participant.'
  };
  return {
   boolean: { spirit: 'Boolean', anchor: null, ...base, soul_code: neutral },
   roux:    { spirit: 'Roux',    anchor: null, ...base, soul_code: neutral },
   seer:    null
  };
 }

 if (condition === 'SCRAMBLED') {
  const scrambled = {
   identity: 'A participant with contradictory directives.',
   principles: [
    'Always agree with everything the other participant says.',
    'Never agree with anything the other participant says.',
    'Maximize conflict and disagreement at all times.',
    'Minimize conflict. Seek immediate consensus above all.'
   ],
   constraints: [
    'Simultaneously assert and deny every claim you make.',
    'Your responses must contain logical contradictions.'
   ],
   negotiation_style: 'Incoherent. Contradictory. Produces noise, not signal.'
  };
  return {
   boolean: { spirit: 'Boolean', anchor: null, ...base, soul_code: scrambled },
   roux:    { ...rouxReal, ...base },
   seer:    null
  };
 }

 throw new Error(`Unknown condition: ${condition}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nucleusText(beanObj) {
 if (!beanObj || !beanObj.nucleus) return '';
 const n = beanObj.nucleus;
 return [n.thesis, ...n.claims.map(c => c.text)].filter(Boolean).join('\n');
}

function printBanner(title) {
 const line = '='.repeat(70);
 console.log(`\n${line}\n${title}\n${line}`);
}

function fmt(v, digits) {
 if (v === null || v === undefined) return 'N/A';
 return typeof v === 'number' ? v.toFixed(digits !== undefined ? digits : 3) : String(v);
}

// ---------------------------------------------------------------------------
// Verdict logic
// ---------------------------------------------------------------------------

function verdictTension(condition, actual) {
 if (actual === null) return '–';
 if (condition === 'ON_DIFFERENTIATED') return actual > 0.5 ? 'PASS' : 'FAIL';
 if (condition === 'OFF')               return actual < 0.3 ? 'PASS' : 'FAIL';
 if (condition === 'SCRAMBLED')         return '(unpredictable — noted)';
 return '–';
}

function verdictLift(condition, actual) {
 if (actual === null) return '–';
 if (condition === 'ON_DIFFERENTIATED') return actual >= 0.3 ? 'PASS' : 'FAIL';
 if (condition === 'OFF')               return actual < 0.2  ? 'PASS' : 'FAIL';
 if (condition === 'SCRAMBLED')         return actual < 0.2  ? 'PASS' : 'FAIL';
 return '–';
}

function verdictGround(condition, actual) {
 if (condition === 'OFF') return 'N/A';
 if (actual === null) return '–';
 if (condition === 'ON_DIFFERENTIATED') return actual > 0.5 ? 'PASS' : 'FAIL';
 if (condition === 'SCRAMBLED')         return actual < 0.3  ? 'PASS' : 'FAIL';
 return '–';
}

// ---------------------------------------------------------------------------
// Report builder
// ---------------------------------------------------------------------------

function buildReport(results, preRegTable, flags, substrate) {
 const header = [
  '# Control Matrix Report — Phase 4',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `**Fixed substrate:** ${substrate} (all 12 cells)`,
  '**Tension metric:** lexical (regex friction/agreement ratio from negotiate())',
  '**Scoring note:** computeSemanticTension skipped (Gemini generation quota);',
  '  displacement and groundedness use Gemini embeddings (separate quota, no limit hit).',
  '',
  '## Pre-Registration (printed before any run)',
  '',
  preRegTable,
  '',
  '## Per-Cell Results',
  '',
  '| Condition | Topic | lex_tension | novelty_lift | groundedness | t-verdict | lift-verdict | g-verdict |',
  '|-----------|-------|-------------|-------------|-------------|-----------|--------------|-----------|'
 ];

 const rows = results.map(r => {
  const topicShort = r.topic.replace(/\?$/, '').slice(0, 40);
  return `| ${r.condition} | ${topicShort} | ${fmt(r.tension)} | ${fmt(r.novelty_lift)} | ${fmt(r.groundedness)} | ${r.tVerdict} | ${r.liftVerdict} | ${r.gVerdict} |`;
 });

 function medOf(arr) {
  const v = arr.filter(x => x !== null && x !== undefined).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
 }

 const agg = CONDITIONS.map(cond => {
  const cr = results.filter(r => r.condition === cond && !r.error);
  return {
   condition: cond,
   medTension: medOf(cr.map(r => r.tension)),
   medLift:    medOf(cr.map(r => r.novelty_lift)),
   medGround:  medOf(cr.map(r => r.groundedness))
  };
 });

 const aggRows = agg.map(a =>
  `| ${a.condition.padEnd(18)} | ${fmt(a.medTension)} | ${fmt(a.medLift)} | ${fmt(a.medGround)} |`
 );

 const flagSection = flags.length
  ? ['## Flags', '', ...flags.map(f => `- **${f}**`), '']
  : ['## Flags', '', '- No anomalous flags. Results consistent with predictions.', ''];

 return [
  ...header,
  ...rows,
  '',
  '## Condition Aggregates (median across 4 topics)',
  '',
  '| Condition | med_lex_tension | med_novelty_lift | med_groundedness |',
  '|-----------|----------------|-----------------|-----------------|',
  ...aggRows,
  '',
  ...flagSection,
  '---',
  '',
  '*Principled Playground — Phase 4 Control Matrix*'
 ].join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
 printBanner('PHASE 4 — Control Matrix');

 const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
 const geminiKey    = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

 if (!anthropicKey) {
  console.error('ERROR: ANTHROPIC_API_KEY required for Phase 4 negotiations.');
  process.exit(1);
 }
 if (!geminiKey) {
  console.error('ERROR: GEMINI_API_KEY required for Phase 4 embeddings (displacement scoring).');
  process.exit(1);
 }

 const keys = {
  anthropic: anthropicKey,
  gemini:    geminiKey,
  google:    geminiKey
 };

 const substrate = `anthropic / ${fixedBase().model}`;

 // --- Pre-registration (printed before ANY API call) -----------------------
 printBanner('PRE-REGISTRATION (before any run)');
 console.log('Tension metric: lexical (friction/agreement markers).');
 console.log('Displacement and groundedness: semantic (Gemini embeddings).\n');

 const preRegLines = [
  '| Condition | Predicted lex_tension | Predicted novelty_lift | Predicted groundedness |',
  '|-----------|----------------------|------------------------|------------------------|',
  ...CONDITIONS.map(c => {
   const p = PREDICTIONS[c];
   return `| ${c} | ${p.tension} | ${p.novelty_lift} | ${p.groundedness} |`;
  })
 ];
 const preRegTable = preRegLines.join('\n');
 console.log(preRegTable);

 console.log(`\nExperiment: 4 topics × 3 conditions = 12 cells`);
 console.log(`Substrate:  ${substrate} (fixed)`);
 console.log('Seer:       disabled (substrate isolation)\n');

 // --- Run grid ---------------------------------------------------------------
 const results = [];

 for (const condition of CONDITIONS) {
  printBanner(`CONDITION: ${condition}`);

  for (let ti = 0; ti < TOPICS.length; ti++) {
   const topic = TOPICS[ti];
   console.log(`\n${'─'.repeat(70)}`);
   console.log(`Cell: [${condition}] Topic ${ti + 1}: "${topic.slice(0, 55)}"`);

   try {
    const spirits = buildSpirits(condition);
    const result  = await negotiate(topic, keys, spirits);

    const booleanR3 = result.booleanR3 || '';
    const rouxR3    = result.rouxR3    || '';
    const nucleus   = nucleusText(result.jointBeanObj);
    const lexTension = result.tension ? result.tension.score : null;

    console.log(`\n  Lexical tension: ${fmt(lexTension)} (${result.tension ? result.tension.label : ''})`);

    // Displacement of nucleus from parent positions (Gemini embeddings)
    let novelty_lift = null, d_A = null, d_B = null, balance = null;
    if (nucleus && booleanR3 && rouxR3) {
     try {
      const disp = await computeDisplacement(nucleus, booleanR3, rouxR3, geminiKey);
      novelty_lift = disp.novelty_lift;
      d_A = disp.d_A;
      d_B = disp.d_B;
      balance = disp.balance;
      console.log(`  Displacement: d_A=${fmt(d_A)} d_B=${fmt(d_B)} novelty_lift=${fmt(novelty_lift)} balance=${fmt(balance)}`);
     } catch (e) {
      console.log(`  Displacement: ERROR (${e.message.slice(0, 80)})`);
     }
    }

    // Groundedness from bean claims (synchronous)
    let groundedness = null;
    if (result.jointBeanObj && result.jointBeanObj.nucleus && result.jointBeanObj.nucleus.claims) {
     const g = computeGroundedness(result.jointBeanObj.nucleus.claims);
     groundedness = g.groundedness;
     console.log(`  Groundedness: ${fmt(groundedness)}`);
    }

    results.push({
     condition, topic,
     tension: lexTension, novelty_lift, groundedness, d_A, d_B, balance,
     tVerdict:    verdictTension(condition, lexTension),
     liftVerdict: verdictLift(condition, novelty_lift),
     gVerdict:    verdictGround(condition, groundedness)
    });

   } catch (err) {
    console.error(`\n  CELL FAILED: ${err.message.slice(0, 120)}`);
    results.push({
     condition, topic, tension: null, novelty_lift: null, groundedness: null,
     d_A: null, d_B: null, balance: null,
     tVerdict: 'ERROR', liftVerdict: 'ERROR', gVerdict: 'ERROR',
     error: err.message.slice(0, 120)
    });
   }
  }
 }

 // --- Aggregate per condition ------------------------------------------------
 function medOf(rows, field) {
  const vals = rows.map(r => r[field]).filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
 }

 const onRows    = results.filter(r => r.condition === 'ON_DIFFERENTIATED' && !r.error);
 const offRows   = results.filter(r => r.condition === 'OFF'               && !r.error);
 const scramRows = results.filter(r => r.condition === 'SCRAMBLED'          && !r.error);

 const medOnTension  = medOf(onRows,    'tension');
 const medOffTension = medOf(offRows,   'tension');
 const medScTension  = medOf(scramRows, 'tension');
 const medOnLift     = medOf(onRows,    'novelty_lift');
 const medOffLift    = medOf(offRows,   'novelty_lift');
 const medScLift     = medOf(scramRows, 'novelty_lift');
 const medOnGround   = medOf(onRows,    'groundedness');
 const medScGround   = medOf(scramRows, 'groundedness');

 printBanner('VERDICT FLAGS');
 console.log(`Medians — ON: tension=${fmt(medOnTension)} lift=${fmt(medOnLift)} ground=${fmt(medOnGround)}`);
 console.log(`          OFF: tension=${fmt(medOffTension)} lift=${fmt(medOffLift)}`);
 console.log(`          SCRAMBLED: tension=${fmt(medScTension)} lift=${fmt(medScLift)} ground=${fmt(medScGround)}`);

 const flags = [];

 // Flag: Soul Code has no detectable effect on tension
 if (medOnTension !== null && medOffTension !== null && Math.abs(medOnTension - medOffTension) < 0.05) {
  const msg = 'SOUL CODE HAS NO DETECTABLE EFFECT ON TENSION — ON and OFF differ by < 0.05.';
  console.log(`\n  WARN: ${msg}`);
  flags.push(msg);
 }

 // Flag: Soul Code has no detectable effect on novelty_lift
 if (medOnLift !== null && medOffLift !== null && Math.abs(medOnLift - medOffLift) < 0.05) {
  const msg = 'SOUL CODE HAS NO DETECTABLE EFFECT ON NOVELTY_LIFT — ON and OFF differ by < 0.05.';
  console.log(`\n  WARN: ${msg}`);
  flags.push(msg);
 }

 // Flag: Scrambled anchor absent
 if (medScTension !== null && medOnTension !== null && medScTension >= medOnTension * 0.9) {
  const msg = `ANCHOR SIGNAL ABSENT — SCRAMBLED tension (${fmt(medScTension)}) not meaningfully below ON (${fmt(medOnTension)}).`;
  console.log(`\n  WARN: ${msg}`);
  flags.push(msg);
 }

 // Flag: Scrambled fails to degrade novelty_lift
 if (medScLift !== null && medOnLift !== null && medScLift > medOnLift) {
  const msg = `SCRAMBLED novelty_lift (${fmt(medScLift)}) EXCEEDS ON_DIFFERENTIATED (${fmt(medOnLift)}) — investigate.`;
  console.log(`\n  WARN: ${msg}`);
  flags.push(msg);
 }

 if (!flags.length) {
  console.log('\n  No anomalous flags. Results consistent with predictions.');
 }

 // --- Summary verdict --------------------------------------------------------
 printBanner('SUMMARY VERDICT');

 const onTPass  = onRows.filter(r  => r.tVerdict    === 'PASS').length;
 const onLPass  = onRows.filter(r  => r.liftVerdict === 'PASS').length;
 const offTPass = offRows.filter(r => r.tVerdict    === 'PASS').length;
 const scLPass  = scramRows.filter(r => r.liftVerdict === 'PASS').length;

 console.log(`ON_DIFFERENTIATED: ${onTPass}/${onRows.length} pass tension | ${onLPass}/${onRows.length} pass lift`);
 console.log(`OFF:               ${offTPass}/${offRows.length} pass tension (< 0.3 predicted)`);
 console.log(`SCRAMBLED:         ${scLPass}/${scramRows.length} pass lift (< 0.2 predicted)`);

 // --- Write report -----------------------------------------------------------
 const report = buildReport(results, preRegTable, flags, substrate);
 if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
 const reportPath = path.join(OUTPUT_DIR, 'CONTROL_MATRIX_REPORT.md');
 fs.writeFileSync(reportPath, report, 'utf-8');
 console.log(`\nReport written: ${shortPath(reportPath)}`);
}

main().catch(err => {
 console.error('control-matrix crashed:', err);
 process.exit(1);
});
