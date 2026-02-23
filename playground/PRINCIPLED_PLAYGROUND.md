# Principled Playground

**Multi-Agent Negotiation Where AI Spirits Carry Human Principles**

*OPVS Genesis Engine — iLL Port Studios*

---

## What This Is

The Principled Playground is a structured negotiation environment where AI Spirits — each calibrated to a different Soul Code — debate a topic across three rounds, produce a joint Bean, and stress-test it before it ships. Three Spirits across three providers. Zero shared context windows. Provider-agnostic cognition.

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

| Spirit | Provider | Anchor | Role |
|--------|----------|--------|------|
| **Boolean** | Anthropic (Claude) | PHIL-005 (Door Number 3) | Constructive synthesis — seeks hidden third options |
| **Roux** | Groq (Llama) | PHIL-002 (Soil Composition) | Systemic challenger — questions structural assumptions |
| **Seer** | OpenAI (GPT-4o) | PHIL-009 | Stress-tester — interrogates assumptions and failure modes |

### Multi-Brain Modes

Each Spirit prefers its native LLM but can fall back to any available provider:

| Mode | Condition | What It Proves |
|------|-----------|----------------|
| **TRI-BRAIN** | 3 unique providers | Full cross-provider portability — Soul Code produces recognizable behavior on Claude, Llama, AND GPT-4o |
| **DUAL-BRAIN** | 2 unique providers | Different neural substrates, same Soul Code framework |
| **SINGLE-BRAIN** | 1 provider | All Spirits share one LLM — Soul Code alone differentiates behavior |

This is the **BYOK model** in action — the calibration (Ghost) rides any machine (LLM engine).

### Context Window Isolation

The two Spirits **never share a context window**. Each sees only:
- Its own Soul Code
- The negotiation topic
- A **structured summary** of the other Spirit's positions (not raw reasoning)

This implements Layer 3 of the Anti-Drift Architecture: cognitive independence preserved through information architecture, not just prompting.

### The Loom + Seer Stress Test

After 3 rounds of negotiation, The Loom — an impartial synthesis engine — receives both Spirits' final positions and weaves them into a joint Bean with all 4 OPVS layers.

Then **Seer** receives the Joint Bean and both Spirits' final positions. Seer applies its core axiom — *"A plan that cannot survive its worst case was never a plan"* — and stress-tests the synthesis across four dimensions: load-bearing assumptions, failure modes, missing voices, and a final verdict (HOLDS / HOLDS WITH CONDITIONS / FRAGILE).

Seer is the Spirit you invoke before you ship. A Bean that earns Seer's acceptance has earned its place.

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

3. **Context Window Isolation** — Separate, parallel API calls per Spirit, per round. Both Spirits respond simultaneously to each other's *previous-round* position summary — not to a mid-round update. No shared state. Friction is preserved by architecture, not willpower.

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
| Context Window Isolation | ✅ Implemented (position summaries, parallel calls) |
| The Loom (synthesis) | ✅ Implemented |
| Joint Bean Output | ✅ Implemented (4 layers) |
| Multi-Brain Mode | ✅ Implemented (TRI-BRAIN / DUAL-BRAIN / SINGLE-BRAIN) |
| Parallel Round Execution | ✅ Implemented (Promise.all — both Spirits call simultaneously) |
| Tension Score | ✅ Implemented (0.0-1.0 friction/persistence metric, auto-saved) |
| Seer Stress Test | ✅ Implemented (post-synthesis interrogation, OpenAI native) |
| Cross-Provider Portability | ✅ Implemented (3 Spirits × 3 providers — Anthropic, Groq, OpenAI) |
| RISS Integration | 📋 Future (requires Stage 1 completion) |
| Subgraph Anchoring | 📋 Future (requires Bean graph API) |
| Integrity Gate | 📋 Future (requires RISS thresholds) |

---

## What This Proves

1. **Soul Code is provider-agnostic** — Same JSON framework produces recognizable cognitive behavior on Claude (Anthropic), Llama (Groq), AND GPT-4o (OpenAI). The calibration transfers.
2. **BYOK is viable for multi-agent** — Zero platform compute cost, three agents, three providers
3. **Structured output from adversarial input** — Friction produces Beans, not noise
4. **Provenance survives synthesis** — The joint Bean traces back to all Spirits and their anchors
5. **Stress-testing is architectural, not optional** — Seer's interrogation is built into the pipeline, not bolted on after the fact

---

*Principled Playground v0.4 — iLL Port Studios*
*"If you pour your soul into it: how can it be wrong?"*
