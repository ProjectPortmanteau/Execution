#!/usr/bin/env node
// playground/preflight.js
// API Key Preflight verify all configured provider keys before running negotiate.js
// Sends a minimal "ping" prompt to each provider and reports status.
// Zero external dependencies.

'use strict';

const fs = require('fs');
const path = require('path');
const { send, resolveProvider, PROVIDERS } = require('./provider');

// ---------------------------------------------------------------------------
// Minimal .env loader (same as negotiate.js)
// ---------------------------------------------------------------------------
function loadEnv() {
 const envPath = path.join(__dirname, '.env');
 if (!fs.existsSync(envPath)) return;
 const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
 for (const line of lines) {
 const trimmed = line.trim();
 if (!trimmed || trimmed.startsWith('#')) continue;
 const eq = trimmed.indexOf('=');
 if (eq === -1) continue;
 const key = trimmed.slice(0, eq).trim();
 const val = trimmed.slice(eq + 1).trim();
 if (!process.env[key]) process.env[key] = val;
 }
}
loadEnv();

// ---------------------------------------------------------------------------
// Spirit configs (for model + provider resolution)
// ---------------------------------------------------------------------------
const SPIRITS_DIR = path.join(__dirname, 'spirits');

function loadSpirit(filename) {
 return JSON.parse(fs.readFileSync(path.join(SPIRITS_DIR, filename), 'utf-8'));
}

// ---------------------------------------------------------------------------
// Preflight check per provider
// ---------------------------------------------------------------------------

const PING_SYSTEM = 'You are a health-check responder. Reply with exactly: OK';
const PING_USER = 'Respond with the single word OK.';

