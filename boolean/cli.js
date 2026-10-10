#!/usr/bin/env node
// boolean/cli.js
//
// Talk to Boolean from a terminal, against a runtime graph exported by
// scripts/boolean-ledger.js. With --model it calls a local llama-server
// running whatever stock open model you start it with; without, it runs
// dry and prints the Sources the model would have been given.
//
// Usage:
// node boolean/cli.js --graph out/runtime-graph.jsonl [--model http://127.0.0.1:8080]
//   [--position 1] [--mode story|curtain] [--tags tags.json --domain tags.example.com]
//
// Commands: /pos N, /mode story|curtain, /spoilers on|off, /tap <url>, /quit

'use strict';

const fs = require('fs');
const readline = require('readline');
const { Graph } = require('./runtime/graph');
const { createReader, createTagRegistry, applyTap } = require('./runtime/reader');
const { createBoolean } = require('./runtime/agent');
const { llamaServer } = require('./runtime/models');
const { loadArtisticTier } = require('./runtime/constitution');

const parseArgs = (argv) => {
 const args = {};
 for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];
 return args;
};

const dryModel = {
 name: 'dry run',
 async generate({ system }) {
  // Unbracket the IDs so the Sources aren't counted as citations.
  const sources = system.slice(system.indexOf('Sources:')).replace(/^\[([^\]]+)\]/gm, '$1:');
  return `(dry run, no model)\n${sources}`;
 },
};

const main = async () => {
 const args = parseArgs(process.argv.slice(2));
 if (!args.graph) {
  console.error('Usage: node boolean/cli.js --graph <runtime-graph.jsonl> [--model http://127.0.0.1:8080] [--position N] [--mode story|curtain] [--tags tags.json --domain <domain>]');
  process.exit(1);
 }

 const beans = fs.readFileSync(args.graph, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
 const graph = new Graph(beans);
 const tags = args.tags ? createTagRegistry(JSON.parse(fs.readFileSync(args.tags, 'utf8'))) : new Map();
 const model = args.model ? llamaServer({ baseUrl: args.model }) : dryModel;
 const boolean = createBoolean({ graph, model, artisticTier: loadArtisticTier() });

 let reader = createReader({ position: Number(args.position || 0) });
 let mode = args.mode || 'story';
 const history = [];

 console.log(`Boolean: ${graph.beans.size} Beans loaded, ${graph.rejected.length} refused. Model: ${model.name}.`);
 console.log(`Position ${reader.position}, ${mode} mode. /pos N, /mode, /spoilers on|off, /tap <url>, /quit`);

 const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
 rl.prompt();
 for await (const line of rl) {
  const input = line.trim();
  const [cmd, value] = input.split(/\s+/, 2);
  if (!input) {
   // nothing
  } else if (cmd === '/quit') {
   break;
  } else if (cmd === '/pos') {
   reader = { ...reader, position: Number(value) };
   console.log(`Position ${reader.position}`);
  } else if (cmd === '/mode') {
   mode = value === 'curtain' ? 'curtain' : 'story';
   console.log(`${mode} mode`);
  } else if (cmd === '/spoilers') {
   reader = { ...reader, spoilersUnlocked: value === 'on' };
   console.log(`Spoilers ${reader.spoilersUnlocked ? 'unlocked' : 'locked'}`);
  } else if (cmd === '/tap') {
   const result = applyTap(reader, tags, value, args.domain);
   reader = result.reader;
   console.log(JSON.stringify(result.event));
  } else {
   try {
    const answer = await boolean.ask({ question: input, reader, mode, history });
    console.log(`\n${answer.text}\n`);
    if (answer.citations.length) console.log(`Cited: ${answer.citations.map((c) => `${c.bean_id} ${c.title || ''}`.trim()).join('; ')}`);
    if (!answer.supported) console.log('Unsupported: no valid citation for this answer.');
    if (answer.invalidCitations.length) console.log(`Cited outside its Sources: ${answer.invalidCitations.join(', ')}`);
    history.push({ role: 'user', content: input }, { role: 'assistant', content: answer.text });
   } catch (err) {
    console.error(err.message);
   }
  }
  rl.prompt();
 }
 rl.close();
};

main();
