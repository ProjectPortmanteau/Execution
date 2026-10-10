'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { enforce, validate } = require('../ledger');
const { loadOrFreeze, isHeldOut } = require('../heldout');

const base = {
 bean_id: 'T-1',
 ratification: 'C',
 authorship: 'robert',
 scope: 'project',
 use: 'train',
 training_set: 'voice',
 source: 'prose',
};

test('robert-authored project text trains', () => {
 assert.deepEqual(enforce(base), { use: 'train', training_set: 'voice', changes: [] });
});

test('scope gates come first', () => {
 assert.equal(enforce({ ...base, scope: 'personal' }).use, 'exclude');
 assert.equal(enforce({ ...base, scope: 'unclear' }).use, 'hold');
 assert.equal(enforce({ ...base, scope: undefined }).use, 'hold');
 // Personal stays excluded even when it would otherwise be eval.
 assert.equal(enforce({ ...base, scope: 'personal', use: 'eval' }).use, 'exclude');
});

test('AI text never trains, ratified or not', () => {
 const r = enforce({ ...base, authorship: 'ai', ratification: 'C' });
 assert.equal(r.use, 'runtime');
 assert.equal(r.training_set, null);
 assert.match(r.changes[0], /cannot train/);
});

test('mixed holds, third party excludes', () => {
 assert.equal(enforce({ ...base, authorship: 'mixed' }).use, 'hold');
 assert.equal(enforce({ ...base, authorship: 'third_party', use: 'runtime' }).use, 'exclude');
});

test('eval stays eval and never trains', () => {
 assert.deepEqual(enforce({ ...base, use: 'eval', training_set: 'voice' }), { use: 'eval', training_set: null, changes: [] });
});

test('train needs a training set', () => {
 assert.equal(enforce({ ...base, training_set: null }).use, 'hold');
});

test('malformed records hold', () => {
 assert.equal(enforce({ ...base, use: 'trian' }).use, 'hold');
 assert.deepEqual(validate({ ...base, authorship: 'claude' }), ['invalid authorship: "claude"']);
});

test('held-out slice is deterministic and frozen', () => {
 const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-'));
 const file = path.join(dir, 'manifest.json');
 const first = loadOrFreeze(file, 0.2);
 assert.equal(first.created, true);
 const second = loadOrFreeze(file);
 assert.equal(second.created, false);
 const ids = Array.from({ length: 500 }, (_, i) => `B-${i}`);
 const a = ids.filter((id) => isHeldOut(first.manifest, id));
 const b = ids.filter((id) => isHeldOut(second.manifest, id));
 assert.deepEqual(a, b);
 assert.ok(a.length > 60 && a.length < 140, `expected about 100 of 500, got ${a.length}`);
 assert.throws(() => loadOrFreeze(file, 0.1), /frozen at 0.2/);
});

test('export script writes sets, graph, and report from the fixture', () => {
 const out = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-'));
 const script = path.join(__dirname, '..', '..', 'scripts', 'boolean-ledger.js');
 execFileSync(process.execPath, [script, path.join(__dirname, '..', 'fixtures', 'beans.jsonl'), out]);
 const report = JSON.parse(fs.readFileSync(path.join(out, 'report.json'), 'utf8'));
 assert.deepEqual(report.counts, { train: 4, runtime: 5, exclude: 1, eval: 1, hold: 2 });

 const graphIds = fs.readFileSync(path.join(out, 'runtime-graph.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l).bean_id);
 for (const id of ['FIX-006', 'FIX-010', 'FIX-012', 'FIX-013']) assert.ok(!graphIds.includes(id), `${id} leaked into the graph`);
 assert.ok(graphIds.includes('FIX-007'), 'AI text should be runtime, in the graph');

 const trained = ['voice', 'decision', 'correction'].flatMap((set) => ['train', 'heldout'].flatMap((side) => {
  const text = fs.readFileSync(path.join(out, side, `${set}.jsonl`), 'utf8').trim();
  return text ? text.split('\n').map((l) => JSON.parse(l).bean_id) : [];
 }));
 assert.deepEqual(trained.sort(), ['FIX-001', 'FIX-002', 'FIX-009', 'FIX-011']);
});
