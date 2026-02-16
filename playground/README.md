# Playground — Usage Guide

**Principled Playground v0.2 — Dual-Brain Multi-Agent Negotiation**

---

## Quick Start

```bash
# Dual-brain mode (recommended)
ANTHROPIC_API_KEY=sk-ant-... GOOGLE_API_KEY=AI... \
  node playground/negotiate.js "How should AI handle creative ownership?"

# Single-brain fallback
GOOGLE_API_KEY=AI... \
  node playground/negotiate.js "What makes a system fair?"

# Show usage
node playground/negotiate.js
```

---

## Environment Variables

| Variable | Provider | Required | Notes |
|----------|----------|----------|-------|
| `ANTHROPIC_API_KEY` | Anthropic (Claude) | At least one key required | Boolean's native provider |
| `GOOGLE_API_KEY` | Google (Gemini) | At least one key required | Roux's native provider |

**Dual-Brain Mode**: Both keys set → each Spirit uses its native LLM.
**Single-Brain Fallback**: One key set → both Spirits share a single LLM.

---

## File Structure

```
playground/
├── negotiate.js                  # Negotiation engine (entry point)
├── provider.js                   # BYOK dual-brain provider abstraction
├── spirits/
│   ├── boolean.json              # Boolean's Soul Code (Claude, PHIL-005)
│   └── contrarian.json           # Roux's Soul Code (Gemini, PHIL-002)
├── PRINCIPLED_PLAYGROUND.md      # Full concept document
└── README.md                     # This file
```

---

## How It Works

### 1. Spirit Loading

Each Spirit's Soul Code is loaded from `spirits/*.json`. The Soul Code defines:
- **Identity** — Who the Spirit is
- **Principles** — Core values (mapped to Layer 0 Beans)
- **Constraints** — Hard lines that cannot be crossed
- **Negotiation style** — How the Spirit approaches disagreement

### 2. Provider Resolution

The BYOK provider abstraction (`provider.js`) resolves which LLM to use:

```
Boolean → prefers Anthropic → falls back to Google
Roux    → prefers Google    → falls back to Anthropic
```

If both keys are provided, you get **DUAL-BRAIN** mode — same Soul Code framework, different neural substrates.

### 3. Negotiation Protocol (3 Rounds)

Each round follows a structured format:

| Round | Boolean | Roux |
|-------|---------|------|
| 1 | Opens with position, non-negotiables, flexible areas | Opens with counter-position |
| 2 | Responds to Roux's summary, revises, proposes synthesis | Responds to Boolean's summary |
| 3 | Final position with synthesis opportunity | Final position with synthesis opportunity |

**Context window isolation**: Each Spirit sees only a structured summary of the other's position — never raw reasoning.

### 4. The Loom (Synthesis)

After 3 rounds, The Loom receives both final positions and produces a joint Bean:

```
## JOINT BEAN

### Nucleus (Content)
The synthesized insight — the Door Number 3.

### Shell (Metadata)
- Topic, Type: SOLUTION, Anchors: PHIL-002, PHIL-005

### Corona (Connections)
Typed edges to related Beans and concepts.

### Echo (Provenance)
- Participants, Rounds: 3, Timestamp, Mode: DUAL-BRAIN
```

---

## Extending

### Adding a New Spirit

1. Create a JSON file in `spirits/`:

```json
{
  "spirit": "YourSpirit",
  "provider": "google",
  "model": "gemini-2.0-flash",
  "anchor": "PHIL-XXX",
  "soul_code": {
    "identity": "...",
    "principles": ["..."],
    "constraints": ["..."],
    "negotiation_style": "..."
  }
}
```

2. Update `negotiate.js` to load your spirit file.

### Adding a New Provider

1. Implement `callYourProvider(apiKey, model, systemPrompt, userMessage)` in `provider.js`
2. Add it to the `PROVIDERS` map
3. Update `resolveProvider()` fallback logic

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Zero dependencies | Reduces attack surface. `fetch` is built into Node 18+. |
| JSON Soul Codes | Machine-readable, version-controllable, diffable. |
| 3 rounds | Enough for position → response → synthesis. More rounds = diminishing returns + higher cost. |
| Position summarization | Implements context window isolation (Anti-Drift Layer 3). |
| The Loom as separate step | Neither Spirit "wins." A third process synthesizes. Implements Door Number 3 structurally. |

---

## Related Documents

- [Principled Playground Concept](../roadmap/PRINCIPLED_PLAYGROUND_CONCEPT.md) — Full design document
- [Principled Playground Architecture](PRINCIPLED_PLAYGROUND.md) — What this prototype proves
- [Spirit Calibration Genesis Blueprint](../SPIRIT_CALIBRATION_GENESIS_BLUEPRINT_V1.md) — Soul Code standard
- [Layer 0: Philosophy](../beans/00_Philosophy.md) — The axioms that anchor both Spirits

---

*Zero external dependencies — 663 lines, raw `fetch` only, BYOK from day one.*
