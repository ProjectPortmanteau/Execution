// boolean/runtime/models.js
// Model adapters. Boolean runs on the reader's own hardware: no hosted or
// paid inference, ever. Each adapter exposes generate({ system, messages }).

'use strict';

// Loopback, private LAN ranges, and mDNS names count as the user's own hardware.
const isLocalHost = (hostname) => {
 const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();
 if (h === 'localhost' || h === '::1' || h.endsWith('.local')) return true;
 const m = h.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
 if (!m) return false;
 const [a, b] = [Number(m[1]), Number(m[2])];
 return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
};

/**
 * llama.cpp's llama-server (OpenAI-compatible chat endpoint). Used on a
 * desktop to prove the runtime with a stock open model before any
 * fine-tune; start it with the GGUF of your choice, plus --lora for an
 * adapter once one exists.
 */
const llamaServer = ({ baseUrl = 'http://127.0.0.1:8080', temperature = 0.3, maxTokens = 512, fetchImpl = fetch } = {}) => {
 const url = new URL('/v1/chat/completions', baseUrl);
 if (!isLocalHost(url.hostname)) {
  throw new Error(`${url.hostname} is not local. Boolean only runs on the user's own hardware.`);
 }

 return {
  name: `llama-server ${url.host}`,
  async generate({ system, messages }) {
   const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     messages: [{ role: 'system', content: system }, ...messages],
     temperature,
     max_tokens: maxTokens,
    }),
   });
   if (!res.ok) throw new Error(`llama-server ${res.status}: ${await res.text()}`);
   const data = await res.json();
   return data.choices[0].message.content;
  },
 };
};

/**
 * llama.rn context on the phone (React Native). Untested here: written
 * against llama.rn's completion({ messages }) API for Phase 2.
 */
const llamaRn = (context, { temperature = 0.3, maxTokens = 512 } = {}) => ({
 name: 'llama.rn',
 async generate({ system, messages }) {
  const result = await context.completion({
   messages: [{ role: 'system', content: system }, ...messages],
   temperature,
   n_predict: maxTokens,
  });
  return result.text;
 },
});

module.exports = { llamaServer, llamaRn, isLocalHost };
