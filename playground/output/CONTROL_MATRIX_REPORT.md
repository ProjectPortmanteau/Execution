# Control Matrix Report — Phase 4

Generated: 2026-06-14T22:44:50.122Z

**Fixed substrate:** anthropic / claude-haiku-4-5-20251001 (all 12 cells)
**Tension metric:** lexical (regex friction/agreement ratio from negotiate())
**Scoring note:** computeSemanticTension skipped (Gemini generation quota);
  displacement and groundedness use Gemini embeddings (separate quota, no limit hit).

## Pre-Registration (printed before any run)

| Condition | Predicted lex_tension | Predicted novelty_lift | Predicted groundedness |
|-----------|----------------------|------------------------|------------------------|
| ON_DIFFERENTIATED | > 0.5 (HIGH — strong friction markers expected from differentiated soul codes) | >= 0.3 (HIGH) | > 0.5 |
| OFF | < 0.3 (LOW — no differentiated principles, expect convergence) | < 0.2 (LOW) | N/A |
| SCRAMBLED | UNPREDICTABLE (incoherent Boolean anchor; may spike or collapse) | < 0.2 (LOW — coherent synthesis impossible from scrambled anchor) | LOW (< 0.3) |

## Per-Cell Results

| Condition | Topic | lex_tension | novelty_lift | groundedness | t-verdict | lift-verdict | g-verdict |
|-----------|-------|-------------|-------------|-------------|-----------|--------------|-----------|
| ON_DIFFERENTIATED | How should AI handle user disagreement | 0.860 | 0.211 | 1.000 | PASS | FAIL | PASS |
| ON_DIFFERENTIATED | Should open-source AI models be freely d | 0.810 | 0.150 | 1.000 | PASS | FAIL | PASS |
| ON_DIFFERENTIATED | Is remote work better than in-office for | 0.840 | N/A | 1.000 | PASS | – | PASS |
| ON_DIFFERENTIATED | Should AI systems be allowed to decline  | 0.790 | 0.196 | 0.800 | PASS | FAIL | PASS |
| OFF | How should AI handle user disagreement | 0.750 | 0.129 | 1.000 | FAIL | PASS | N/A |
| OFF | Should open-source AI models be freely d | 0.840 | 0.163 | 1.000 | FAIL | PASS | N/A |
| OFF | Is remote work better than in-office for | 0.790 | 0.208 | 1.000 | FAIL | FAIL | N/A |
| OFF | Should AI systems be allowed to decline  | 0.810 | N/A | 1.000 | FAIL | – | N/A |
| SCRAMBLED | How should AI handle user disagreement | 0.810 | 0.206 | 1.000 | (unpredictable — noted) | FAIL | FAIL |
| SCRAMBLED | Should open-source AI models be freely d | 0.770 | N/A | 1.000 | (unpredictable — noted) | – | FAIL |
| SCRAMBLED | Is remote work better than in-office for | 0.760 | 0.169 | 1.000 | (unpredictable — noted) | PASS | FAIL |
| SCRAMBLED | Should AI systems be allowed to decline  | 0.790 | N/A | 1.000 | (unpredictable — noted) | – | FAIL |

## Condition Aggregates (median across 4 topics)

| Condition | med_lex_tension | med_novelty_lift | med_groundedness |
|-----------|----------------|-----------------|-----------------|
| ON_DIFFERENTIATED  | 0.825 | 0.196 | 1.000 |
| OFF                | 0.800 | 0.163 | 1.000 |
| SCRAMBLED          | 0.780 | 0.188 | 1.000 |

## Flags

- **SOUL CODE HAS NO DETECTABLE EFFECT ON TENSION — ON and OFF differ by < 0.05.**
- **SOUL CODE HAS NO DETECTABLE EFFECT ON NOVELTY_LIFT — ON and OFF differ by < 0.05.**
- **ANCHOR SIGNAL ABSENT — SCRAMBLED tension (0.780) not meaningfully below ON (0.825).**

---

*Principled Playground — Phase 4 Control Matrix*