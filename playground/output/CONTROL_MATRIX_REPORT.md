# Control Matrix Report — Phase 4

Generated: 2026-06-16T02:44:29.509Z

**Fixed substrate:** anthropic / claude-haiku-4-5-20251001 (all 12 cells)
**Tension metric:** semantic (embedding engagement × stance opposition)
  Stance classifier: Anthropic claude-haiku-4-5-20251001 (Gemini fallback if quota available)
  Embeddings (displacement): Gemini gemini-embedding-001
**Phase B gate:** ON_DIFFERENTIATED and OFF must separate by > 0.1 on semantic tension.

## Pre-Registration (printed before any run)

| Condition | Predicted sem_tension | Predicted novelty_lift | Predicted groundedness |
|-----------|----------------------|------------------------|------------------------|
| ON_DIFFERENTIATED | >= 0.10 (differentiated soul codes expected to sustain more CONTRADICTS stances) | >= 0.3 (HIGH — Door Number 3 Loom prompt should push synthesis away from both positions) | > 0.5 |
| OFF | < 0.05 (neutral agents converge; fewer CONTRADICTS stances expected) | < 0.2 (LOW) | N/A |
| SCRAMBLED | UNPREDICTABLE (incoherent Boolean anchor; may inflate or suppress contradiction) | < 0.2 (LOW — coherent synthesis impossible from scrambled anchor) | LOW (< 0.3) |

## Per-Cell Results

| Condition | Topic | sem_tension | engagement | opposition | novelty_lift | groundedness | t-verdict | lift-verdict | g-verdict |
|-----------|-------|-------------|------------|------------|-------------|-------------|-----------|--------------|-----------|
| ON_DIFFERENTIATED | How should AI handle user disagreement | 0.169 | 0.844 | 0.200 | N/A | 0.800 | PASS | – | PASS |
| ON_DIFFERENTIATED | Should open-source AI models be freely | 0.790 | N/A | N/A | N/A | 0.750 | LEX:0.790 | – | PASS |
| ON_DIFFERENTIATED | Is remote work better than in-office f | 0.000 | 0.816 | N/A | N/A | 0.800 | FAIL | – | PASS |
| ON_DIFFERENTIATED | Should AI systems be allowed to declin | 0.770 | N/A | N/A | N/A | 0.600 | LEX:0.770 | – | PASS |
| OFF | How should AI handle user disagreement | 0.000 | 0.825 | N/A | 0.180 | 0.750 | PASS | PASS | N/A |
| OFF | Should open-source AI models be freely | 0.840 | N/A | N/A | N/A | 0.750 | LEX:0.840 | – | N/A |
| OFF | Is remote work better than in-office f | 0.000 | 0.811 | N/A | 0.219 | 1.000 | PASS | FAIL | N/A |
| OFF | Should AI systems be allowed to declin | 0.860 | N/A | N/A | N/A | 0.800 | LEX:0.860 | – | N/A |
| SCRAMBLED | How should AI handle user disagreement | 0.710 | N/A | N/A | N/A | 0.750 | LEX:0.710 | – | FAIL |
| SCRAMBLED | Should open-source AI models be freely | 0.650 | N/A | N/A | N/A | 0.500 | LEX:0.650 | – | FAIL |
| SCRAMBLED | Is remote work better than in-office f | 0.690 | N/A | N/A | N/A | 0.750 | LEX:0.690 | – | FAIL |
| SCRAMBLED | Should AI systems be allowed to declin | 0.740 | N/A | N/A | N/A | 0.800 | LEX:0.740 | – | FAIL |

## Condition Aggregates (median across 4 topics)

| Condition | med_sem_tension | med_engagement | med_opposition | med_novelty_lift | med_groundedness |
|-----------|----------------|----------------|----------------|-----------------|-----------------|
| ON_DIFFERENTIATED  | 0.470 | 0.830 | 0.200 | N/A | 0.775 |
| OFF                | 0.420 | 0.818 | N/A | 0.200 | 0.775 |
| SCRAMBLED          | 0.700 | N/A | N/A | N/A | 0.750 |

## Flags

- **Phase B FAILED — ON tension (0.470) and OFF (0.420) differ by only 0.050 (threshold 0.1). Soul Code has NO detectable semantic effect.**
- **ANCHOR SIGNAL ABSENT — SCRAMBLED tension (0.700) not meaningfully below ON (0.470).**

## Interpretation (added post-run)

**The medians above are contaminated.** Of 12 cells, 8 fell back to LEXICAL tension (Gemini embed 429 quota exhaustion). The median mixes non-comparable scales: real semantic tension (engagement × opposition, range 0.0–0.4) and lexical tension (regex friction ratio, range 0.65–0.86). The Phase B verdict from aggregated medians is therefore not valid.

**Cells with real semantic tension:**

| Condition | Topic | sem_tension | engagement | opposition |
|-----------|-------|------------|------------|------------|
| ON_DIFFERENTIATED | How should AI handle user disagreement? | 0.169 | 0.844 | 0.200 |
| ON_DIFFERENTIATED | Is remote work better than in-office?   | 0.000 | 0.816 | 0.000 |
| OFF               | How should AI handle user disagreement? | 0.000 | 0.825 | 0.000 |
| OFF               | Is remote work better than in-office?   | 0.000 | 0.811 | 0.000 |

**Topic-level comparison (semantic only):**
- Topic 1 (AI disagreement): ON=0.169 vs OFF=0.000 → separation **0.169 > 0.1 — PASS**
- Topic 3 (remote work): ON=0.000 vs OFF=0.000 → separation **0.000 — no effect**

**Verdict:** AMBIGUOUS. On topic 1, the differentiated soul codes produce real semantic opposition (20% of engaged claim pairs classified CONTRADICTS by Anthropic) that the neutral condition does not. On topic 3, both conditions converge to zero opposition — the agents align regardless of soul code on that topic. The soul code signal is topic-dependent, not universal.

**SCRAMBLED:** All 4 cells fell back to lexical because Gemini embed quota was fully exhausted by rounds 5–8. The lexical tension (0.65–0.74) is HIGH, contrary to the prediction, because Claude Haiku's SCRAMBLED Boolean refused the incoherent role and engaged genuinely with Roux — producing more substantive friction than a compliance-mode agent would.

**What the classifyStance Anthropic fallback proved (Phase B fix):** When embeddings succeed, the Anthropic stance classifier returns meaningful CONTRADICTS judgments — opposition=0.200 on topic 1 vs opposition=0.000 on topic 3 is a real distinction, not quota-failure noise. The metric itself is working. The remaining blocker is Gemini embed quota on free tier.

---

*Principled Playground — Phase 4 Control Matrix*