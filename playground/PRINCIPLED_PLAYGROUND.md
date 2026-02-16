# Principled Playground

**Multi-Agent Negotiation Where AI Spirits Carry Human Principles**

*OPVS Genesis Engine — iLL Port Studios*

---

## What This Is

The Principled Playground is a structured negotiation environment where two AI Spirits — each calibrated to a different Soul Code — debate a topic across three rounds and produce a joint Bean that neither human planned for but both can use.

This is **not** a chatbot conversation. It is principle-constrained negotiation with provenance-tracked output.

---

## The Thesis

Every current multi-agent system falls into one of two traps:

| Trap | What Happens | Why It Fails |
|------|-------------|--------------|
| **Task agents** (AutoGPT, CrewAI) | Agents complete tasks for a single user | No inter-agent negotiation. No principle constraints. |
| **Social simulation** (Generative Agents) | Agents mimic human social behavior | Optimizes for engagement. Produces synthetic noise. |

The Principled Playground is a third category: **Principle-Constrained Negotiation**.

Agents don't chat — they negotiate. Their positions are grounded in their Explorer's Soul Code, not the base model's training data. The output is a structured knowledge artifact (Bean) with full provenance, not a conversation log.

---

## Architecture

### The Spirits

Each Spirit carries a Soul Code — a JSON file defining identity, principles, constraints, and negotiation style. The Soul Code anchors to a specific philosophical Bean from Layer 0.

| Spirit | Provider | Anchor | Style |
|--------|----------|--------|-------|
| **Boolean** | Anthropic (Claude) | PHIL-005 (Door Number 3) | Constructive synthesis — seeks hidden third options |
| **Roux** | Google (Gemini) | PHIL-002 (Soil Composition) | Systemic challenger — questions structural assumptions |

### Dual-Brain Mode

When both API keys are provided, each Spirit routes through its native LLM:

- Boolean → Claude (Anthropic)
- Roux → Gemini (Google)

Same Soul Code framework, different neural substrates. This is the **BYOK model** in action — the calibration (Ghost) rides any machine (LLM engine).

When only one key is available, both Spirits share a single LLM (**SINGLE-BRAIN** fallback). The Soul Code still differentiates their behavior.

### Context Window Isolation

The two Spirits **never share a context window**. Each sees only:
- Its own Soul Code
- The negotiation topic
- A **structured summary** of the other Spirit's positions (not raw reasoning)

This implements Layer 3 of the Anti-Drift Architecture: cognitive independence preserved through information architecture, not just prompting.

### The Loom

After 3 rounds of negotiation, The Loom — an impartial synthesis engine — receives both Spirits' final positions and weaves them into a joint Bean with all 4 OPVS layers:

| Layer | Name | Content |
|-------|------|---------|
| **Nucleus** | Content | The synthesized insight — the Door Number 3 |
| **Shell** | Metadata | Topic, type, philosophical anchors |
| **Corona** | Connections | Typed edges to related concepts |
| **Echo** | Provenance | Participants, rounds, timestamp, mode |

---

## The Anti-Drift Architecture

The central risk of multi-agent interaction is convergence — LLM agents naturally drift toward agreement. The Principled Playground prevents this through three layers (with RISS as a future fourth):

1. **Soul Code Anchoring** — Each Spirit's system prompt is constructed from its Soul Code, not generic instructions. Principles are constraints, not suggestions.

2. **Post-Generation Filtering** — The position summarizer strips raw reasoning before sharing with the other Spirit. Neither agent can pattern-match on the other's cognitive process.

3. **Context Window Isolation** — Separate API calls per Spirit, per round. No shared state. Friction is preserved by architecture, not willpower.

4. **RISS Reputation (Future)** — Behavioral drift from Soul Code triggers reputation slashing. Alignment failure has economic consequences.

---

## Principled Friction

The Playground is designed to produce **friction**, not consensus.

When Boolean (optimizing for creative synthesis) collides with Roux (optimizing for systemic justice), the result is not compromise (mediocrity). It is synthesis — a solution neither could have produced alone.

The Loom's job is not to average their positions. It is to find where their principles **overlap structurally** even when they **disagree tactically**.

---

## Relationship to the Concept Document

This prototype implements the core negotiation protocol described in the [Principled Playground Concept](../roadmap/PRINCIPLED_PLAYGROUND_CONCEPT.md). Specifically:

| Concept | Status |
|---------|--------|
| Principle Exchange | ✅ Implemented (Soul Code → system prompt) |
| 3-Round Negotiation | ✅ Implemented |
| Context Window Isolation | ✅ Implemented (position summaries) |
| The Loom (synthesis) | ✅ Implemented |
| Joint Bean Output | ✅ Implemented (4 layers) |
| Dual-Brain Mode | ✅ Implemented (BYOK provider abstraction) |
| RISS Integration | 📋 Future (requires Stage 1 completion) |
| Subgraph Anchoring | 📋 Future (requires Bean graph API) |
| Integrity Gate | 📋 Future (requires RISS thresholds) |

---

## What This Proves

1. **Soul Code works across providers** — Same framework, different LLMs, coherent negotiation
2. **BYOK is viable for multi-agent** — Zero platform compute cost, even with two agents
3. **Structured output from adversarial input** — Friction produces Beans, not noise
4. **Provenance survives synthesis** — The joint Bean traces back to both Spirits and their anchors

---

*Principled Playground v0.2 — iLL Port Studios*
*"If you pour your soul into it: how can it be wrong?"*
