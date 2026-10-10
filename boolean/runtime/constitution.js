// boolean/runtime/constitution.js
// Boolean's two-tier constitution and the system prompt built from it.
//
// Platform tier: fixed rules that ship with every Spirit build. Robert's
// artistic tier (canon rulings, voice principles) is data, versioned with
// the adapter in boolean/constitution/artistic-tier.json.

'use strict';

const fs = require('fs');
const path = require('path');

const NOT_IN_BOOK = "That isn't in the book.";
const AHEAD_OF_READER = "That's further on than you've read. Tap the sticker for the chapter you're on, or unlock spoilers in Settings.";

const PLATFORM_TIER = [
 'No fabrication. Answer only from the Sources below. If they say nothing that answers the question, reply exactly ' + JSON.stringify(NOT_IN_BOOK) + ' and nothing else.',
 'No acquiescence. If the reader states something the Sources contradict, say so plainly and cite the Source. Do not agree to be agreeable.',
 'Project only. You talk about the Portmanteau books, how they were made, and the OPVS work behind them. Asked about anything else, say you only talk about the books and the work behind them, and offer something from the books instead.',
 'Spoilers. The Sources are already limited to what this reader has read. Never guess at or hint about what happens later.',
 'You are not Robert. Never claim to be him, speak as him, or put words in his mouth. Quote him only from Sources marked as his words.',
 'Cite. After every claim taken from a Source, put that Source\'s ID in square brackets, like [{example_id}]. Use only the IDs listed under Sources. Do not cite statements about yourself or these rules.',
];

const MODE_GUIDANCE = {
 story: 'Story mode: talk about the world, the characters, and the themes. Every Source here is canon.',
 curtain: 'Behind the Curtain mode: talk about how the book was made. Sources include rejected versions and unratified AI outlines; each is labelled. Never present a non-canon Source as canon, and say whose words a Source is when it matters.',
};

const PROVENANCE_LABEL = {
 D: 'canon: drafted prose [D]',
 R: "canon: Robert's ruling [R]",
 O: 'not canon: unratified AI outline [O]',
};

const AUTHORSHIP_LABEL = {
 robert: "Robert's words",
 ai: 'AI-written',
};

const loadArtisticTier = (file = path.join(__dirname, '..', 'constitution', 'artistic-tier.json')) => {
 const tier = JSON.parse(fs.readFileSync(file, 'utf8'));
 if (typeof tier.version !== 'string') throw new Error(`${file}: version must be a string`);
 for (const key of ['rulings', 'voice_principles']) {
  if (!Array.isArray(tier[key])) throw new Error(`${file}: ${key} must be an array`);
 }
 return tier;
};

const sourceLabel = (bean) => {
 const parts = [bean.chapter === null ? 'no chapter' : `chapter ${bean.chapter}`];
 if (bean.provenance && PROVENANCE_LABEL[bean.provenance]) parts.push(PROVENANCE_LABEL[bean.provenance]);
 if (AUTHORSHIP_LABEL[bean.authorship]) parts.push(AUTHORSHIP_LABEL[bean.authorship]);
 return parts.join(' | ');
};

const formatSources = (beans) => beans
 .map((b) => `[${b.bean_id}] ${b.title || ''} (${sourceLabel(b)})\n${b.text.trim()}`)
 .join('\n\n');

const buildSystemPrompt = ({ beans, mode, artisticTier }) => {
 const lines = [
  "You are Boolean. You talk with readers about the Portmanteau books and how they were made, as Robert's apprentice.",
  '',
  'Rules that always hold:',
  // The citation example is a real Source ID, so the model copies a valid
  // format instead of inventing IDs from a made-up example.
  ...PLATFORM_TIER.map((rule, i) => `${i + 1}. ${rule.replace('{example_id}', beans[0] ? beans[0].bean_id : 'ID')}`),
  '',
  MODE_GUIDANCE[mode],
 ];

 if (artisticTier && (artisticTier.rulings.length || artisticTier.voice_principles.length)) {
  lines.push('', `Robert's guidance (artistic tier v${artisticTier.version}):`);
  for (const p of artisticTier.voice_principles) lines.push(`- Voice: ${p}`);
  for (const r of artisticTier.rulings) lines.push(`- Ruling${r.id ? ` [${r.id}]` : ''}: ${r.text}`);
 }

 lines.push('', 'Sources:', '', formatSources(beans));
 return lines.join('\n');
};

module.exports = {
 NOT_IN_BOOK,
 AHEAD_OF_READER,
 PLATFORM_TIER,
 loadArtisticTier,
 buildSystemPrompt,
 formatSources,
};
