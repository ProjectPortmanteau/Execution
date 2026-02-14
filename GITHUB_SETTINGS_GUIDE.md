> **NOTE:** These settings have not yet been applied. Follow the steps below to update the repository's public-facing metadata in the GitHub UI.

# GitHub Repository Settings Guide

Follow these steps to update the public-facing metadata for the **ProjectPortmanteau/Execution** repository.

## 1. Update the "About" Section
1. Navigate to the repository home page on GitHub.
2. Click the gear icon (⚙️) next to the **About** section on the right-hand side.
3. Paste the following into the **Description** field:
   > A recursive creative ecosystem where philosophy, platform, methodology, and AI reinforce each other. Built on the Bean knowledge management system (OPVS).
4. Add the following **Topics** (prioritized for discoverability):
   - `knowledge-graph`
   - `byok`
   - `ai-calibration`
   - `spirit-marketplace`
   - `recursive-systems`
   - `pfe-methodology`
   - `opvs`
   - `semantic-git`
   - `web3-ledger`
   - `simulation-theory`
5. Click **Save changes**.

## 2. Commit Sequence
The following semantic commit sequence is used to maintain the integrity of the Ark (Shadow Ledger):

1. **README Update:**
   ```bash
   git add README.md
   git commit -m "[LORE] Updated repository README — public-facing project overview"
   ```

2. **Spirit Calibration Blueprint (Genesis):**
   ```bash
   # Create directory and add the calibration document
   git add spirit-calibration/
   git commit -m "[PODIUM] Genesis Blueprint V1.0 — Spirit Calibration Standard"
   ```

## 3. Why This Matters
The `[LORE]` tag ensures the README update is recorded as context/worldbuilding. The `[PODIUM]` tag for the Blueprint indicates a "Crystallized" truth—an immutable standard that is ready for the Spirit Marketplace. This structure ensures that someone landing on the repo for the first time gets a coherent story instead of just a file listing.