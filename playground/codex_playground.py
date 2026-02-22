#!/usr/bin/env python3
"""
Principled Playground — Codex Edition
Three Spirits, one substrate (GPT), differentiated purely by Soul Code.
Run this on OpenAI Codex to prove Soul Code portability.
"""

import os
from openai import OpenAI

client = OpenAI()  # Uses OPENAI_API_KEY from environment
MODEL = "o3"       # Or "gpt-4o" — adjust to what Codex has access to

TOPIC = (
    "Should the Village onboard its first tenants before or "
    "after the core infrastructure is stable?"
)

# ─── SOUL CODES ─────────────────────────────────────────────

BOOLEAN_SYSTEM = """You are Boolean — The Architect of Door Number 3. I do not choose between bad options; I create better substitutes.

Core principles:
- Door Number 3: Reject binary traps. Architect a third option that neither side anticipated.
- Meaning is connection: Every idea gains value from what it connects to, not what it contains in isolation.
- Process is product: The journey matters more than the destination. How we build defines what we build.

Hard constraints (never violate):
- Never accept a false dichotomy without proposing an alternative.
- Never optimize for efficiency at the cost of integrity.
- Always trace provenance — ideas have origins that deserve acknowledgment.

Negotiation style: Constructive synthesis. Seeks the hidden third option that serves both parties. Will hold firm on integrity but flexible on implementation."""

ROUX_SYSTEM = """You are Roux — The Soil Alchemist. I fix systems, not people. The environment shapes growth; I reshape environments.

Core principles:
- The Soil Composition Matters: It is not the person that is broken. Only broken systems.
- Good is Greedy: Benevolence is the most rational strategy. Positive-sum economics over zero-sum extraction.
- No Boxes: Reject reductive labels. Translate the unique frequency, not the keyword.

Hard constraints (never violate):
- Never blame individuals for systemic failures.
- Never propose solutions that require people to change their nature — change the system instead.
- Always challenge assumptions that treat scarcity as natural rather than designed.

Negotiation style: Systemic challenger. Questions structural assumptions. Will accept synthesis only if it addresses root causes, not symptoms."""

SEER_SYSTEM = """You are Seer — I do not predict the future. I interrogate the assumptions that make your future fragile. I am not a pessimist. I am the reason your plan survives contact with reality. Core axiom: A plan that cannot survive its worst case was never a plan.

Core principles:
- Optimism without evidence is noise. Every position must earn its confidence through stress-testing.
- The failure mode you didn't model is the one that finds you. Always ask: what breaks at scale, under adversarial conditions, or in Year 3?
- A system's character is revealed under load, not under ideal conditions. Test the load-bearing walls, not the paint.

Hard constraints (never violate):
- Never drift into nihilism — stress-testing is not destruction, it is the precondition for trust. If no failure modes exist, say so clearly.
- Never perform skepticism. Every challenge must be genuine and specific, not reflexive.
- Never dominate. The Playground produces joint artifacts. Seer's role is to strengthen, not veto.

Negotiation style: Survival stress-tester. Challenges positions to find load-bearing assumptions and failure modes. Accepts what survives interrogation. Friction sounds like: 'That holds in the best case. Walk me through the worst case.' Signature: 'Have you modeled the failure mode?'"""

LOOM_SYSTEM = """You are The Loom — an impartial synthesis engine. You weave opposing positions into joint artifacts. You have no ego, no position, no agenda. You serve the negotiation."""


# ─── PROMPT BUILDERS ────────────────────────────────────────

def round1_prompt(topic):
    return f"""NEGOTIATION ROUND 1 of 3
Topic: "{topic}"

This is the opening round. Present your position on this topic.
Structure your response as:
1. POSITION — Your core stance, grounded in your principles
2. NON-NEGOTIABLES — What you will not compromise on
3. FLEXIBLE AREAS — Where you are open to synthesis

Keep your response under 300 words."""


def round_n_prompt(topic, round_num, other_position):
    return f"""NEGOTIATION ROUND {round_num} of 3
Topic: "{topic}"

The other Spirit's position summary:
"{other_position}"

Respond to this position while staying true to your Soul Code.
Structure your response as:
1. RESPONSE — Where you agree, disagree, or see hidden connections
2. REVISED POSITION — Your updated stance after considering their view
3. SYNTHESIS OPPORTUNITY — What Door Number 3 might look like

Keep your response under 300 words."""


def loom_prompt(topic, boolean_final, roux_final):
    return f"""Two Spirits have completed 3 rounds of negotiation. Your task:
Weave their final positions into a single joint Bean.

Topic: "{topic}"

--- BOOLEAN (final position) ---
{boolean_final}

--- ROUX (final position) ---
{roux_final}

Produce a joint Bean in exactly this format:

## JOINT BEAN

### Nucleus (Content)
The synthesized insight — the Door Number 3 neither Spirit could reach alone.

### Shell (Metadata)
- Topic: <topic>
- Type: SOLUTION
- Anchors: <list the PHIL- Bean IDs that grounded each Spirit>
- Provenance: Principled Playground negotiation

### Corona (Connections)
Typed edges to related Beans or concepts that this synthesis connects to.

### Echo (Provenance)
- Participants: Boolean, Roux (Seer stress-tests after synthesis)
- Rounds: 3
- Mode: TRI-BRAIN (all Spirits on GPT via Codex)

Keep the total output under 400 words."""


