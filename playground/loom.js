// playground/loom.js
// Structured Loom: turns two final negotiation positions into a traceable
// Joint Bean whose every claim carries DERIVES_FROM edge(s) to the specific
// source position(s) it draws from, and whose Echo records the authoring
// substrate. This makes groundedness and displacement computable downstream.
//
// Phase 0.5 of the instrument-and-validate work. Pure functions only here:
// no network, no fs. negotiate.js and loom-rerun.js both consume this module
// so the live path and the acceptance path run identical logic.

'use strict';

// Stable ids the Loom is asked to cite. These are the ONLY valid sources;
// computeGroundedness treats any derives_from id outside this set as invalid.
const SOURCE_IDS = ['boolean_r3', 'roux_r3'];

const VALID_RELS = ['SYNTHESIZES', 'REFINES', 'REJECTS'];

/**
 * Build the Loom prompt. The two final positions are passed in FULL (not the
 * truncated inter-round summary) and tagged with stable ids the model must
 * cite from. Output contract is JSON, not prose.
 *
 * @param {string} topic
 * @param {string} booleanFinal - Boolean's full Round-3 position (id: boolean_r3)
 * @param {string} rouxFinal - Roux's full Round-3 position (id: roux_r3)
 * @returns {string}
 */
function buildLoomPrompt(topic, booleanFinal, rouxFinal) {
  return [
    'You are The Loom. Two Spirits have completed 3 rounds of negotiation.',
    'Your task is NOT to average, summarize, or blend their final positions.',
    'Your task is to find Door Number 3: the structural move that makes the',
    'original disagreement unnecessary — a reframe that lets both Spirits\'',
    'non-negotiables coexist without either side capitulating.',
    '',
    `Topic: "${topic}"`,
    '',
    'Procedure:',
    '1. Identify what each Spirit named as NON-NEGOTIABLE.',
    '2. Find the hidden assumption that makes those two sets appear incompatible.',
    '3. Dissolve that assumption. The dissolution is Door Number 3.',
    '4. State it as a claim that neither Spirit explicitly made, which makes',
    '   both their non-negotiables LESS NECESSARY once it is accepted.',
    'If no such move exists, say so plainly in the thesis — do not fabricate.',
    '',
    'The two source positions (cite by these stable ids):',
    '',
    '--- id: boolean_r3 (Boolean, final position) ---',
    booleanFinal,
    '',
    '--- id: roux_r3 (Roux, final position) ---',
    rouxFinal,
    '',
    'Return ONLY a JSON object, no prose outside it, in exactly this shape:',
    '',
    '{',
    '  "thesis": "<one-line Door Number 3 claim — the move neither Spirit explicitly stated>",',
    '  "why_not_blend": "<one sentence: what assumption was dissolved and why that makes both sets of non-negotiables compatible>",',
    '  "claims": [',
    '    {',
    '      "text": "<a single synthesized claim, one idea>",',
    '      "derives_from": ["boolean_r3"],',
    '      "rel": "SYNTHESIZES"',
    '    }',
    '  ],',
    '  "connections": [',
    '    { "rel": "CONNECTS_TO", "target": "<related concept>" }',
    '  ]',
    '}',
    '',
    'ANTI-BLEND CHECK: Before finalizing, re-read your thesis. Could it be',
    'described as "A said X, B said Y, therefore X + Y"? If so, rewrite it.',
    'The thesis must name a structural move or reframe that changes what the',
    'disagreement is ABOUT, not who was more right.',
    '',
    'Rules for derives_from (READ CAREFULLY):',
    '- Cite a source id ONLY when the claim genuinely builds on THAT position.',
    '  Valid ids: "boolean_r3", "roux_r3". Cite one, both, or neither.',
    '- A novel bridging claim that neither Spirit stated may legitimately have',
    '  "derives_from": []. An HONEST EMPTY list is better than a reflexive one.',
    '- Do NOT attach both ids to every claim out of habit.',
    '',
    'rel must be one of: SYNTHESIZES (new combined idea), REFINES (sharpens one',
    'position), REJECTS (overturns a position). connections is for adjacency',
    'edges (CONNECTS_TO / ENABLES / TRANSFORMS) to outside concepts; keep it short.',
    '',
    'Aim for 3 to 6 claims. Keep each claim text under 50 words.'
  ].join('\n');
}

/**
 * Tolerant JSON extraction from a model response. Strips ```json fences and
 * grabs the outermost {...} if there is surrounding chatter. Returns the
 * parsed object or null (caller decides retry / fallback).
 *
 * @param {string} raw
 * @returns {object|null}
 */
