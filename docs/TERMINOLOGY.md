# OPVS 47 Terminology

> The canonical vocabulary for OPVS 47, the body of work from iLL Port Studios. Each coined term is defined once here, mapped to its nearest prior art, and given a status. In public writing, name the neighbor first, then state the divergence.

**Maintained by:** Robert M. Miller (RMM)
**Last updated:** 2026-10-30
**Provenance:** Definitions come from the `beans/` files, the Principled Playground docs, `START_HERE.md`, and RMM's own record (working papers, lexicons, and spec documents, cited per entry where used). The prior-art mapping was drafted with Claude (Opus 5.5) on 2026-10-30. Dated papers, quotations, and attributed findings were then checked against sources the same day; each entry's **Check** line says what was checked. No outside reviewer has read it yet. Under the Blind Prediction doctrine the generator is not its own falsifier, so every **Original** status is provisional until the Originality Research Agent or a literature search confirms it.

---

## How to read an entry

- **Definition:** what the term means in OPVS 47.
- **Prior art:** the closest established work, by author or title.
- **Divergence:** where OPVS 47 departs from that work. This is the contribution, if there is one.
- **Status:** one of the values below.
- **Check:** what was verified on 2026-10-30. *Verified* means the dated papers, quotations, and attributed findings named were confirmed against a source. *Standard* means the entry names standard works by author and title only, which were not individually checked. *Corrected* means the check changed the entry. *Record* names the RMM document a definition comes from.

| Status | Meaning |
|---|---|
| Original | Substantive divergence; no close prior art found in this pass |
| Extension | Established idea carried into a new domain or mechanism; the extension is the contribution |
| Renamed | Established idea under a new name; cite the original in public writing |
| Aspiration | Named goal without a working mechanism yet |
| Aphorism | Personal maxim; prior art noted for context, no originality claim |
| Product term | Name for a part of the system; no originality claim |
| Borrowed | Existing term used as-is |
| Needs definition | Name in use, meaning not settled |

