# Boolean

Boolean's agent core, built from the AI Bean Slum Edition build plan and the Boolean Training Data Ledger. Plain Node.js (CommonJS), no dependencies, so the runtime code moves into the React Native app unchanged.

## Base model

[Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B), Apache 2.0, pinned by revision in `model.json` with its 4-bit GGUF ([unsloth/Qwen3.5-4B-GGUF](https://huggingface.co/unsloth/Qwen3.5-4B-GGUF), Q4_K_M, 2.74 GB) and that file's SHA-256.

- Why: the newest small Qwen line (Qwen3.8 starts at 27B), and 4B is the tier mid-range phones run at 4-bit. Its hybrid Gated DeltaNet layers keep the KV cache small on device.
- LoRA adapters train on this exact checkpoint. Moving to another base means retraining.
- Qwen3.5 thinks by default. The profile turns that off with `chat_template_kwargs: {"enable_thinking": false}` and uses the card's non-thinking sampling; any think block that still comes back is stripped.
- It ships a vision encoder (`mmproj`); Boolean is text-only and never downloads it.
- Run end to end on the pinned GGUF through llama-server (Oct 10, 2026) against the fixtures: cited answers, the spoiler short-circuit, contradicting a wrong claim, "That isn't in the book.", labelling an outline as not canon, declining off-topic asks, and refusing to speak as Robert all held. At temperature 0.7 the stock model still overstates sometimes (once it said a non-canon event "did not" happen, when the Sources are silent). The fine-tune and the Fabrication check are where that gets measured. Answers took 12 to 30 s on a 4-core cloud CPU; phone speed is unmeasured.
- `node scripts/boolean-model.js verify` checks the license of every pinned checkpoint on Hugging Face and fails unless all are Apache 2.0. `download <dir>` runs that check, then fetches the GGUF and verifies size and hash.

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
├── model.json                # Pinned base model: Qwen3.5-4B, Apache 2.0
├── constitution/
│   └── artistic-tier.json    # Robert's tier, empty until he fills it
├── fixtures/                 # Synthetic test Beans and tags (not Portmanteau canon)
├── test/
└── cli.js                    # Talk to Boolean in a terminal
scripts/boolean-ledger.js     # Phase 1 export
scripts/boolean-model.js      # License check and verified GGUF download
```

## Use

```bash
# Phase 1: apply the Ledger to BEAN_CONVERTER output and export
node scripts/boolean-ledger.js beans.jsonl out/
node scripts/boolean-ledger.js beans.jsonl --check   # report overrides, write nothing

# Talk to Boolean (dry run prints the Sources the model would get)
node boolean/cli.js --graph out/runtime-graph.jsonl --position 1

# With the pinned model on your own machine
node scripts/boolean-model.js download models/
llama-server -m models/Qwen3.5-4B-Q4_K_M.gguf --jinja -c 8192 --port 8080
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

iOS or Android first. Domain for tag links. SUN verification. One tag ID space or two. Whether finishing unlocks spoilers. The artistic tier's contents.
