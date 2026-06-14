// playground/transcript-parser.js
// Shared transcript parsing utilities. Imported by loom-rerun.js, novelty-report.js,
// and any other script that needs to extract structured content from negotiation
// markdown transcripts. Both DUAL-BRAIN and SINGLE-BRAIN formats are identical
// in heading structure (confirmed in Phase 0 audit).

'use strict';

/**
 * Extract the LAST "Round 3" positions for Boolean and Roux from a transcript.
 * Handles both the old transcript format (### Boolean / ### Roux headers) and
 * the newer saveOutput format. Returns empty strings if a section is not found.
 *
 * @param {string} md - Full transcript markdown
 * @returns {{ boolean_r3: string, roux_r3: string }}
 */
function extractRound3(md) {
  // Find the start of the final round (Round 3) section.
  const roundMatches = [...md.matchAll(/^#{1,3}\s*Round\s*3\b.*$/gim)];
  const startIdx = roundMatches.length ? roundMatches[roundMatches.length - 1].index : 0;
  const region = md.slice(startIdx);

  // Cut the region at the Loom synthesis / next top-level section if present.
  const stop = region.search(/^#{1,3}\s*(The Loom|JOINT BEAN|Stress Test|Tension)/im);
  const body = stop > 0 ? region.slice(0, stop) : region;

  // Grab text after a spirit header up to the next spirit header or rule.
  const grab = (who, text) => {
    const re = new RegExp(`^#{1,4}\\s*${who}\\b.*$|^\\*\\*${who}:?\\*\\*.*$`, 'im');
    const m = text.match(re);
    if (!m) return '';
    const after = text.slice(text.indexOf(m[0]) + m[0].length);
    const nextHdr = after.search(/^#{1,4}\s*(Boolean|Roux)\b|^\*\*(Boolean|Roux):?\*\*|^---\s*$/im);
    return (nextHdr > 0 ? after.slice(0, nextHdr) : after).trim();
  };

  return { boolean_r3: grab('Boolean', body), roux_r3: grab('Roux', body) };
}

/**
 * Extract the Nucleus (synthesis content) from the Loom section of a transcript.
 * Finds the text between "### Nucleus (Content)" and "### Shell (Metadata)".
 * Returns an empty string if either heading is absent.
 *
 * @param {string} md - Full transcript markdown
 * @returns {string}
 */
function extractNucleus(md) {
  const start = md.search(/^#{1,4}\s*Nucleus\s*\(Content\)/im);
  if (start === -1) return '';
  const after = md.slice(start);
  // Skip the heading line itself
  const bodyStart = after.indexOf('\n') + 1;
  const stop = after.search(/^#{1,4}\s*Shell\s*\(Metadata\)/im);
  const raw = stop > 0 ? after.slice(bodyStart, stop) : after.slice(bodyStart);
  return raw.trim();
}

module.exports = { extractRound3, extractNucleus };
