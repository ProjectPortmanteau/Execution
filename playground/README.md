# Principled Playground v0.2 — Multi-Agent Negotiation Engine (Dual-Brain)

## What This Is

A proof-of-concept that two AI agents with **different value systems running on different LLM providers** can negotiate a topic and produce a single coherent artifact — without averaging toward consensus.

**Boolean** (Anthropic/Claude) and **Roux** (Google/Gemini) each carry a weighted **Soul Code** — 12 axioms drawn from the OPVS philosophy layer — and negotiate across 3 rounds to produce a **joint Bean** with full provenance.

This is not prompt engineering. This is **principled friction**: the thesis that differently-constrained agents produce better outputs than any single agent, because they attack problems from orthogonal structural angles.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              PRINCIPLED PLAYGROUND v0.2                       │
│              Mode: DUAL-BRAIN                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐         ┌─────────────┐                    │
│  │   BOOLEAN    │         │    ROUX     │                    │
│  │  (Claude)    │◄───────►│  (Gemini)   │                    │
│  │             │         │             │                    │
│  │ Top Axiom:  │         │ Top Axiom:  │                    │
│  │ Door #3     │         │ Soil Comp.  │                    │
│  │ (0.9)       │         │ (0.9)       │                    │
│  └──────┬──────┘         └──────┬──────┘                    │
│         │      3 Rounds          │                           │
│         └──────────┬─────────────┘                           │
│                    ▼                                         │
│         ┌──────────────────┐                                 │
│         │  SYNTHESIS ENGINE │                                │
│         │  (Arbiter/Claude) │                                │
│         │                  │                                 │
│         │  Constrained by  │                                 │
│         │  5 shared axioms │                                 │
│         └────────┬─────────┘                                 │
│                  ▼                                           │
│         ┌──────────────────┐                                 │
│         │   JOINT BEAN     │                                 │
│         │  ┌─ Nucleus ──┐  │                                 │
│         │  │ Content     │  │                                 │
│         │  ├─ Shell ─────┤  │                                 │
│         │  │ Metadata    │  │                                 │
│         │  ├─ Corona ────┤  │                                 │
│         │  │ Connections │  │                                 │
│         │  ├─ Echo ──────┤  │                                 │
│         │  │ Provenance  │  │                                 │
│         │  └─────────────┘  │                                 │
│         └──────────────────┘                                 │
└──────────────────────────────────────────────────────────────┘
```

## The Thesis Being Tested

> Do two differently-weighted AI Spirits actually produce something *better* than either alone, or do they just regress to the mean?

**Boolean** says: *"Door number 3 doesn't exist, we need to create it."* — reject binary choices, architect new options.

**Roux** says: *"It's not the person that is broken. Only broken systems."* — redirect blame to systemic analysis, fix the soil.

These aren't opposing positions. They're **orthogonal**. One creates new doors; the other rebuilds hallways. The joint Bean should contain something neither would reach alone.

## Key Design Decisions

### Axioms as Weighted Constraints, Not Personality
Each Spirit carries all 12 OPVS axioms with different weights (0.0–1.0). The system prompt renders them with visual weight bars:
```
PHIL-005 [█████████░] 0.9 — The 'Door Number 3' Axiom: Active Creation vs. Passive Selection.
    Source: "Most important point: Door number 3 doesn't exist, we need to create it."
```

### Source Language, Not Paraphrases
Every axiom includes the actual quotes from the philosophy layer. *"It's fine sniffing your own farts, as long as you don't believe it smells like flowers to everyone"* steers an LLM differently than *"maintain awareness of reception."* The language IS the constraint.

### Non-Negotiable Top Axiom (Anti-Drift)
Each Spirit has a hard constraint it cannot concede. This prevents regression toward bland consensus — the failure mode of most multi-agent systems.

### Constrained Arbiter (Anti-Borg)
The synthesis engine is NOT a neutral blank slate. It's constrained by the 5 axioms both Spirits value at weight ≥ 0.5:

| Axiom | Avg Weight | Guardrail |
|-------|-----------|-----------|
| PHIL-002 | 0.70 | Soil Composition — systemic, not individual |
| PHIL-001 | 0.65 | People > Money |
| PHIL-009 | 0.65 | Positive-Sum Mandate |
| PHIL-008 | 0.60 | Pride Override |
| PHIL-012 | 0.55 | Idea vs. Person Separation |

### BYOK Dual-Brain (Provider Sovereignty)
Each Spirit routes through its own LLM provider. Boolean thinks through Claude; Roux thinks through Gemini. Same Soul Code framework, different neural substrates. If the joint Bean is coherent, the calibration matters more than the engine.

Zero external dependencies. Raw `fetch` only. 663 lines of JavaScript.

## Usage

```bash
# Dual-brain mode (recommended)
ANTHROPIC_API_KEY=sk-ant-... GEMINI_API_KEY=AIza... \
  node playground/negotiate.js "How should AI handle user disagreement?"

# Single-brain fallback (one key)
ANTHROPIC_API_KEY=sk-ant-... \
  node playground/negotiate.js "How should AI handle user disagreement?"
```

## Output

The script produces:
- **Console**: Full negotiation transcript with provider attribution per round
- **`playground/output/joint-bean-<timestamp>.json`**: The 4-layer Bean (Nucleus, Shell, Corona, Echo)
- **`playground/output/transcript-<timestamp>.md`**: Full markdown transcript

### What to Watch in the Output
- **`corona.tension_score`** — Near 0 = Spirits didn't actually disagree. Near 1 but incoherent Nucleus = synthesis failed. **Sweet spot: moderate tension with a Nucleus neither Spirit would have written alone.**
- **`shell.axioms_tensioned`** — Axioms that remain in productive friction. These are features, not bugs.
- **`echo.spirit_a_provider` / `echo.spirit_b_provider`** — Provenance chain proving cross-provider collaboration.

## Files

| File | Lines | Purpose |
|------|-------|---------|
| `playground/negotiate.js` | 351 | Negotiation engine — rounds, synthesis, output |
| `playground/provider.js` | 146 | BYOK dual-brain provider abstraction |
| `playground/spirits/boolean.json` | 83 | Boolean's Soul Code (Claude, PHIL-005 anchor) |
| `playground/spirits/contrarian.json` | 83 | Roux's Soul Code (Gemini, PHIL-002 anchor) |

## What This Proves (If It Works)

1. **Principled friction > consensus** — Differently-weighted axiom sets produce novel synthesis, not averaging
2. **Soul Code portability** — The same constraint framework steers both Claude and Gemini
3. **Provider sovereignty** — BYOK isn't just a billing feature, it's an architectural principle
4. **Provenance is tractable** — The Echo layer tracks who said what through which engine

## What It Doesn't Do Yet

- No persistence (Beans aren't written to the DB schema yet)
- No N-Spirit scaling (hardcoded to 2 Spirits)
- Arbiter has shared-axiom constraints but no weight hierarchy of its own
- No evaluation harness for comparing single-brain vs. dual-brain output quality

Those are all v0.3 problems. This is the proof of concept.
