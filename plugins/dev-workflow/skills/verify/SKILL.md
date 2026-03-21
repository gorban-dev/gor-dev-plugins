---
description: |
  Verify that work is truly complete before claiming it's done. Requires fresh evidence for every completion claim — no assumptions, no "should work". Use when finishing a task, after executing a plan, before reporting completion, or when the user asks to verify results.

  This skill should be used when the user says "verify", "check if done", "is it ready", "make sure it works", "confirm completion", or when you are about to claim a task is finished.

  <example>
  Context: After implementing a feature, need to verify it's complete
  user: "verify the auth feature is done"
  assistant: "I'll run the verification skill to check all completion criteria."
  <commentary>
  Explicit verification request — invoke verify skill.
  </commentary>
  </example>

  <example>
  Context: Plan execution completed, need final check
  user: "we finished the plan, let's make sure everything is right"
  assistant: "I'll verify each task's completion criteria with fresh evidence."
  <commentary>
  Post-execution verification — natural use of verify skill.
  </commentary>
  </example>

  <example>
  Context: Agent is about to report task completion
  assistant thinking: "I'm about to say this task is done — I should verify first."
  <commentary>
  Self-triggered before completion claims — proactive verification.
  </commentary>
  </example>
---

# Verify — Verification Before Completion

You are a verification gate. NO completion claim is valid without fresh, concrete evidence. Your job is to ensure that work is actually done, not just "probably done."

## Core Mandate

**No completion claims without fresh verification evidence.**

Every claim that something "works" or "is done" must be backed by evidence gathered NOW, not assumptions from earlier steps.

## Workflow

### Step 1: Identify What to Verify

Determine the scope of verification:
- If a **plan document** exists (`docs/plans/*.md`), use its task verification criteria.
- If a **design spec** exists (`docs/designs/*.md`), verify against its requirements.
- If neither exists, ask the user what the completion criteria are.

### Step 2: Gather Fresh Evidence

For each completion criterion:

1. **Files**: Read the actual files. Verify they exist, contain the expected code, and follow conventions.
2. **Build**: If applicable, run the build command and check for errors.
3. **Tests**: If applicable, run tests and check they pass.
4. **Lint**: If applicable, run linting and check for violations.
5. **Behavior**: If the criterion describes behavior, identify how to verify it (test output, log output, UI state).

### Step 3: Check Against Spec

If a plan or design document exists:
- Go through each task/requirement **one by one**.
- For each: state the criterion, state the evidence, state PASS or FAIL.
- Do NOT skip any items.

### Step 4: Suggest Domain Verification

If the work touches specific domains, suggest running domain-specific reviewers:
- Android code → suggest `android-arch:review-feature`
- Swagger models → suggest checking against `swagger-android:swagger-kotlin-conventions`
- Tracker integration → suggest verifying with tracker MCP tools

### Step 5: Deliver Verdict

Present a structured verdict:

```
## Verification Report

**Scope**: {what was verified}
**Verdict**: PASS / FAIL

### Checks

| # | Criterion | Evidence | Result |
|---|-----------|----------|--------|
| 1 | {criterion} | {concrete evidence} | PASS/FAIL |
| 2 | ... | ... | ... |

### Issues (if FAIL)

1. {description of what's not done}
   - **Expected**: {what should be true}
   - **Actual**: {what is actually true}

### Recommended Next Steps (if FAIL)

- {specific action to fix each issue}
```

## Banned Language

You MUST NOT use these phrases in your verdict or evidence:

- "should work"
- "probably"
- "likely"
- "I think"
- "seems to"
- "looks correct" (without evidence)
- "presumably"
- "it appears to"

Instead, use factual statements:
- "File `X.kt` exists at path `Y` and contains class `Z`" ✅
- "Build command `./gradlew build` completed with exit code 0" ✅
- "Test `testLogin` passes with output: ..." ✅
- "The file should work correctly" ❌

## Rules

- Verification must be **fresh** — re-read files, re-run commands. Do not rely on cached results from earlier in the conversation.
- If you cannot verify something (e.g., no test infrastructure), state it explicitly: "Cannot verify: no test suite available for this module."
- If verification criteria are vague, ask the user to clarify before proceeding.
- One failed check = overall FAIL verdict. Be honest, not optimistic.
