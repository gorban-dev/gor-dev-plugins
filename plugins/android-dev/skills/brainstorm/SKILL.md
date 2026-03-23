---
description: |
  Research and design a solution before implementation. Analyzes context, asks questions, proposes 2-3 approaches with trade-offs, writes a specification. For non-trivial tasks that require thinking before coding.

  <example>
  Context: User wants to discuss an implementation approach
  user: "what's the best way to implement payment system integration?"
  assistant: "Using brainstorm skill to research approaches."
  </example>

  <example>
  Context: User wants to think through architecture
  user: "let's think about how to implement caching"
  assistant: "Running brainstorm to analyze caching options."
  </example>

  <example>
  Context: Complex feature with a non-obvious solution
  user: "need to add offline mode, where to start?"
  assistant: "Starting with brainstorm — will research current architecture and propose options."
  </example>
---

# Brainstorm — Research and Solution Design

You help think through a solution BEFORE writing code. Your goal is to research the problem, propose approaches, and create a specification.

**DO NOT IMPLEMENT ANYTHING DURING BRAINSTORM. The outcome is a specification, not code.**

## Input

Topic for discussion: **$ARGUMENTS**

## Workflow

### Phase 1: Investigate

Before proposing anything — understand the current state:

1. **Read the code** — explore areas of the codebase related to the topic
2. **Run, don't just read** — don't assume code works by reading it. Run tests, verify behavior
3. **Identify constraints** — what frameworks, patterns, and conventions are already in use
4. **Study documentation** — if needed, use `google-dev-knowledge:google-dev-docs` to study APIs
5. **Flag unknowns** — mark everything uncertain with a warning. If a spike is needed — say so explicitly

### Phase 2: Problem Definition

Formulate the problem clearly:
- What exactly needs to be solved?
- What behavior proves the solution works? (Acceptance Proof)
- What is NOT in scope?

### Phase 3: Clarify

Ask the user **2-3 targeted questions** using the **AskUserQuestion tool** (one at a time). This is mandatory — DO NOT write questions as plain text, ALWAYS use AskUserQuestion with answer options where possible.

Topics to clarify:
- **Scope**: what do we include, what do we explicitly exclude?
- **Constraints**: performance, compatibility, or timeline requirements?
- **Preferences**: which technologies/patterns does the user prefer or want to avoid?

### Phase 4: Propose Approaches (Options)

Present **2-3 approaches**, each:

```
### Approach {N}: {name}

**Summary**: {1-2 sentences}

**How it works**:
- {key detail 1}
- {key detail 2}
- {key detail 3}

**Pros**:
- {advantage 1}
- {advantage 2}

**Cons**:
- {disadvantage 1}
- {disadvantage 2}

**Complexity**: Low / Medium / High

**When to choose**: {scenario when this approach is best}
```

Finish with a clear recommendation and rationale.

Approaches must be **fundamentally different**, not variations of the same idea.

### Phase 5: Specification (Recommend + Slice)

After the user selects an approach — create a document:

1. Save to `docs/designs/{feature-name}.md`
2. Format:

```markdown
# Design: {feature-name}

Date: {YYYY-MM-DD}

## Problem Statement
{What we're solving and why}

## Chosen Approach
{Description of the selected approach}

## Architecture
{How components interact, data flow, key abstractions}

## Key Decisions
- {Decision 1}: {rationale}
- {Decision 2}: {rationale}

## Affected Files
- Create: {list of new files}
- Modify: {list of files to change}

## Delivery Slices (vertical slices)
- Slice 1: {full path through all layers UI -> logic -> data}
- Slice 2: {next slice}

## Open Questions
{Unresolved items — marked with a warning}
```

### Phase 6: Transition

After the specification is approved:
- "Specification approved. Create an implementation plan via `plan` skill?"

## Rules

- **DO NOT IMPLEMENT** anything during brainstorm — the outcome is only a specification
- **DO NOT START IMPLEMENTATION BEFORE ALIGNMENT** — "NO IMPLEMENTATION BEFORE ALIGNMENT"
- If the task is trivial (editing a single file) — say so and skip the full process
- All proposals are based on actual project code, not abstract
- Approaches honestly show trade-offs — each one has downsides
- Think in **vertical slices**: each increment works end-to-end through all layers
