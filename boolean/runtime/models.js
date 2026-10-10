// boolean/runtime/models.js
// Model adapters. Boolean runs on the reader's own hardware: no hosted or
// paid inference, ever. Each adapter exposes generate({ system, messages }).

'use strict';

// The pinned base model: Qwen3.5-4B, Apache 2.0. See boolean/model.json.
// require() rather than fs so the same line works under Metro in the app.
const MODEL = require('../model.json');

// Qwen3.5 thinks by default. The profile turns that off, and any think block
// that still comes back is dropped so it never reaches the reader.
const stripThinking = (text) => String(text).replace(/<think>[\s\S]*?<\/think>/g, '').replace(/^[\s\S]*<\/think>/, '').trim();

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
 * desktop to prove the runtime with the stock model before any fine-tune.
 * Start it with the profile's GGUF and --jinja (so chat_template_kwargs
 * applies), plus --lora for an adapter once one exists.
 */
const llamaServer = ({ baseUrl = 'http://127.0.0.1:8080', profile = MODEL, maxTokens = 512, fetchImpl = fetch } = {}) => {
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
     ...profile.sampling,
     chat_template_kwargs: profile.chat_template_kwargs,
     max_tokens: maxTokens,
    }),
   });
   if (!res.ok) throw new Error(`llama-server ${res.status}: ${await res.text()}`);
   const data = await res.json();
   return stripThinking(data.choices[0].message.content);
  },
 };
};

/**
 * llama.rn context on the phone (React Native). Untested here: written
 * against llama.rn's completion({ messages }) API for Phase 2. How llama.rn
 * turns off Qwen3.5's thinking still needs checking on device; until then
 * stripThinking keeps think blocks out of answers.
 */
const llamaRn = (context, { profile = MODEL, maxTokens = 512 } = {}) => ({
 name: 'llama.rn',
 async generate({ system, messages }) {
  const { temperature, top_p, top_k, min_p, presence_penalty } = profile.sampling;
  const result = await context.completion({
   messages: [{ role: 'system', content: system }, ...messages],
   temperature,
   top_p,
   top_k,
   min_p,
   penalty_present: presence_penalty,
   n_predict: maxTokens,
  });
  return stripThinking(result.text);
 },
});

module.exports = { MODEL, llamaServer, llamaRn, isLocalHost, stripThinking };
