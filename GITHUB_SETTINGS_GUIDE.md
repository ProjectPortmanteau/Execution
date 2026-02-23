> **NOTE:** These settings have not yet been applied. Follow the steps below to update the repository's public-facing metadata in the GitHub UI.

# GitHub Repository Settings Guide

Follow these steps to update the public-facing metadata for the **ProjectPortmanteau/Execution** repository.

## 1. Update the "About" Section
1. Navigate to the repository home page on GitHub.
2. Click the gear icon (⚙️) next to the **About** section on the right-hand side.
3. Paste the following into the **Description** field:
 > A recursive creative ecosystem: knowledge graph, AI calibration framework, and execution methodology built on the Bean primitive. Sell calibration, not inference.
4. Add the following **Topics** (prioritized for discoverability):
 - `knowledge-graph`
 - `ai-calibration`
 - `byok`
 - `multi-agent`
 - `semantic-commits`
 - `typescript`
 - `postgresql`
 - `spirit-marketplace`
 - `provenance`
 - `knowledge-management`
 - `llm`
 - `opvs`
 - `recursive-systems`
 - `pfe-methodology`
 - `semantic-git`
5. In the **Website** field, add the Groove-Shift deployment URL.
6. Click **Save changes**.

> **Why topics matter:** GitHub topics enable discoverability through GitHub's Explore page, search filters, and topic-based collections. They also signal to search engines that this content is worth indexing.

## 2. Create a Release (v1.0.0)
1. Go to the repository's **Releases** page.
2. Click **Draft a new release**.
3. In the **Tag** field, enter: `v1.0.0`
4. Set **Target** to `main`.
5. Set **Release title** to: `Genesis: 85 beans, BYOK architecture, Boolean live, Spirit Calibration Blueprint`
6. In the description, summarize the key components:
 - 85 beans across 7 layers (0–6) with provenance tracking
 - Git-to-Mint pipeline with semantic commit tags
 - Spirit Calibration Genesis Blueprint V1.1
 - BYOK model: sell calibration, not inference
 - CI/CD with Neon branch-per-PR
7. Click **Publish release**.

> **Why releases matter:** Repositories with zero releases and 100+ commits signal abandonment. A tagged release signals intent and maturity.

## 3. Commit Sequence
The following semantic commit sequence is used to maintain the integrity of the Ark (Shadow Ledger):

1. **README Update:**
 ```bash
 git add README.md
 git commit -m "[LORE] Updated repository README public-facing project overview"
 ```

2. **Spirit Calibration Blueprint (Genesis):**
 ```bash
 # Create directory and add the calibration document
 git add spirit-calibration/
 git commit -m "[PODIUM] Genesis Blueprint V1.0 Spirit Calibration Standard"
 ```

## 4. Why This Matters
The `[LORE]` tag ensures the README update is recorded as context/worldbuilding. The `[PODIUM]` tag for the Blueprint indicates a "Crystallized" truthan immutable standard that is ready for the Spirit Marketplace. This structure ensures that someone landing on the repo for the first time gets a coherent story instead of just a file listing.

## 5. External Backlinks (SEO)
External links are what trigger Google to index the repo. Post the repository URL on:
- Your LinkedIn profile (featured section)
- A LinkedIn article about the architecture
- Any relevant community (Hacker News Show HN, Reddit r/SideProject, Indie Hackers)

Without external links, the repo will remain invisible to search engines regardless of how good the content is.