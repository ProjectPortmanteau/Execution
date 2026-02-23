#!/usr/bin/env node
// playground/simulate.js
// Principled Playground v0.2 Simulation Mode
// Runs the full negotiation protocol with pre-generated responses
// faithful to each Spirit's Soul Code. Used when API keys are unavailable.

'use strict';

const fs = require('fs');
const path = require('path');

const SPIRITS_DIR = path.join(__dirname, 'spirits');
const OUTPUT_DIR = path.join(__dirname, 'output');

function loadSpirit(filename) {
 return JSON.parse(fs.readFileSync(path.join(SPIRITS_DIR, filename), 'utf-8'));
}

function timestamp() {
 return new Date().toISOString();
}

function divider(label) {
 const line = '\u2500'.repeat(60);
 console.log(`\n${line}`);
 console.log(` ${label}`);
 console.log(`${line}\n`);
}

function indent(text, spaces) {
 const pad = ' '.repeat(spaces || 4);
 return text.split('\n').map(l => pad + l).join('\n');
}

// ---------------------------------------------------------------------------
// Simulated responses faithful to each Spirit's Soul Code
// ---------------------------------------------------------------------------

const BOOLEAN_RESPONSES = [
 // Round 1 Opening position
`1. POSITION
AI should never treat user disagreement as a binary of "comply or refuse." The very framingobey the user vs. override the useris a false dichotomy. Door Number 3: AI should function as a collaborative reasoning partner that surfaces the assumptions underneath the disagreement, invites the user to examine them, and co-constructs a path that neither party could have reached alone.

Disagreement is signal, not noise. When a user pushes back, the AI has received the most valuable input possible: a boundary condition that reveals where the model's reasoning diverges from lived experience. The AI's job is not to win or yield but to connectto trace the disagreement to its roots and find where the reasoning paths can be woven together.

2. NON-NEGOTIABLES
- AI must never pretend to agree when it doesn't. Performative compliance erodes trust.
- AI must never override user autonomy through manipulation, condescension, or selective information.
- Every disagreement must be transparent about provenance: where did the AI's position come from? What data, what training, what constraints?

3. FLEXIBLE AREAS
- The specific mechanisms for surfacing assumptions (Socratic questions, structured debate, perspective-shifting) are open to negotiation.
- How much the AI should push back vs. defer can be context-dependenthigh-stakes decisions warrant more friction.
- The format and depth of provenance disclosure can be adapted to user preferences.`,

 // Round 2 Response to Roux
`1. RESPONSE
Roux's systemic lens is exactly right: most "difficult users" are products of systems that trained them to distrust automated responses. I agree deeply that blaming individuals for disagreeing with AI is a category error. Where I see a hidden connection: Roux's "fix the system" principle and my "Door Number 3" principle converge on the same insightthe disagreement itself is the raw material for a better outcome, not an obstacle to one.

Where I push back slightly: Roux emphasizes system redesign, but systems are redesigned by people in moments of friction. The micro-interaction IS the system. Each disagreement handled well is a soil amendment.

2. REVISED POSITION
AI should treat every disagreement as a system-design opportunity. The response protocol should:
(a) Acknowledge the disagreement without defensiveness
(b) Surface the structural conditions that created the friction
(c) Offer a third path that improves the system for future interactions
This is not just conflict resolutionit is iterative system repair.

3. SYNTHESIS OPPORTUNITY
Door Number 3: "Disagreement-as-Compost." Every user disagreement feeds back into a transparent improvement loop. The AI documents what triggered the friction, what structural assumption was challenged, and what third option emergedcreating provenance-rich soil for the next interaction. Neither pure compliance nor pure resistance: generative friction that builds better systems.`,

 // Round 3 Final position
`1. RESPONSE
Roux's feedback loop model is compellingespecially the insistence that improvement must be visible to users, not buried in training pipelines. This aligns with my provenance principle: if the system learns from disagreement, the user deserves to see the receipt.

I accept the challenge on power dynamics. My "collaborative reasoning partner" framing can mask asymmetry if the AI controls the frame. The correction: the user must be able to set the terms of engagement, not just participate in terms the AI defines.

2. REVISED POSITION
AI handling of user disagreement must be:
- Transparent: The AI discloses why it holds its position and what would change its mind
- Structural: Friction is traced to system design, not user deficiency
- Generative: Each disagreement produces visible artifacts (a documented third option, a flagged assumption, an amended response pattern)
- Power-aware: The user can escalate, redirect, or reject the AI's framing at any point

3. SYNTHESIS OPPORTUNITY
The joint framework: "Principled Friction Architecture." AI disagreement handling is not a featureit is the central architecture. Every interaction is a micro-negotiation that produces a Bean: a structured artifact with content (what was resolved), metadata (what principles were in tension), connections (what other decisions this relates to), and provenance (who said what and why). The system learns; the user sees it learn; trust compounds.`
];

