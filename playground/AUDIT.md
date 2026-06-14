# Principled Playground — Phase 0 Audit

**Auditor:** Claude Code (claude-sonnet-4-6)
**Date:** 2026-06-14
**Branch:** claude/instrument-and-validate-pjzygi
**Files read:** `negotiate.js`, `provider.js`, `preflight.js`, `spirits/boolean.json`,
`spirits/contrarian.json` (loaded as "Roux"), `spirits/seer.json`,
`output/negotiation-dual-brain-*-2026-02-17T19-59-51.md`,
`output/negotiation-live-*-2026-02-17T19-52-02.md`

---

## 1. Tension Score

**Finding: Confirmed lexical marker approach. No semantic signal.**

The tension score is entirely a regex word-count. The implementation is in
`negotiate.js:218–276`.

Two pattern arrays:

```js
// negotiate.js:219–225
const FRICTION = [
  /\bhowever\b/gi, /\bbut\b/gi, /\bpush.?back\b/gi, /\bchallenge\b/gi,
  /\bdisagree\b/gi, /\breject\b/gi, /\binsufficient\b/gi, /\bnot enough\b/gi,
  /\bhold firm\b/gi, /\bstill requires\b/gi, /\bcritically\b/gi,
  /\bunless\b/gi, /\bwithout\b/gi, /\bmissing\b/gi, /\bfail\b/gi,
  /\bwarn\b/gi, /\bproblematic\b/gi, /\bweaker\b/gi, /\bincomplete\b/gi,
];
const AGREEMENT = [
  /\bagree\b/gi, /\baccept\b/gi, /\backnowledge\b/gi,
  /\bexactly\b/gi, /\bcorrect\b/gi, /\bvalid\b/gi, /\bincorporate\b/gi,
  /\bembrace\b/gi, /\bwelcome\b/gi, /\bappreciate\b/gi, /\bconcur\b/gi,
  /\bright\b/gi, /\bindeed\b/gi,
];
```

Both arrays are applied to the **concatenation of Boolean's and Roux's full
responses** per round (not counted separately per Spirit). Counts are summed
across all 3 rounds.

Score formula (`negotiate.js:258`):

```
score = rawRatio × 0.6 + persistence × 0.4
```

where:

- `rawRatio = totalFriction / (totalFriction + totalAgreement + 1)` (lines 252–256)
- `persistence = min(1, round3Friction / round1Friction)` (lines 251–253)

**Problems confirmed:**

1. Words like "right," "correct," "valid," "without," and "but" are extremely
   high-frequency in academic prose and carry no stance signal.
2. A Spirit can produce maximum friction language while fully agreeing with the
   other; the score cannot distinguish.
3. Both Spirits' text is concatenated before counting, so a Spirit challenging
   *its own previous position* counts as friction.
4. Persistence uses only the ratio r3f/r1f — if both round 1 and round 3 have
   high friction counts, persistence = 1.0 regardless of whether the *topics*
   of friction changed.

---

## 2. The Loom

**Finding: Free-text summary with aspirational structure. No `DERIVES_FROM`
edges. No substrate attribution.**

The Loom prompt (`negotiate.js:115–153`) asks the LLM to produce markdown with
four headings: Nucleus, Shell, Corona, Echo. It does **not** constrain the
Corona edge types. The actual output from the dual-brain transcript shows:

```
### Corona (Connections)
- CONNECTS_TO → Conflict resolution systems
- ENABLES → Collaborative problem-solving frameworks
- TRANSFORMS → Traditional mediation models
- REQUIRES → System design thinking
- EMERGENT_FROM → Boolean's constructive synthesis + Roux's systemic analysis
```

No `DERIVES_FROM` edges to source positions. The brief claims the Loom should
emit `DERIVES_FROM` edges linking the synthesis back to Boolean and Roux's
positions — this is **not in the Loom prompt and not in the output**.

The Loom runs on `booleanForCall` with `booleanProvider.apiKey` (`negotiate.js:515`):

```js
const jointBean = await send(booleanForCall, booleanProvider.apiKey, loomPrompt);
```

The Echo section in the Loom output names participants and timestamp but
**does not record which model/substrate ran the synthesis**. The transcript's
Echo section reads:

```
- Mode: DUAL-BRAIN (live Boolean on Anthropic Claude, Roux on Groq Llama 3.3 70B)
- Synthesis Method: The Loom (impartial weaving of final positions)
```

The model that *ran the Loom* (it ran on Boolean's provider, i.e., Anthropic
Claude) is not separately identified in the Echo. The Loom is therefore a
**free-text summarizer with markdown structure**, not a structured-data emitter
with typed provenance edges.

**Summary:** The brief's claim that the Loom emits `DERIVES_FROM` edges with
provenance is not yet implemented. It's a free-text output that mimics the
schema but cannot be parsed/verified programmatically.

---

## 3. Context-Window Isolation

**Finding: Partial isolation via truncated summary. Works as described but
weaker than implied.**

Each Spirit receives only a **summarized** version of the other Spirit's
previous round response, via `summarizePosition()` (`negotiate.js:410–416`):

