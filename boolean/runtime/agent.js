// boolean/runtime/agent.js
// Boolean's answer loop: retrieve under the scope and spoiler filters,
// short-circuit when nothing may be said, otherwise ask the model with the
// constitution and Sources, then check its citations and log to the Trail.

'use strict';

const { buildSystemPrompt, NOT_IN_BOOK, AHEAD_OF_READER } = require('./constitution');
const { checkCitations } = require('./citations');

const HISTORY_TURNS = 6;

/**
 * @param {object} opts
 * @param {Graph} opts.graph         runtime graph (boolean/runtime/graph.js)
 * @param {object} opts.model        adapter with generate({ system, messages })
 * @param {object} [opts.artisticTier] Robert's tier (constitution.loadArtisticTier)
 * @param {function} [opts.embed]    optional text -> vector, for hybrid search
 * @param {function} [opts.onTrail]  receives one entry per answer
 * @param {number} [opts.k]          Sources per answer
 */
const createBoolean = ({ graph, model, artisticTier = null, embed = null, onTrail = () => {}, k = 6 }) => {
 const ask = async ({ question, reader, mode = 'story', history = [] }) => {
  const retrieve = async (query) => graph.retrieve(query, reader, { mode, k, queryEmbedding: embed ? await embed(query) : null });

  // The question alone decides first, so an earlier match can't mask "ahead
  // of you". Only when it matches nothing at all ("why did he do that?") does
  // the previous question join the search.
  let { beans, aheadOfReader } = await retrieve(question);
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (beans.length === 0 && !aheadOfReader && lastUser) {
   ({ beans, aheadOfReader } = await retrieve(`${lastUser.content} ${question}`));
  }

  let answer;
  if (beans.length === 0) {
   // Nothing the reader may hear: answer without the model, so there is nothing to fabricate from.
   answer = {
    kind: aheadOfReader ? 'ahead' : 'not_in_book',
    text: aheadOfReader ? AHEAD_OF_READER : NOT_IN_BOOK,
    citations: [],
    invalidCitations: [],
    supported: true,
   };
  } else {
   const system = buildSystemPrompt({ beans, mode, artisticTier });
   const messages = [...history.slice(-HISTORY_TURNS), { role: 'user', content: question }];
   const text = (await model.generate({ system, messages })).trim();
   const check = checkCitations(text, beans);
   answer = {
    kind: check.notInBook ? 'not_in_book' : 'answer',
    text,
    citations: check.citations.map((id) => ({ bean_id: id, title: graph.get(id).title || null })),
    invalidCitations: check.invalidCitations,
    supported: check.supported,
   };
  }

  onTrail({
   at: new Date().toISOString(),
   mode,
   position: reader.position,
   question,
   kind: answer.kind,
   answer: answer.text,
   sources: beans.map((b) => b.bean_id),
   citations: answer.citations.map((c) => c.bean_id),
   supported: answer.supported,
  });
  return answer;
 };

 return { ask };
};

module.exports = { createBoolean };
