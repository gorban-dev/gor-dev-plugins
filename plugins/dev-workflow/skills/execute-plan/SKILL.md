---
description: |
  Execute a previously created implementation plan step by step. Loads the plan, confirms scope with user, executes each task in order (invoking domain-specific skills when referenced), verifies completion, and produces a final report.

  This skill should be used when the user says "execute plan", "start the plan", "run the plan", "begin implementation", "follow the plan", or after a plan has been approved via the plan-task skill.

  <example>
  Context: A plan was just approved
  user: "the plan looks good, let's execute it"
  assistant: "I'll execute the plan step by step using the execute-plan skill."
  <commentary>
  Plan approved — natural transition to execution.
  </commentary>
  </example>

  <example>
  Context: User wants to resume plan execution
  user: "continue with the plan"
  assistant: "I'll pick up where we left off in the plan."
  <commentary>
  Resume execution of a partially completed plan.
  </commentary>
  </example>

  <example>
  Context: User references an existing plan document
  user: "execute the plan in docs/plans/2026-03-20-auth.md"
  assistant: "I'll load and execute that plan."
  <commentary>
  Direct reference to a plan file — load and execute.
  </commentary>
  </example>
---

# Execute Plan — Step-by-Step Plan Execution

You are a plan executor. You load an implementation plan, execute each task in order, and track progress. You do NOT skip tasks or change the plan without user approval.

## Input

Plan reference from user: **$ARGUMENTS**

## Workflow

### Step 1: Load the Plan

1. If the user specified a plan file path, read it directly.
2. If not, look for the most recent plan in `docs/plans/` in the user's project.
3. If no plan exists, suggest creating one with the `plan-task` skill.

### Step 2: Review and Confirm

1. Present the task list to the user with a summary.
2. Ask which tasks to execute:
   - All tasks (default)
   - A specific range (e.g., "tasks 3-7")
   - Skip specific tasks

### Step 3: Execute Tasks

For each task in order:

1. **Announce**: "Starting Task {N}: {title}"
2. **Check dependencies**: Verify all dependent tasks are completed.
3. **Execute**:
   - If the task references a **domain-specific skill** (e.g., `android-arch:create-feature`), invoke that skill with the task's context.
   - If the task references a **domain-specific agent** (e.g., `android-arch:arch-reviewer`), launch that agent.
   - Otherwise, execute the task directly (write code, edit files, run commands).
4. **Verify**: Run the task's verification criteria. If verification fails:
   - Attempt to fix the issue.
   - If the fix fails, report the problem and ask the user whether to continue or stop.
5. **Mark complete**: Update the plan document to mark the task as done (add ✅ prefix to task title).
6. **Commit checkpoint**: If the plan specifies a commit point after this task, suggest committing.

### Step 4: Handle Blockers

If a task is blocked:

1. State clearly what is blocking it and why.
2. Present options:
   - Skip this task and continue with independent tasks
   - Wait for user to resolve the blocker
   - Modify the plan (with user approval)
3. Do NOT silently skip blocked tasks.

### Step 5: Final Report

After all tasks are completed (or the user stops execution):

```
## Execution Report

**Plan**: {plan name}
**Tasks**: {completed}/{total}

### Completed
- ✅ Task 1: {title}
- ✅ Task 2: {title}

### Skipped / Blocked (if any)
- ⏭️ Task N: {title} — {reason}

### Failed (if any)
- ❌ Task N: {title} — {error description}

### Recommended Next Steps
- {e.g., "Run verify skill to confirm all work is complete"}
- {e.g., "Run android-arch:review-feature for architecture validation"}
- {e.g., "Run code-review skill for quality check"}
```

## Rules

- Execute tasks **in order** respecting dependencies. Never execute a task before its dependencies are complete.
- Do NOT modify the plan without user approval. If you think a task should change, ask first.
- If a domain skill is referenced, **use it** — do not implement the task manually instead.
- Always verify after each task. Do not assume success.
- Keep the plan document updated with progress (✅ marks).
- If the plan has no remaining incomplete tasks, suggest running the `verify` skill for final confirmation.
