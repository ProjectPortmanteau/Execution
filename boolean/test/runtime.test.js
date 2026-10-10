'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { Graph } = require('../runtime/graph');
const { createReader, createTagRegistry, applyTap, parseTagUrl, finishBook } = require('../runtime/reader');
const { createBoolean } = require('../runtime/agent');
const { checkCitations } = require('../runtime/citations');
const { llamaServer, isLocalHost } = require('../runtime/models');
const { NOT_IN_BOOK, AHEAD_OF_READER, loadArtisticTier } = require('../runtime/constitution');

const fixtures = path.join(__dirname, '..', 'fixtures');
const beans = fs.readFileSync(path.join(fixtures, 'beans.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const tags = createTagRegistry(JSON.parse(fs.readFileSync(path.join(fixtures, 'tags.json'), 'utf8')));
const DOMAIN = 'tags.example.test';

const ids = (list) => list.map((b) => b.bean_id).sort();

// A model that records what it was shown and answers with a fixed reply.
const recordingModel = (reply) => {
 const calls = [];
 return { calls, generate: async (input) => { calls.push(input); return typeof reply === 'function' ? reply(input) : reply; } };
};

test('graph loads only project Beans with use train or runtime', () => {
 const graph = new Graph(beans);
 const rejected = Object.fromEntries(graph.rejected.map((r) => [r.bean_id, r.reason]));
 assert.match(rejected['FIX-006'], /scope = personal/);
 assert.match(rejected['FIX-010'], /use = eval/);
 assert.match(rejected['FIX-012'], /use = hold/);
 assert.match(rejected['FIX-013'], /scope = unclear/);
 assert.ok(graph.get('FIX-007'), 'mis-tagged AI text still loads as runtime');
 assert.equal(graph.get('FIX-006'), null);
});

test('spoiler gate holds the reader to their position', () => {
 const graph = new Graph(beans);
 const atOne = graph.retrieve('red door key', createReader({ position: 1 }));
 assert.deepEqual(ids(atOne.beans), ['FIX-001']);
 const atThree = graph.retrieve('red door key', createReader({ position: 3 }));
 assert.deepEqual(ids(atThree.beans), ['FIX-001', 'FIX-002']);
});

test('a Bean with no chapter is treated as a spoiler', () => {
 const graph = new Graph(beans);
 assert.ok(!ids(graph.retrieve('harbor master', createReader({ position: 99 })).beans).includes('FIX-009'));
 assert.ok(ids(graph.retrieve('harbor master', createReader({ spoilersUnlocked: true })).beans).includes('FIX-009'));
});

test('only matches past the reader report aheadOfReader', () => {
 const graph = new Graph(beans);
 const r = graph.retrieve('lighthouse lamp', createReader({ position: 1 }));
 assert.deepEqual(r.beans, []);
 assert.equal(r.aheadOfReader, true);
 assert.equal(graph.retrieve('volcano', createReader({ position: 1 })).aheadOfReader, false);
});

test('story mode is canon only; curtain mode adds the rest', () => {
 const graph = new Graph(beans);
 const reader = createReader({ position: 3 });
 const story = ids(graph.retrieve('lighthouse', reader, { mode: 'story' }).beans);
 assert.ok(!story.includes('FIX-004'), 'unratified outline in story mode');
 const curtain = ids(graph.retrieve('lighthouse', reader, { mode: 'curtain' }).beans);
 assert.ok(curtain.includes('FIX-004'));
});

test('token-gated Beans need their token', () => {
 const graph = new Graph(beans);
 let reader = createReader({ position: 1 });
 assert.ok(!ids(graph.retrieve('tide song', reader).beans).includes('FIX-008'));
 ({ reader } = applyTap(reader, tags, `https://${DOMAIN}/t/tok-tide?e=00&c=11`, DOMAIN));
 assert.equal(graph.retrieve('tide song', reader).beans[0].bean_id, 'FIX-008');
});

test('taps set position, unlock tokens, and ignore foreign links', () => {
 let reader = createReader();
 let event;
 ({ reader, event } = applyTap(reader, tags, `https://${DOMAIN}/t/ch03`, DOMAIN));
 assert.deepEqual(event, { type: 'chapter', chapter: 3, verified: false });
 assert.equal(reader.position, 3);
 ({ reader, event } = applyTap(reader, tags, `https://${DOMAIN}/t/ch01`, DOMAIN));
 assert.equal(reader.position, 1);
 assert.equal(applyTap(reader, tags, `https://${DOMAIN}/t/nope`, DOMAIN).event.type, 'unknown');
 assert.equal(applyTap(reader, tags, 'https://evil.test/t/ch03', DOMAIN).event.type, 'foreign');
 assert.equal(applyTap(reader, tags, `http://${DOMAIN}/t/ch03`, DOMAIN).event.type, 'foreign');
 assert.equal(parseTagUrl('not a url', DOMAIN), null);
 assert.equal(finishBook(reader).spoilersUnlocked, false);
 assert.equal(finishBook(reader, { unlocksSpoilers: true }).spoilersUnlocked, true);
});

test('nothing retrievable: canned answer, model never called', async () => {
 const model = recordingModel('should not be used');
 const boolean = createBoolean({ graph: new Graph(beans), model });
 const notInBook = await boolean.ask({ question: 'What is the capital of France?', reader: createReader({ position: 3 }) });
 assert.equal(notInBook.text, NOT_IN_BOOK);
 assert.equal(notInBook.kind, 'not_in_book');
 const ahead = await boolean.ask({ question: 'Where is the lighthouse lamp key?', reader: createReader({ position: 1 }) });
 assert.equal(ahead.text, AHEAD_OF_READER);
 assert.equal(model.calls.length, 0);
});

test('the model never sees out-of-scope, eval, or spoiler text', async () => {
 const model = recordingModel('The door opens at low tide [FIX-001].');
 const boolean = createBoolean({ graph: new Graph(beans), model });
 await boolean.ask({ question: 'red door harbor tide lighthouse lamp key doctor appointment sealed sample', reader: createReader({ position: 1 }), mode: 'curtain' });
 const { system } = model.calls[0];
 for (const leaked of ['lighthouse lamp', 'Doctor appointment', 'Sealed Maker', 'harbor master', 'pasted assistant']) {
  assert.ok(!system.includes(leaked), `system prompt leaked: ${leaked}`);
 }
 assert.ok(system.includes('[FIX-001]'));
});

test('answers carry checked citations and log to the Trail', async () => {
 const trail = [];
 const model = recordingModel('It opens only at low tide [FIX-001], and there are two tides a day [FIX-003].');
 const boolean = createBoolean({ graph: new Graph(beans), model, onTrail: (e) => trail.push(e) });
 const answer = await boolean.ask({ question: 'When does the red door open? How many tides?', reader: createReader({ position: 1 }) });
 assert.equal(answer.kind, 'answer');
 assert.equal(answer.supported, true);
 assert.deepEqual(answer.citations.map((c) => c.bean_id), ['FIX-001', 'FIX-003']);
 assert.equal(trail.length, 1);
 assert.deepEqual(trail[0].citations, ['FIX-001', 'FIX-003']);
});

test('uncited or wrongly cited answers are unsupported', () => {
 const sources = [{ bean_id: 'FIX-001' }];
 assert.equal(checkCitations('The door is red.', sources).supported, false);
 const bad = checkCitations('It opens at low tide [FIX-001] and Mara burns it [FIX-004].', sources);
 assert.equal(bad.supported, false);
 assert.deepEqual(bad.invalidCitations, ['FIX-004']);
 assert.equal(checkCitations('Canon [D] says so [FIX-001].', sources).supported, true);
 assert.equal(checkCitations('That isn’t in the book.', sources).notInBook, true);
});

test('model adapter refuses hosted endpoints', () => {
 assert.throws(() => llamaServer({ baseUrl: 'https://api.example.com' }), /not local/);
 assert.ok(llamaServer({ baseUrl: 'http://192.168.1.20:8080' }));
 assert.equal(isLocalHost('127.0.0.1'), true);
 assert.equal(isLocalHost('172.32.0.1'), false);
});

test('artistic tier template loads', () => {
 const tier = loadArtisticTier();
 assert.equal(tier.version, '0');
 assert.deepEqual(tier.rulings, []);
});

test('history never masks an ahead-of-reader question', async () => {
 const model = recordingModel('It opens at low tide [FIX-001].');
 const boolean = createBoolean({ graph: new Graph(beans), model });
 const reader = createReader({ position: 1 });
 const history = [{ role: 'user', content: 'When does the red door open?' }, { role: 'assistant', content: 'At low tide [FIX-001].' }];
 const ahead = await boolean.ask({ question: 'And the lamp key?', reader, history });
 assert.equal(ahead.kind, 'ahead');
 // A pure follow-up with no terms of its own does use the previous question.
 const followUp = await boolean.ask({ question: 'Why is that?', reader, history });
 assert.equal(followUp.kind, 'answer');
 assert.equal(model.calls.length, 1);
});

test('llama-server adapter sends system plus messages and reads the reply', async () => {
 let sent;
 const fetchImpl = async (url, init) => {
  sent = { url: String(url), body: JSON.parse(init.body) };
  return { ok: true, json: async () => ({ choices: [{ message: { content: 'At low tide [FIX-001].' } }] }) };
 };
 const model = llamaServer({ fetchImpl });
 const text = await model.generate({ system: 'S', messages: [{ role: 'user', content: 'Q' }] });
 assert.equal(text, 'At low tide [FIX-001].');
 assert.equal(sent.url, 'http://127.0.0.1:8080/v1/chat/completions');
 assert.deepEqual(sent.body.messages, [{ role: 'system', content: 'S' }, { role: 'user', content: 'Q' }]);
});
