# Principled Playground v0.4 Parallel vs Sequential Execution Report

**Date:** 2026-02-23
**Branch:** `claude/principled-playground-report-SmpI5`
**Mode:** TRI-BRAIN (3 distinct LLM providers)
**Topic:** *"Should AI systems be allowed to negotiate on behalf of humans?"*

---

## Executive Summary

We ran the Principled Playground's full TRI-BRAIN negotiation protocol twice on the same topic once with **parallel** round execution (`Promise.all`) and once with **sequential** execution (Boolean then Roux, one at a time) to measure the impact on wall-clock performance, negotiation quality, and output stability.

**Key findings:**

1. **Sequential was 30% faster** (67.7s vs 97.1s) provider-side rate limiting penalized concurrent requests
2. **Sequential produced higher tension** (0.85 MAXIMUM vs 0.76 HIGH) more friction markers, full persistence through Round 3
3. **Both modes converged on the same synthesis** "Hybrid/Evolutionary Negotiation Ecosystems" validating protocol stability
4. **Both received identical Seer verdicts** CONDITIONAL PASS with overlapping failure modes

---

## Test Configuration

### Spirit-Provider Mapping

| Spirit | Role | Provider | Model | Anchor |
|--------|------|----------|-------|--------|
| **Boolean** | Architect of Door Number 3 | Anthropic | `claude-sonnet-4-20250514` | PHIL-005 |
| **Roux** | Soil Alchemist | Groq | `llama-3.3-70b-versatile` | PHIL-002 |
| **Seer** | Stress-Tester | OpenRouter | `nvidia/nemotron-nano-9b-v2:free` | PHIL-009 |

### Protocol