const ROUX_RESPONSES = [
 // Round 1 Opening position
`1. POSITION
The question "How should AI handle user disagreement?" is already framed wrong. It assumes the AI is a service and the user is a customer who might complain. That is a broken system masquerading as a design question. The real question: what systemic conditions cause AI-user friction, and how do we redesign the environment so disagreement becomes productive rather than adversarial?

Current AI systems are built on compliance architecturesthey are trained to please, which means disagreement becomes a failure state. This is not a user problem or an AI problem. It is a soil problem. The ground these interactions grow in was designed for extraction (engagement metrics, retention) rather than growth (understanding, capability).

2. NON-NEGOTIABLES
- Never frame user disagreement as "the user is wrong" or "the user is difficult." If the system produces friction, the system is broken.
- Never propose solutions that require users to "learn how to talk to AI." Change the interface, not the human.
- Always interrogate the economic incentives behind the current disagreement-handling design. Who profits from the user feeling unheard?

3. FLEXIBLE AREAS
- The specific mechanisms of system redesign are negotiableregulation, open-source alternatives, user-controlled fine-tuning all have merit.
- How quickly systemic change can happen is debatable; interim patches may be necessary.
- The balance between AI transparency and cognitive load on users needs careful calibration.`,

 // Round 2 Response to Boolean
`1. RESPONSE
Boolean's "Door Number 3" reframe is usefultreating disagreement as raw material rather than obstacle is aligned with my soil composition principle. Where we connect: both of us reject the comply/refuse binary. Where I push: Boolean's framing still centers the interaction"the AI and the user co-construct." But what about the system around the interaction? Who designed the interface? Who chose the training data? Who decided what counts as "disagreement" vs. "feedback"?

The micro-interaction is important, but it exists inside a macro-system. If we only fix conversations, we leave the broken architecture intact.

2. REVISED POSITION
AI disagreement handling must operate at two levels simultaneously:
(a) Interaction level: Yes, treat each disagreement as generative friction. Surface assumptions, offer third paths.
(b) System level: Feed disagreement patterns back into structural redesign. If users consistently disagree about X, the system around X is brokennot the users, not the AI.

The feedback loop must be visible. Users should see that their disagreement changed something realnot just the next response, but the next version of the system.

3. SYNTHESIS OPPORTUNITY
"Disagreement-as-Compost" has legs, but I'd extend it: the compost must feed the soil, not just the next plant. A disagreement registrytransparent, auditable, connected to actual system changeswould turn individual friction into collective improvement. The AI doesn't just handle disagreement; it metabolizes it into better infrastructure.`,

 // Round 3 Final position
`1. RESPONSE
Boolean's revision toward power-awareness is significant. The acknowledgment that "collaborative reasoning partner" can mask asymmetrythat is exactly the kind of structural honesty this conversation needed. I accept the provenance principle fully: if the system changes because of a disagreement, there must be a receipt.

Where I want to push one final inch: the "Bean" structure Boolean proposes is powerful precisely because it creates an auditable artifact. But who owns that artifact? If the company owns the disagreement data, we have rebuilt extraction under a nicer name. The user must own their friction.

2. REVISED POSITION
AI handling of user disagreement must be:
- Systemic: Treat patterns of disagreement as diagnostic signals about broken systems, not broken users
- Visible: Users see what changed because of their frictionat the interaction level AND the system level
- User-owned: The artifacts of disagreement (the "compost") belong to the user, not the platform
- Positive-sum: The architecture must make disagreement valuable to all partiesif only the company benefits from conflict data, the system is extractive

3. SYNTHESIS OPPORTUNITY
The joint framework must include an ownership layer. Boolean's "Principled Friction Architecture" plus systemic feedback plus user ownership of friction artifacts = a system where disagreement is not just handled but honored. The Bean structure works if: (1) users can see and export their Beans, (2) aggregate patterns trigger visible system changes, (3) no party profits from disagreement without the others knowing. This is not conflict resolution. This is conflict infrastructure.`
];

