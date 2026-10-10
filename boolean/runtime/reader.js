// boolean/runtime/reader.js
// Reader state and NFC taps (reader stickers and Bean tokens).
//
// A tag carries only an ID, in an NDEF URI like
//   https://<domain>/t/<tag-id>?e=<encrypted>&c=<cmac>
// The tag registry maps that ID to a chapter or a Bean, so taps work
// offline. SUN values (e, c) are passed through unverified: the prototype
// accepts any registered tag offline, and verification is an open decision.

'use strict';

const createReader = (overrides = {}) => ({
 position: 0,
 finished: false,
 spoilersUnlocked: false,
 collection: new Set(),
 ...overrides,
});

/**
 * Builds a registry from entries like
 *   { tag_id: 'ch03', kind: 'chapter', chapter: 3 }
 *   { tag_id: 'tok-7', kind: 'bean', bean_id: 'LORE-004' }
 * It works for one shared ID space or two; that choice is still open.
 */
const createTagRegistry = (entries) => {
 const registry = new Map();
 for (const entry of entries) {
  if (!entry.tag_id) throw new Error('tag entry missing tag_id');
  if (entry.kind === 'chapter' && !Number.isInteger(entry.chapter)) {
   throw new Error(`chapter tag ${entry.tag_id} needs a whole-number chapter`);
  }
  if (entry.kind === 'bean' && !entry.bean_id) throw new Error(`bean tag ${entry.tag_id} needs a bean_id`);
  if (entry.kind !== 'chapter' && entry.kind !== 'bean') throw new Error(`tag ${entry.tag_id} has unknown kind ${entry.kind}`);
  if (registry.has(entry.tag_id)) throw new Error(`duplicate tag_id ${entry.tag_id}`);
  registry.set(entry.tag_id, entry);
 }
 return registry;
};

/** Parses a tag URL. Returns null for anything that isn't one of ours. */
const parseTagUrl = (url, domain) => {
 let parsed;
 try {
  parsed = new URL(url);
 } catch {
  return null;
 }
 if (parsed.protocol !== 'https:' || parsed.hostname !== domain) return null;
 const match = parsed.pathname.match(/^\/t\/([A-Za-z0-9_-]+)\/?$/);
 if (!match) return null;
 return { tagId: match[1], e: parsed.searchParams.get('e'), c: parsed.searchParams.get('c') };
};

/**
 * Applies a tap. Returns { reader, event } with a new reader object; the
 * caller persists it. Events: chapter, unlock, already_unlocked, unknown, foreign.
 */
const applyTap = (reader, registry, url, domain) => {
 const tag = parseTagUrl(url, domain);
 if (!tag) return { reader, event: { type: 'foreign' } };

 const entry = registry.get(tag.tagId);
 if (!entry) return { reader, event: { type: 'unknown', tag_id: tag.tagId } };

 if (entry.kind === 'chapter') {
  // A sticker sets the position (re-reading moves it back); the app's
  // manual override covers missed or failed stickers.
  return {
   reader: { ...reader, position: entry.chapter },
   event: { type: 'chapter', chapter: entry.chapter, verified: false },
  };
 }

 if (reader.collection.has(entry.bean_id)) {
  return { reader, event: { type: 'already_unlocked', bean_id: entry.bean_id } };
 }
 const collection = new Set(reader.collection);
 collection.add(entry.bean_id);
 return { reader: { ...reader, collection }, event: { type: 'unlock', bean_id: entry.bean_id, verified: false } };
};

/**
 * Marks the book finished. Whether finishing also unlocks spoilers is an
 * open decision; until it's made, finishing does not, and the reader
 * unlocks them by choice in Settings.
 */
const finishBook = (reader, { unlocksSpoilers = false } = {}) => ({
 ...reader,
 finished: true,
 spoilersUnlocked: reader.spoilersUnlocked || unlocksSpoilers,
});

module.exports = { createReader, createTagRegistry, parseTagUrl, applyTap, finishBook };