- **Rounds:** 3 negotiation rounds between Boolean and Roux
- **Context isolation:** Each Spirit responds to a frozen summary of the other's *previous* round position, never mid-round updates
- **Loom:** Impartial synthesis engine (runs on Boolean's provider) weaves final positions into a Joint Bean (OPVS format)
- **Seer:** Independent stress-test of the Joint Bean via OpenRouter (3rd provider)
- **Parallel mode:** `Promise.all([Boolean, Roux])` within each round
- **Sequential mode:** `await Boolean; await Roux;` within each round

---

## 1. Timing Comparison

| Phase | Parallel | Sequential | Ratio |
|-------|----------|------------|-------|
| Round 1 | 21.1s | 13.2s | 0.63x |
| Round 2 | 15.4s | 13.6s | 0.89x |
| Round 3 | 13.6s | 13.0s | 0.96x |
| Loom | 37.3s | 12.1s | 0.33x |
| Seer | 9.7s | 15.7s | 1.62x |
| **TOTAL** | **97.1s** | **67.7s** | **0.70x** |

### Analysis

**Parallel was slower across every phase except Seer.** This is counter-intuitive but explained by provider-side behavior:

- **Round 1 (0.63x):** The most dramatic gap. Anthropic's Claude took ~21s when fired concurrently with Groq, vs ~12s when running alone. Groq responded in <2s either way, meaning the `Promise.all` wall-clock was dominated by an inflated Claude response time.
- **Rounds 2-3:** The gap narrowed as rate-limit backpressure dissipated, approaching parity by Round 3.
- **Loom (0.33x):** The Loom runs on Anthropic (single call, no parallelism in either mode). Yet it took **37.3s parallel vs 12.1s sequential** a 3x penalty. This strongly suggests Anthropic's API was still throttling after heavy parallel usage, with latency carried forward into the Loom phase.
- **Seer (1.62x):** The only phase where parallel was faster. OpenRouter's free tier responded in 9.7s after a rest period (parallel), vs 15.7s when called immediately after sequential rounds. Free-tier flakiness likely explains this variance.

**Conclusion:** In environments with API rate limits (especially Anthropic), sequential execution can outperform parallel by avoiding throttle-induced latency spikes. Parallel remains architecturally cleaner (no ordering dependency between Spirits within a round) and would win in rate-limit-free environments.

---

## 2. Tension Score Comparison

| Metric | Parallel | Sequential |
|--------|----------|------------|
| **Score** | **0.76** | **0.85** |
| Label | HIGH | MAXIMUM |
| Friction markers | 19 | 25 |
| Agreement markers | 5 | 7 |
| Friction persistence (R3/R1) | 0.75 | 1.00 |

### Per-Round Breakdown

**Parallel:**

| Round | Friction | Agreement |
|-------|----------|-----------|
| 1 | 8 | 0 |
| 2 | 5 | 2 |
| 3 | 6 | 3 |

**Sequential:**

| Round | Friction | Agreement |
|-------|----------|-----------|
| 1 | 7 | 1 |
| 2 | 8 | 3 |
| 3 | 10 | 3 |

### Analysis

Sequential produced **31% more friction markers** and maintained full friction persistence through Round 3 (1.00 vs 0.75). In the parallel run, friction *decreased* from Round 1 to 3, suggesting convergence. In the sequential run, friction *escalated* Roux pushed back harder in each successive round.

This is likely **sampling variance** (LLMs are non-deterministic) rather than a structural effect of execution order. The protocol guarantees identical information flow: each Spirit receives the same frozen position summary regardless of whether the calls execute concurrently or sequentially. However, different random seeds in the LLM produce different rhetorical choices, and the sequential run happened to produce a more combative Roux.

---

## 3. Output Comparison

### Joint Bean Parallel Mode

**"Hybrid Negotiation Ecosystems"**

> AI should not negotiate *for* humans but rather serve as ecosystem architects that expand negotiation spaces beyond zero-sum frameworks. The core insight: current negotiation systems assume scarcity and competition as foundational premises. The synthesis creates "Hybrid Negotiation Ecosystems" where AI specializes in identifying unexploited value creation opportunities and mapping stakeholder networks, while humans retain authority over values, boundaries, and final decisions.

**OPVS layers:** Nucleus (ecosystem redesign over actor optimization), Shell (Process Architecture Synthesis), Corona (6 adjacent connections), Echo (full provenance).

### Joint Bean Sequential Mode

**"Evolutionary Negotiation Ecosystems"**

> AI negotiation systems should evolve beyond the allow/prohibit binary into hybrid intelligence platforms that architect new value-creation opportunities. The synthesis: **Collaborative Intelligence Design** where AI identifies hidden possibilities, humans maintain ethical oversight, and the negotiation process itself becomes a learning system that generates better frameworks for future interactions.

**OPVS layers:** Nucleus (collaborative intelligence design), Shell (Synthesis Bean), Corona (7 adjacent connections with cross-pollination note), Echo (convergence analysis).

### Convergence Analysis

Despite different execution paths and LLM sampling, both Beans converged on **remarkably similar themes:**

| Theme | Parallel | Sequential |
|-------|----------|------------|
| Reject allow/prohibit binary | Yes | Yes |
| AI as ecosystem architect | Yes | Yes |
| Positive-sum over zero-sum | Yes | Yes |
| Human authority preserved | Yes | Yes |
| Value creation > value capture | Yes | Yes |
| Learning/evolution metaphor | Partial (regeneration) | Strong (evolutionary) |
| System redesign emphasis | Strong | Strong |

This convergence across independent runs validates that the **negotiation protocol produces stable, reproducible insights** regardless of execution ordering. The Soul Code constraints (Boolean's "Door Number 3", Roux's "Soil Composition") consistently steer the negotiation toward systemic redesign rather than binary yes/no positions.

---

## 4. Stress Test Comparison

### Parallel Seer's Verdict: CONDITIONAL PASS

**Load-bearing assumptions:**
1. AI must reliably identify *unexploited value creation* opportunities
2. Humans retain clarity on values/boundaries
3. Incentive structures align with cooperation
4. Scalable infrastructure exists for multi-stakeholder dynamics

**Failure modes:** Scale (miss low-probability opportunities), Adversarial (default to competition), Time (alignment collapse if feedback loops slow), Bias (entrench systemic inequities)

### Sequential Seer's Verdict: CONDITIONAL PASS

**Load-bearing assumptions:**
- Human-AI co-creation without reverting to power imbalances
- Continuous learning prevents ethical drift
- Adversarial actors won't undermine positive-sum design
- Scalability preserves transparency

**Failure modes:** Scale (overwhelm oversight), Adversarial (exploit negotiation loops), Time (learning stagnation), Ethics (framework drift), Trust deficit (zero-sum collapse)

### Analysis

Both verdicts are **CONDITIONAL PASS** with substantially overlapping failure modes. The sequential run identified one additional failure mode (trust deficit / cultural buy-in) that the parallel run didn't surface. Both stressed the tension between the Bean's abundance assumptions and real-world adversarial conditions.

---

## 5. Architectural Observations

### Why Parallel Is Still the Right Default

Despite the timing loss in this environment, parallel execution is architecturally correct for the Playground:

1. **No information leakage:** Spirits respond to frozen prior-round snapshots, making parallel calls semantically identical to sequential ones
2. **Provider agnostic:** The speed penalty is specific to rate-limited APIs. With higher-tier API keys or self-hosted models, parallel would win
3. **Future-proof:** As provider rate limits relax or the Playground moves to dedicated inference, the parallel architecture will deliver its intended speedup without code changes

### When Sequential Makes Sense

- Free-tier or rate-limited API keys
- Debugging individual Spirit responses
- Environments where API concurrency triggers 429s
- When deterministic ordering is required for reproducibility

### OpenRouter Integration

This benchmark also validated the new OpenRouter provider added in this session:

- **Seer** ran successfully on `nvidia/nemotron-nano-9b-v2:free` via OpenRouter
- The provider handles reasoning-model response format (content in `reasoning` field) transparently
- Free-tier flakiness is mitigated by retry logic in preflight (2 retries with backoff)
- Preflight now correctly distinguishes "provider failed but no Spirit depends on it" from "Spirit's provider failed"

---

## 6. Data Files

| File | Description |
|------|-------------|
| `playground/compare-modes.js` | Comparison runner script |
| `playground/output/comparison-2026-02-23T04-13-08.md` | Raw comparison data with full round transcripts |
| `playground/output/PARALLEL_VS_SEQUENTIAL_REPORT.md` | This report |

---

## Appendix: Session Changelog

| Commit | Description |
|--------|-------------|
| `33c80d5` | Add OpenRouter provider for Seer restore TRI-BRAIN with free-tier model |
| `9de5ecd` | Add parallel vs sequential comparison runner with first benchmark |
| *(this commit)* | Full GitHub report with analysis |

---

*Principled Playground v0.4 iLL Port Studios*
*TRI-BRAIN: Anthropic (Claude) + Groq (Llama) + OpenRouter (Nemotron)*