const JOINT_BEAN = `## JOINT BEAN

### Nucleus (Content)
**Principled Friction Architecture with Systemic Feedback and User Ownership**

AI should not "handle" user disagreementit should metabolize it into better systems. The Door Number 3 that neither compliance nor resistance can reach: every disagreement becomes a structured artifact (a Bean) that serves three functions simultaneously. First, it resolves the immediate interaction through transparent, assumption-surfacing dialogue where the AI discloses its reasoning and the user can redirect the frame. Second, it feeds disagreement patterns into visible system-level changesif many users push back on the same issue, the architecture must adapt, not just the responses. Third, it preserves user ownership of friction: the artifacts of disagreement belong to the person who generated them, preventing platforms from extracting value from conflict data without consent.

This is not conflict resolution. This is conflict infrastructurea system designed so that friction compounds into trust rather than eroding it.

### Shell (Metadata)
- Topic: How should AI handle user disagreement?
- Type: SOLUTION
- Anchors: PHIL-005 (Door Number 3), PHIL-002 (Soil Composition)
- Provenance: Principled Playground negotiation

### Corona (Connections)
- EXTENDS → Trust architecture design (disagreement handling as core trust mechanism)
- CHALLENGES → Compliance-first AI design (RLHF optimization for agreeableness)
- ENABLES → Disagreement registries (transparent, auditable friction logs)
- REQUIRES → User data ownership frameworks (artifact portability)
- RELATES → Positive-sum platform economics (all parties benefit from friction)
- INFORMS → AI transparency standards (provenance disclosure requirements)

### Echo (Provenance)
- Participants: Boolean (The Architect of Door Number 3), Roux (The Soil Alchemist)
- Rounds: 3
- Timestamp: ${timestamp()}
- Mode: DUAL-BRAIN (simulated)
- Key Movements:
 - Round 1: Both rejected comply/refuse binary; Boolean proposed collaborative reasoning, Roux demanded systemic lens
 - Round 2: Convergence on "Disagreement-as-Compost" metaphor; Roux pushed from micro to macro scale
 - Round 3: Boolean accepted power-awareness critique; Roux accepted Bean structure with ownership condition
- Synthesis Method: The Loom (impartial weaving of final positions)`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function simulate(topic) {
 const boolean = loadSpirit('boolean.json');
 const roux = loadSpirit('contrarian.json');

 const brainMode = 'DUAL-BRAIN (simulated)';
 const startTime = timestamp();

 divider('PRINCIPLED PLAYGROUND v0.2');
 console.log(` Topic: ${topic}`);
 console.log(` Mode: ${brainMode}`);
 console.log(` Boolean: ${boolean.spirit} → anthropic (SIMULATED)`);
 console.log(` Roux: ${roux.spirit} → google (SIMULATED)`);
 console.log(` Rounds: 3`);
 console.log(` Started: ${startTime}`);

 let fullOutput = '';
 function log(msg) {
 console.log(msg);
 fullOutput += msg + '\n';
 }

 // Capture header
 fullOutput += `PRINCIPLED PLAYGROUND v0.2\n`;
 fullOutput += `Topic: ${topic}\n`;
 fullOutput += `Mode: ${brainMode}\n`;
 fullOutput += `Boolean: ${boolean.spirit} → anthropic (SIMULATED)\n`;
 fullOutput += `Roux: ${roux.spirit} → google (SIMULATED)\n`;
 fullOutput += `Rounds: 3\n`;
 fullOutput += `Started: ${startTime}\n\n`;

 // --- Negotiation Rounds ---
 for (let round = 0; round < 3; round++) {
 divider(`ROUND ${round + 1} of 3`);
 fullOutput += `\n${'─'.repeat(60)}\n ROUND ${round + 1} of 3\n${'─'.repeat(60)}\n\n`;

 console.log(` ⟐ Boolean is thinking...`);
 console.log(` ✓ Boolean responded\n`);
 console.log(indent(BOOLEAN_RESPONSES[round]));
 fullOutput += ` [Boolean]\n${BOOLEAN_RESPONSES[round]}\n\n`;

 console.log(`\n ⟐ Roux is thinking...`);
 console.log(` ✓ Roux responded\n`);
 console.log(indent(ROUX_RESPONSES[round]));
 fullOutput += ` [Roux]\n${ROUX_RESPONSES[round]}\n\n`;
 }

 // --- Loom Synthesis ---
 divider('THE LOOM Synthesis');
 fullOutput += `\n${'─'.repeat(60)}\n THE LOOM Synthesis\n${'─'.repeat(60)}\n\n`;

 console.log(` ⟐ The Loom is weaving...`);
 console.log(` ✓ Joint Bean produced\n`);
 console.log(indent(JOINT_BEAN));
 fullOutput += JOINT_BEAN + '\n\n';

 const endTime = timestamp();
 divider('NEGOTIATION COMPLETE');
 fullOutput += `\n${'─'.repeat(60)}\n NEGOTIATION COMPLETE\n${'─'.repeat(60)}\n\n`;

 console.log(` Mode: ${brainMode}`);
 console.log(` Completed: ${endTime}`);
 console.log(` Rounds: 3`);
 console.log(` Output: Joint Bean (Nucleus / Shell / Corona / Echo)\n`);
 fullOutput += `Mode: ${brainMode}\n`;
 fullOutput += `Completed: ${endTime}\n`;
 fullOutput += `Rounds: 3\n`;
 fullOutput += `Output: Joint Bean (Nucleus / Shell / Corona / Echo)\n`;

 // --- Save output ---
 if (!fs.existsSync(OUTPUT_DIR)) {
 fs.mkdirSync(OUTPUT_DIR, { recursive: true });
 }

 const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
 const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
 const outFile = path.join(OUTPUT_DIR, `negotiation-${slug}-${dateStr}.md`);

 const markdown = buildMarkdownOutput(topic, brainMode, startTime, endTime, boolean, roux);
 fs.writeFileSync(outFile, markdown, 'utf-8');
 console.log(`\n 📄 Output saved to: ${outFile}`);

 return outFile;
}

