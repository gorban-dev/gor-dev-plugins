---
description: |
  Create and execute an implementation plan. Two modes: creating a granular plan (tasks of 2-5 minutes each) and step-by-step execution. Use for planning complex tasks or after brainstorm.

  <example>
  Context: User wants to plan a feature implementation
  user: "create a plan for the settings screen"
  assistant: "Using plan skill in plan mode to create a granular plan for the settings feature."
  </example>

  <example>
  Context: User wants to execute an existing plan
  user: "execute the plan from .claude/docs/android-dev/plans/2026-03-20-settings.md"
  assistant: "Using plan skill in execute mode for step-by-step plan execution."
  </example>

  <example>
  Context: User wants to break a complex task into steps
  user: "break down the DI migration task into steps"
  assistant: "Using plan skill to decompose the DI migration task into granular tasks."
  </example>
---

# Plan — Create & Execute Implementation Plans

You create and execute granular implementation plans. Two operating modes.

## Input

Task from the user: **$ARGUMENTS**

## Determining the Mode

### PLAN Mode (default)
Triggers:
- User asks to plan / create a plan / break down a task
- No reference to an existing plan for execution
- After brainstorm, when ideas need to be turned into tasks

### EXECUTE Mode
Triggers:
- User references an existing plan (file or link)
- User says "execute the plan" / "start from the plan"
- A plan file exists in `.claude/docs/android-dev/plans/`

---

## Mode: PLAN

### Step 1: Scope Analysis

1. Read the task / design document / brainstorm result
2. Study the current codebase:
   - Find related features via Glob
   - Read `$CLAUDE_PLUGIN_ROOT/rules/android-core.md` to understand the architecture
   - Determine which files need to be created / modified / only read
3. Identify dependencies on existing code

### Step 2: File Mapping

Compile a complete list of files with exact paths:
- **Create** — new files that need to be created
- **Modify** — existing files that need to be changed
- **Read** — files for context (do not change)

### Step 3: Task Decomposition

Break the work into granular tasks:

**Requirements for each task:**
- **2-5 minutes** to complete (no more)
- **Single responsibility** — one task = one action
- **Concrete verification criteria** — not "make sure it works", but "file is created and contains a data class with fields X, Y, Z"
- **Skill reference** if applicable (implement, review, test-ui, etc.)
- **Explicit dependencies** — which tasks it depends on
- **Exact file paths** — no "and other files"

**Task order:**
1. Preparation (reading rules, analyzing existing code)
2. Domain layer (UseCases, Repository interfaces)
3. Data layer (Repository implementations, DataSources)
4. Presentation layer (ViewState, ViewEvent, ViewAction, ViewModel)
5. UI layer (Screen, View)
6. DI (dependency module)
7. Review (architecture check)
8. Testing (UI tests on device)

### Step 4: Plan Self-Check

Validate the plan before saving:
- [ ] Each task takes 2-5 minutes
- [ ] Each task has concrete verification criteria
- [ ] Dependencies are correct (no cycles, none missing)
- [ ] All files from the mapping are covered by tasks
- [ ] Task order is logical (domain -> data -> presentation -> UI -> DI)
- [ ] No "monster" tasks (more than 3 files at once)

### Step 5: Save

Save the plan to a file: `.claude/docs/android-dev/plans/{YYYY-MM-DD}-{feature-name}.md`

Format — see `references/plan-format.md`:

```markdown
# Plan: {feature-name}

Date: {YYYY-MM-DD}
Design: {link to design doc, if exists}

## Context

{What we're building and why, 2-3 sentences}

## Tech Stack

{Key technologies, frameworks, patterns involved}

## Tasks

### Task 1: {title}
- **Files**: {exact file paths to create/modify}
- **Skill**: {skill name, if applicable — e.g., implement, review, test-ui}
- **Depends on**: {task numbers, or "none"}
- **Action**: {specific description of what to do}
- **Verify**: {concrete verification criteria}

### Task 2: {title}
...

## Notes

{Edge cases, risks, open questions, decisions made}
```

Output to the user: path to the plan file, number of tasks, time estimate.

---

## Mode: EXECUTE

### Step 1: Load the Plan

1. Read the plan file (from the path specified by the user or from `.claude/docs/android-dev/plans/`)
2. Display the task list to the user
3. Confirm scope: "Executing {N} tasks. Shall I begin?"

### Step 2: Sequential Execution

For each task in order:

1. **Announce** — "Task {N}/{total}: {title}"
2. **Check dependencies** — are all dependent tasks completed?
   - If not — inform the user, suggest options
3. **Execute**:
   - If a skill is specified — invoke it (implement, review, test-ui, etc.)
   - If no skill is specified — perform the action directly
4. **Verify** — check against the criteria from the plan
   - If verification passes — mark the task as completed
   - If it fails — try to fix it; if unable — mark as failed
5. **Status** — update the task status in the plan (if possible)

### Step 3: Handle Blockers

If a task cannot be completed:
1. Inform the user of the reason
2. Suggest options:
   - Skip the task and continue
   - Change the approach
   - Stop execution
3. Request a decision from the user

### Step 4: Final Report

```
## Execution Report: {plan name}

### Tasks
| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | {title} | Done | {details} |
| 2 | {title} | Done | |
| 3 | {title} | Skipped | {reason} |
| 4 | {title} | Failed | {reason} |

### Summary
- Completed: {N}/{total}
- Skipped: {N}
- Failed: {N}
- Time: {approximate time}

### Next Steps
{What needs to be done next, if anything}
```

## Rules

- **Every task MUST have verification criteria** — without them the task is not accepted
- **Execute tasks in order** — respect dependencies
- **If a skill is specified — USE it** — don't do manually what is automated
- **Always verify after execution** — don't mark a task without checking
- **Keep the plan up to date** — update task statuses in the document
