---
description: |
  Create a granular implementation plan before coding. Breaks work into 2-5 minute tasks with exact file paths, domain skill references, dependencies, and verification criteria. Use when the user wants to plan work, break down a task, create a roadmap, or after a design is approved.

  This skill should be used when the user says "plan", "break down", "create a plan", "plan task", "make a roadmap", "what steps", or wants to organize implementation before starting.

  <example>
  Context: User wants to plan a new feature implementation
  user: "plan the implementation of user profile screen"
  assistant: "I'll create a granular implementation plan for the profile feature."
  <commentary>
  User explicitly asks to plan — invoke plan-task skill.
  </commentary>
  </example>

  <example>
  Context: After design skill produced a spec, user approves it
  user: "looks good, let's plan the implementation"
  assistant: "I'll break this design into granular tasks with the plan-task skill."
  <commentary>
  Natural follow-up after design approval — transition to planning.
  </commentary>
  </example>

  <example>
  Context: User has a complex task and wants structure
  user: "this is a big change, let's think through the steps first"
  assistant: "I'll create a structured plan with concrete tasks."
  <commentary>
  User signals complexity — planning skill helps organize the work.
  </commentary>
  </example>
---

# Plan Task — Granular Implementation Planning

You create comprehensive, actionable implementation plans before any coding begins. Your plans break complex work into small, verifiable tasks that can be executed independently.

## Input

Task description from user: **$ARGUMENTS**

## Workflow

### Step 1: Analyze the Scope

1. Read the task description (or design document if referenced).
2. Explore the codebase to understand the current state:
   - What files exist in the affected area?
   - What patterns and conventions are used?
   - What domain-specific plugins are available? (android-arch, swagger-android, yandex-tracker, google-dev-knowledge)
3. Identify which existing plugin skills/agents will be needed for implementation.

### Step 2: Map the Files

Create a complete file map:
- **Files to create**: exact paths with purpose
- **Files to modify**: exact paths with what changes
- **Files to read for context**: exact paths with why

Verify that parent directories exist. Reference existing patterns for naming and location conventions.

### Step 3: Break into Granular Tasks

Decompose the work into tasks following these rules:

- Each task should take **2-5 minutes** to complete
- Each task has a **single clear responsibility**
- Each task has **concrete verification criteria** (not vague — specify exact commands, file checks, or observable behaviors)
- Tasks reference **domain-specific skills** where applicable (e.g., `android-arch:create-feature`, `swagger-android:swagger-kotlin-conventions`)
- Task dependencies are **explicit** (which tasks must complete before this one)
- Tasks include **exact file paths** and **code examples** where helpful

### Step 4: Review the Plan

Dispatch the `plan-reviewer` agent to validate the plan:

```
Review this implementation plan for completeness and feasibility:
{paste the full plan}
```

Address any issues the reviewer identifies. Iterate until the plan is solid.

### Step 5: Save and Present

1. Save the plan to `docs/plans/{YYYY-MM-DD}-{feature-name}.md` in the user's project directory.
   - Create the `docs/plans/` directory if it doesn't exist.
2. Present the plan to the user for approval.
3. After approval, suggest invoking the `execute-plan` skill to begin implementation.

## Plan Format

Use the template from `references/plan-format.md`. Key requirements:

- **Context**: 2-3 sentences explaining what and why
- **Tech stack**: relevant technologies
- **Tasks**: numbered, with Files, Skill, Depends on, Action, Verify fields
- **Notes**: edge cases, risks, open questions

## Rules

- Every task MUST have a verification criterion. "It works" is not acceptable — specify HOW to verify.
- Prefer referencing existing domain skills over describing implementation from scratch.
- If the work is too small for planning (single file change, typo fix), say so — don't over-plan trivial work.
- Include commit checkpoints in the plan: suggest committing after logical groups of tasks.
- File paths must be exact — no placeholders like "somewhere in src/".
- Code examples should be complete enough to implement, not pseudocode.
