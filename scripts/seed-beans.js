#!/usr/bin/env node
// scripts/seed-beans.js
//
// Reads all Bean markdown files from the local beans/ directory,
// parses them using the project's existing parser, and upserts
// each Bean into the Neon database (Soil).
//
// Usage:
// DATABASE_URL=<your-neon-url> node scripts/seed-beans.js
// or
// npm run seed (with DATABASE_URL set in your environment or .env)

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { safeParseBeanFile, splitBeansFromFile } = require('../utils/parser');

// ── Configuration ──────────────────────────────────────────────
const BEANS_DIR = path.resolve(__dirname, '..', 'beans');
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

// ── Database helpers (mirrors services/githubSync.js) ──────────
const persistBeanToSoil = async (dbClient, bean) => {
 const query = `
 INSERT INTO beans (user_id, title, content, type, layer, bean_id, source_path, status, last_synced_at)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
 ON CONFLICT (source_path) WHERE source_path IS NOT NULL
 DO UPDATE SET
 title = EXCLUDED.title,
 content = EXCLUDED.content,
 layer = EXCLUDED.layer,
 bean_id = EXCLUDED.bean_id,
 status = EXCLUDED.status,
 last_synced_at = NOW()
 RETURNING id, title, source_path
 `;

 const title = bean.title || bean.path || 'Untitled Bean';
 const layer = (bean.layer !== null && bean.layer !== undefined) ? bean.layer : null;
 const content = bean.content || '';
 const type = 'ARK';
 const beanId = bean.bean_id || null;
 const status = ['archived', 'draft'].includes(bean.status) ? bean.status : 'active';

 const values = [SYSTEM_USER_ID, title, content, type, layer, beanId, bean.path, status];
 const res = await dbClient.query(query, values);
 return res.rows[0];
};

// ── Main seed routine ──────────────────────────────────────────
const seed = async () => {
 // 1. Collect all .md files under beans/ (recursive)
 const beanFiles = [];

 const walk = (dir, prefix) => {
 for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
 const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
 if (entry.isDirectory()) {
 walk(path.join(dir, entry.name), rel);
 } else if (entry.name.endsWith('.md')) {
 beanFiles.push({ abs: path.join(dir, entry.name), rel: `beans/${rel}` });
 }
 }
 };

 walk(BEANS_DIR, '');

 if (beanFiles.length === 0) {
 console.log('No bean files found in', BEANS_DIR);
 process.exit(0);
 }

 console.log(`\n🫘 Found ${beanFiles.length} bean file(s). Parsing…\n`);

 // 2. Connect to Neon
 if (!process.env.DATABASE_URL) {
 console.error('ERROR: DATABASE_URL environment variable is required.');
 process.exit(1);
 }

 const client = new Client({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: true },
 });
 await client.connect();
 console.log('✅ Connected to Neon database.\n');

 let persisted = 0;
 let failed = 0;

 // 3. Parse and persist each file
 for (const { abs, rel } of beanFiles) {
 const raw = fs.readFileSync(abs, 'utf8');
 const parsed = safeParseBeanFile(rel, raw);

 if (!parsed.ok) {
 console.log(` ⚠️ Skipping ${rel}: ${parsed.error}`);
 failed++;
 continue;
 }

 const fileBean = { path: rel, ...parsed.data };

 // Split into individual bean sections (if any)
 const sections = splitBeansFromFile(fileBean.content || '');

 if (sections.length > 0) {
 for (const section of sections) {
 try {
 const row = await persistBeanToSoil(client, {
 path: `${rel}#${section.id}`,
 title: section.title,
 content: section.content,
 layer: fileBean.layer,
 bean_id: section.id,
 status: fileBean.status,
 });
 persisted++;
 console.log(` ✓ ${section.id} ${row.title}`);
 } catch (err) {
 failed++;
 console.error(` ✗ ${section.id} ${err.message}`);
 }
 }
 } else {
 // No embedded beans persist the whole file as one bean
 try {
 const row = await persistBeanToSoil(client, fileBean);
 persisted++;
 console.log(` ✓ ${rel} ${row.title}`);
 } catch (err) {
 failed++;
 console.error(` ✗ ${rel} ${err.message}`);
 }
 }
 }

 await client.end();

 console.log(`\n─────────────────────────────────────────`);
 console.log(` Seed complete: ${persisted} persisted, ${failed} failed.`);
 console.log(`─────────────────────────────────────────\n`);

 process.exit(failed > 0 ? 1 : 0);
};

seed().catch((err) => {
 console.error('Seed failed:', err);
 process.exit(1);
});
