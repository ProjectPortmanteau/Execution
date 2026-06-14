# AGENTS.md

Static context for any coding agent working in this repository (Claude Code,
Gemini, Codex, or other). This file is the harness. Read it fully before editing.
Keep it lean and high signal. Add a rule whenever an agent does something it
should not have done.

> Tool aliasing: this is the canonical rule file. If your tool reads `CLAUDE.md`
> or `GEMINI.md`, point them here rather than maintaining three copies.

-----

## 1. What this project is

The **Principled Playground** (part of the OPVS `Execution` repo, `playground/`
subsystem) is a multi-agent negotiation system. Agents called **Spirits** hold
fixed identities and distinct principle anchors, argue a contested question
across three rounds, and a synthesis step called the **Loom** weaves their final
positions into a joint artifact. The thesis: structured disagreement produces
ideas no single agent would reach. The disagreement has to be real, so the
architecture enforces it.

This is **agentic engineering, not vibe coding**: changes here are gated by
specs, tests, and evals. Treat the eval as the bar, not the demo.

-----

## 2. Stack and layout

- Runtime: Node.js / Express. Languages: JavaScript (majority) and TypeScript.
- Data: PostgreSQL (Neon). Frontend: React / Vite.
- Providers (BYOK): Anthropic, Groq, OpenRouter, and Google Gemini. Keys live in
  `.env` only. Never commit a key. Never hard-code one.
- Key files (confirm exact line numbers before editing, they shift):
  - `playground/negotiate.js`: the 3-round engine and synthesis call.
  - `playground/loom.js`: structured synthesis (Joint Bean + JSON sidecar).
  - `playground/provider.js`: the provider abstraction (`PROVIDERS` map).
  - `playground/spirits/`: Soul Code definitions.
  - `playground/output/`: timestamped transcripts and reports.
  - `playground_scoring.py`: the semantic eval metrics (see Section 3).

-----

## 3. Core concepts you must know before editing (Knowledge)

**The Bean** is the atomic unit of memory and knowledge. Four layers:

- Nucleus: the content itself.
- Shell: metadata (`type`, `tags`, `salience`, `token_cost`).
- Corona: typed, weighted edges. Closed set: `SUPPORTS`, `CONTRADICTS`,
  `REFINES`, `DERIVES_FROM`.
- Echo: provenance (`author`, `substrate`, `source`, `verified`,
  `compressed_from`). `substrate` records which model authored the Bean.

**The Spirits** (each a distinct identity on a swappable engine):

- Boolean: anchor PHIL-005, rejects binary traps. Genesis Spirit.
- Roux: loaded from `spirits/contrarian.json` (filename is misleading, content
  is correct), anchor PHIL-002, systemic causality.
- Seer: anchor PHIL-009, stress-tester role.
- A Spirit's engine is config, not code. Adding one is a `PROVIDERS` entry plus
  an adapter. No negotiation-logic change required.

**Isolation (load-bearing).** During negotiation a Spirit reads only its own
prior-round context, never another Spirit's private state. Only the Loom (and the
post-hoc scorer) may read across Spirits, and only the posted positions, never a
full private graph. Do not add shared memory between negotiating Spirits. It
corrupts the friction the whole system depends on.

**Scoring (Section 6, in `playground_scoring.py`).** Three metrics, computed post-hoc,
embeddings via Gemini `text-embedding-004`:

- Tension = `engagement x opposition`. Engagement is topical overlap of salient
  claims; opposition is the share of engaged pairs a constrained classifier marks
  `CONTRADICTS`. This is semantic, not a keyword count.
- Displacement = `novelty_lift = min(d_A, d_B)` and `balance = |d_A - d_B|`.
  Novelty near zero means the synthesis echoed one Spirit.
- Groundedness = share of synthesis claims carrying a real `DERIVES_FROM` edge.
  Novelty and groundedness check each other. Neither alone is sufficient.

-----

## 4. Hard rules, never violate (Guardrails)

1. **Verify, do not assume.** When you report what the code does, quote the
   actual lines. If reality differs from this file or from a task brief, say so
   and stop. The most valuable work this repo has seen came from recon that
   corrected a wrong assumption.
1. **No fakeable metric.** A metric an agent can satisfy without doing the work
   is worse than no metric. Groundedness must never be a reflexive 1.0; an honest
   empty citation beats a reflexive full one. If you add an eval, add the
   adversarial case that proves it can fail.
1. **Respect gates.** When a task is phased, stop at each gate for human
   confirmation. Never build on top of a validation that has not passed. If a
   novelty check returns near zero, stop and diagnose the Loom. Do not proceed.
1. **Populate scoring fields from the first write.** Every Bean must carry
   stance-typed edges and `provenance.substrate`, and every synthesis claim its
   `DERIVES_FROM` edges. These cannot be backfilled later. If you cannot populate
   them cleanly, stop and surface the constraint.
1. **Honesty over polish.** Write "demonstrated on N=x," not "proven." Flag any
   generated forward number (projections, percentiles, probabilities) as the
   least trustworthy artifact in the output. Do not introduce comparisons or
   claims the evidence does not support.
1. **Git discipline.** Work on a branch, never push to main. Small, labeled
   commits. Do not commit secrets, generated artifacts, or large regenerable
   files.

-----

## 5. How to work here (Workflow)

- **Spec, then gate, then build.** Large changes get a written spec and phased
  execution with checkpoints, not one big diff.
- **Tests and evals before code.** They are the contract. A passing eval with a
  clear rubric is the bar; a demo is not.
- **Surgical edits.** Factor reusable logic into its own module so the eval
  harness runs the same path as production. Keep unrelated code untouched.
- **Close with compression (CWAP).** End a work session with a short structured
  summary: what changed, what was verified, what remains unproven, what carries
  forward.

-----

## 6. Known traps, do not repeat (living memory)

These are real findings from prior audits. Each is a rule earned the hard way.

- Tension scoring was once a lexical regex counter over both Spirits' concatenated
  text. It counted self-challenge as friction and tripped on filler words. It is
  being replaced by the semantic metric in Section 3. Do not reintroduce keyword
  counting.
- The Loom once emitted only `CONNECTS_TO / ENABLES / TRANSFORMS` edges and no
  `DERIVES_FROM`, so groundedness could not be computed. Keep `DERIVES_FROM` on
  every synthesis claim that builds on a position.
- Portability was once claimed from the wrong evidence: a parallel-vs-sequential
  run on the same models proves execution-order invariance, not substrate
  portability. Keep those two claims separate.
- A fidelity scorecard once marked a behavior "portable" from a single
  observation. Claim portable only for behavior seen on two or more substrates.
  Mark the rest "untested."

> Append here whenever an agent makes a mistake worth never repeating.

-----

## 7. Canonical reference files (load on demand)

Do not inline these. Read the relevant one when the task calls for it.

- `BEAN_MEMORY_SPEC_v1.md`: frozen Bean and scoring field definitions.
- `VALIDATION_PROTOCOL.md`: the control matrix and the local novelty recipe.
- `playground_scoring.py`: the runnable Section 6 metrics with a self-test.
- `playground/AUDIT.md`: the current honest state of what is and is not built.

-----

## 8. House style for any generated document

- No em-dashes anywhere. Use commas, colons, or periods.
- Arial typography. Gold and dark navy accents in formatted documents.
- Sign formatted deliverables with the mark: -AF- RMM.
- Plain, direct prose. No filler, no inflation.
