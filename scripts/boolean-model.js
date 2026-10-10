#!/usr/bin/env node
// scripts/boolean-model.js
//
// Checks and fetches Boolean's pinned base model (boolean/model.json).
// The build plan's rule: check the license of the exact checkpoint before
// training. `verify` asks Hugging Face for the license of the pinned model,
// its GGUF repo, and the adapter base, and fails unless all are Apache 2.0.
// `download` verifies, then fetches the GGUF at its pinned revision and
// checks size and SHA-256.
//
// Usage:
// node scripts/boolean-model.js verify
// node scripts/boolean-model.js download <dir>

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const MODEL = require('../boolean/model.json');

const HF = 'https://huggingface.co';
const REQUIRED_LICENSE = 'apache-2.0';

const getJson = async (url) => {
 const res = await fetch(url);
 if (!res.ok) throw new Error(`${url}: ${res.status}`);
 return res.json();
};

const licenseOf = async (repo, revision) => {
 const suffix = revision ? `/revision/${revision}` : '';
 const info = await getJson(`${HF}/api/models/${repo}${suffix}`);
 return (info.cardData && info.cardData.license) || null;
};

const verify = async () => {
 const checks = [[MODEL.id, MODEL.revision], [MODEL.gguf.repo, MODEL.gguf.revision]];
 if (MODEL.adapter_base !== MODEL.id) checks.push([MODEL.adapter_base]);
 let ok = true;
 for (const [repo, revision] of checks) {
  const license = await licenseOf(repo, revision);
  const pass = license === REQUIRED_LICENSE;
  ok = ok && pass;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${repo}${revision ? `@${revision.slice(0, 7)}` : ''}: ${license}`);
 }
 if (!ok) throw new Error(`Every checkpoint must be ${REQUIRED_LICENSE}. Not downloading.`);
};

const sha256File = (file) => new Promise((resolve, reject) => {
 const hash = crypto.createHash('sha256');
 fs.createReadStream(file).on('data', (d) => hash.update(d)).on('end', () => resolve(hash.digest('hex'))).on('error', reject);
});

const download = async (dir) => {
 await verify();
 const { repo, revision, file, bytes, sha256 } = MODEL.gguf;
 const dest = path.join(dir, file);
 fs.mkdirSync(dir, { recursive: true });

 if (fs.existsSync(dest) && fs.statSync(dest).size === bytes && await sha256File(dest) === sha256) {
  console.log(`Already present and verified: ${dest}`);
  return;
 }

 const res = await fetch(`${HF}/${repo}/resolve/${revision}/${file}`);
 if (!res.ok) throw new Error(`download ${file}: ${res.status}`);
 const partial = `${dest}.partial`;
 const hash = crypto.createHash('sha256');
 let received = 0;
 let lastLog = 0;
 const out = fs.createWriteStream(partial);
 for await (const chunk of Readable.fromWeb(res.body)) {
  hash.update(chunk);
  received += chunk.length;
  if (!out.write(chunk)) await new Promise((r) => out.once('drain', r));
  if (received - lastLog > 250e6) {
   lastLog = received;
   console.log(`  ${(received / 1e9).toFixed(2)} / ${(bytes / 1e9).toFixed(2)} GB`);
  }
 }
 await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())));

 const digest = hash.digest('hex');
 if (received !== bytes || digest !== sha256) {
  fs.unlinkSync(partial);
  throw new Error(`${file} failed its check (got ${received} bytes, sha256 ${digest})`);
 }
 fs.renameSync(partial, dest);
 console.log(`Downloaded and verified: ${dest}`);
};

const main = async () => {
 const [cmd, dir] = process.argv.slice(2);
 if (cmd === 'verify') return verify();
 if (cmd === 'download' && dir) return download(dir);
 console.error('Usage: node scripts/boolean-model.js verify | download <dir>');
 process.exit(1);
};

main().catch((err) => {
 console.error(err.message);
 process.exit(1);
});
