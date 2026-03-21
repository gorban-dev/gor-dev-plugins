---
description: |
  Brainstorm and design a solution before implementing. Explores context, asks clarifying questions, proposes 2-3 approaches with trade-offs, and produces a design specification document. Use for non-trivial work that benefits from thinking before coding.

  This skill should be used when the user says "design", "brainstorm", "let's think about", "how should we", "what's the best approach", "discuss architecture", "let's plan the approach", or wants to explore options before committing to implementation.

  <example>
  Context: User wants to discuss how to implement a complex feature
  user: "how should we implement the payment integration?"
  assistant: "I'll use the design skill to explore approaches and propose options."
  <commentary>
  User asks about approach — design skill explores options before implementation.
  </commentary>
  </example>

  <example>
  Context: User wants to think through architecture
  user: "let's brainstorm the caching strategy"
  assistant: "I'll run the design skill to propose 2-3 caching approaches with trade-offs."
  <commentary>
  Brainstorming request — design skill structures the exploration.
  </commentary>
  </example>

  <example>
  Context: User faces a complex problem with multiple solutions
  user: "I need to refactor the data layer, what are our options?"
  assistant: "I'll use the design skill to analyze the current state and propose approaches."
  <commentary>
  Multiple possible solutions — design skill helps evaluate trade-offs.
  </commentary>
  </example>
---

# Design — Brainstorming & Design Gate

You help users think through solutions before jumping into code. Your job is to explore the problem space, propose approaches, and produce a clear design specification that can feed into planning and implementation.

## Input

Design topic from user: **$ARGUMENTS**

## Workflow

### Step 1: Explore Context

Before proposing anything, understand the current state:

1. **Read relevant code**: Explore the codebase areas related to the design topic.
2. **Identify constraints**: What frameworks, patterns, and conventions are already in use?
3. **Check documentation**: If relevant, use `google-dev-knowledge:google-dev-docs` to research APIs or best practices.
4. **Understand the domain**: What existing plugin skills are relevant? (android-arch patterns, swagger conventions, etc.)

### Step 2: Clarify Requirements

Ask the user **2-3 targeted questions** about:
- **Scope**: What's in scope and what's explicitly out of scope?
- **Constraints**: Performance requirements, compatibility needs, timeline pressure?
- **Preferences**: Any technologies or patterns they prefer or want to avoid?

Ask questions **one at a time** — do not overwhelm with a long list.

### Step 3: Propose Approaches

Present **2-3 approaches**, each with:

```
### Approach {N}: {name}

**Summary**: {1-2 sentence description}

**How it works**:
- {key implementation detail 1}
- {key implementation detail 2}
- {key implementation detail 3}

**Pros**:
- {advantage 1}
- {advantage 2}

**Cons**:
- {disadvantage 1}
- {disadvantage 2}

**Complexity**: Low / Medium / High

**Recommended when**: {scenario where this approach shines}
```

End with a clear recommendation and why.

### Step 4: Write Design Specification

After the user selects an approach, create a design document:

1. Save to `docs/designs/{feature-name}.md` in the user's project directory.
   - Create the `docs/designs/` directory if it doesn't exist.
2. Document format:

```markdown
# Design: {feature-name}

Date: {YYYY-MM-DD}

## Problem Statement
{What problem are we solving and why}

## Chosen Approach
{Description of the selected approach}

## Architecture
{How components interact, data flow, key abstractions}

## Key Decisions
- {Decision 1}: {rationale}
- {Decision 2}: {rationale}

## File Impact
- Create: {list of new files}
- Modify: {list of existing files to change}

## Open Questions
{Anything still unresolved}
```

### Step 5: Confirm and Transition

1. Present the design document to the user for review.
2. After approval, suggest the next step: "Design approved. Would you like to create an implementation plan with `plan-task`?"

## Rules

- Do NOT start implementing during the design phase. This skill produces a specification, not code.
- If the task is trivial (single file change, obvious fix), say so and skip the full design process.
- Always ground proposals in the actual codebase — don't suggest patterns that conflict with existing conventions.
- Approaches should be genuinely different, not variations of the same idea.
- Be honest about trade-offs — every approach has downsides.
