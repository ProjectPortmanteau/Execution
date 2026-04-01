# viberank

CLI tool for analyzing and ranking Beans by philosophical alignment with Layer 0 principles.

## Overview

`viberank` is a command-line utility that reads Bean files from the Project Portmanteau repository and ranks them based on their "vibe score" — a measure of how strongly they resonate with the core philosophical principles defined in Layer 0 (Soul Code).

## Installation

From within the project directory:

```bash
npm install
```

## Usage

### Basic Usage

Rank all Beans across all layers:

```bash
npx viberank
```

### Filter by Layer

Rank only Beans from a specific layer (0-6):

```bash
npx viberank --layer 0
```

### Verbose Output

Show detailed information including source files:

```bash
npx viberank --verbose
```

### Help

Display help message:

```bash
npx viberank --help
```

## How It Works

### Vibe Score Calculation

The vibe score is calculated by analyzing Bean content for:

1. **Philosophy Keywords** — Presence of Layer 0 concepts like:
   - People > Money
   - Broken systems, not broken people
   - Door Number 3 thinking
   - Positive-sum collaboration
   - Creative license and ambiguity
   - Integrity and loyalty
   - And more...

2. **Cross-References** — Explicit references to Layer 0 Beans (e.g., `PHIL-001`)

3. **Structural Elements** — Bean formatting (Principle, Application, Content fields)

Higher scores indicate stronger philosophical alignment with the project's core values.

### Output Format

The tool displays a ranked table with:

- **Rank** — Position in the ranking (1 = highest vibe score)
- **ID** — Bean identifier (e.g., `PHIL-008`, `LORE-003`)
- **Vibe** — Calculated vibe score
- **Layer** — Bean layer (0-6)
- **Title** — Bean title/description

### Summary Statistics

After the ranking table, the tool displays:

- Total number of beans analyzed
- Average vibe score
- Score range (min - max)

## Examples

### Example 1: Analyze All Beans

```bash
$ npx viberank

🫘 VIBERANK — Bean Philosophical Alignment Analysis

════════════════════════════════════════════════════════════════════════════════

All Beans (ranked by philosophical alignment)

Rank | ID           | Vibe | Layer | Title
────────────────────────────────────────────────────────────────────────────────
   1 | ARK-006      |   28 | L6    | Trilogy Arc — Structural Map
   2 | PHIL-008     |   17 | L0    | The Pride Override
   3 | PHIL-012     |   16 | L0    | Idea vs. Person Separation
   ...

Total beans analyzed: 161
Average vibe score: 3.33
Range: 0 - 28
```

### Example 2: Analyze Layer 0 Only

```bash
$ npx viberank --layer 0

🫘 VIBERANK — Bean Philosophical Alignment Analysis

════════════════════════════════════════════════════════════════════════════════

Layer 0 Beans (ranked by philosophical alignment)

Rank | ID           | Vibe | Layer | Title
────────────────────────────────────────────────────────────────────────────────
   1 | PHIL-008     |   17 | L0    | The Pride Override
   2 | PHIL-012     |   16 | L0    | Idea vs. Person Separation
   3 | PHIL-001     |   15 | L0    | Constitutional Amendment #1 - People > Money
   ...

Total beans analyzed: 12
Average vibe score: 13.42
Range: 9 - 17
```

## Use Cases

- **Quality Assurance** — Verify that new Beans maintain philosophical coherence
- **Discovery** — Find Beans with strong alignment to core principles
- **Documentation** — Identify which Beans best embody the project philosophy
- **Onboarding** — Help new contributors understand which Beans to study first

## Technical Details

### Dependencies

- `fs` — File system operations (built-in)
- `path` — Path utilities (built-in)
- `gray-matter` — Markdown frontmatter parsing
- `utils/parser.js` — Bean parsing utilities

### File Structure

The tool expects the following directory structure:

```
project-root/
├── bin/
│   └── viberank.js
├── beans/
│   ├── 00_Philosophy.md
│   ├── 01_Layer_1_Visionary_Blueprint.md
│   ├── 02_Layer_2_Narrative_Roadmap.md
│   ├── 03_Layer_3_Execution.md
│   ├── 04_Layer_4_Lore.md
│   ├── 05_Layer_5_Process.md
│   └── 06_Layer_6_Ark_Consolidated.md
└── utils/
    └── parser.js
```

## Philosophy

This tool embodies the Project Portmanteau principle of **coherence measurement**. In a recursive creative ecosystem where philosophy → platform → methodology → narrative, viberank provides a quantitative way to verify that all layers maintain alignment with the foundational Soul Code.

As stated in PHIL-008 (The Pride Override):

> "Winning the argument isn't worth losing your vibe."

This tool helps ensure the entire Bean graph maintains its vibe.

## License

Part of the OPVS Genesis Engine — iLL Port Studios

See root LICENSE file for details.
