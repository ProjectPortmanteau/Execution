# Principled Playground — Phase Summary

Generated: 2026-06-14

## What was built

A four-phase instrumentation and validation stack on a multi-agent negotiation system.
Two AI spirits (Boolean, Roux) negotiate contested topics across 3 rounds. A synthesis
engine (The Loom) produces a structured Joint Bean with traceable DERIVES_FROM edges.

### Phases completed

**Phase 0 — Honest audit.**
Found: tension score was lexical regex only; Loom emitted no traceable edges;
isolation was 8-line truncation. Provider abstraction was clean. All findings
committed to `playground/AUDIT.md`.

**Phase 0.5 — Loom patch.**
Loom output contract changed to structured JSON with DERIVES_FROM edges on each claim.
`loom.js` exports: `buildLoomPrompt`, `parseLoomJSON`, `normalizeLoom`,
`computeGroundedness`, `buildJointBean`, `buildFallbackBean`, `renderJointBeanProse`.
Anti-rubber-stamp guard: groundedness = 1.0 is flagged as a suspicious signal, not a good one.
Test suite: `loom.test.js` (11 checks, all pass).

**Phase 1 — Gemini provider + embed().**
`provider.js` gained `embed(text, apiKey)` using `gemini-embedding-001` (3072-dim).
`gemini` added as a named provider (alias for `callGoogle`, distinct key slot).
`preflight.js` includes embed preflight check.

**Phase 2 — Semantic scoring module.**
`scoring.js` exports: `cosineSim`, `splitClaims`, `embedText`, `classifyStance`,
`computeSemanticTension`, `computeDisplacement`, `computeGroundedness`.
`SCORING_FIXTURE=1` env var bypasses all API calls for CI.
`fixtureEmbed` returns deterministic 3072-dim unit vectors seeded from char codes.
Test suite: `scoring.test.js` (20 checks, all pass including 3-case discrimination).

**Phase 3 — Novelty report on real transcripts.**
`transcript-parser.js`: `extractRound3`, `extractNucleus`.
`novelty-report.js` ran on existing transcripts with live Gemini embeddings.

Gate result: **AMBIGUOUS** (median novelty_lift = 0.16, between FAIL threshold 0.1 and PASS threshold 0.3).
Balance was very low (0.008–0.034), indicating the Loom blends equally from both parents
rather than synthesizing beyond them.

**Phase 4 — Control matrix.**
`control-matrix.js` ran 12 cells: 4 topics × 3 conditions (ON_DIFFERENTIATED, OFF, SCRAMBLED).
Fixed substrate: `claude-haiku-4-5-20251001` (Anthropic). Gemini used for embeddings only.
Pre-registration table printed before any API call.

---

## What is demonstrated

- The two spirits (Boolean PHIL-005, Roux PHIL-002) produce qualitatively differentiated
  positions across all four topics. The transcripts show distinct framings, non-negotiables,
  and synthesis opportunities that reflect the soul codes. This is visible in the content.

- The Loom reliably produces structured JSON with DERIVES_FROM edges. Groundedness = 1.000
  across all 12 Phase 4 cells, including SCRAMBLED. The harness is structurally sound.

- The pre-registration-then-run design was honored: predictions were committed before any
  API call. Three flags fired; none was suppressed.

---

## What is NOT demonstrated

### Soul Code has no detectable effect on current metrics

Control matrix aggregate medians:

| Condition | med_lex_tension | med_novelty_lift | med_groundedness |
|-----------|----------------|-----------------|-----------------|
| ON_DIFFERENTIATED | 0.825 | 0.196 | 1.000 |
| OFF | 0.800 | 0.163 | 1.000 |
| SCRAMBLED | 0.780 | 0.188 | 1.000 |

Difference between ON and OFF: tension=0.025, novelty_lift=0.033. Both below the flag
threshold. The soul code influence is visible in the qualitative transcript content but
not in the lexical tension or embedding displacement metrics as currently defined.

**Root cause (tension metric):** The lexical tension metric counts friction words
("however", "but", "disagree", etc.). Claude Haiku generates these regardless of soul
code because the negotiation prompt structure already elicits them. The metric is
insensitive to soul code calibration.

**Root cause (novelty_lift):** novelty_lift of ~0.15–0.21 is consistent across all
conditions. The Loom blends equally from both parents (balance ~0.01–0.05) regardless
of what those parents said. The Loom prompt asks to "weave" the positions — this
produces synthesis geometrically close to the midpoint of A and B, hence low
displacement from either.

### Proposed fixes (not yet implemented)

1. **Tension metric:** Replace lexical regex with `computeSemanticTension` (engagement × opposition).
   This requires Gemini generation capacity beyond free tier (5 RPM). Semantic tension
   would distinguish conditions where content diverges without friction words.

2. **Novelty lift:** Change the Loom prompt from "weave their final positions" to:
   > "Do NOT summarize the two positions. Instead:
   > 1. Find the hidden assumption that each Spirit makes about the topic.
   > 2. Identify the constraint that, if dissolved, would allow both positions to coexist.
   > 3. Construct a claim that neither Spirit stated, which makes both positions LESS necessary
   >    once it is accepted — this is Door Number 3."
   This "Door Number 3 lift function" is documented in `LOOM_FINDING.md`.

3. **N=1 problem:** Phase 4 ran each topic once per condition. Variance is unknown.
   A proper experiment needs N ≥ 5 per cell with random topic assignment.

---

## Files changed (all phases)

| File | Action |
|------|--------|
| `playground/AUDIT.md` | CREATED: Phase 0 findings |
| `playground/loom.js` | CREATED: structured Bean output, DERIVES_FROM edges |
| `playground/loom.test.js` | CREATED: 11 checks |
| `playground/loom-rerun.js` | MODIFIED: imports from transcript-parser |
| `playground/provider.js` | MODIFIED: embed(), gemini alias, fallback chain |
| `playground/preflight.js` | MODIFIED: gemini key, embed preflight |
| `playground/negotiate.js` | MODIFIED: Loom integration, injectable spirits, gemini key |
| `playground/scoring.js` | CREATED: full semantic scoring module |
| `playground/scoring.test.js` | CREATED: 20 checks including 3-case discrimination |
| `playground/transcript-parser.js` | CREATED: extractRound3, extractNucleus |
| `playground/novelty-report.js` | CREATED: Phase 3 runner |
| `playground/control-matrix.js` | CREATED: Phase 4 runner |
| `playground/output/NOVELTY_REPORT.md` | GENERATED: Phase 3 results |
| `playground/output/CONTROL_MATRIX_REPORT.md` | GENERATED: Phase 4 results |
| `AGENTS.md` | CREATED: harness rule file |

---

*Principled Playground — iLL Port Studios*
*-AF- RMM*