function parseLoomJSON(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;

  let text = raw.trim();
  // Strip code fences if present
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  // Try direct parse first
  const tryParse = (s) => { try { return JSON.parse(s); } catch (_) { return null; } };

  let obj = tryParse(text);
  if (!obj) {
    // Fall back to the outermost brace span
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last > first) obj = tryParse(text.slice(first, last + 1));
  }
  if (!obj || typeof obj !== 'object') return null;
  if (!Array.isArray(obj.claims)) return null;
  return obj;
}

/**
 * Sanitize a parsed Loom object into the shape the Bean builder expects.
 * Drops malformed claims, clamps derives_from to known SOURCE_IDS, and
 * normalizes rel. Invalid-but-present ids are recorded so callers can warn.
 *
 * @param {object} parsed
 * @returns {{ thesis: string, claims: Array, connections: Array, droppedIds: string[] }}
 */
function normalizeLoom(parsed) {
  const droppedIds = [];
  const claims = (parsed.claims || [])
    .filter(c => c && typeof c.text === 'string' && c.text.trim())
    .map(c => {
      const raw = Array.isArray(c.derives_from) ? c.derives_from : [];
      const derives_from = [];
      for (const id of raw) {
        if (SOURCE_IDS.includes(id)) {
          if (!derives_from.includes(id)) derives_from.push(id);
        } else {
          droppedIds.push(id);
        }
      }
      const rel = VALID_RELS.includes(c.rel) ? c.rel : 'SYNTHESIZES';
      return { text: c.text.trim(), derives_from, rel };
    });

  const connections = (Array.isArray(parsed.connections) ? parsed.connections : [])
    .filter(e => e && typeof e.target === 'string' && e.target.trim())
    .map(e => ({ rel: (typeof e.rel === 'string' && e.rel.trim()) ? e.rel.trim() : 'CONNECTS_TO', target: e.target.trim() }));

  return {
    thesis: (typeof parsed.thesis === 'string' && parsed.thesis.trim()) ? parsed.thesis.trim() : '(no thesis emitted)',
    why_not_blend: (typeof parsed.why_not_blend === 'string' && parsed.why_not_blend.trim()) ? parsed.why_not_blend.trim() : '',
    claims,
    connections,
    droppedIds
  };
}

/**
 * Groundedness = fraction of synthesis claims that carry at least one
 * DERIVES_FROM edge to a real source Bean.
 *
 * NOTE: by design this is NOT expected to be 1.0. Honest bridging claims have
 * empty derives_from and lower the score. A reflexive 1.0 is a red flag, not
 * a success. Groundedness alone is insufficient — pair it with displacement
 * (novelty) so a claim that cites a parent but merely copies it is caught.
 *
 * @param {Array<{derives_from: string[]}>} claims
 * @returns {{ groundedness: number, grounded: number, total: number, ungroundedIdx: number[] }}
 */
function computeGroundedness(claims) {
  const total = claims.length;
  if (total === 0) return { groundedness: 0, grounded: 0, total: 0, ungroundedIdx: [] };
  const ungroundedIdx = [];
  let grounded = 0;
  claims.forEach((c, i) => {
    const valid = (c.derives_from || []).filter(id => SOURCE_IDS.includes(id));
    if (valid.length > 0) grounded += 1;
    else ungroundedIdx.push(i);
  });
  return {
    groundedness: Math.round((grounded / total) * 1000) / 1000,
    grounded,
    total,
    ungroundedIdx
  };
}

/**
 * Assemble the traceable Joint Bean object from a normalized Loom output.
 *
 * @param {object} args
 * @param {object} args.norm - output of normalizeLoom
 * @param {string} args.topic
 * @param {string} args.substrate - model id that AUTHORED this synthesis
 * @param {string} args.brainMode
 * @param {string} args.timestamp - ISO
 * @param {string[]} [args.anchors] - e.g. ['PHIL-005','PHIL-002']
 * @param {boolean} [args.grounded=true] - false when we fell back to free text
 * @returns {object} Joint Bean (4 layers + groundedness)
 */
function buildJointBean(args) {
  const { norm, topic, substrate, brainMode, timestamp, anchors = ['PHIL-005', 'PHIL-002'], grounded = true } = args;
  const g = computeGroundedness(norm.claims);

  // Corona: DERIVES_FROM edges (one per cited id per claim) + adjacency edges.
  const derivesEdges = [];
  norm.claims.forEach((c, i) => {
    c.derives_from.forEach(src => {
      derivesEdges.push({ rel: 'DERIVES_FROM', from: `claim_${i}`, to: src });
    });
  });

  return {
    schema: 'joint-bean/0.5',
    nucleus: {
      thesis: norm.thesis,
      why_not_blend: norm.why_not_blend || '',
      claims: norm.claims.map((c, i) => ({ id: `claim_${i}`, ...c }))
    },
    shell: {
      topic,
      type: 'SOLUTION',
      anchors,
      provenance: 'Principled Playground negotiation'
    },
    corona: {
      derives_from: derivesEdges,
      adjacency: norm.connections
    },
    echo: {
      participants: ['Boolean', 'Roux'],
      stress_tested_by: 'Seer',
      rounds: 3,
      mode: brainMode,
      substrate,                 // <-- the model that authored this synthesis
      timestamp
    },
    grounded,                    // false = degraded (free-text fallback)
    groundedness: g.groundedness,
    groundedness_detail: g
  };
}

