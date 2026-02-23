# Contributing to the Beans Ledger

This repository uses a per-layer, front-matter driven format to keep the Master Ledger readable and machine-friendly.

Quick rules:
- File location: each Bean file lives in /beans and is named with the layer prefix: e.g., `beans/01_Layer_1_Visionary_Blueprint.md`.
- Front-matter (YAML) required at top of each file:
 - id: stable id (e.g., layer-1)
 - title: human title
 - tags: list
 - status: draft | verified | archived
- Do not include inline [Source ...] citations. Instead:
 - Add original source IDs to `beans/_sources.json` under the Bean ID mapping.
- Commit message template:
 - Add/Update bean: "Add/Update beans/<filename> <Your Name>"
- PRs:
 - Small, focused PRs for bean additions/edits are preferred.
 - Changes that alter canonical definitions must include rationale and references in the PR description.

If you want, I can:
- Retry pushing these files into ProjectPortmanteau/Execution (main) now, or
- Generate and push a full beans/_sources.json mapping (complete provenance) before committing.

(End of CONTRIBUTING.md)