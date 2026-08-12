#!/usr/bin/env node
// bean-converter/loaders/claudeChatLoader.js
//
// Phase 0 (Load) of the Claude Chat Export Ingestion spec.
// Reads a conversations.json export (Settings > Privacy > Export Data on claude.ai),
// writes one corpus_source_index row per conversation, and one corpus_raw row per
// message in every non-excluded conversation.
//
// Usage:
// DATABASE_URL=<neon-url> node bean-converter/loaders/claudeChatLoader.js /path/to/conversations.json
//
// Safe to re-run against the same file: corpus_raw dedups on (source_type, external_id)
// and corpus_source_index dedups on conversation_id, both via ON CONFLICT DO NOTHING.

const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

// Six conversations are Robert's wife's home health care (HHC) work, not OPVS genesis
// material. Hardcoded by UUID rather than keyword-matched: a first-pass keyword filter on
// "caregiver" false-positived on OPVS sessions, where Robert describes himself as his
// daughter's primary caregiver.
const EXCLUDED_CONVERSATION_IDS = new Set([
 'ca73b3a4-e3e1-4076-839b-2d2026c796a2', // Community home care resources for Michigan counties (2026-07-20)
 '4518bf5b-b5d2-43ca-9ee7-f228b6730da3', // Adding resources to Lenawee County PowerPoint (2026-07-20)
 '6e5f158d-1131-4d4a-8a76-c35f7a9112c9', // Community mental health resources for three counties (2026-07-20)
 'b4c46fcf-15ee-4e73-94af-4b93eb9f45c3', // Community resources for northwest Ohio counties (2026-07-22)
 '5fb5d98a-b392-4d62-8fc5-3f38b94f43d6', // Bedside Bulletin: Clinical reminders and updates (2026-07-24)
 'e8cc70d2-72b2-463e-808c-fdad291cfe3e', // Case study patient and caregiver modification (2026-07-26)
]);

// Only type:"text" content blocks are genesis material for v1. thinking/tool_use/tool_result/
// token_budget blocks are execution trace, not source content, and are skipped.
const extractTextContent = (message) =>
 (message.content || [])
 .filter((block) => block.type === 'text')
 .map((block) => block.text)
 .join('\n\n');

const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const sha256Hex = (content) => crypto.createHash('sha256').update(content, 'utf8').digest('hex');

const upsertSourceIndex = async (client, conversation, { excluded, excludeReason }) => {
 const messages = conversation.chat_messages || [];
 const totalWords = messages.reduce(
 (sum, m) => sum + wordCount(extractTextContent(m)),
 0
 );

 await client.query(
 `INSERT INTO corpus_source_index
 (conversation_id, title, summary, created_at, message_count, word_count, excluded, exclude_reason)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
 ON CONFLICT (conversation_id) DO NOTHING`,
 [
 conversation.uuid,
 conversation.name || 'Untitled',
 conversation.summary || '',
 conversation.created_at || null,
 messages.length,
 totalWords,
 excluded,
 excludeReason || null,
 ]
 );
};

const insertRawMessage = async (client, conversation, message) => {
 const content = extractTextContent(message);
 const sourcePath = `claude_chat://${conversation.uuid}/${message.uuid}`;

 const res = await client.query(
 `INSERT INTO corpus_raw
 (source_type, source_path, external_id, parent_external_id, speaker, sha256, content, captured_at, shard_id)
 VALUES ('claude_chat', $1, $2, $3, $4, $5, $6, $7, $8)
 ON CONFLICT (source_type, external_id) WHERE external_id IS NOT NULL DO NOTHING
 RETURNING id`,
 [
 sourcePath,
 message.uuid,
 message.parent_message_uuid || null,
 message.sender || null,
 sha256Hex(content),
 content,
 message.created_at || null,
 conversation.uuid,
 ]
 );

 return res.rows.length > 0; // true if a new row was actually inserted
};

const runLoader = async (client, conversations) => {
 const stats = {
 conversationsTotal: conversations.length,
 conversationsExcluded: 0,
 conversationsLoaded: 0,
 messagesExcluded: 0,
 messagesInserted: 0,
 messagesSkippedExisting: 0,
 };

 for (const conversation of conversations) {
 const excluded = EXCLUDED_CONVERSATION_IDS.has(conversation.uuid);

 await upsertSourceIndex(client, conversation, {
 excluded,
 excludeReason: excluded ? 'wife_hhc_work' : null,
 });

 if (excluded) {
 stats.conversationsExcluded++;
 stats.messagesExcluded += (conversation.chat_messages || []).length;
 continue;
 }

 stats.conversationsLoaded++;

 for (const message of conversation.chat_messages || []) {
 const inserted = await insertRawMessage(client, conversation, message);
 if (inserted) stats.messagesInserted++;
 else stats.messagesSkippedExisting++;
 }
 }

 return stats;
};

const main = async () => {
 const filePath = process.argv[2];
 if (!filePath) {
 console.error('Usage: node bean-converter/loaders/claudeChatLoader.js <path-to-conversations.json>');
 process.exit(1);
 }
 if (!process.env.DATABASE_URL) {
 console.error('ERROR: DATABASE_URL environment variable is required.');
 process.exit(1);
 }

 console.log(`Reading ${filePath}...`);
 const conversations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
 const totalMessages = conversations.reduce((n, c) => n + (c.chat_messages || []).length, 0);
 console.log(`Parsed ${conversations.length} conversations, ${totalMessages} messages.`);

 const client = new Client({ connectionString: process.env.DATABASE_URL });
 await client.connect();

 try {
 await client.query('BEGIN');
 const stats = await runLoader(client, conversations);
 await client.query('COMMIT');

 console.log('\n─────────────────────────────────────────');
 console.log(` Conversations: ${stats.conversationsTotal} total, ${stats.conversationsExcluded} excluded (wife_hhc_work), ${stats.conversationsLoaded} loaded`);
 console.log(` Messages: ${stats.messagesExcluded} excluded (inside excluded conversations)`);
 console.log(` corpus_raw:    ${stats.messagesInserted} inserted this run, ${stats.messagesSkippedExisting} already present (idempotent skip)`);
 console.log(` Expected non-excluded message count: ${totalMessages - stats.messagesExcluded}`);
 console.log('─────────────────────────────────────────\n');
 } catch (err) {
 await client.query('ROLLBACK');
 throw err;
 } finally {
 await client.end();
 }
};

if (require.main === module) {
 main().catch((err) => {
 console.error('Loader failed:', err);
 process.exit(1);
 });
}

module.exports = {
 EXCLUDED_CONVERSATION_IDS,
 extractTextContent,
 sha256Hex,
 wordCount,
 runLoader,
};
