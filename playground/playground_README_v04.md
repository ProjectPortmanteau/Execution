# Principled Playground — Usage Guide

**v0.4 — TRI-BRAIN Multi-Agent Negotiation**

*Three Spirits. Three providers. One Joint Bean.*

---

## Quick Start

```bash
# TRI-BRAIN mode (recommended) — Boolean + Roux + Seer across 3 providers
ANTHROPIC_API_KEY=sk-ant-... GROQ_API_KEY=gsk_... OPENROUTER_API_KEY=sk-or-... \
  node playground/negotiate.js "Your topic here"

# Dual-brain mode
ANTHROPIC_API_KEY=sk-ant-... GROQ_API_KEY=gsk_... \
  node playground/negotiate.js "Your topic here"

# Run parallel vs sequential benchmark comparison
ANTHROPIC_API_KEY=sk-ant-... GROQ_API_KEY=gsk_... OPENROUTER_API_KEY=sk-or-... \
  node playground/compare-modes.js "Your topic here"

# Show usage
node playground/negotiate.js
```

---

## Environment Variables

| Variable | Provider | Spirit | Notes |
|----------|----------|--------|-------|
| `ANTHROPIC_API_KEY` | Anthropic (Claude) | Boolean | Boolean's native provider |
| `GROQ_API_KEY` | Groq (Llama) | Roux | Roux's native provider |
| `OPENROUTER_API_KEY` | OpenRouter | Seer | Seer's native provider |

**TRI-BRAIN:** All three keys → each Spirit uses its native LLM.
**DUAL-BRAIN:** Two keys → two Spirits on distinct providers.
**SINGLE-BRAIN:** One key → all Spirits share one LLM (Soul Code alone differentiates behavior — proven to work).

---

## The Spirits

| Spirit | Role | Provider | Soul Code Anchor |
|--------|------|----------|-----------------|
| **Boolean** | Principled Architect — seeks Door Number 3, rejects binary traps | Anthropic (Claude) | PHIL-005 |
| **Roux** | Soil Alchemist — challenges structural assumptions, centers systemic causality | Groq (Llama) | PHIL-002 |
| **Seer** | Stress-Tester — interrogates load-bearing assumptions, models failure modes | OpenRouter | PHIL-009 |

Soul Codes are in `spirits/`. Each is a JSON file defining identity, principles, constraints, and negotiation style. Provider-agnostic — the calibration rides any engine.

---

## File Structure

```
playground/
├── negotiate.js              # Negotiation engine — entry point (3 rounds + Loom + Seer)
├── provider.js               # BYOK tri-brain provider abstraction
├── compare-modes.js          # Parallel vs sequential benchmark runner
├── preflight.js              # Provider health check before negotiation
├── simulate.js               # Offline simulation mode
├── spirits/
│   ├── boolean.json          # Boolean's Soul Code (PHIL-005)
│   ├── contrarian.json       # Roux's Soul Code (PHIL-002)
│   └── seer.json             # Seer's Soul Code (PHIL-009)
├── output/
│   ├── PARALLEL_VS_SEQUENTIAL_REPORT.md   # v0.4 benchmark — key findings
│   ├── CROSS_SUBSTRATE_REPORT.md          # Portability proof across providers
│   ├── NEGOTIATION_REPORT.md              # Early protocol validation
│   └── *.md                               # Timestamped negotiation transcripts
├── PRINCIPLED_PLAYGROUND.md  # Full architecture document
└── README.md                 # This file
```

---

## How It Works

### 1. Preflight

The system checks all configured providers before starting. A Spirit whose provider is unavailable falls back to the next available. Preflight distinguishes "provider failed but no Spirit depends on it" from "Spirit's provider failed."

### 2. Spirit Loading

Each Spirit's Soul Code is loaded from `spirits/*.json`. The Soul Code defines identity, principles, constraints, and negotiation style anchored to a specific philosophical Bean from Layer 0.

### 3. Negotiation Protocol (3 Rounds)

**Context isolation:** Each Spirit responds to a frozen snapshot of the other's *previous* round position — never mid-round updates. This prevents epistemic bleed and produces more authentic friction.

| Round | Boolean | Roux | Notes |
|-------|---------|------|-------|
| 1 | Opens with position, non-negotiables, flexible areas | Opens with counter-position | Both calls run in parallel (`Promise.all`) |
| 2 | Responds to Roux's Round 1 snapshot | Responds to Boolean's Round 1 snapshot | Parallel |
| 3 | Final position with synthesis opportunity | Final position with synthesis opportunity | Parallel |

**Why all 3 rounds parallelize:** Each Spirit's prompt is built from the *previous* round's position summaries, which are fully determined before the round starts. Neither Spirit needs to wait for the other's current response. The frozen-snapshot architecture makes parallel semantically identical to sequential.

### 4. The Loom

After Round 3, the Loom (synthesis engine, runs on Boolean's provider) weaves both final positions into a **Joint Bean** — a co-authored knowledge artifact in OPVS format with full provenance.

### 5. Seer Stress-Test

Seer independently reviews the Joint Bean on its own provider. Output: load-bearing assumptions, specific failure modes (scale, adversarial conditions, time, ethics), and a PASS/CONDITIONAL PASS/FAIL verdict.

### 6. Tension Score

Every run produces a tension score (0.0–1.0):
- Friction markers: `however`, `challenge`, `reject`, `disagree`, `concern`, `cannot accept`
- Agreement markers: `accept`, `concur`, `incorporate`, `agree`, `synthesis`
- Persistence ratio: does friction survive to Round 3 or collapse?

| Range | Label | Meaning |
|-------|-------|---------|
| 0.8–1.0 | MAXIMUM | Deep principled disagreement, full persistence |
| 0.6–0.8 | HIGH | Meaningful friction with partial convergence |
| 0.4–0.6 | MODERATE | Constructive tension |
| &lt; 0.4 | LOW | Rapid convergence or shallow engagement |

### 7. Output

Every run auto-saves a timestamped `.md` to `playground/output/` with full transcript + per-round breakdown + tension score.

---

## What Was Proven in v0.4

**Benchmark:** Two independent runs of the same topic (parallel vs sequential) on TRI-BRAIN configuration.

| Run | Tension | Synthesis | Seer |
|-----|---------|-----------|------|
| Parallel | 0.76 HIGH | "Hybrid Negotiation Ecosystems" | CONDITIONAL PASS |
| Sequential | 0.85 MAXIMUM | "Evolutionary Negotiation Ecosystems" | CONDITIONAL PASS |

Both runs converged on the same thesis despite different execution paths and non-deterministic LLM sampling. The Soul Code constraints drove the convergence — not the providers, not the execution order.

**The portability thesis holds:** The same Soul Code produces recognizable, role-consistent behavior across Claude, Llama, and OpenRouter. Calibration transfers. The Ghost rides any Machine.

Full report: <a>`output/PARALLEL_VS_SEQUENTIAL_REPORT.md`</a>

---

## Performance Notes

In rate-limited environments (free/low-tier API keys), sequential execution can outperform parallel by 20–30% due to provider-side throttling. Parallel remains architecturally correct (no ordering dependency) and will outperform sequential in rate-limit-free environments.

Use `compare-modes.js` to benchmark both on your setup.

---

*Principled Playground v0.4 — iLL Port Studios*
*TRI-BRAIN: Anthropic (Claude) + Groq (Llama) + OpenRouter*
