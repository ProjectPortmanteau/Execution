# Contributing to the Beans Ledger

This repository uses a per-layer, front-matter driven format to keep the Master Ledger readable and machine-friendly.

## Quick Rules

- **File location:** Each Bean file lives in `/beans/` and is named with the layer prefix (e.g., `beans/01_Layer_1_Visionary_Blueprint.md`).
- **Front-matter (YAML)** required at the top of each file:
  - `id` — stable id (e.g., `layer-1`)
  - `title` — human-readable title
  - `tags` — list of tags
  - `status` — `draft | verified | archived`
- **Source attribution:** Do not include inline `[Source ...]` citations. Instead, add original source IDs to `beans/_sources.json` under the Bean ID mapping.
- **Commit message template:** `Add/Update beans/<filename> <Your Name>`
- **PRs:** Small, focused PRs for bean additions/edits are preferred. Changes that alter canonical definitions must include rationale and references in the PR description.

## Validation Checklist

When making changes, verify:

- [ ] Bean IDs are unique and follow naming conventions (e.g., `PHIL-001`, `LORE-005`)
- [ ] All new Beans are registered in `beans/_sources.json`
- [ ] `BEANS_MASTER_LEDGER.md` reflects the current state
- [ ] Cross-references between layers are intact
- [ ] Markdown formatting is consistent with existing files