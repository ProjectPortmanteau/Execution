// services/corpusReview.js
//
// Review gate (spec section 2.4): for corpus_candidate rows where provenance is still
// 'unclassified' and the proposed type is 'decision' or 'concept', the reviewer needs thread
// context to make the provenance call — not an isolated candidate row. Telling
// assistant_synthesis (compiling something already established elsewhere) apart from a fresh
// assistant_generation is a judgment call that needs that context.
//
// This module only reads. Accepting/rejecting a candidate (Phase 3) is out of scope here.

const { Client } = require('pg');

let db = null;
let dbConnecting = null;

const getDbConnection = async () => {
 if (db) return db;
 if (dbConnecting) return dbConnecting;

 dbConnecting = (async () => {
 const client = new Client({ connectionString: process.env.DATABASE_URL });
 await client.connect();
 db = client;
 dbConnecting = null;
 return db;
 })();

 return dbConnecting;
};

const getPendingCandidatesWithContext = async (dbClient) => {
 const { rows: candidates } = await dbClient.query(
 `SELECT cc.id, cc.raw_id, cc.proposed_type, cc.provenance, cc.nucleus,
   cc.confidence, cc.classifier_run, cc.review_status,
   cr.content AS raw_content, cr.speaker AS raw_speaker,
   cr.parent_external_id, cr.shard_id AS conversation_id, cr.captured_at
  FROM corpus_candidate cc
  JOIN corpus_raw cr ON cr.id = cc.raw_id
  WHERE cc.review_status = 'pending'
   AND cc.provenance = 'unclassified'
   AND cc.proposed_type IN ('decision', 'concept')
  ORDER BY cr.captured_at ASC NULLS LAST`
 );

 const withContext = [];

 for (const candidate of candidates) {
 let parent = null;
 if (candidate.parent_external_id) {
 const { rows } = await dbClient.query(
 `SELECT id, speaker, content, captured_at
   FROM corpus_raw
   WHERE source_type = 'claude_chat' AND external_id = $1`,
 [candidate.parent_external_id]
 );
 parent = rows[0] || null;
 }

 let humanReply = null;
 if (candidate.raw_speaker === 'assistant') {
 const { rows } = await dbClient.query(
 `SELECT cr.id, cr.speaker, cr.content, cr.captured_at
   FROM reply_pair rp
   JOIN corpus_raw cr ON cr.id = rp.human_raw_id
   WHERE rp.assistant_raw_id = $1`,
 [candidate.raw_id]
 );
 humanReply = rows[0] || null;
 }

 withContext.push({ candidate, parent, humanReply });
 }

 return withContext;
};

const listPendingCandidatesWithContext = async () => {
 const dbClient = await getDbConnection();
 return getPendingCandidatesWithContext(dbClient);
};

module.exports = { getPendingCandidatesWithContext, listPendingCandidatesWithContext };
