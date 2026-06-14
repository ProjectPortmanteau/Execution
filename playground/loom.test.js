#!/usr/bin/env node
// playground/loom.test.js
// Dependency-free unit checks for the structured Loom (Phase 0.5).
// Verifies: JSON extraction (incl. code fences + chatter), normalization /
// id-clamping, groundedness math, the anti-rubber-stamp red-flag (1.0), and
// the degraded free-text fallback. Run: node playground/loom.test.js

'use strict';

const assert = require('assert');
const loom = require('./loom');

let passed = 0;
function ok(name, fn) { fn(); passed++; console.log(`  ✓ ${name}`); }

console.log('loom.js unit checks\n');

// --- parseLoomJSON tolerance ----------------------------------------------
ok('parses bare JSON', () => {
  const o = loom.parseLoomJSON('{"thesis":"t","claims":[]}');
  assert.strictEqual(o.thesis, 't');
});
ok('parses fenced ```json blocks', () => {
  const o = loom.parseLoomJSON('here you go:\n```json\n{"thesis":"t","claims":[{"text":"x","derives_from":[],"rel":"SYNTHESIZES"}]}\n```');
  assert.strictEqual(o.claims.length, 1);
});
ok('parses JSON embedded in chatter', () => {
  const o = loom.parseLoomJSON('Sure! {"thesis":"t","claims":[]} hope that helps');
  assert.ok(o && Array.isArray(o.claims));
});
ok('returns null on unparseable / missing claims', () => {
  assert.strictEqual(loom.parseLoomJSON('not json at all'), null);
  assert.strictEqual(loom.parseLoomJSON('{"thesis":"t"}'), null); // no claims array
});

// --- normalizeLoom clamps ids and rels ------------------------------------
ok('clamps unknown derives_from ids and records them', () => {
  const norm = loom.normalizeLoom({
    thesis: 'T',
    claims: [
      { text: 'a', derives_from: ['boolean_r3', 'bogus_id'], rel: 'SYNTHESIZES' },
      { text: 'b', derives_from: ['roux_r3'], rel: 'WAT' } // invalid rel -> default
    ]
  });
  assert.deepStrictEqual(norm.claims[0].derives_from, ['boolean_r3']);
  assert.ok(norm.droppedIds.includes('bogus_id'));
  assert.strictEqual(norm.claims[1].rel, 'SYNTHESIZES');
});
ok('drops malformed claims (no text)', () => {
  const norm = loom.normalizeLoom({ thesis: 'T', claims: [{ derives_from: ['boolean_r3'] }, { text: 'ok', derives_from: [] }] });
  assert.strictEqual(norm.claims.length, 1);
});

// --- groundedness math + anti-rubber-stamp --------------------------------
ok('groundedness counts only claims with a valid source edge', () => {
  const g = loom.computeGroundedness([
    { derives_from: ['boolean_r3'] },
    { derives_from: [] },
    { derives_from: ['roux_r3', 'boolean_r3'] },
    { derives_from: ['bogus'] } // invalid -> not grounded
  ]);
  assert.strictEqual(g.total, 4);
  assert.strictEqual(g.grounded, 2);
  assert.strictEqual(g.groundedness, 0.5);
  assert.deepStrictEqual(g.ungroundedIdx, [1, 3]);
});
ok('reflexive 1.0 is achievable and detectable (the failure mode)', () => {
  const g = loom.computeGroundedness([
    { derives_from: ['boolean_r3'] },
    { derives_from: ['roux_r3'] }
  ]);
  assert.strictEqual(g.groundedness, 1); // a Loom that cites everything hits 1.0
});
ok('empty claim set => groundedness 0, not 1', () => {
  const g = loom.computeGroundedness([]);
  assert.strictEqual(g.groundedness, 0);
});

// --- buildJointBean wiring -------------------------------------------------
ok('buildJointBean emits DERIVES_FROM corona edges + substrate echo', () => {
  const norm = loom.normalizeLoom({
    thesis: 'T',
    claims: [
      { text: 'a', derives_from: ['boolean_r3', 'roux_r3'], rel: 'SYNTHESIZES' },
      { text: 'b', derives_from: [], rel: 'SYNTHESIZES' }
    ],
    connections: [{ rel: 'TRANSFORMS', target: 'mediation' }]
  });
  const bean = loom.buildJointBean({
    norm, topic: 'X', substrate: 'claude-sonnet-4-20250514',
    brainMode: 'DUAL-BRAIN', timestamp: '2026-06-14T00:00:00Z'
  });
  assert.strictEqual(bean.echo.substrate, 'claude-sonnet-4-20250514');
  assert.strictEqual(bean.corona.derives_from.length, 2); // 2 edges from claim_0
  assert.ok(bean.corona.derives_from.every(e => e.rel === 'DERIVES_FROM'));
  assert.strictEqual(bean.corona.adjacency.length, 1);
  assert.strictEqual(bean.groundedness, 0.5);
  assert.strictEqual(bean.grounded, true);
});

// --- fallback bean is visibly degraded ------------------------------------
ok('fallback bean is grounded:false, groundedness 0, keeps raw', () => {
  const bean = loom.buildFallbackBean({
    rawText: 'some prose the model returned', topic: 'X',
    substrate: 'm', brainMode: 'DUAL-BRAIN', timestamp: 't'
  });
  assert.strictEqual(bean.grounded, false);
  assert.strictEqual(bean.groundedness, 0);
  assert.strictEqual(bean.nucleus.raw, 'some prose the model returned');
});

console.log(`\n${passed} checks passed.`);
