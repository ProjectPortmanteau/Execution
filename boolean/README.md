# Boolean

Boolean's agent core, built from the AI Bean Slum Edition build plan and the Boolean Training Data Ledger. Plain Node.js (CommonJS), no dependencies, so the runtime code moves into the React Native app unchanged.

This covers the parts of build phases 1 and 2 that don't wait on an open decision:

| Build plan phase | What's here | What's not |
|---|---|---|
| 1. Corpus | Ledger rules as code, set export, frozen held-out slice | BEAN_CONVERTER itself (not in this repo), speaker split, paste flagger |
| 2. App skeleton | The runtime the Talk screen calls: retrieval, both filters, constitution, citations, Trail | The React Native app, SQLite storage, a chosen model |
| 3. Tap | Tag URL parsing, chapter stickers, token unlocks | NFC hardware, SUN verification |

## Layout

```
boolean/
├── ledger.js                 # Ledger rules: scope, then authorship, then use
├── heldout.js                # Frozen held-out slice (hash of salt + bean_id)
├── runtime/
│   ├── graph.js              # Load filter (scope) + retrieval (spoiler gate, mode, tokens)
│   ├── search.js             # BM25 keyword search, optional embedding blend
│   ├── constitution.js       # Platform tier rules, system prompt, Source labels
│   ├── citations.js          # Checks cited Bean IDs against the Sources given
│   ├── agent.js              # ask(): retrieve, short-circuit, generate, check, Trail
│   ├── reader.js             # Reader state, tag registry, taps
│   └── models.js             # llama-server (desktop) and llama.rn (phone) adapters
├── constitution/
│   └── artistic-tier.json    # Robert's tier, empty until he fills it
├── fixtures/                 # Synthetic test Beans and tags (not Portmanteau canon)
├── test/
└── cli.js                    # Talk to Boolean in a terminal
scripts/boolean-ledger.js     # Phase 1 export
```

## Use

```bash
# Phase 1: apply the Ledger to BEAN_CONVERTER output and export
node scripts/boolean-ledger.js beans.jsonl out/
node scripts/boolean-ledger.js beans.jsonl --check   # report overrides, write nothing

# Talk to Boolean (dry run prints the Sources the model would get)
node boolean/cli.js --graph out/runtime-graph.jsonl --position 1

# With a stock open model on your own machine
llama-server -m <model>.gguf --port 8080
node boolean/cli.js --graph out/runtime-graph.jsonl --model http://127.0.0.1:8080

npm test
```

## Bean record

One JSON object per line. The Ledger fields come from the Ledger's converter spec; the runtime fields are what the graph needs.

| Field | Values | Used by |
|---|---|---|
| `bean_id`, `title`, `text` | strings | all |
| `ratification` | `C`, `P`, `?` | Ledger |
| `authorship` | `robert`, `ai`, `mixed`, `third_party` | Ledger |
| `scope` | `project`, `personal`, `unclear` | Ledger, graph |
| `use` | `train`, `runtime`, `hold`, `eval`, `exclude` | Ledger, graph |
| `training_set` | `voice`, `decision`, `correction`, `null` | export |
| `source`, `source_ref` | per the Ledger | export |
| `prompt` | the situation, for decision and correction examples | export |
| `mode` | `story` (the world) or `curtain` (its making) | graph |
| `chapter` | whole number; `0` is spoiler-free; `null` is gated | spoiler gate |
| `provenance` | `D`, `R`, `O` | story mode keeps only `D` and `R` |
| `unlock` | `token` when a Bean token must be tapped first | graph |

## Guarantees the tests hold

- Nothing personal, unclear, mixed, held, or sealed for eval ever enters the graph, whatever its `use` field claims. The graph re-runs the Ledger on load.
- AI-written text never trains, ratified or not.
- The model never sees a Bean past the reader's position. A Bean with no chapter tag is treated as a spoiler.
- When nothing may be said, Boolean answers "That isn't in the book." (or says it's further on) without calling the model.
- An answer citing nothing, or citing a Bean it wasn't given, is marked unsupported.
- The model adapter refuses any host that isn't the user's own hardware.

## Choices made here

- Held-out decision and correction examples are kept out of the runtime graph, so Boolean can't retrieve the answers the disguise test scores against. Held-out voice text (the book) stays readable.
- Finishing the book does not unlock spoilers yet; the reader unlocks them in Settings. `finishBook(reader, { unlocksSpoilers: true })` flips that once decided.
- The held-out fraction defaults to the Ledger's suggested 10% and freezes on the first export.
- Tag taps are accepted offline without SUN verification, per the prototype plan.

## Open, not decided here

Base model family and size. iOS or Android first. Domain for tag links. SUN verification. One tag ID space or two. Whether finishing unlocks spoilers. The artistic tier's contents.
