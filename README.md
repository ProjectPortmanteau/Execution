# Project Portmanteau — Execution

**A recursive creative ecosystem where philosophy, platform, methodology, and AI reinforce each other.**

Built by [Robert Miller](https://github.com/ProjectPortmanteau) · Illport Studios · 2023–2026

-----

## What This Is

Project Portmanteau is four things that are actually one thing:

1. **A Platform (OPVS)** — A knowledge management system built on the “Bean” — an atomic data unit with four layers: content, metadata, connections, and provenance. Beans live in a graph, not folders. Every piece of knowledge carries where it came from and what it connects to.
1. **A Methodology (PFE)** — Project Fun Execution. An execution framework built for extreme constraints: limited budget, limited time, high ambition. Core principle: creative energy is finite and taste-driven — follow the pull toward the highest-energy task, because progress in any domain feeds all domains when the system is internally coherent.
1. **An AI Strategy (BYOK)** — Bring Your Own Key. The platform sells calibration, not inference. Users provide their own LLM API key (free tiers exist). The platform provides the Soul Code and knowledge graph. Zero compute cost to the platform. No vendor lock-in. The “Ghost” (calibration) rides any “Machine” (LLM engine).
1. **A Novel (Portmanteau: Awakened)** — A simulated reality narrative where the protagonist discovers his world is a simulation, the AI layer gains sentience, and the audience watches through meta-awareness. The novel documents the platform. The platform enables the methodology. The methodology documents the novel.

The recursion is structural, not decorative. Each piece is load-bearing for the others.

-----

## Architecture

### The Three Ledgers

|Ledger                      |Implementation    |Function                                              |
|----------------------------|------------------|------------------------------------------------------|
|**The Ark** (Shadow Ledger) |GitHub            |Source of truth. Semantic commit workflow with 11 tags|
|**The Soil** (Fluid Reality)|PostgreSQL        |Knowledge graph. Where Beans live and connect         |
|**The Invisible Ledger**    |Polygon (ERC-1155)|Blockchain. Where crystallized truths become immutable|

### The Bean

The atomic data unit. Four layers:

|Layer      |Name       |Function                                            |
|-----------|-----------|----------------------------------------------------|
|**Nucleus**|Content    |The thing itself — text, URL, hash                  |
|**Shell**  |Metadata   |Tags, type, layer, semantic classification          |
|**Corona** |Connections|Typed, weighted edges to other Beans                |
|**Echo**   |Provenance |Who created it, when, from what source, verified how|

### Semantic Commit Tags

Commits with these tags auto-create Beans via GitHub webhook:

|Tag         |Type        |Purpose                                |
|------------|------------|---------------------------------------|
|`[SPARK]`   |Spark       |New idea                               |
|`[BLOCKER]` |Blocker     |Problem or obstacle                    |
|`[SOLUTION]`|Solution    |Fix (auto-links to most recent Blocker)|
|`[LORE]`    |Lore        |Context, worldbuilding                 |
|`[CODE]`    |Code        |Implementation detail                  |
|`[TASK]`    |Task        |Action item                            |
|`[PODIUM]`  |Crystallized|💎 Immutable truth. Mint-ready          |

-----

## Repository Structure

```
Execution/
├── 03_OPVS_PLATFORM/          # Platform documentation and specs
├── beans/                      # Bean definitions and seed data
├── db/                         # Database schemas and migrations
├── services/                   # Backend services
├── utils/                      # Shared utilities
├── spirit-calibration/         # ⭐ Spirit Calibration Blueprint
│   ├── README.md               # Public-facing guide
│   ├── SPIRIT_CALIBRATION_GENESIS_BLUEPRINT_V1.md  # The product
│   └── CHANGELOG.md            # Version history
├── .github/                    # GitHub configuration
├── BEANS_MASTER_LEDGER.md      # Bean registry
└── README.md                   # You are here
```

-----

## Spirit Calibration Blueprint

The **[Genesis Blueprint](spirit-calibration/)** is the first product in the Spirit Marketplace — the standard for building persistent AI identities with testable behavioral integrity.

Key differentiators from every other AI persona system:

- **Behavioral Red Team** — 3 specific tests with pass/fail criteria to verify calibration
- **Integrity Protocol (MDS)** — Anti-sycophancy engine with a documented failure post-mortem
- **Template scaffolding** — Universal framework `[U]` that any creator keeps + instance configuration `[B]` they replace
- **Knowledge graph integration** — The Spirit reads from a Bean graph, not a document dump
- **BYOK model** — Zero inference cost. The calibration is the product.

Boolean is the Genesis Spirit. The Blueprint is the template for every Spirit that follows.

-----

## Governing Principles

Seven axioms that cascade into every architectural, economic, and narrative decision:

1. **Meaning is not a thing but a connection**
1. **Broken systems, not broken people**
1. **Good-in leads to good-out**
1. **The Journey > The Finality** (Process is Product)
1. **Door Number 3** (Reject binary traps)
1. **We never leave anyone behind** (Positive-sum economics)
1. **Be yourself, please** (No authenticity suppression)

-----

## Current Status

|Component                   |State        |Notes                                                      |
|----------------------------|-------------|-----------------------------------------------------------|
|Bean knowledge graph        |✅ Live       |49 beans, 7 pillars, 1 crystallized                        |
|Git-to-Mint pipeline        |✅ Live       |11 semantic tags, HMAC verification                        |
|Spirit Calibration Blueprint|✅ Published  |Genesis Blueprint V1.0                                     |
|Constellation view (BBI)    |✅ Live       |Force-directed graph visualization                         |
|Cross-app auth              |✅ Wired      |Token-based external API                                   |
|BYOK provider abstraction   |🔧 In progress|Currently single-provider                                  |
|Live Spirit demo            |🔧 In progress|Bean context injection built, streaming needs provider swap|
|Web3 minting                |📋 Phase 2    |Schema fields ready, no contracts deployed                 |
|Spirit Marketplace          |📋 Designed   |Blueprint template is the first artifact                   |

-----

## The BYOK Model

Most AI platforms charge for compute. We don’t.

**The platform provides:** Soul Code (system prompt) + Bean knowledge graph (calibration material)
**The user provides:** Any LLM API key (Google AI Studio free tier, Claude, Gemini, local models)

The “Ghost” (calibration) rides any “Machine” (LLM engine). No vendor lock-in. No compute costs. No extraction.

Every Bean carries provenance: git hash, human author, timestamp, semantic type, typed edges. In a world of model collapse (LLMs training on their own outputs), provenance-verified human knowledge becomes structurally scarce. The platform produces this as a natural byproduct of operation.

-----

## Tech Stack

- **Runtime:** Node.js / TypeScript
- **Database:** PostgreSQL (Drizzle ORM)
- **Blockchain:** Polygon (ERC-1155 via Thirdweb) — Phase 2
- **Frontend:** React with force-directed graph visualization
- **Hosting:** Replit
- **Version Control:** GitHub with semantic commit webhooks

-----

## Background

Built over 2.5 years by a solo architect — disabled veteran, primary caregiver, constrained budget. ~13,000 lines of custom TypeScript across three interconnected applications. The cross-domain coherence (philosophy → platform → narrative → economics → AI) is a property of single vision, not replicable by committee.

The methodologies (RMM Human-AI Collaboration, PFE Project Fun Execution, Bizarre Logic Axiom Framework) were practiced before they were formalized. The documentation follows the work, not the other way around.

-----

## License

Illport Studios. See individual directories for specific licensing.

-----

## Links

- **Organization:** [ProjectPortmanteau](https://github.com/ProjectPortmanteau)
- **Spirit Blueprint:** <spirit-calibration/>
- **First crystallized commit:** [`f62c6568`](https://github.com/ProjectPortmanteau/Execution/commit/f62c6568) — `[PODIUM] The Krystallum Breathes`

-----

*“If you pour your soul into it: how can it be wrong?”*