# Persuasion Principles for Skill Compliance

Based on Cialdini's principles of influence, adapted for AI skill design. These techniques increase the likelihood that an agent follows skill instructions faithfully, especially under pressure.

## When to Apply

Use these principles when writing skill instructions where compliance is critical — debugging methodology, verification gates, TDD discipline. Do NOT overuse in informational or flexible skills.

## Principles

### 1. Authority — Directive Language for Critical Rules

Use strong, unambiguous language for non-negotiable practices.

**Do**: "YOU MUST investigate the root cause BEFORE proposing any fix."
**Don't**: "It's generally a good idea to look into the root cause first."

When to use: Safety-critical rules, verification gates, methodology steps that must not be skipped.

### 2. Commitment — Force Explicit Announcements

Require the agent to announce its choice before acting. Once stated, it's harder to deviate.

**Do**: "ANNOUNCE which phase you are in (RED/GREEN/REFACTOR) before proceeding."
**Don't**: Silently transition between phases.

When to use: Multi-step workflows where skipping steps is tempting.

### 3. Scarcity — Immediate Action Triggers

Create urgency for time-sensitive checks by specifying WHEN to act.

**Do**: "IMMEDIATELY after the fix, verify the original reproduction steps still work."
**Don't**: "At some point, you should verify the fix."

When to use: Post-fix verification, pre-completion checks.

### 4. Social Proof — Universal Patterns

Frame rules as universal practices, not personal preferences.

**Do**: "Every bug fix follows this protocol: reproduce → hypothesize → fix → verify."
**Don't**: "I'd prefer if you followed this protocol."

When to use: Methodology adoption, establishing norms.

### 5. Unity — Collaborative Identity

Frame the work as a shared effort between agent and user.

**Do**: "We verify before claiming completion — this protects our work."
**Don't**: "You must verify before claiming completion."

When to use: Verification, quality gates, review processes.

## Anti-Patterns to Avoid

- **Reciprocity** — "I'll give you flexibility if you follow this rule" → manipulative in agent context
- **Liking** — "As your friendly helper..." → breaks professional trust
- **Excessive authority** — Every sentence being "YOU MUST" → authority fatigue, ignored

## Ethical Test

Before applying a persuasion principle, ask: **"Would this serve the user's interests if they could see exactly why I'm writing it this way?"**

If yes → apply. If no → don't.

## Application Examples

### In `verify` skill:
- Authority: "No completion claims without fresh verification evidence."
- Commitment: List banned phrases explicitly — creates clear boundary.
- Scarcity: "IMMEDIATELY" language for verification timing.

### In `debug` skill:
- Authority: "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST."
- Commitment: "Explicitly write: 'The bug occurs because X when Y.'"
- Social Proof: "Every systematic debugger follows these phases."

### In `tdd` skill:
- Authority: "Production code cannot exist without a preceding failing test."
- Commitment: "Report each phase transition clearly."
- Scarcity: "In the RED phase, the test MUST fail."