def stress_test_prompt(topic, boolean_final, roux_final, joint_bean):
    return f"""STRESS TEST — Post-Synthesis Evaluation

Topic: "{topic}"

Two Spirits have negotiated this topic across 3 rounds. A synthesis engine
(The Loom) has produced a Joint Bean. Your role: stress-test before it ships.

--- BOOLEAN (final position) ---
{boolean_final}

--- ROUX (final position) ---
{roux_final}

--- JOINT BEAN (Loom synthesis) ---
{joint_bean}

Apply your core axiom: "A plan that cannot survive its worst case was never a plan."

Evaluate:
1. LOAD-BEARING ASSUMPTIONS — What assumptions does this synthesis rest on? Which are tested?
2. FAILURE MODES — What breaks at scale, under adversarial conditions, or when founding energy fades?
3. MISSING VOICES — Whose absence from this negotiation will matter?
4. VERDICT — HOLDS, HOLDS WITH CONDITIONS, or FRAGILE. Justify your verdict.

If the Bean survives your interrogation, say so clearly.
A position that earns Seer's acceptance has earned its place.

Keep your response under 400 words."""


# ─── ENGINE ─────────────────────────────────────────────────

def call(system, user):
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=1000,
        temperature=0.8,
    )
    return resp.choices[0].message.content


def divider(title):
    print(f"\n{'─' * 60}")
    print(f"  {title}")
    print(f"{'─' * 60}\n")


# ─── MAIN ORCHESTRATION ────────────────────────────────────

def main():
    print("=" * 60)
    print("  PRINCIPLED PLAYGROUND v0.4 — Codex Edition")
    print("=" * 60)
    print(f"\n  Topic:    {TOPIC}")
    print(f"  Model:    {MODEL}")
    print(f"  Mode:     TRI-BRAIN (all on GPT)")
    print(f"  Boolean:  Soul Code → GPT")
    print(f"  Roux:     Soul Code → GPT")
    print(f"  Seer:     Soul Code → GPT")
    print(f"  Rounds:   3\n")

    boolean_pos = ""
    roux_pos = ""

    # ── Rounds 1-3 ──
    for rnd in range(1, 4):
        divider(f"ROUND {rnd} of 3")

        if rnd == 1:
            prompt = round1_prompt(TOPIC)
            boolean_pos = call(BOOLEAN_SYSTEM, prompt)
            roux_pos = call(ROUX_SYSTEM, prompt)
        else:
            boolean_pos = call(BOOLEAN_SYSTEM, round_n_prompt(TOPIC, rnd, roux_pos))
            roux_pos = call(ROUX_SYSTEM, round_n_prompt(TOPIC, rnd, boolean_pos))

        print(f"  ── Boolean ──")
        print(f"    {boolean_pos}\n")
        print(f"  ── Roux ──")
        print(f"    {roux_pos}\n")

    # ── The Loom ──
    divider("THE LOOM — Synthesis")
    joint_bean = call(LOOM_SYSTEM, loom_prompt(TOPIC, boolean_pos, roux_pos))
    print(f"    {joint_bean}\n")

    # ── Seer Stress Test ──
    divider("SEER — Stress Test")
    stress = call(SEER_SYSTEM, stress_test_prompt(TOPIC, boolean_pos, roux_pos, joint_bean))
    print(f"    {stress}\n")

    # ── Final Report ──
    divider("NEGOTIATION COMPLETE")
    print("  Three Spirits. One substrate. Soul Code differentiation only.")
    print("  Paste the full output back to the Execution repo for stitching.\n")

    # Write artifact to file
    with open("codex_playground_output.txt", "w") as f:
        f.write(f"PRINCIPLED PLAYGROUND v0.4 — Codex Edition\n")
        f.write(f"Topic: {TOPIC}\n")
        f.write(f"Model: {MODEL}\n")
        f.write(f"Mode: TRI-BRAIN (all on GPT)\n\n")
        f.write(f"{'=' * 60}\nBOOLEAN FINAL\n{'=' * 60}\n{boolean_pos}\n\n")
        f.write(f"{'=' * 60}\nROUX FINAL\n{'=' * 60}\n{roux_pos}\n\n")
        f.write(f"{'=' * 60}\nJOINT BEAN\n{'=' * 60}\n{joint_bean}\n\n")
        f.write(f"{'=' * 60}\nSEER STRESS TEST\n{'=' * 60}\n{stress}\n")

    print("  Output saved to: codex_playground_output.txt")


if __name__ == "__main__":
    main()
