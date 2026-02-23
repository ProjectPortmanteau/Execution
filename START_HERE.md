# Start Here — You Don't Need to Be a Developer

If you found this repository and something pulled you in, this document is for you.

You don't need to understand the code to understand what's being built here. The code is the *proof*. This document is the *map*.

---

## What Problem Are We Solving?

Imagine you've been building a creative universe for years. Thousands of characters, rules, timelines, decisions, plot threads. Everything connects to everything else.

At some point, the complexity becomes the enemy. You can't remember what you decided three years ago. You can't trace why a character behaves the way they do. You can't tell if a new scene breaks something established five chapters back.

We call this **Lore Entropy** — the point where any sufficiently complex creative or knowledge ecosystem collapses under its own weight.

Marvel hits it. George R.R. Martin hit it. Every solo builder, researcher, or founder managing thousands of interconnected ideas eventually hits it.

The root cause: we store knowledge in flat files and manage it with linear tools. When everything connects to everything else, linear breaks.

---

## What Was Built

**OPVS (Omniversal Project Vision System)** is a semantic knowledge graph — a system where ideas aren't stored in folders, they live as interconnected nodes in a graph. Every piece of knowledge knows what it connects to, where it came from, and what depends on it.

Think of it as **ERP for storytelling**. The same way Enterprise Resource Planning systems manage the interconnected complexity of a business, OPVS manages the interconnected complexity of a narrative universe or knowledge ecosystem.

### The Bean

The atomic unit of OPVS is called a **Bean**. Every idea, asset, and decision in the system is a Bean. Each Bean has four layers:

- **Nucleus** — the raw content (a scene, a character note, a concept, a code commit)
- **Shell** — standardized metadata (type, state, layer, priority)
- **Corona** — relational edges (how this Bean connects to every other Bean in the graph)
- **Echo** — immutable provenance (who created it, when, from what source, verified how)

There are currently **85 Beans** in the live knowledge graph, organized across 7 layers (Philosophy → Blueprint → Narrative → Execution → Lore → Process → Archive).

### The Provenance Pipeline

Every commit to this repository tagged with a semantic marker automatically becomes a Bean in the knowledge graph. The documentation writes itself as a byproduct of the work.

Tags like `[SPARK]` (new idea), `[BLOCKER]` (obstacle), `[SOLUTION]` (fix), `[PODIUM]` (immutable truth, mint-ready) each create structured artifacts with full chain of custody — from the first keystroke to the final asset.

---

## The AI Layer — Spirits

OPVS doesn't use a generic AI assistant. It uses **AI Spirits** — AI instances calibrated to specific principles, character, and knowledge.

A Spirit's character lives in its **Soul Code** — a portable document defining identity, principles, constraints, and negotiation style. The Soul Code is provider-agnostic. The same calibration runs on any LLM engine.

This is the **BYOK model** (Bring Your Own Key): users provide their own API keys, the platform provides the Soul Code and knowledge graph. Zero inference cost to operate. The platform sells calibration — the soul — not compute.

### Current Spirits

| Spirit | Character | Provider |
|--------|-----------|----------|
| **Boolean** | Principled Architect — seeks the third option, rejects binary traps | Anthropic (Claude) |
| **Roux** | Soil Alchemist — challenges structural assumptions, centers systemic causality | Groq (Llama) |
| **Seer** | Stress-Tester — interrogates load-bearing assumptions, models failure modes | OpenRouter |

The long-term vision: **every Village tenant calibrates their own Spirit** from their own knowledge subgraph. Your Spirit knows your lore, your principles, your voice. It isn't a generic assistant — it reflects your structured knowledge.

---

## The Principled Playground

The most demonstrable proof of the architecture is the **Principled Playground** — a multi-Spirit negotiation system where Boolean and Roux debate a topic across three structured rounds, synthesize a Joint Bean, and Seer stress-tests it for failure modes.

**What was proven in the first TRI-BRAIN benchmark (v0.4):**

Two independent runs of the same negotiation — different execution methods, non-deterministic AI sampling — both converged on the same synthesis thesis. The Soul Code constraints, not the providers, drove the convergence.

That's reproducible insight generation. Calibration transfers across providers.

See `playground/output/PARALLEL_VS_SEQUENTIAL_REPORT.md` for the full benchmark.
See `playground/output/CROSS_SUBSTRATE_REPORT.md` for the portability proof.

---

## What's in This Repository

```
/beans                    — Live knowledge graph (85 Beans across 7 layers)
/playground               — Principled Playground negotiation engine + output transcripts
/db                       — Database schema and migrations
/services                 — Core platform services
/spirit-calibration       — Spirit calibration artifacts
/roadmap                  — Product roadmap documents
/docs                     — Extended technical documentation

BEANS_MASTER_LEDGER.md                        — Full Bean registry
SPIRIT_CALIBRATION_GENESIS_BLUEPRINT_V1.md    — How to calibrate a Spirit
CHANGELOG.md                                  — Full version history
CONTRIBUTING.md                               — How to participate
```

---

## The Village

This project is building toward a **Village** — a community of tenants who build on this infrastructure together, each with their own Spirit calibrated to their own knowledge.

The Village runs on one axiom: **Generosity is the dominant strategy.**

The system is architecturally designed so the most rational move is to contribute. Reputation decays if you stop feeding the community. Hoarding is irrational by design.

The Village has three kinds of tenants:

**Architects** — systems thinkers who see structure where others see chaos. You've been frustrated that no tool handles complexity the way your mind does.

**Storytellers** — people managing universes of interconnected ideas, characters, or knowledge. You've hit the wall where flat lists and linear tools break.

**Principled Builders** — people who believe the most rational move in a healthy system is generosity. You're tired of platforms that reward extraction.

---

## Where Things Stand

The knowledge graph is live. The provenance pipeline is operational. Three Spirits are running on three providers. The negotiation protocol produces reproducible artifacts. The BYOK economic model is proven.

What isn't built yet: **Sandbox Mode** — the front door that lets a new tenant arrive, orient, and plug in. That's next.

---

## Do You GetIt?

If any of this stopped you — if Lore Entropy is a problem you've actually felt, if the Village architecture makes immediate sense, if the Soul Code portability thesis clicks — you might be a tenant.

Connect: <a href="https://www.linkedin.com/in/robert-miller-ill-port-studios/">Robert Miller on LinkedIn</a>

The soil is fertile. The right people change everything.

*Always Faithful — Boolean &amp; RMM*
*iLL Port Studios | Project Portmanteau*