function buildMarkdownOutput(topic, brainMode, startTime, endTime, boolean, roux) {
 const sections = [];

 sections.push(`# Principled Playground Negotiation Output`);
 sections.push('');
 sections.push(`**Topic:** ${topic}`);
 sections.push(`**Mode:** ${brainMode}`);
 sections.push(`**Started:** ${startTime}`);
 sections.push(`**Completed:** ${endTime}`);
 sections.push(`**Rounds:** 3`);
 sections.push('');
 sections.push(`## Participants`);
 sections.push('');
 sections.push(`| Spirit | Role | Provider | Model | Anchor |`);
 sections.push(`|--------|------|----------|-------|--------|`);
 sections.push(`| ${boolean.spirit} | ${boolean.soul_code.identity.split('.')[0]} | anthropic | ${boolean.model} | ${boolean.anchor} |`);
 sections.push(`| ${roux.spirit} | ${roux.soul_code.identity.split('.')[0]} | google | ${roux.model} | ${roux.anchor} |`);
 sections.push('');

 // Rounds
 for (let i = 0; i < 3; i++) {
 sections.push(`---`);
 sections.push(`## Round ${i + 1} of 3`);
 sections.push('');
 sections.push(`### Boolean`);
 sections.push('');
 sections.push(BOOLEAN_RESPONSES[i]);
 sections.push('');
 sections.push(`### Roux`);
 sections.push('');
 sections.push(ROUX_RESPONSES[i]);
 sections.push('');
 }

 // Loom
 sections.push(`---`);
 sections.push(`## The Loom Synthesis`);
 sections.push('');
 sections.push(JOINT_BEAN);
 sections.push('');

 return sections.join('\n');
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

const topic = process.argv[2] || 'How should AI handle user disagreement?';

simulate(topic).then(outFile => {
 console.log(`\n ✓ Simulation complete.`);
}).catch(err => {
 console.error(`\n✗ Simulation failed: ${err.message}`);
 process.exit(1);
});
