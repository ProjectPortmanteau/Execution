// boolean/runtime/citations.js
// Checks an answer's citations against the Sources Boolean was given.
// Every factual answer names the Beans it drew on; an answer whose
// citations are missing or point outside its Sources is marked unsupported
// so the app can show it as such.

'use strict';

const { NOT_IN_BOOK } = require('./constitution');

// Bracketed tokens that are provenance or corpus tags, not citations.
const TAGS = new Set(['D', 'R', 'O', 'N', 'C', 'P', '?']);

const extractCitations = (text) => {
 const ids = [];
 for (const match of String(text).matchAll(/\[([^\]\s]{1,64})\]/g)) {
  const id = match[1];
  if (!TAGS.has(id) && !ids.includes(id)) ids.push(id);
 }
 return ids;
};

const normalize = (text) => String(text).trim().toLowerCase().replace(/[‘’]/g, "'");
const isNotInBook = (text) => normalize(text).startsWith(normalize(NOT_IN_BOOK).replace(/\.$/, ''));

/**
 * Returns { citations, invalidCitations, supported, notInBook }.
 * citations: cited IDs that were among the Sources, in order of first use.
 * invalidCitations: cited IDs that were not.
 */
const checkCitations = (text, sources) => {
 const allowed = new Set(sources.map((b) => b.bean_id));
 const cited = extractCitations(text);
 const citations = cited.filter((id) => allowed.has(id));
 const invalidCitations = cited.filter((id) => !allowed.has(id));
 const notInBook = isNotInBook(text);
 return {
  citations,
  invalidCitations,
  notInBook,
  supported: invalidCitations.length === 0 && (citations.length > 0 || notInBook),
 };
};

module.exports = { extractCitations, checkCitations, isNotInBook };
