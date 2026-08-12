#!/usr/bin/env node
// bean-converter/loaders/threadBuilder.js
//
// Phase 1 (Thread) of the Claude Chat Export Ingestion spec.
// Walks corpus_raw rows loaded by claudeChatLoader.js and, for every human-authored
// row, resolves its parent via parent_external_id. When the parent is assistant-authored,
// emits a reply_pair record. This phase is purely structural — it does not classify pairs
// as corrections, ratifications, etc. That's a Phase 2 (classifier) + Phase 3 (human review) call.
//
// Usage:
// DATABASE_URL=<neon-url> node bean-converter/loaders/threadBuilder.js
//
// Safe to re-run: reply_pair.human_raw_id is UNIQUE, inserts use ON CONFLICT DO NOTHING.

const { Client } = require('pg');

// Claude chat exports use this sentinel as parent_message_uuid for the first message in a
// conversation. It never resolves to a real corpus_raw row — that's expected, not an orphan.
const ROOT_SENTINEL = '00000000-0000-4000-8000-000000000000';

const buildThreads = async (client) => {
 const { rows: humanRows } = await client.query(
 `SELECT id, external_id, parent_external_id, shard_id
 FROM corpus_raw
 WHERE source_type = 'claude_chat' AND speaker = 'human'`
 );

 const stats = {
 humanRowsTotal: humanRows.length,
 pairsCreated: 0,
 pairsAlreadyPresent: 0,
 conversationRoots: 0,
 parentNotAssistant: 0,
 orphans: [],
 };

 for (const row of humanRows) {
 if (!row.parent_external_id || row.parent_external_id === ROOT_SENTINEL) {
 stats.conversationRoots++;
 continue;
 }

 const { rows: parentRows } = await client.query(
 `SELECT id, speaker FROM corpus_raw WHERE source_type = 'claude_chat' AND external_id = $1`,
 [row.parent_external_id]
 );

 if (parentRows.length === 0) {
 stats.orphans.push({
 humanRawId: row.id,
 conversationId: row.shard_id,
 missingParentExternalId: row.parent_external_id,
 });
 continue;
 }

 const parent = parentRows[0];
 if (parent.speaker !== 'assistant') {
 stats.parentNotAssistant++;
 continue;
 }

 const res = await client.query(
 `INSERT INTO reply_pair (assistant_raw_id, human_raw_id)
 VALUES ($1, $2)
 ON CONFLICT (human_raw_id) DO NOTHING
 RETURNING id`,
 [parent.id, row.id]
 );

 if (res.rows.length > 0) stats.pairsCreated++;
 else stats.pairsAlreadyPresent++;
 }

 return stats;
};

const main = async () => {
 if (!process.env.DATABASE_URL) {
 console.error('ERROR: DATABASE_URL environment variable is required.');
 process.exit(1);
 }

 const client = new Client({ connectionString: process.env.DATABASE_URL });
 await client.connect();

 try {
 const stats = await buildThreads(client);

 console.log('\n─────────────────────────────────────────');
 console.log(` Human rows scanned:      ${stats.humanRowsTotal}`);
 console.log(` Conversation roots:      ${stats.conversationRoots} (no parent to resolve)`);
 console.log(` reply_pair created:      ${stats.pairsCreated}`);
 console.log(` reply_pair already present: ${stats.pairsAlreadyPresent}`);
 console.log(` Parent found, not assistant: ${stats.parentNotAssistant}`);
 console.log(` Orphans (parent not found):  ${stats.orphans.length}`);
 if (stats.orphans.length > 0) {
 console.log('\n Orphans — spot-check these, do not silently ignore:');
 for (const o of stats.orphans) {
 console.log(`  human_raw_id=${o.humanRawId} conversation=${o.conversationId} missing_parent=${o.missingParentExternalId}`);
 }
 }
 console.log('─────────────────────────────────────────\n');
 } finally {
 await client.end();
 }
};

if (require.main === module) {
 main().catch((err) => {
 console.error('Thread builder failed:', err);
 process.exit(1);
 });
}

module.exports = { ROOT_SENTINEL, buildThreads };
