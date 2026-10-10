#!/usr/bin/env node
// scripts/boolean-ledger.js
//
// Phase 1 of the Boolean build: takes tagged Bean records (JSONL, one per
// line, as BEAN_CONVERTER emits them with the Ledger fields), applies the
// Ledger rules, and writes the training sets, the runtime graph, and a
// report of every record whose requested use was overridden.
//
// Usage:
// node scripts/boolean-ledger.js <beans.jsonl> <out-dir> [--heldout 0.1] [--check]
//
// --check   report only, write nothing; exits 1 if any record was overridden
// --heldout fraction for the frozen held-out slice (first run only)
//
// Output (in out-dir):
// train/{voice,decision,correction}.jsonl   training examples
// heldout/{voice,decision,correction}.jsonl frozen slice for the disguise test
// runtime-graph.jsonl                       what Boolean may retrieve at runtime
// eval.jsonl                                sealed eval material (Maker's Mark, Drift Probe)
// report.json                               counts and every override with its reason
// heldout-manifest.json                     salt and fraction, written once

'use strict';

const fs = require('fs');
const path = require('path');
const { enforce, GRAPH_USES } = require('../boolean/ledger');
const { loadOrFreeze, isHeldOut } = require('../boolean/heldout');

const SETS = ['voice', 'decision', 'correction'];

const parseArgs = (argv) => {
 const args = { positional: [], check: false, heldout: undefined };
 for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--check') args.check = true;
  else if (argv[i] === '--heldout') args.heldout = Number(argv[++i]);
  else args.positional.push(argv[i]);
 }
 return args;
};

const readJsonl = (file) => fs.readFileSync(file, 'utf8')
 .split('\n')
 .map((line, i) => ({ line: line.trim(), n: i + 1 }))
 .filter(({ line }) => line)
 .map(({ line, n }) => {
  try {
   return JSON.parse(line);
  } catch (err) {
   throw new Error(`line ${n}: ${err.message}`);
  }
 });

// Training examples carry only what the trainer needs. A correction's
// rejected side is regenerated later by an open teacher model, never taken
// from a closed model's transcript, so it starts empty.
const toExample = (bean, set) => {
 const base = { bean_id: bean.bean_id, source_ref: bean.source_ref || null };
 if (set === 'voice') return { ...base, text: bean.text };
 if (set === 'decision') return { ...base, prompt: bean.prompt || null, response: bean.text };
 return { ...base, prompt: bean.prompt || null, chosen: bean.text, rejected: null };
};

const classifyAll = (beans) => beans.map((bean) => ({ bean, ...enforce(bean) }));

const main = () => {
 const args = parseArgs(process.argv.slice(2));
 const [input, outDir] = args.positional;
 if (!input || (!outDir && !args.check)) {
  console.error('Usage: node scripts/boolean-ledger.js <beans.jsonl> <out-dir> [--heldout 0.1] [--check]');
  process.exit(1);
 }

 const decided = classifyAll(readJsonl(input));
 const overrides = decided
  .filter((d) => d.changes.length > 0)
  .map((d) => ({ bean_id: d.bean.bean_id || null, requested: d.bean.use, use: d.use, reasons: d.changes }));
 const counts = {};
 for (const d of decided) counts[d.use] = (counts[d.use] || 0) + 1;

 // Decision and correction examples are pairs; a missing prompt is reported, not guessed.
 const missingPrompt = decided
  .filter((d) => d.use === 'train' && d.training_set !== 'voice' && !d.bean.prompt)
  .map((d) => d.bean.bean_id);

 if (args.check) {
  console.log(JSON.stringify({ counts, overrides, missing_prompt: missingPrompt }, null, 2));
  process.exit(overrides.length > 0 ? 1 : 0);
 }

 fs.mkdirSync(path.join(outDir, 'train'), { recursive: true });
 fs.mkdirSync(path.join(outDir, 'heldout'), { recursive: true });
 const { manifest, created } = loadOrFreeze(path.join(outDir, 'heldout-manifest.json'), args.heldout);

 const buckets = { train: {}, heldout: {} };
 for (const set of SETS) {
  buckets.train[set] = [];
  buckets.heldout[set] = [];
 }
 const graph = [];
 const evalItems = [];

 for (const d of decided) {
  const bean = { ...d.bean, use: d.use, training_set: d.training_set };
  let heldOut = false;
  if (d.use === 'train') {
   heldOut = isHeldOut(manifest, bean.bean_id);
   buckets[heldOut ? 'heldout' : 'train'][d.training_set].push(toExample(bean, d.training_set));
  }
  if (d.use === 'eval') evalItems.push(bean);
  // A held-out decision or correction is the answer the disguise test compares
  // against, so Boolean must not be able to retrieve it. Held-out voice text
  // (the book itself) stays readable.
  const hiddenAnswer = heldOut && d.training_set !== 'voice';
  // The graph never receives anything outside the project, however it was tagged.
  if (GRAPH_USES.has(d.use) && bean.scope === 'project' && !hiddenAnswer) graph.push(bean);
 }

 const writeJsonl = (file, rows) => fs.writeFileSync(
  path.join(outDir, file),
  rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '')
 );
 for (const set of SETS) {
  writeJsonl(path.join('train', `${set}.jsonl`), buckets.train[set]);
  writeJsonl(path.join('heldout', `${set}.jsonl`), buckets.heldout[set]);
 }
 writeJsonl('runtime-graph.jsonl', graph);
 writeJsonl('eval.jsonl', evalItems);

 const report = {
  input: path.resolve(input),
  generated_at: new Date().toISOString(),
  heldout: { fraction: manifest.fraction, frozen_at: manifest.frozen_at, frozen_this_run: created },
  counts,
  sets: Object.fromEntries(SETS.map((s) => [s, { train: buckets.train[s].length, heldout: buckets.heldout[s].length }])),
  runtime_graph: graph.length,
  missing_prompt: missingPrompt,
  overrides,
 };
 fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');

 console.log(`Records: ${decided.length}  ${JSON.stringify(counts)}`);
 for (const set of SETS) console.log(`  ${set}: ${buckets.train[set].length} train, ${buckets.heldout[set].length} held out`);
 console.log(`Runtime graph: ${graph.length} Beans`);
 console.log(`Overrides: ${overrides.length} (see report.json)`);
 if (missingPrompt.length) console.log(`Missing prompt on ${missingPrompt.length} decision/correction examples`);
 if (created) console.log(`Froze held-out slice at ${manifest.fraction}`);
};

if (require.main === module) {
 try {
  main();
 } catch (err) {
  console.error(err.message);
  process.exit(1);
 }
}

module.exports = { classifyAll, toExample };
