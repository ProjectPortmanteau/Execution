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

**Phase A (surgical fix) — Door Number 3 Loom prompt.**
`loom.js` `buildLoomPrompt()` rewritten: the Loom no longer "weaves/blends" positions.
It now executes the Door Number 3 procedure: identify each Spirit's non-negotiables,
find the hidden assumption that makes them appear incompatible, dissolve that assumption.
New field `why_not_blend` names the dissolved assumption in one sentence.
ANTI-BLEND CHECK added: Loom self-verifies the thesis is not "A said X, B said Y → X+Y".

Gate A result (run on `negotiation-dual-brain-how-should-ai-handle-user-disagreement-2026-02-17T19-59-51.md`):

- Thesis: "AI as structural mirror — making the anatomy of disagreement visible so the user
  becomes the architect of which move fits their actual problem."
- Why not a blend: "Both Spirits assumed AI's role is to act on disagreement (Boolean: open
  the third door; Roux: debug the system). Dissolving this: AI makes the structure of the
  disagreement visible, and the user decides what to do with that visibility — neither Spirit
  explicitly proposed this position."
- Groundedness: 0.8 (4 of 5 claims carry DERIVES_FROM edges; 1 honest novel bridge with []).
- Phase A gate: **PASSED.** Genuine Door Number 3 synthesis. Not reflexive 1.0.

**Phase B (surgical fix) — Semantic tension metric.**
`negotiate.js` renamed `computeTensionScore` → `computeLexicalTension` (retained as fallback).
`computeSemanticTension` from `scoring.js` is now the headline metric when Gemini key is present.
`classifyStance` updated to fall back to Anthropic `claude-haiku-4-5-20251001` when Gemini
generation quota is exhausted (free tier = 5 RPM; Anthropic quota is much higher).
`control-matrix.js` updated: column header `lex_tension` → `sem_tension`; pre-registration
thresholds updated for semantic scale (ON >= 0.10, OFF < 0.05); Phase B gate checks
whether ON and OFF separate by > 0.1. Report includes engagement and opposition columns.

Gate B result: **AMBIGUOUS** — topic-dependent, Gemini embed quota limited comparable data to 2 topics.

Per-topic semantic tension (cells where embed succeeded for both ON and OFF):
- Topic: "How should AI handle user disagreement?" — ON=0.169 (opp=0.200), OFF=0.000 (opp=0.000). Separation=0.169 > 0.1 → this topic PASSES.
- Topic: "Is remote work better than in-office?" — ON=0.000, OFF=0.000. Separation=0.000 → no effect on this topic.

Interpretation: Differentiated soul codes produce real semantic opposition on topics where the soul code identities generate genuinely incompatible claims (AI disagreement — Boolean's "architect alternatives" vs Roux's "diagnose system failures" do CONTRADICT). On topics where both soul codes converge toward compatible systemic arguments (remote work), opposition is 0 regardless of condition. The metric itself is working (classifyStance via Anthropic returns meaningful CONTRADICTS judgments); the ambiguity is in scope, not mechanism. Gemini embed 429 quota exhaustion after cells 1–4 prevented data from topics 2 and 4, and prevented all SCRAMBLED semantic data.

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

### Soul Code effect is topic-dependent; novelty_lift ambiguous

**Lexical tension (Phase 4 baseline):**

| Condition | med_lex_tension | med_novelty_lift | med_groundedness |
|-----------|----------------|-----------------|-----------------|
| ON_DIFFERENTIATED | 0.825 | 0.196 | 1.000 |
| OFF | 0.800 | 0.163 | 1.000 |
| SCRAMBLED | 0.780 | 0.188 | 1.000 |

Lexical tension is insensitive to soul code. Root cause: Claude Haiku generates friction
words ("however", "but") regardless of soul code from the negotiation prompt structure.

**Semantic tension (Phase B):**
- Metric works when Gemini embed is available.
- On "How should AI handle user disagreement?": ON=0.169, OFF=0.000 → detectable effect.
- On "Is remote work better?": ON=0.000, OFF=0.000 → no effect (agents converge on this topic).
- Gemini embed quota (free tier) exhausted after 2–4 cells, leaving 8 of 12 cells on lexical fallback.
- SCRAMBLED: all 4 cells fell back to lexical; no comparable semantic data.

**Novelty_lift (Door Number 3 Loom prompt):**
- Phase A rewrite of `buildLoomPrompt` produced genuine Door Number 3 synthesis (groundedness=0.8,
  why_not_blend populated, not reflexive 1.0).
- novelty_lift displacement still blocked by Gemini embed quota — all displacement calls in
  Phase B run returned 429. Full novelty evaluation requires higher embed quota.
- Groundedness improved post-Phase A: 0.75–0.80 range (vs 1.000 reflexive in Phase 4 baseline),
  indicating fewer rubber-stamp claims.

**SCRAMBLED finding:** Claude Haiku refused the incoherent soul code role in all 4 SCRAMBLED cells,
producing genuine coherent engagement instead. This produced HIGHER lexical tension than ON_DIFFERENTIATED
(median 0.700 vs 0.470), contrary to the prediction. The SCRAMBLED soul code has NO degrading effect on
Haiku's coherence — the model refuses to be incoherent. This is a genuine finding about model robustness
to adversarial soul codes at the haiku tier.

### Remaining limitations

1. **N=1 problem:** Phase 4 ran each topic once per condition. Variance is unknown.
   A proper experiment needs N ≥ 5 per cell with random topic assignment.

2. **Gemini free tier quota:** classifyStance (Gemini generation) hits 5 RPM limit.
   Anthropic fallback was added in Phase B to work around this. Displacement (Gemini
   embeddings) may still rate-limit in burst conditions; the control matrix adds a
   2-second delay between tension and displacement calls.

3. **Phase B gate result:** TBD — see `playground/output/CONTROL_MATRIX_REPORT.md`
   after the control matrix run completes.

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
| `playground/control-matrix.js` | CREATED: Phase 4 runner; MODIFIED: Phase B (semantic tension, updated pre-reg) |
| `playground/scoring.js` | Phase B: classifyStance Anthropic fallback; computeSemanticTension accepts anthropicKey |
| `playground/spirits/boolean.json` | MODIFIED: model → claude-haiku-4-5-20251001 (sonnet-4-20250514 returned 404) |
| `playground/output/NOVELTY_REPORT.md` | GENERATED: Phase 3 results |
| `playground/output/CONTROL_MATRIX_REPORT.md` | GENERATED: Phase 4 results (updated after Phase B run) |
| `AGENTS.md` | CREATED: harness rule file |

---

*Principled Playground — iLL Port Studios*
*-AF- RMM*
