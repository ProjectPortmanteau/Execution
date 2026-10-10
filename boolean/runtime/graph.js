// boolean/runtime/graph.js
// Boolean's runtime Knowledge Graph and retrieval.
//
// Two filters stand between a question and the model:
//   scope: only project Beans with use train or runtime are ever loaded.
//          A model can be talked around a rule; it cannot reveal what was
//          never loaded.
//   spoilers: only Beans at or before the reader's position are retrieved,
//          unless spoilers are unlocked. A Bean with no chapter tag is
//          treated as a spoiler (fail closed); chapter 0 means spoiler-free.
// Story mode also drops anything that is not canon ([D] or [R]); Behind the
// Curtain mode keeps it, labelled, so Boolean can talk about rejected versions.

'use strict';

const { enforce, GRAPH_USES } = require('../ledger');
const { Bm25Index, cosine } = require('./search');

const MODES = ['story', 'curtain'];
const CANON = new Set(['D', 'R']);

/** Why a record may not enter the graph, or null when it may. */
const loadRejection = (bean) => {
 const { use, changes } = enforce(bean);
 if (bean.scope !== 'project') return `scope = ${bean.scope}`;
 if (!GRAPH_USES.has(use)) return `use = ${use}${changes.length ? ` (${changes.join('; ')})` : ''}`;
 if (!MODES.includes(bean.mode)) return `mode must be story or curtain, got ${JSON.stringify(bean.mode)}`;
 if (bean.chapter !== null && bean.chapter !== undefined && !(Number.isInteger(bean.chapter) && bean.chapter >= 0)) {
  return `chapter must be a whole number or null, got ${JSON.stringify(bean.chapter)}`;
 }
 if (!bean.text) return 'empty text';
 return null;
};

class Graph {
 constructor(beans) {
  this.beans = new Map();
  this.rejected = [];
  for (const bean of beans) {
   const reason = loadRejection(bean);
   if (reason) {
    this.rejected.push({ bean_id: bean.bean_id || null, reason });
   } else if (this.beans.has(bean.bean_id)) {
    this.rejected.push({ bean_id: bean.bean_id, reason: 'duplicate bean_id' });
   } else {
    this.beans.set(bean.bean_id, Object.freeze({ ...bean, chapter: bean.chapter ?? null }));
   }
  }
  this.index = new Bm25Index([...this.beans.values()]);
 }

 get(beanId) {
  return this.beans.get(beanId) || null;
 }

 /**
  * Finds the Beans that may answer `query` for this reader in this mode.
  * Returns { beans, aheadOfReader } where aheadOfReader is true when the only
  * matches sit past the reader's position (so Boolean can say so honestly
  * without revealing them).
  */
 retrieve(query, reader, { mode = 'story', k = 6, queryEmbedding = null, minCosine = 0.35 } = {}) {
  if (!MODES.includes(mode)) throw new Error(`unknown mode ${mode}`);
  const keyword = this.index.score(query);
  const maxKeyword = Math.max(0, ...keyword.values());

  const scored = [];
  for (const bean of this.beans.values()) {
   let score = maxKeyword ? (keyword.get(bean.bean_id) || 0) / maxKeyword : 0;
   if (queryEmbedding && Array.isArray(bean.embedding)) {
    const c = cosine(queryEmbedding, bean.embedding);
    score = c >= minCosine ? 0.5 * score + 0.5 * c : 0.5 * score;
   }
   if (score > 0) scored.push({ bean, score });
  }

  const visible = (bean) => this.inMode(bean, mode) && this.unlocked(bean, reader);
  const candidates = scored.filter(({ bean }) => visible(bean));
  const allowed = candidates.filter(({ bean }) => this.notSpoiler(bean, reader));
  allowed.sort((a, b) => b.score - a.score);

  return {
   beans: allowed.slice(0, k).map(({ bean }) => bean),
   aheadOfReader: allowed.length === 0 && candidates.length > 0,
  };
 }

 inMode(bean, mode) {
  if (mode === 'curtain') return true;
  return bean.mode === 'story' && CANON.has(bean.provenance);
 }

 // A token-gated Bean is visible only after its token has been tapped.
 unlocked(bean, reader) {
  return bean.unlock !== 'token' || reader.collection.has(bean.bean_id);
 }

 notSpoiler(bean, reader) {
  if (reader.spoilersUnlocked) return true;
  return bean.chapter !== null && bean.chapter <= reader.position;
 }
}

module.exports = { Graph, MODES, CANON, loadRejection };