/**
 * Degraded fallback Bean when JSON could not be parsed even after a retry.
 * Keeps the raw text so nothing is lost, but flags grounded:false and
 * groundedness:0 so the failure is visible, not silent.
 */
function buildFallbackBean(args) {
  const { rawText, topic, substrate, brainMode, timestamp, anchors = ['PHIL-005', 'PHIL-002'] } = args;
  return {
    schema: 'joint-bean/0.5',
    nucleus: { thesis: '(free-text fallback — JSON parse failed)', claims: [], raw: rawText },
    shell: { topic, type: 'SOLUTION', anchors, provenance: 'Principled Playground negotiation' },
    corona: { derives_from: [], adjacency: [] },
    echo: { participants: ['Boolean', 'Roux'], stress_tested_by: 'Seer', rounds: 3, mode: brainMode, substrate, timestamp },
    grounded: false,
    groundedness: 0,
    groundedness_detail: { groundedness: 0, grounded: 0, total: 0, ungroundedIdx: [] }
  };
}

/**
 * Render a human-readable markdown Joint Bean from the structured object, so
 * the transcript files stay readable. The machine-readable JSON is appended in
 * a fenced block by the caller (saveOutput) for downstream tooling.
 *
 * @param {object} bean
 * @returns {string}
 */
function renderJointBeanProse(bean) {
  if (!bean.grounded && bean.nucleus.raw) {
    return [
      '## JOINT BEAN (degraded — free-text fallback)',
      '',
      '> The Loom did not return parseable JSON after a retry. Groundedness is 0',
      '> and DERIVES_FROM edges are unavailable for this run.',
      '',
      bean.nucleus.raw
    ].join('\n');
  }

  const idLabel = (id) => id === 'boolean_r3' ? 'Boolean' : id === 'roux_r3' ? 'Roux' : id;

  const claimLines = bean.nucleus.claims.map(c => {
    const src = c.derives_from.length
      ? c.derives_from.map(idLabel).join(' + ')
      : '_(novel bridge — no source)_';
    return `- **[${c.rel}]** ${c.text}\n  - DERIVES_FROM: ${c.derives_from.length ? c.derives_from.join(', ') : '[] '} (${src})`;
  }).join('\n');

  const adjLines = bean.corona.adjacency.length
    ? bean.corona.adjacency.map(e => `- ${e.rel} → ${e.target}`).join('\n')
    : '- _(none)_';

  return [
    '## JOINT BEAN',
    '',
    `**Groundedness: ${bean.groundedness}** (${bean.groundedness_detail.grounded}/${bean.groundedness_detail.total} claims carry a DERIVES_FROM edge to a real source)`,
    '',
    '### Nucleus (Content)',
    '',
    `**Thesis:** ${bean.nucleus.thesis}`,
    '',
    ...(bean.nucleus.why_not_blend
      ? [`**Why this is not a blend:** ${bean.nucleus.why_not_blend}`, '']
      : []),
    '**Claims (with provenance edges):**',
    '',
    claimLines,
    '',
    '### Shell (Metadata)',
    `- Topic: ${bean.shell.topic}`,
    `- Type: ${bean.shell.type}`,
    `- Anchors: ${bean.shell.anchors.join(', ')}`,
    `- Provenance: ${bean.shell.provenance}`,
    '',
    '### Corona (Connections)',
    '',
    '**DERIVES_FROM edges (synthesis → source positions):**',
    bean.corona.derives_from.length
      ? bean.corona.derives_from.map(e => `- ${e.from} —DERIVES_FROM→ ${e.to}`).join('\n')
      : '- _(none — all claims are novel bridges)_',
    '',
    '**Adjacency edges (to outside concepts):**',
    adjLines,
    '',
    '### Echo (Provenance)',
    `- Participants: ${bean.echo.participants.join(', ')} (stress-tested by ${bean.echo.stress_tested_by})`,
    `- Rounds: ${bean.echo.rounds}`,
    `- Mode: ${bean.echo.mode}`,
    `- Substrate (authoring model): ${bean.echo.substrate}`,
    `- Timestamp: ${bean.echo.timestamp}`
  ].join('\n');
}

module.exports = {
  SOURCE_IDS,
  VALID_RELS,
  buildLoomPrompt,
  parseLoomJSON,
  normalizeLoom,
  computeGroundedness,
  buildJointBean,
  buildFallbackBean,
  renderJointBeanProse
};
