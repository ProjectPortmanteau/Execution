// boolean/ledger.js
// Boolean Training Data Ledger rules, as a script instead of memory.
//
// Every Bean record carries the Ledger fields. enforce() decides the use a
// record actually gets, in the Ledger's order:
//   1. scope: personal -> exclude, unclear (or missing) -> hold
//   2. authorship: third_party -> exclude, mixed -> hold until split
//   3. eval stays eval and never trains
//   4. train only when authorship = robert. Ratification alone never makes
//      text trainable; AI text, ratified or not, goes to runtime
//   5. a train record needs a training_set; anything else has none

'use strict';

const FIELDS = {
 ratification: ['C', 'P', '?'],
 authorship: ['robert', 'ai', 'mixed', 'third_party'],
 scope: ['project', 'personal', 'unclear'],
 use: ['train', 'runtime', 'hold', 'eval', 'exclude'],
 training_set: ['voice', 'decision', 'correction', null],
 source: ['apple_notes', 'convo_export', 'prose', 'essay', 'code', 'doc'],
};

// Uses whose records may ever be loaded into Boolean's runtime graph.
const GRAPH_USES = new Set(['train', 'runtime']);

/**
 * Checks enum values and required fields. Returns a list of problems;
 * an empty list means the record is well-formed (not that it may train).
 */
const validate = (bean) => {
 const problems = [];
 if (!bean || typeof bean !== 'object') return ['record is not an object'];
 if (!bean.bean_id) problems.push('missing bean_id');

 for (const [field, allowed] of Object.entries(FIELDS)) {
  const value = bean[field] === undefined ? null : bean[field];
  if (field === 'training_set' && value === null) continue;
  if (value === null) {
   problems.push(`missing ${field}`);
  } else if (!allowed.includes(value)) {
   problems.push(`invalid ${field}: ${JSON.stringify(value)}`);
  }
 }
 return problems;
};

/**
 * Applies the Ledger rules to one record.
 * Returns { use, training_set, changes } where changes lists every rule
 * that overrode the requested use, so the export report can show why.
 */
const enforce = (bean) => {
 const requested = bean.use;
 const changes = [];
 const result = (use, reason) => {
  if (reason && use !== requested) changes.push(reason);
  const trainingSet = use === 'train' ? bean.training_set : null;
  return { use, training_set: trainingSet, changes };
 };

 // A malformed record is never trusted with anything beyond hold.
 const problems = validate(bean);
 if (problems.length > 0) {
  return result('hold', `malformed record (${problems.join('; ')})`);
 }

 if (bean.scope === 'personal') return result('exclude', 'scope = personal forces exclude');
 if (bean.scope === 'unclear') return result('hold', 'scope = unclear goes to hold');

 if (bean.authorship === 'third_party') return result('exclude', 'third-party data is excluded');
 if (bean.authorship === 'mixed') return result('hold', 'mixed authorship goes to hold until split');

 if (requested === 'eval') return result('eval');

 if (requested === 'train') {
  if (bean.authorship !== 'robert') {
   return result('runtime', `authorship = ${bean.authorship} cannot train; runtime only`);
  }
  if (!bean.training_set) {
   return result('hold', 'use = train needs a training_set (voice, decision, or correction)');
  }
  return result('train');
 }

 return result(requested);
};

module.exports = { FIELDS, GRAPH_USES, validate, enforce };