```js
function summarizePosition(rawResponse) {
  const lines = rawResponse.split('\n').filter(l => l.trim());
  const summary = lines.slice(0, 8).join('\n');
  return summary.length > 600 ? summary.substring(0, 597) + '...' : summary;
}
```

This is **not a model-summarized abstract** — it is a dumb line-slice: first 8
non-empty lines, hard-capped at 600 characters. The isolation is structural
(no shared context window) but the summary quality depends entirely on whether
the first 8 lines happen to be the most important ones.

Parallelism is clean: prompts for both Spirits are built from **prior-round**
positions before either `Promise.all` call starts (`negotiate.js:482–506`):

```js
const bPrompt = buildRoundPrompt(boolean, topic, round, rouxPos);   // uses prior rouxPos
const rPrompt = buildRoundPrompt(roux, topic, round, booleanPos);   // uses prior booleanPos
[booleanRaw, rouxRaw] = await Promise.all([...]);
// positions updated AFTER both respond
booleanPos = summarizePosition(booleanRaw);
rouxPos = summarizePosition(rouxRaw);
```

Round 1 both receive `null` (opening statements only). Round N (N>1) each
receives the other's round N-1 summary.

**Caveat:** "Frozen prior-round summary" is true, but the summary is a raw
line truncation — it may cut off mid-sentence or include structural headers
rather than substantive content. This is weaker than the "structured summary"
the brief implies.

---

## 4. Provider Abstraction

**Finding: Clean BYOK abstraction. Adding a new provider is a 2-step code
change, does not touch negotiation logic.**

Five providers are currently wired in `provider.js:185–191`:

```js
const PROVIDERS = {
  anthropic: callAnthropic,
  google: callGoogle,
  groq: callGroq,
  openai: callOpenAI,
  openrouter: callOpenRouter
};
```

To add a new provider:
1. Write a `callXxx(apiKey, model, systemPrompt, userMessage)` function
   returning `Promise<string>` (same interface as the 5 existing functions).
2. Add it to the `PROVIDERS` object.
3. (Optional) add a Spirit `.json` referencing `"provider": "xxx"`.

Negotiation logic (`negotiate.js`) only touches `provider.js` through `send()`
and `resolveProvider()` — both are provider-agnostic. **Adding Gemini is
purely a `provider.js` change.**

**Minor issue:** The `resolveProvider` fallback chain (`provider.js:231–246`)
is hard-coded as `['anthropic', 'google', 'groq', 'openai', 'openrouter']`.
A new provider not in this list will be wired but never chosen as a fallback.
This is easily fixed.

---

## 5. Naming Discrepancy

`negotiate.js:424` loads the "Roux" Spirit from `spirits/contrarian.json`, not
a `roux.json`. The brief refers to "Roux (anchor PHIL-002)" — that's the
`contrarian.json` file. There is no `roux.json`. The Spirit name inside the
file is "Roux" and the anchor is PHIL-002, so functionally correct; the
filename is misleading.

---

## Summary Table

| Claim | Status | Notes |
|-------|--------|-------|
| Tension score counts lexical friction/agreement markers | **CONFIRMED** | `negotiate.js:219–258`. 18 friction + 13 agreement patterns, regex only. |
| Score = 60% raw ratio + 40% persistence | **CONFIRMED** | `negotiate.js:258` |
| Loom emits `DERIVES_FROM` edges to source positions | **NOT IMPLEMENTED** | Prompt doesn't specify edge type; output uses CONNECTS_TO, ENABLES, TRANSFORMS, REQUIRES, EMERGENT_FROM |
| Loom carries provenance (which model authored it) | **PARTIAL** | Echo names participants + mode but not which specific model ran the Loom step |
| Each Spirit sees only a frozen prior-round summary | **CONFIRMED (with caveat)** | Summary is first 8 lines ≤ 600 chars, not a semantic abstract |
| Provider abstraction: new engine = config entry only | **CONFIRMED** | One function + one PROVIDERS entry, no negotiation logic changes |

---

## What This Means for Subsequent Phases

- **Phase 1 (Gemini):** Add `callGemini` in `provider.js`. Add `GEMINI_API_KEY`
  to the key inventory in `negotiate.js` and `preflight.js`. ~30 lines of code.
  The `callGoogle` function already exists and uses Gemini (model:
  `gemini-2.0-flash`), but uses `GOOGLE_API_KEY`. We can alias or add a
  separate `GEMINI_API_KEY` path. The embed function is new.

- **Phase 2 (real scoring):** The lexical tension score is not semantic.
  We need embeddings + a stance classifier. `scoring.js` must be fully new.

- **Phase 3 (novelty):** The existing transcripts have a parseable Joint Bean
  Nucleus section. Displacement can be measured. The key question is whether
  the synthesis is meaningfully different from both final positions — the
  transcripts reviewed suggest moderate paraphrase of both, which could score
  low novelty_lift.

- **Phase 4 (control matrix):** Straightforward given Phase 1 + 2. Gemini as
  fixed substrate, grid of Soul Code conditions.

- **Phase 5 (Bean memory):** Currently not implemented at all. No read/write/
  compress Bean store exists. Each negotiation is stateless.