async function checkProvider(name, apiKey, model, retries) {
 retries = retries || (name === 'openrouter' ? 2 : 0);
 const callFn = PROVIDERS[name];
 if (!callFn) return { provider: name, status: 'UNKNOWN', detail: 'No provider function' };
 if (!apiKey) return { provider: name, status: 'SKIP', detail: 'No API key configured' };

 for (let attempt = 0; attempt <= retries; attempt++) {
 if (attempt > 0) {
 const wait = attempt * 2000;
 process.stdout.write(`retry ${attempt}/${retries} (${wait/1000}s) ... `);
 await new Promise(r => setTimeout(r, wait));
 }
 const start = Date.now();
 try {
 const reply = await callFn(apiKey, model, PING_SYSTEM, PING_USER);
 const ms = Date.now() - start;
 const ok = typeof reply === 'string' && reply.length > 0;
 return {
 provider: name,
 status: ok ? 'OK' : 'WARN',
 detail: ok ? `Response in ${ms}ms` : `Empty response (${ms}ms)`,
 latency: ms,
 snippet: (reply || '').slice(0, 60)
 };
 } catch (err) {
 const ms = Date.now() - start;
 if (attempt === retries) {
 return {
 provider: name,
 status: 'FAIL',
 detail: err.message.slice(0, 120),
 latency: ms
 };
 }
 }
 }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
 console.log('╔══════════════════════════════════════════════════════════╗');
 console.log('║ Principled Playground API Key Preflight ║');
 console.log('╚══════════════════════════════════════════════════════════╝\n');

 const keys = {
 anthropic: process.env.ANTHROPIC_API_KEY || '',
 google: process.env.GOOGLE_API_KEY || '',
 groq: process.env.GROQ_API_KEY || '',
 openai: process.env.OPENAI_API_KEY || '',
 openrouter: process.env.OPENROUTER_API_KEY || ''
 };

 // Default lightweight models for preflight (minimize token cost)
 const models = {
 anthropic: 'claude-sonnet-4-20250514',
 google: 'gemini-2.0-flash',
 groq: 'llama-3.3-70b-versatile',
 openai: 'gpt-4o-mini',
 openrouter: 'nvidia/nemotron-nano-9b-v2:free'
 };

 // Load spirits to show intended provider mapping
 const boolean = loadSpirit('boolean.json');
 const roux = loadSpirit('contrarian.json');
 const seer = loadSpirit('seer.json');

 console.log('Spirit → Provider mapping:');
 console.log(` Boolean : ${boolean.provider} (${boolean.model})`);
 console.log(` Roux : ${roux.provider} (${roux.model})`);
 console.log(` Seer : ${seer.provider} (${seer.model})\n`);

 // Check which keys are present
 console.log('Key inventory:');
 for (const [name, key] of Object.entries(keys)) {
 const masked = key ? key.slice(0, 8) + '...' + key.slice(-4) : '(not set)';
 console.log(` ${name.padEnd(10)} : ${masked}`);
 }
 console.log();

 // Ping each configured provider
 console.log('Pinging providers...\n');

 const providers = Object.keys(PROVIDERS);
 const results = [];

 for (const name of providers) {
 if (!keys[name]) {
 results.push({ provider: name, status: 'SKIP', detail: 'No API key' });
 continue;
 }
 process.stdout.write(` ${name.padEnd(10)} ... `);
 const result = await checkProvider(name, keys[name], models[name]);
 results.push(result);

 const icon = result.status === 'OK' ? '✓' : result.status === 'SKIP' ? '–' : '✗';
 console.log(`${icon} ${result.status} ${result.detail}`);
 if (result.snippet) {
 console.log(`${''.padEnd(15)} └─ "${result.snippet}"`);
 }
 }

 console.log();

 // Resolve what negotiate.js would actually use
 console.log('Provider resolution (what negotiate.js will use):');
 const resolvedBoolean = resolveProvider(boolean, keys);
 const resolvedRoux = resolveProvider(roux, keys);
 const resolvedSeer = resolveProvider(seer, keys);

 function showResolved(label, resolved) {
 if (!resolved) {
 console.log(` ${label} : ✗ NO PROVIDER AVAILABLE`);
 return false;
 }
 const tag = resolved.mode === 'NATIVE' ? '' : ` (FALLBACK from ${resolved.provider})`;
 console.log(` ${label} : ${resolved.provider}${tag}`);
 return true;
 }

 const bOk = showResolved('Boolean', resolvedBoolean);
 const rOk = showResolved('Roux ', resolvedRoux);
 const sOk = showResolved('Seer ', resolvedSeer);

 // Brain mode
 const activeProviders = new Set(
 [resolvedBoolean, resolvedRoux, resolvedSeer]
 .filter(Boolean)
 .map(r => r.provider)
 );
 const brainMode = activeProviders.size >= 3 ? 'TRI-BRAIN'
 : activeProviders.size === 2 ? 'DUAL-BRAIN'
 : 'SINGLE-BRAIN';

 console.log(`\n Brain mode: ${brainMode} (${activeProviders.size} distinct provider${activeProviders.size !== 1 ? 's' : ''})`);

 // Determine which providers are actually needed for negotiation
 const neededProviders = new Set(
 [resolvedBoolean, resolvedRoux, resolvedSeer]
 .filter(Boolean)
 .map(r => r.provider)
 );

 // Summary: only block on failures for providers that spirits actually need
 const okCount = results.filter(r => r.status === 'OK').length;
 const failCount = results.filter(r => r.status === 'FAIL').length;
 const skipCount = results.filter(r => r.status === 'SKIP').length;
 const neededFails = results.filter(r => r.status === 'FAIL' && neededProviders.has(r.provider));

 console.log('\n────────────────────────────────────────────────────────────');
 if (neededFails.length > 0) {
 const names = neededFails.map(r => r.provider).join(', ');
 console.log(`PREFLIGHT: BLOCKED ${names} failed and is needed by a Spirit. Fix before running negotiate.js.`);
 process.exit(1);
 } else if (!bOk || !rOk) {
 console.log('PREFLIGHT: Boolean or Roux has no provider. Cannot negotiate.');
 process.exit(1);
 } else if (failCount > 0) {
 const failNames = results.filter(r => r.status === 'FAIL').map(r => r.provider).join(', ');
 console.log(`PREFLIGHT: PASS with warnings ${failNames} failed but no Spirit depends on them.`);
 if (!sOk) console.log(' Seer unavailable stress test will be skipped.');
 console.log(` Ready for ${brainMode} negotiation.`);
 } else if (!sOk) {
 console.log(`PREFLIGHT: PASS (${okCount} OK, ${skipCount} skipped). Seer unavailable stress test will be skipped.`);
 } else {
 console.log(`PREFLIGHT: ALL CLEAR (${okCount} OK, ${skipCount} skipped). Ready for ${brainMode} negotiation.`);
 }
}

main().catch(err => {
 console.error('Preflight crashed:', err.message);
 process.exit(2);
});