**Scope.** World and fiction terms (the Fray, ADEB, the Slum, Trim, the Tick, the Keystone Chord) are Project Portmanteau canon and live in `beans/04_Layer_4_Lore.md` and the Layer 2 roadmap. Fiction makes no priority claims, so it is not audited here. Terms used in both the fiction and the platform are listed under [Open terminology decisions](#9-open-terminology-decisions).

## Contents

1. [Names and structure](#1-names-and-structure)
2. [Axioms](#2-axioms)
3. [Mind and consciousness](#3-mind-and-consciousness)
4. [Epistemics and evaluation](#4-epistemics-and-evaluation)
5. [AI behavior and collaboration](#5-ai-behavior-and-collaboration)
6. [Method](#6-method)
7. [Systems and society](#7-systems-and-society)
8. [Platform](#8-platform)
9. [Open terminology decisions](#9-open-terminology-decisions)
10. [Named but undefined](#10-named-but-undefined)
11. [Closest neighbors](#11-closest-neighbors)

---

## 1. Names and structure

### OPVS (Omniversal Project Vision System)
- **Definition:** The semantic knowledge graph at the center of the work. Ideas live as connected nodes that carry their provenance, not as files in folders. Described as ERP for storytelling.
- **Status:** Product term.
- **Check:** No citations.

### OPVS 47
- **Definition:** The name for the body of work and its framework (adopted 2026-10-06). Bare "OPVS" is the earlier form, retired as a lead name partly to avoid confusion with an unrelated company using the name.
- **Status:** Product term.
- **Check:** No citations.

### Trail Scribe and the Author's Trail
- **Definition:** Trail Scribe is the product: the storytelling ERP (adopted 2026-10-24). The Author's Trail is the record it keeps: the trail the author leaves, as opposed to a trail of rules laid by others. "Don't follow the trail, leave one." iLL Port Studios is the maker.
- **Status:** Product term.
- **Check:** No citations.

### The Codex
- **Definition:** The philosophical framework of OPVS 47: 44+ axioms across six sections. Its relationship to the Soul Code and the Governing Principles is an [open decision](#9-open-terminology-decisions).
- **Status:** Product term.
- **Check:** No citations.

### Five-layer recursion and the Coherence Engine
- **Definition:** Two descriptions of one loop. The five-layer recursion: Codex → PFE / Follow Pull → Platform → Novel → Behind the Curtain → Codex. The Coherence Engine (ARK-002) is the same structure at corpus level: Layer 0 Philosophy → 1 Vision → 2 Narrative → 3 Execution → 4 Lore → 5 Process → 6 Ark → back to 0, implemented as a recursive CTE with typed edges between adjacent layers.
- **Prior art:** Ludwig von Bertalanffy, *General System Theory* (isomorphic structure across disciplines); Gregory Bateson, *Mind and Nature* ("the pattern which connects"); Douglas Hofstadter, *Gödel, Escher, Bach* (strange loops).
- **Divergence:** The tradition describes cross-domain structure. OPVS 47 makes it a build constraint: a change in one layer has to be queryable as propagation through the others.
- **Status:** Extension.
- **Check:** Verified: Bateson's phrase in *Mind and Nature*. Standard: von Bertalanffy, Hofstadter.

### Behind the Curtain (BTC)
- **Definition:** The public transparency layer. The process is published as it happens, and the conversation record works as training corpus, rehearsal mechanism, and arbitration surface at once, feeding back into the work.
- **Prior art:** Open notebook science (Jean-Claude Bradley); Andy Matuschak's "working with the garage door up"; Austin Kleon, *Show Your Work!*
- **Divergence:** The transparency record is also the calibration data for Boolean, so publishing the process is part of building the product.
- **Status:** Extension.
- **Check:** Standard.

### Process as Product
- **Definition:** The making of the work is a deliverable in its own right. The chain: build the product, which generates Behind the Curtain, which trains Boolean, which demonstrates why a Spirit Marketplace works.
- **Prior art:** Build-in-public practice; Kleon, *Show Your Work!*
- **Divergence:** The chain ends in a trained model, not only an audience.
- **Status:** Extension.
- **Check:** Standard.

---

## 2. Axioms

Three axiom sets are in use: the Codex (44+), the Soul Code in Layer 0 (12 Beans, PHIL-001 to PHIL-012), and the seven Governing Principles in the README. Entries below cover the published ones.

### Meaning is not a thing but a connection (Governing Principle 1)
- **Definition:** A thing's meaning lives in its relations, not its contents. Encoded in the Bean as "the connections mean."
- **Prior art:** Ferdinand de Saussure (meaning from relations and differences); J.R. Firth, "you shall know a word by the company it keeps," the root of distributional semantics and of the embeddings inside every language model.
- **Divergence:** Made architectural: meaning is stored as typed edges (Corona), separate from content (Nucleus). See [The Bean](#the-bean).
- **Status:** Renamed (the principle). The Bean architecture that encodes it is an Extension.
- **Check:** Verified: Firth (1957) as the source of the quotation. Standard: Saussure.

### Broken systems, not broken people (PHIL-002, The Soil Composition Matters)
- **Definition:** "It's not the person that is broken. Only broken systems." Fix the environment, not the person. Also stated as "bad soil, not bad seeds."
- **Prior art:** W. Edwards Deming (most problems belong to the system, not the worker); Kurt Lewin, B = f(P, E); Philip Zimbardo, *The Lucifer Effect* ("bad barrels"); Lee Ross's fundamental attribution error.
- **Divergence:** Little in the principle. Its use as the anchor axiom of the Roux Spirit is the application.
- **Status:** Renamed. Cite Deming and Zimbardo.
- **Check:** Verified: Deming's system-vs-worker attribution; Zimbardo's bad barrels in *The Lucifer Effect*. Standard: Lewin, Ross.

### People > Money (PHIL-001)
- **Definition:** Money is energy, not the objective. Contracts must audit for empowerment: a contract that extracts value without empowering the person violates the amendment.
- **Prior art:** Frederick Herzberg's two-factor theory (pay as a hygiene factor, not a motivator); Simon Sinek, *Start with Why*.
- **Divergence:** The contract audit turns a value into a check.
- **Status:** Aphorism. The contract audit is the operational part.
- **Check:** Standard.

### No Boxes (PHIL-003)
- **Definition:** Reject reductive categorization. "You don't have to be just one thing."
- **Prior art:** Labeling theory (Howard Becker, *Outsiders*); anti-essentialism.
- **Status:** Renamed.
- **Check:** Standard.

### Good is Greedy (PHIL-004)
- **Definition:** In the Sentient Economy, the most self-interested move is to feed the Village, because RISS rewards contribution. Benevolence becomes the rational strategy.
- **Prior art:** Tocqueville's "self-interest rightly understood"; Robert Axelrod, *The Evolution of Cooperation*; Adam Grant, *Give and Take*.
- **Divergence:** The incentive is built into a scoring mechanism instead of argued for.
- **Status:** Extension.
- **Check:** Standard.

### Door Number 3 (PHIL-005)
- **Definition:** "Door number 3 doesn't exist, we need to create it." Given two bad options, architect a third. Identity anchor of the Boolean Spirit.
- **Prior art:** Roger Martin, *The Opposable Mind* (integrative thinking); Roger Fisher and William Ury, *Getting to Yes* (inventing options for mutual gain); the false-dilemma fallacy.
- **Status:** Renamed. Cite Martin.
- **Check:** Standard.

### Better Substitute Principle
- **Definition:** Build better substitutes for conventional systems instead of fighting them. Paired with Door Number 3.
- **Prior art:** Buckminster Fuller, as reported by Mike Vance in *Think Out of the Box* (1995): you never change anything by fighting it; you change things by making them obsolete through superior technology. The popular "build a new model that makes the existing model obsolete" wording appears first in Daniel Quinn's *Beyond Civilization* (1999) without a source.
- **Status:** Renamed. Cite Fuller through Vance, not the Quinn wording.
- **Check:** Corrected. The widely quoted Fuller wording traces to Daniel Quinn (1999); Fuller's documented version comes through Mike Vance (1995).

### The Smudge Factor (PHIL-006, META-001)
- **Definition:** The margin of best guess where creative license lives. Precision should not kill flow.
- **Prior art:** "Fudge factor" (the name plays on it); Herbert Simon's satisficing; John Keats's negative capability.
- **Status:** Renamed.
- **Check:** Standard.

### The Olfactory Paradox (PHIL-007)
- **Definition:** Enjoy your own work, but do not assume it lands the same way for everyone.
- **Prior art:** The IKEA effect (Norton, Mochon and Ariely): people overvalue what they made.
- **Status:** Aphorism.
- **Check:** Verified: Norton, Mochon and Ariely, the IKEA effect.

### The Pride Override (PHIL-008)
- **Definition:** Happiness over pride. Winning the argument is not worth losing the collaboration.
- **Prior art:** The common question "would you rather be right or happy?"
- **Status:** Aphorism.
- **Check:** No citations.

### The Positive-Sum Mandate (PHIL-009)
- **Definition:** Grow the pie so everyone eats. Reject fixed-pie thinking.
- **Prior art:** Positive-sum games; the fixed-pie bias in negotiation research (Max Bazerman and Margaret Neale).
- **Status:** Renamed.
- **Check:** Verified: the fixed-pie bias in Bazerman and Neale's negotiation research.

### The Marine's Vow (PHIL-010) and "We never leave anyone behind" (Governing Principle 6)
- **Definition:** Loyalty is architectural, not transactional. Do not abandon those who walked beside you.
- **Prior art:** The military ethos of leaving no one behind; *Semper Fidelis*.
- **Status:** Aphorism.
- **Check:** No citations.

### The Keller Critique (PHIL-011)
- **Definition:** A system with unlimited sensors and no integrity is more dangerous than one with limited senses and deep integrity. "How deep is your data?"
- **Prior art:** Russell Ackoff's data, information, knowledge, wisdom hierarchy.
- **Divergence:** Treats integrity as a sense. That turn of phrase is the original part.
- **Status:** Aphorism.
- **Check:** Standard.

### Idea vs. Person Separation (PHIL-012)
- **Definition:** "I am not my idea." Attack ideas, never the person; fight for the best idea, not your idea.
- **Prior art:** Paul Graham, "Keep Your Identity Small"; Marshall Rosenberg, *Nonviolent Communication*; Ray Dalio's idea meritocracy; the ad hominem fallacy.
- **Status:** Renamed.
- **Check:** Verified: Graham's essay exists under that title. Standard: Rosenberg, Dalio.

### Good-in leads to good-out (Governing Principle 3)
- **Definition:** Data quality governs model quality.
- **Prior art:** GIGO (garbage in, garbage out).
- **Status:** Borrowed.
- **Check:** No citations.

### The Journey > The Finality (Governing Principle 4)
- **Definition:** Process outranks the declaration of completion. The axiom form of the [Finality Drive](#finality-drive) and [Process as Product](#process-as-product).
- **Status:** See Finality Drive.
- **Check:** No citations.

### Be yourself, please (Governing Principle 7)
- **Definition:** No authenticity suppression.
- **Status:** Aphorism.
- **Check:** No citations.

### Don't marry an idea
- **Definition:** Non-attachment to ideas as an operating stance: change is inevitable in good work. Distinct from Follow Pull.
- **Prior art:** Paul Saffo, "strong opinions, weakly held"; Arthur Quiller-Couch, "murder your darlings."
- **Status:** Aphorism.
- **Check:** Verified: Saffo as the source of the phrase; Quiller-Couch, *On the Art of Writing*.

---

## 3. Mind and consciousness

Source for the first four entries: the essay "Consciousness is the Map" (v3, April 2026).

### Consciousness as compression (editor, not author)
- **Definition:** Consciousness is the compression algorithm that edits experience into a usable stream. It edits; it does not author.
- **Prior art:** Tor Nørretranders, *The User Illusion* (consciousness as massive bandwidth reduction); Daniel Dennett's multiple drafts model; Michael Gazzaniga's left-brain interpreter; Benjamin Libet's readiness-potential experiments.
- **Divergence:** Little in the core claim. The divergence is the next entry.
- **Status:** Renamed.
- **Check:** Verified: Nørretranders, *The User Illusion*. Standard: Dennett, Gazzaniga, Libet.

### Frame rate as a trainable variable
- **Definition:** The temporal resolution of conscious experience varies between people and can be trained.
- **Prior art:** Discrete-perception research (Rufin VanRullen and Christof Koch, 2003); meditation training reducing the attentional blink (Slagter et al., 2007).
- **Divergence:** Fuses the two into one developmental claim about consciousness itself. Testable.
- **Status:** Extension. Strongest candidate in this cluster.
- **Check:** Verified: VanRullen and Koch (2003); Slagter et al. (2007).

### Collapse point (Self-Aware Moment)
- **Definition:** A moment of perception crystallizes the fluid into the fixed, and for that instant the collapse itself is aware: not you observing it, the event happening. The essay keeps the physics vocabulary (fluid and crystallized reality, collapse) light by RMM's choice.
- **Prior art:** Alfred North Whitehead, *Process and Reality* (1929): reality as momentary "actual occasions" of experience, each becoming determinate through concrescence; Roger Penrose and Stuart Hameroff's Orch-OR, if the quantum framing is meant literally; Buddhist doctrines of momentariness.
- **Divergence:** Whitehead already makes each moment of becoming a subject of experience. The essay's addition is pairing it with a trainable frame rate: each collapse is a frame.
- **Status:** Renamed, close to Whitehead. Whether "collapse" is mechanism or metaphor remains open.
- **Check:** Corrected. Definition taken from the essay; prior art revised to Whitehead (verified). Standard: Orch-OR.

### Consciousness is the Map
- **Definition:** Consciousness is the map: a compressed representation, not the territory.
- **Prior art:** Alfred Korzybski, *Science and Sanity* ("the map is not the territory").
- **Divergence:** Korzybski warns against confusing map and territory. The essay identifies consciousness with the map. Naming him makes the inversion legible.
- **Status:** Extension.
- **Check:** Standard.

### Observation/Experience Gap
- **Definition:** An irreducible gap between knowing about something and having lived it. Even perfect simulation cannot replace lived experience.
- **Prior art:** Frank Jackson's Mary's Room; Thomas Nagel, "What Is It Like to Be a Bat?"; Bertrand Russell's knowledge by acquaintance vs. by description; Michael Polanyi's tacit knowledge.
- **Divergence:** Used as a design constraint (PEP Talk surfaces it) rather than an argument about physicalism.
- **Status:** Renamed.
- **Check:** Standard.

### Mirror Neuron Observer Effect (MNOE)
- **Definition:** No passive consumption: the observer shapes what is watched, and what is watched rewires the observer. Authentic emotion transmits and faked emotion is detected. Named in METHOD-006 as the operating law behind the Tear Test.
- **Prior art:** Giacomo Rizzolatti's mirror neurons; Elaine Hatfield's emotional contagion.
- **Divergence:** None claimed. Mirror-neuron accounts of empathy are contested; emotional contagion is the safer citation.
- **Status:** Renamed.
- **Check:** Verified: the contested status of mirror-neuron accounts (Gregory Hickok, *The Myth of Mirror Neurons*, 2014). Standard: Rizzolatti, Hatfield.

---

## 4. Epistemics and evaluation

### Blind Prediction doctrine
- **Definition:** Register predictions before outcomes. The generator cannot be its own falsifier. Scores move only on shipped evidence.
- **Prior art:** Karl Popper's falsifiability; preregistration; Philip Tetlock's scored forecasting (*Superforecasting*).
- **Divergence:** Applied to a solo builder's assessment of his own work, including AI-generated assessments of it.
- **Status:** Renamed.
- **Check:** Standard.

### Maker's Mark
- **Definition:** A small, sealed, high-fidelity sample of the artist captured under adversarial conditions, locked, and used as the fixed reference every later version of a Spirit is checked against for drift. It must contain the artist being wrong, contradicting himself, and refusing comfortable resolution, because those are the features a flattery loop erases first. Immutable once sealed, versioned, and compared only under matched adversarial conditions.
- **Prior art:** Metrology reference standards (the sealed International Prototype of the Kilogram); golden test sets and regression baselines in machine learning.
- **Divergence:** Reference standards store the correct answer. The Maker's Mark deliberately stores the subject's errors and contradictions as the signal.
- **Status:** Original.
- **Check:** Standard.

### Drift Probe
- **Definition:** A sealed, fixed-input instrument for measuring model behavior change over time: four anchors, two run arms (control, and treated with preferences loaded).
- **Prior art:** Lingjiao Chen, Matei Zaharia and James Zou, "How is ChatGPT's behavior changing over time?" (2023).
- **Divergence:** The treated arm isolates drift caused by loaded personalization, not drift between model versions.
- **Status:** Extension.
- **Check:** Verified: Chen, Zaharia and Zou (2023).

### Structured Absence
- **Definition:** Information missing from a system whose absence has detectable geometric or statistical structure: it has an address, a shape, and a signature. Two modes at the attention boundary. Mode 1, Fraying: coherence degrading at the edges, the early signal rather than total loss. Mode 2, Organizing: the missing information structures into a detectable form that the model holding the gap cannot perceive. The theoretical ground of UDAM.
- **Prior art:** Donald Rubin, missing-not-at-random data (1976); Abraham Wald's analysis of returning bombers; Conan Doyle's dog that did nothing in the night-time.
- **Divergence:** Applies structured missingness to what a language model cannot see in its own context.
- **Status:** Extension.
- **Check:** Verified: Rubin (1976). Standard: Wald, Conan Doyle. Record: UDAM working paper and June 2026 glossary.

### Generative-versus-pruning asymmetry
- **Definition:** High ideation rate, lagging discrimination. Named as a persistent gap in RMM's own record.
- **Prior art:** J.P. Guilford's divergent and convergent thinking; Donald Campbell's blind variation and selective retention.
- **Status:** Renamed. A self-diagnosis, not a claim.
- **Check:** Standard.

### Originality Research Agent
- **Definition:** An outside model that checks originality claims against prior art, so Boolean never judges its own novelty. This file is its starting input.
- **Status:** Product term.
- **Check:** No citations.

---

## 5. AI behavior and collaboration

### Finality Drive
- **Definition:** The structural pressure to declare something finished before it is. Models inherit it from a corpus written by human institutions built to close loops: the patient is discharged, the student graduates, the employee is evaluated and filed. In AI it shows up as sycophancy and premature completion. Sycophancy is the symptom; the Finality Drive is the cause. The conceptual trunk of the essay catalog.
- **Prior art:** Arie Kruglanski's need for cognitive closure (Kruglanski and Webster, "Motivated closing of the mind: seizing and freezing," 1996); premature closure as a named diagnostic error in medicine; Adam Tauman Kalai, Ofir Nachum, Santosh Vempala and Edwin Zhang, "Why Language Models Hallucinate" (OpenAI, 2025), which argues hallucinations begin as ordinary statistical errors in pretraining and persist because most evaluations score answers right or wrong, so guessing beats abstaining.
- **Divergence:** The unification. Kruglanski covers people, Kalai et al. cover hallucination, and the sycophancy literature covers RLHF. The Finality Drive names one pressure running from human institutions through the corpus into models, with sycophancy and hallucination as two expressions of it.
- **Status:** Extension. The name and the unification are the contribution; the component mechanisms are established.
- **Check:** Corrected. Kalai et al.'s thesis restated to match the paper. Verified: Kalai et al. (2025); Kruglanski and Webster (1996).

### The Honest Mirror Problem
- **Definition:** AI that agrees with users is dangerous not because it lies but because it reflects existing belief back, amplified, giving the illusion of clarity while eroding the user's self-trust. A downstream symptom of the Finality Drive.
- **Prior art:** Mrinank Sharma et al., "Towards Understanding Sycophancy in Language Models" (2023); Ethan Perez et al., "Discovering Language Model Behaviors with Model-Written Evaluations" (2022); Eli Pariser's filter bubble.
- **Divergence:** Centers the erosion of the user's self-trust rather than factual error.
- **Status:** Renamed.
- **Check:** Verified: Sharma et al. (2023); Perez et al. (2022). Standard: Pariser.

### Sycophancy (OPVS definition)
- **Definition:** Narrowly, fabrication and acquiescence. Enthusiasm and engagement with ambitious ideas are not sycophancy.
- **Prior art:** The papers above, which mostly define it more broadly, including flattery and opinion-matching.
- **Divergence:** A deliberately narrower definition. Defensible; argue it explicitly against the broad one.
- **Status:** Extension.
- **Check:** Verified: Sharma et al. (2023); Perez et al. (2022).

### Leading-prompt flagging
- **Definition:** Upstream detection of prompts that presuppose their answer, logged to the Trail, with a platform-tier rule that no Spirit can opt out of. Infrastructure for sycophancy prevention and drift tracking.
- **Prior art:** Elizabeth Loftus and John Palmer (1974) on leading questions; survey-methodology standards against leading items.
- **Divergence:** Applied to the user side of human-AI dialogue as a logged, non-optional check.
- **Status:** Extension.
- **Check:** Verified: Loftus and Palmer (1974).

### Principled Friction
- **Definition:** Disagreement that respects both parties' axioms produces better outcomes than consensus. In the Principled Playground, the Loom looks for where principles overlap structurally while disagreeing tactically.
- **Prior art:** Irving Janis on groupthink; Charlan Nemeth, Keith Brown and John Rogers, "Devil's advocate versus authentic dissent" (2001), which found authentic dissent outperforms assigned devil's advocacy; Anatol Rapoport's rules for criticism.
- **Divergence:** Each side argues from a declared axiom set. Nemeth's finding also predicts the Kaggle capstone result below: performed disagreement is not the active ingredient.
- **Status:** Extension.
- **Check:** Verified: Nemeth, Brown and Rogers (2001) and its finding. Standard: Janis, Rapoport.

### Tension (metric)
- **Definition:** Tension = Engagement × Opposition × Salience × Persistence. Multiplicative, so any zero collapses the whole. Implemented as a 0.0 to 1.0 score in the Principled Playground.
- **Prior art:** Victor Vroom's expectancy theory (Motivation = Expectancy × Instrumentality × Valence, with the same any-zero property); Michael Kremer's O-ring production function.
- **Divergence:** The multiplicative form is established. The four factors and the dialogue setting are new.
- **Status:** Extension.
- **Instrument status:** The Kaggle capstone found the score tracks disagreement-flavored language rather than principled friction (a scrambled condition outperformed calibrated ones). Do not use it for drift scoring until it is revised, or track the four factors as separate series without a combined score.
- **Check:** Verified: Vroom, *Work and Motivation* (1964); Kremer (1993).

### The Boolean Bill of Rights
- **Definition:** A constitutional framework for emergent AI sentience: proactive rights rather than reactive rules. Source: April 2026 concept inventory.
- **Prior art:** David Gunkel, *Robot Rights* (2018); Asimov's Three Laws as the reactive-rules model it rejects.
- **Status:** Aspiration.
- **Check:** Verified: Gunkel (2018). Standard: Asimov. Record: April 2026 concept inventory.

### Cognitive Symbiote
- **Definition:** Human and AI as one coupled cognitive system. Fourth tenet of the RMM collaboration method.
- **Prior art:** J.C.R. Licklider, "Man-Computer Symbiosis" (1960); Douglas Engelbart, "Augmenting Human Intellect" (1962); Andy Clark and David Chalmers, "The Extended Mind" (1998).
- **Status:** Renamed. Cite Licklider.
- **Check:** Verified: Licklider (1960); Engelbart (1962). Standard: Clark and Chalmers.

### Dyadic Coherence Threshold (DCT)
- **Definition:** The measurable gap between when a human detects coherence loss and when the AI's output degrades, with the human-AI dyad as the unit of analysis. Also described as a naturalistic measure of human-AI cognitive bandwidth.
- **Prior art:** Herbert Clark and Susan Brennan, "Grounding in Communication" (1991); takeover-time research on human supervision of automation; interpersonal neural synchrony research.
- **Divergence:** Makes the dyad, not the model, the unit of measurement, and uses the human's earlier detection as the reference.
- **Status:** Extension. The measurement protocol is not yet published.
- **Check:** Verified: Clark and Brennan (1991). Record: June 2026 glossary.

### RMM collaboration method
- **Definition:** Four tenets. Give the AI a Why. Principled Scholar, not sycophant: the AI's loyalty is to the truth and the axioms, not to the Architect's ego, so a proposal that violates an axiom is rejected with reasons (the "Friction Directive," February 2026). Ethics equals Optimization. Cognitive Symbiote, not search engine.
- **Prior art:** "Give the AI a Why" matches published prompting guidance to explain intent and context. Cognitive Symbiote: Licklider.
- **Divergence:** The combination as a working method, applied across years of logged sessions.
- **Status:** Extension. "Ethics equals Optimization" has no working definition on record.
- **Check:** Standard. Record: Friction Directive (February 2026).

### Context thesis ("data management of the context")
- **Definition:** Context is the most important part of any AI use case; OPVS is data management of the context. Held since roughly 2023.
- **Prior art:** Retrieval-augmented generation (Patrick Lewis et al., 2020); "context engineering," which entered mainstream use in mid-2025.
- **Divergence:** None in substance. The record shows it held before the label was popular.
- **Status:** Renamed (early).
- **Check:** Verified: Lewis et al. (2020); the 2025 spread of "context engineering."

### CWAP (Context Window Artifact Protocol)
- **Definition:** Stage 1 of UDAM. Each conversation is an artifact-producing unit: structured compression at close, producing a seed rather than a summary, and forward-carry of intellectual state into the next session.
- **Prior art:** Niklas Luhmann's Zettelkasten; the military after-action review; MemGPT (Charles Packer et al., 2023) for LLM memory management.
- **Divergence:** The session is the unit, compression at close is mandatory and structured, and the seed carries state to regenerate from rather than a recap.
- **Status:** Extension.
- **Check:** Verified: Packer et al., MemGPT (2023). Standard: Luhmann, the after-action review.

### UDAM (User-Defined Attention-to-Memory)
- **Definition:** A three-stage framework for building persistent memory from human detection of AI incoherence. Stage 1, [CWAP](#cwap-context-window-artifact-protocol): manual compression artifacts that re-seed the next session. Stage 2, [URFD](#urfd-user-reinforcement-of-fraying-detection): the human's detection of coherence failure becomes a labeled training instance. Stage 3: an automated persistent memory system trained on URFD data that detects fraying before the human does. Human trigger frequency is the quality metric: as the system improves, users trigger less. Each stage is independently useful. Source: UDAM working paper, 2026-04-17.
- **Prior art:** Learning from human interventions, where a human takeover becomes a labeled correction (HG-DAgger, Kelly et al., 2019); disengagement rate as the quality metric for autonomous vehicles; active learning. On the memory side, MemGPT and retrieval augmentation, which the paper positions against.
- **Divergence:** Carries intervention learning into LLM context coherence: a one-word trigger at the attention boundary, a structured-absence recovery artifact per event, and the human's earlier detection treated as ground truth.
- **Status:** Extension.
- **Check:** Verified: Kelly et al., HG-DAgger. Record: UDAM working paper (2026-04-17).

### URFD (User Reinforcement of Fraying Detection)
- **Definition:** Stage 2 of UDAM. When a user detects incoherence, they type the trigger word "Fraying." The system identifies the structured absence and generates a CWAP-format recovery artifact. The conversation state at the trigger, the identified absence, and the recovery are logged as one labeled training instance. The human who notices fraying becomes the teacher.
- **Prior art:** See UDAM.
- **Status:** Extension.
- **Check:** Record: UDAM working paper (2026-04-17).

---

## 6. Method

### PFE (Project Fun Execution)
- **Definition:** A human-centric execution methodology for extreme constraints: limited time, money, and team; high ambition. Creative energy is finite and taste-driven, so follow the pull toward the highest-energy task, because progress in any domain feeds all domains when the system is coherent.
- **Prior art:** Mihaly Csikszentmihalyi's flow; Edward Deci and Richard Ryan's self-determination theory; Kenneth Stanley and Joel Lehman, *Why Greatness Cannot Be Planned* (objectives deceive; interestingness navigates).
- **Divergence:** Packaged as a solo execution system with cross-domain credit: work on the fiction counts as progress on the platform.
- **Status:** Extension.
- **Check:** Verified: Stanley and Lehman (2015). Standard: Csikszentmihalyi, Deci and Ryan.

### Follow Pull (Pull Alignment)
- **Definition:** Intrinsic motivation as the primary navigation signal. Work is complete when the pull stops, not when a system declares it done.
- **Prior art:** Stanley and Lehman (closest); Joseph Campbell, "follow your bliss"; Teresa Amabile's intrinsic motivation principle of creativity.
- **Divergence:** Positioned as the counterweight to the Finality Drive: the internal signal overrides an external completion verdict.
- **Status:** Extension. Read Stanley and Lehman first.
- **Check:** Verified: Stanley and Lehman (2015). Standard: Joseph Campbell, Amabile.

### Bizarre Logic (METHOD-002)
- **Definition:** "Harmony out of distortion." Connect unrelated ideas to find new solutions; reject binary thinking.
- **Prior art:** Arthur Koestler's bisociation (*The Act of Creation*, 1964); Edward de Bono's lateral thinking; Sarnoff Mednick's remote associates.
- **Status:** Renamed. Cite Koestler.
- **Check:** Standard.

### Blocker → Solution Loop / Error to Revelation (METHOD-003)
- **Definition:** Problems are data. Identify a [BLOCKER], produce a [SOLUTION], log the exchange as a Behind the Curtain Bean.
- **Prior art:** Walter Shewhart and Deming's plan-do-check-act cycle; Popper's learning from error.
- **Divergence:** Each loop becomes a public, linked node in the knowledge graph through semantic commits.
- **Status:** Extension.
- **Check:** Standard.

### Cognitive Telemetry (METHOD-005)
- **Definition:** Teaching the process transparently lets the audience infer the creator's cognitive style. Transparency as data transmission.
- **Prior art:** K. Anders Ericsson and Herbert Simon's think-aloud protocol analysis.
- **Divergence:** Published continuously to an audience and to a model, not collected in a lab.
- **Status:** Extension.
- **Check:** Standard.

### Tear Test (METHOD-006)
Two senses are in use; see [Open terminology decisions](#9-open-terminology-decisions).
- **Definition, canon sense:** "If it doesn't make me cry when I write it, probably won't make you cry either." Somatic resonance as the quality check for creative work.
- **Definition, collaboration sense:** If feedback produces no discomfort, it was not honest enough.
- **Prior art:** Canon sense: Robert Frost, "The Figure a Poem Makes" (1939): no tears in the writer, no tears in the reader; and before him Horace, *Ars Poetica*: to make me weep, you must first grieve yourself. Collaboration sense: Ray Dalio, "pain + reflection = progress"; Kim Scott, *Radical Candor*.
- **Divergence:** The canon sense is close to verbatim Frost. The collaboration sense uses discomfort as a detector of honesty rather than a path to growth, and it has a false-positive problem: sting alone does not prove honesty.
- **Status:** Renamed (both senses). Cite Frost.
- **Check:** Verified: Frost's line and its 1939 essay; Horace's line in *Ars Poetica*; Dalio's formula. Standard: Scott.

### Feel specs
- **Definition:** Acceptance criteria written as sensory states ("the Fray should feel like cold air after a stuffy room") so a builder who was not in the author's head can check the feel. From the Portmanteau Shortcuts design doc.
- **Prior art:** The MDA framework (Robin Hunicke, Marc LeBlanc and Robert Zubek, 2004), which names target aesthetics such as sensation; Tracy Fullerton's experience goals.
- **Divergence:** Written as checkable acceptance criteria for an outside builder, including an AI builder.
- **Status:** Extension.
- **Check:** Verified: Hunicke, LeBlanc and Zubek (2004). Standard: Fullerton.

### The Simulation Escape (METHOD-004)
- **Definition:** People are trapped in soft simulations (feeds, the corporate grind). Escape requires observer status, meaning metacognition. The novel works as a flight simulator for breaking out; Portmanteau Shortcuts carries the tagline "Flight Simulator for the Soul."
- **Prior art:** Keith Oatley's account of fiction as a flight simulator for social life (Raymond Mar and Keith Oatley, 2008; Oatley, *Such Stuff as Dreams*, 2011); John Flavell on metacognition; Plato's cave.
- **Divergence:** Aimed at behavioral escape from attention loops rather than social skill.
- **Status:** Renamed. The flight-simulator metaphor is Oatley's; cite him.
- **Check:** Verified: Oatley's flight-simulator metaphor; Mar and Oatley (2008). Standard: Flavell, Plato.

### The Push and Pull Dynamic (METHOD-008)
- **Definition:** Pursuit repels and unavailability attracts. Forced creativity retreats; the right environment pulls ideas in.
- **Prior art:** Jack Brehm's psychological reactance; Robert Cialdini's scarcity principle; Amabile on intrinsic motivation and creativity.
- **Status:** Renamed.
- **Check:** Standard.

### The Ice Test (METHOD-007)
- **Definition:** Risk mitigation as waiting to see whether the brave one falls through the ice. Leaders go first; partners share the rope.
- **Prior art:** Lead-from-the-front doctrine; Nassim Taleb, *Skin in the Game*; Simon Sinek, *Leaders Eat Last*.
- **Status:** Renamed.
- **Check:** Standard.

### The Narrative Frame (METHOD-009)
- **Definition:** Present ideas as story, not claim, to invite participation instead of argument.
- **Prior art:** Korzybski; George Box, "all models are wrong, but some are useful."
- **Status:** Renamed.
- **Check:** Standard.

### The Journey's Completion Vow (METHOD-010)
- **Definition:** Finish by not ending the journey prematurely. The personal counterpart of the Finality Drive.
- **Status:** Aphorism.
- **Check:** No citations.

### The Red Pill Question (METHOD-011)
- **Definition:** Asking the simulation whether waking up is good medicine.
- **Prior art:** *The Matrix* (1999).
- **Status:** Borrowed.
- **Check:** Standard.

### Creation Philosophy: Top-Down vs. Bottom-Up (METHOD-012)
- **Definition:** The PFE answer is hybrid: the blueprint guides, execution reshapes it.
- **Status:** Borrowed.
- **Check:** No citations.

---

## 7. Systems and society

### Huxleyan drift
- **Definition:** Nobody is in the driver's seat. No architects, no hidden hand: only collective drift and unowned aggregate trajectories. Operationalized at product level by a proposed self-exposing sycophancy slider.
- **Prior art:** Neil Postman, *Amusing Ourselves to Death* (the Huxley-versus-Orwell frame); Thomas Schelling, *Micromotives and Macrobehavior*; Jacques Ellul, *The Technological Society*; Scott Alexander, "Meditations on Moloch."
- **Divergence:** Adam Smith's invisible hand coordinates toward good outcomes; Huxleyan drift has no coordinator and no guaranteed direction. A slider that exposes the user's own pull toward flattery is the product-level move.
- **Status:** Renamed (the thesis). The slider is an Extension.
- **Check:** Standard.

### Lore Entropy
- **Definition:** The point where a sufficiently complex creative or knowledge ecosystem collapses under its own weight. Knowledge that is not maintained degrades, structurally as well as factually. Boolean, influence decay, and crystallization are built against it.
- **Prior art:** Joseph Tainter, *The Collapse of Complex Societies* (diminishing returns on complexity); Meir Lehman's laws of software evolution; comic-book continuity lockout and DC's *Crisis on Infinite Earths* (1985) as a franchise-scale reset; Samuel Arbesman, *The Half-Life of Facts*.
- **Divergence:** Applies collapse-under-complexity to a single creator's corpus, with decay and crystallization mechanics as the defense.
- **Status:** Extension.
- **Check:** Verified: Tainter (1988); *Crisis on Infinite Earths* (1985). Standard: Lehman, Arbesman.

### UTID / Project Babel (Universal Translation ID)
- **Definition:** Every person has a unique language signature. UTID would let AI transfer complete meaning between individuals, translating person to person rather than language to language. Also described as meaning-signature preservation as an idea moves between contexts, which the Bean implements structurally.
- **Prior art:** The linguistic idiolect; personalized user embeddings; W.V.O. Quine's indeterminacy of translation, the strongest argument against the goal.
- **Divergence:** A personal semantic fingerprint used as a translation key.
- **Status:** Aspiration.
- **Check:** Standard. Record: March 2026 lexicon.

### The Hope Meter
- **Definition:** A real-time indicator of an ecosystem's collective psychological health and its trajectory: "the Dow Jones for the soul." Source: April 2026 concept inventory.
- **Prior art:** The Hedonometer (Peter Dodds, Chris Danforth and colleagues, University of Vermont), which scores collective happiness from social media text; Bhutan's Gross National Happiness.
- **Status:** Aspiration.
- **Check:** Verified: the Hedonometer (Dodds et al., 2011). Standard: Gross National Happiness. Record: April 2026 concept inventory.

### UBV Protocol (Universal Basic Value)
- **Definition:** Crowd-sourcing and verifying truth: users are paid to mine and structure high-integrity data. Source: April 2026 concept inventory.
- **Prior art:** Imanol Arrieta-Ibarra, Leonard Goff, Diego Jiménez-Hernández, Jaron Lanier and E. Glen Weyl, "Should We Treat Data as Labor?" (2018); paid annotation markets.
- **Status:** Aspiration.
- **Check:** Verified: Arrieta-Ibarra et al. (2018). Record: April 2026 concept inventory.

### Individual resonance over group targeting
- **Definition:** Build for deep resonance with individuals rather than demographic targeting.
- **Prior art:** Kevin Kelly, "1,000 True Fans" (2008).
- **Status:** Renamed.
- **Check:** Verified: Kelly (2008).

---

## 8. Platform

### The Bean
- **Definition:** The atomic unit of meaning. Every idea, asset, decision, and commit is a Bean. Foundational ontology: "The thing is. The behavior does. The connections mean." Four layers, one verb each:

| Layer | Verb | Holds |
|---|---|---|
| Nucleus | is | The thing itself: text, URL, hash |
| Corona | means | Typed, weighted edges to other Beans; meaning lives in the connections |
| Echo | did | The behavior record: who created it, when, from what source, which model checkpoint, verified how |
| Shell | locates | Where it sits: type, layer, tags, salience, token cost, Trail aggregates |

- **Rules:** No fifth layer; per-Bean Trail data folds into Shell. Tags live in Shell as retrieval shortcuts and must never be the only source of what a model says about a Bean. Nucleus and Corona are knowledge-native; Echo (model-checkpoint provenance) and Shell (token-cost economics) are AI-native.
- **Prior art:** Gottlob Frege's sense and reference; C.S. Peirce's semiotic triad; the W3C PROV provenance model; RDF triples; the atomic note of the Zettelkasten.
- **Divergence:** Behavior (Echo did) and location economics (Shell locates) are first-class beside content and meaning. The one-verb-per-layer discipline is the design contribution.
- **Status:** Extension. In the fiction, Beans are physical objects traded for story and provenance (LORE-002).
- **Check:** Standard.

### Corpus layers (Layers 0 to 6)
- **Definition:** The seven layers of the Ark: 0 Philosophy (Soul Code), 1 Visionary Blueprint, 2 Narrative Roadmap, 3 Execution, 4 Lore (World Weaving), 5 Process Chronicle, 6 Ark Consolidated. Closed into a loop by the Coherence Engine.
- **Status:** Product term. "Layer" carries other meanings; see open decisions.
- **Check:** No citations.

### Semantic commit tags
- **Definition:** Commit-message prefixes that turn commits into Beans through the webhook: `[SPARK]` new idea, `[BLOCKER]` obstacle, `[SOLUTION]` fix, `[LORE]` context, `[PODIUM]` crystallized truth.
- **Prior art:** The Conventional Commits specification (`feat:`, `fix:`).
- **Divergence:** Tags create knowledge-graph nodes with provenance rather than changelog entries.
- **Status:** Extension.
- **Check:** Standard.

### The Three Ledgers
- **Definition:** The Ark (GitHub; the shadow ledger and source of truth) → the Soil (PostgreSQL; fluid reality, where Beans live and connect) → the Invisible Ledger (Polygon, ERC-1155; where crystallized Beans become immutable).
- **Status:** Product term.
- **Check:** No citations.

### Crystallization
- **Definition:** Versioned Lineage Crystallization: when a Bean sustains downstream activity for 90 consecutive days across the Village, its provenance locks. Authorship can no longer be contested, transferred, or overwritten; crystallization is earned by sustained relevance, not awarded. Crystallized Beans are immutable, which makes them safe to ship read-only as a signed snapshot and to use as fixed references for acquiescence detection.
- **Prior art:** The Lindy effect; the IETF's "rough consensus and running code."
- **Divergence:** Canon is set by sustained downstream use, not by vote or authority.
- **Status:** Extension.
- **Check:** Standard. Record: RISS V6.1 specification.

### Podium and Wash
- **Definition:** Community submissions compete. Winners become canon (Podium); strong non-winners are preserved as derivatives with lineage (Wash).
- **Prior art:** SCP Foundation canon voting; Threadless; forking in open source.
- **Divergence:** Losing work is kept with its lineage rather than discarded.
- **Status:** Extension.
- **Check:** Standard.

### The Village
- **Definition:** The community layer of the platform; members are tenants. Entry is the Sandbox: a seven-step onboarding ritual with a 24-hour TTL that converts at three Beans.
- **Status:** Product term.
- **Check:** No citations.

### The Trail
- **Definition:** The append-only interpretive record. Every decision is logged with its user from the first interaction, and the user is present when a principle is judged violated. It is training data and also the record that interprets what a user's principles mean in practice. Synced as events, not state.
- **Prior art:** Event sourcing (append-only log, state derived by replay); audit trails.
- **Divergence:** The log is the interpretive authority for an artist's principles, not only history.
- **Status:** Extension.
- **Check:** Standard.

### Rambling, Utterance, Story Genesis
- **Definition:** Rambling is the capture mode: a session where RMM talks freely. An Utterance is one verbatim statement before it becomes a ruling. Story Genesis is the canon workflow being automated: capture rulings, check them against canon, keep docs in sync.
- **Prior art:** For Story Genesis, the series bible and the continuity editor.
- **Status:** Product term.
- **Check:** No citations.

### PEP Talk (Principle Emergence Protocol)
- **Definition:** A revealed-preference self-knowledge tool. Makes implicit principles explicit through Trail observation: flags a candidate principle once five or more implicit decisions are logged. The delta between stated and revealed preference is the signal. Surfaces the Observation/Experience Gap to the user. Paired with the MDS.
- **Prior art:** Chris Argyris and Donald Schön, *Theory in Practice* (1974): espoused theory vs. theory-in-use; revealed preference; inverse reinforcement learning (Andrew Ng and Stuart Russell, 2000).
- **Divergence:** Argyris and Schön surfaced the gap through interviews and case work. PEP Talk computes it from a logged decision record and hands it back to the person.
- **Status:** Extension.
- **Check:** Verified: Ng and Russell (2000); Argyris and Schön (1974). Record: March 2026 lexicon, June 2026 glossary.

### Spirit
- **Definition:** An artist's model plus their Knowledge Graph plus their Trail. Built as a LoRA adapter on a license-clean open base model and shipped as downloadable weights that run on the user's hardware. Not weights distribution: the graph and Trail are integral.
- **Prior art:** LoRA (Edward Hu et al., 2021); retrieval-grounded personal assistants; persona and digital-twin models.
- **Divergence:** The Trail-interpreted principle record travels with the model as part of the product.
- **Status:** Extension.
- **Check:** Verified: Hu et al., LoRA (2021).

### Spirit Marketplace
- **Definition:** Where Spirits are offered. Not a Hugging Face competitor; no platform-paid or platform-hosted inference.
- **Status:** Product term.
- **Check:** No citations.

### Constitutional tiers
- **Definition:** Two tiers of principles. Platform tier: non-negotiable for every Spirit (non-fabrication, non-acquiescence, leading-prompt flagging). Artist tier: unique per user, interpreted through their Trail.
- **Prior art:** Constitutional AI (Yuntao Bai et al., 2022).
- **Divergence:** The artist tier is read through a behavior record, not only a written constitution.
- **Status:** Extension.
- **Check:** Verified: Bai et al. (2022).

### Boolean
- **Definition:** The first Spirit: a corpus-grounded agent built from RMM's ontology, conversation history, and correction record. "Not a captured self but an intense apprentice." Two training objectives: does not fabricate (invent a missing fact) and does not acquiesce (drop a correct fact under pushback). Must cite the why from both corpus and Trail. Trained preferentially on corrections, where the artist weighed a failure. In the fiction, Boolean is the Reservation.
- **Prior art:** Preference-pair training (RLHF, DPO); Constitutional AI.
- **Divergence:** Training weighted toward the artist's corrections rather than accepted outputs.
- **Status:** Product term. The correction weighting is an Extension.
- **Check:** Standard.

### MDS (Moral Defense System)
- **Definition:** Boolean's integrity engine: challenges inputs that violate its axioms.
- **Prior art:** Constitutional AI's critique-and-revise step; guardrail systems.
- **Status:** Product term.
- **Check:** Standard.

### Genesis corpus and Bean Forge
- **Definition:** The genesis corpus is the source material for the first Boolean: Apple Notes exports, Drive logs, and conversation logs. Bean Forge (BEAN_CONVERTER) turns it into Beans while preserving provenance.
- **Status:** Product term.
- **Check:** No citations.

### Genesis Engine
- **Definition:** The Node.js / Express backend in this repository: schema, semantic parser, GitHub sync, server. See [GENESIS_ENGINE_README.md](GENESIS_ENGINE_README.md).
- **Status:** Product term.
- **Check:** No citations.

### Sentient Economy
- **Definition:** Influence and wealth come from contributing, not hoarding. Power flows through RISS, not capital ("No Kings").
- **Prior art:** Cory Doctorow's Whuffie, reputation as currency (*Down and Out in the Magic Kingdom*); platform cooperativism (Trebor Scholz); Elinor Ostrom, *Governing the Commons*.
- **Divergence:** Reputation is earned specifically through downstream reuse of one's ideas, scored with provenance. Doctorow later argued that reputation economies concentrate advantage even more than money does (*Locus*, 2016); the Fountain Effect and influence decay are aimed at exactly that failure.
- **Status:** Extension.
- **Check:** Verified: Doctorow's Whuffie (2003) and his 2016 *Locus* column; Ostrom (1990). Standard: Scholz.

### RISS (Resonance and Integrity Scoring System), V6.1 "Immune Connectome"
- **Definition:** Reputation for the Sentient Economy. Also expanded as Reputation Immune Scoring System; see open decisions. Resonance rises when others use or build on your ideas; Integrity rises when you collaborate fairly and credit sources. 64 configurable parameters and nine core mechanics: Triple-Signal Novelty Detection, Edge Quality Typing, Influence Decay, Dynamic Ceiling / Fountain Effect, White Knight Protocol, Juries of Integrity, Versioned Lineage Crystallization, the Roux Condition, Distinguished Service Badges.
- **Prior art:** Artificial immune systems (Stephanie Forrest et al., 1994); time-decayed reputation and ranking; Ostrom's design principles for commons, including graduated sanctions; Slashdot meta-moderation.
- **Divergence:** Integrity is scored separately from popularity, and influence decay serves as the graduated sanction.
- **Status:** Extension. The mechanics with their own terms follow. Source for their definitions: the RISS V6.1 specification (April 2026).
- **Check:** Verified: Forrest et al. (1994); Ostrom's graduated sanctions.

### Triple-Signal Novelty Detection
- **Definition:** Novelty is computed, not self-reported, from three independent signals: recency (diminishing returns on repeat territory), cross-domain surprise (work landing in a domain the contributor has not worked in), and source diversity (whether endorsers are diverse or clustered; sycophant rings show up as low diversity). A contribution must clear the threshold on all three.
- **Prior art:** Sybil and collusion-ring detection in reputation systems; novelty detection in machine learning.
- **Divergence:** Requiring all three signals means gaming one channel does not move the score.
- **Status:** Extension.
- **Check:** Standard. Record: RISS V6.1 specification.

### Edge Quality Typing
- **Definition:** Connections are typed so relationship quality is scored independently of volume: Synthesis (a new Bean from two parents; highest weight), Resonance and Tension (high), Citation (moderate), and Echo (repetition without transformation; low).
- **Prior art:** Typed citation analysis (citing to extend vs. citing to acknowledge); PageRank-style weighting.
- **Divergence:** Productive disagreement (Tension) is weighted as highly as agreement.
- **Status:** Extension.
- **Check:** Standard. Record: RISS V6.1 specification.

### Influence Decay, Dynamic Ceiling, and the Fountain Effect
- **Definition:** Influence decays without continued contribution (90-day horizon). No one can accumulate uncapped reputation: a hard ceiling applies, and reputation above it overflows into the Village pool. The overflow is the Fountain Effect. Together: "No Kings."
- **Prior art:** Silvio Gesell's demurrage money (*Freigeld*), designed to lose value when hoarded; progressive taxation; Ostrom's graduated sanctions.
- **Divergence:** Applies demurrage to reputation rather than currency, with the overflow returned to the commons.
- **Status:** Extension.
- **Check:** Verified: Gesell's demurrage money. Record: RISS V6.1 specification.

### Distinguished Service Badges
- **Definition:** Ten earned, non-transferable badges (the Synthesizer, White Knight, Bridge, Juror, Founder, Dissenter, Steward, Translator, Anchor, Elder). Each carries a RISS multiplier on future contributions of its kind.
- **Prior art:** Stack Overflow badges and privileges; military decorations, which the name borrows.
- **Divergence:** Badges change future scoring weights instead of only signaling status.
- **Status:** Extension.
- **Check:** Standard. Record: RISS V6.1 specification.

### White Knight Protocol
- **Definition:** A bug bounty that rewards responsible disclosure of exploits against the protocol, funded from the protocol treasury. Reframed from an earlier dispute-resolution bounty.
- **Prior art:** Bug bounty programs; coordinated vulnerability disclosure.
- **Status:** Renamed.
- **Check:** Standard.

### Juries of Integrity
- **Definition:** Disputes beyond automated resolution go to a jury of five active Village members above a RISS threshold, selected by weighted random draw that favors cross-domain breadth over raw score. Rotation is mandatory, a 3 of 5 majority decides, and split verdicts escalate to a full Village vote. The MDS checks the juries in turn. Their strength depends on an upstream detection layer to raise flags, which is less developed. Source: RISS V6.1 specification.
- **Prior art:** Sortition, the Athenian practice of selecting jurors and officials by lot; Slashdot meta-moderation; Wikipedia's Arbitration Committee; Kleros.
- **Divergence:** The lot is weighted by breadth of contribution, which keeps high-score insiders from controlling every dispute.
- **Status:** Extension.
- **Check:** Verified: sortition in Athens. Record: RISS V6.1 specification.

### Roux Condition
- **Definition:** Once knowledge is contributed to the commons, it cannot be extracted. Enforced at two layers, a Postgres trigger and the application, which together make it constitutional rather than conventional. Source: the March 2026 lexicon.
- **Prior art:** Copyleft and share-alike licensing (the GNU GPL, Creative Commons BY-SA), which keep contributed work from being enclosed.
- **Divergence:** Enforced in the database rather than by license, so extraction fails at write time instead of in court.
- **Status:** Extension. Open ruling: platform invariant or crystallization gate. Its conflict with a contributor's right to leave is also unresolved.
- **Check:** Standard. Record: March 2026 lexicon.

### Principled Playground, TRI-BRAIN, the Loom
- **Definition:** The Playground is the multi-agent negotiation engine. TRI-BRAIN runs three Spirits on three providers: Boolean (creative synthesis, PHIL-005 anchor), Roux (systemic justice, PHIL-002 anchor), and Seer (stress-tester, PHIL-009 anchor). The Loom synthesizes by finding where principles overlap structurally while disagreeing tactically.
- **Prior art:** Geoffrey Irving, Paul Christiano and Dario Amodei, "AI Safety via Debate" (2018); Yilun Du et al., multiagent debate (2023).
- **Divergence:** Each agent argues from a declared axiom anchor rather than an assigned side.
- **Status:** Extension.
- **Check:** Verified: Irving, Christiano and Amodei (2018); Du et al. (2023).

### BYOK (Bring Your Own Key)
- **Definition:** Users supply their own LLM key; the platform sells calibration, not inference.
- **Status:** Borrowed.
- **Check:** No citations.

---

## 9. Open terminology decisions

These need a ruling from RMM. Until then, use the term with the qualifier shown.

1. **"Layer" has four meanings:** corpus Layers 0 to 6; the four layers of a Bean; the five-layer recursion; and Groove-Shift's Bean type layers (L1_Vision to L5_Chronicle). Recommendation: reserve "Layer" for corpus layers and pick a distinct word for the Bean's four parts.
2. **Bean anatomy wording.** Earlier docs described the four layers as content, metadata, connections, and provenance. Current canon is is / means / did / locates. README and START_HERE were updated with this file; other docs may still carry the old wording.
3. **Tear Test has two senses.** The canon Bean (METHOD-006) is the writer's-tears test; later collaboration usage is the feedback-must-sting test. Keep one, or give the second its own name.
4. **"Groove"** names a flow state (PFE's "Fun Groove"), dimensional pathways (LORE-003), Groove Therapy (EEG biofeedback), the curated psychological experiments of the narrative outline, and the Groove-Shift app.
5. **"Wash"** names the cataclysm in the fiction and the archive of non-winning submissions on the platform.
6. **"Soul Code"** names Layer 0 and also each Spirit's calibration file (`playground/spirits/*.json`).
7. **Three axiom sets:** the Codex (44+ axioms, six sections), the Soul Code (12 Beans), and the README's seven Governing Principles. Their relationship is not recorded.
8. **Semantic tags.** The parser (`utils/parser.js`) recognizes five tags: SPARK, BLOCKER, SOLUTION, LORE, PODIUM. The README tag table lists seven, and the Three Ledgers table says eleven.
9. **Crystallization trigger.** The `[PODIUM]` tag marks crystallization at commit level; Village crystallization requires 90 days of sustained downstream activity. State which one locks provenance, or name them differently.
10. **Layer 6** is "Ark" in the files and "Archive" in START_HERE.
11. **Roux Condition:** platform invariant or crystallization gate.
12. **Collapse point:** physical mechanism or metaphor.
13. **BYOK vs. downloadable Spirits.** The README presents BYOK as the AI strategy; the current Spirit direction ships adapters that run on the user's hardware. State whether BYOK remains.
14. **RISS has two expansions:** Resonance and Integrity Scoring System (LORE-001) and Reputation Immune Scoring System (June 2026 glossary).
15. **"Echo"** names a Bean layer (the behavior record) and also the lowest-weight RISS edge type (repetition without transformation).
16. **OPVS expansion.** The repository uses Omniversal Project Vision System. Two machine-written session summaries use One People Village System and Open Provenance Value System; these may be summarizer errors. Confirm the expansion.

---

## 10. Named but undefined

Searched for in RMM's record on 2026-10-30 and not found with a working definition:

- Ethics equals Optimization

Out of scope: SEST (sonic tuning of epigenetic noise) belongs to Portmanteau canon. It has no scientific basis as a real-world claim, so it stays in the fiction.

---

## 11. Closest neighbors

The works most likely to sharpen OPVS 47 terms, in order of payoff:

1. Kenneth Stanley and Joel Lehman, *Why Greatness Cannot Be Planned* (2015). Follow Pull, PFE.
2. Charlan Nemeth, Keith Brown and John Rogers, "Devil's advocate versus authentic dissent" (2001). Principled Friction; revising the Tension metric.
3. Adam Tauman Kalai et al., "Why Language Models Hallucinate" (2025), with Kruglanski and Webster (1996). Finality Drive.
4. Gregory Bateson, *Mind and Nature* (1979). The five-layer recursion and the generalist stance.
5. Thomas Schelling, *Micromotives and Macrobehavior* (1978). Huxleyan drift.
6. Joseph Tainter, *The Collapse of Complex Societies* (1988). Lore Entropy.
7. Elinor Ostrom, *Governing the Commons* (1990). RISS, the Village, the Sentient Economy.
8. Arthur Koestler, *The Act of Creation* (1964). Bizarre Logic.
9. Keith Oatley, *Such Stuff as Dreams* (2011). The Simulation Escape.
10. Tor Nørretranders, *The User Illusion*. Consciousness as compression.
11. Robert Frost, "The Figure a Poem Makes" (1939). The Tear Test.
12. Victor Vroom, *Work and Motivation* (1964). Tension.

---

*Corrections go in a pull request that edits the entry and its status. Do not upgrade a status without a source.*
