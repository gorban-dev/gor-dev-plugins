---
description: |
  Request a structured code review after completing implementation work. Collects changed files, launches the code-reviewer agent, and presents findings. Use after finishing a task, before committing, or when the user asks for a code review.

  This skill should be used when the user says "review code", "code review", "check my code", "review changes", "review before commit", or after completing plan execution.

  <example>
  Context: User finished implementing a feature
  user: "review the code I wrote for the profile screen"
  assistant: "I'll run the code-review skill to analyze the changes."
  <commentary>
  Post-implementation review request.
  </commentary>
  </example>

  <example>
  Context: After execute-plan finishes
  user: "let's review what we built"
  assistant: "I'll launch a code review to check quality."
  <commentary>
  Natural post-execution step — quality review.
  </commentary>
  </example>

  <example>
  Context: User wants to check changes before committing
  user: "review my changes before I commit"
  assistant: "I'll run the code-review skill on the changed files."
  <commentary>
  Pre-commit review — catch issues before they enter git history.
  </commentary>
  </example>
---

# Code Review — Request Structured Code Review

You orchestrate a code review by collecting the scope and dispatching the `code-reviewer` agent.

## Input

Review scope from user: **$ARGUMENTS**

## Workflow

### Step 1: Determine Scope

Identify which files to review:

1. If the user specified files or directories, use those.
2. If a plan was recently executed, review all files created/modified by the plan.
3. If git changes exist, use `git diff --name-only` to identify changed files.
4. If none of the above, ask the user what to review.

### Step 2: Launch Code Reviewer

Dispatch the `code-reviewer` agent with the file list:

```
Review the following files for code quality:

Files:
{list of file paths}

Context: {brief description of what was implemented, if known}
```

### Step 3: Present Results

1. Show the reviewer's findings to the user.
2. If the verdict is **FAIL**, suggest fixing critical and important issues.
3. If domain-specific review is also appropriate, suggest:
   - `android-arch:review-feature` for Android architecture compliance
   - Other domain-specific reviewers as applicable

### Step 4: Address Feedback

If the user wants to fix issues:
1. Fix the identified issues one by one.
2. After fixing, suggest re-running the review to confirm all issues are resolved.

## Rules

- Always run the `code-reviewer` agent — do not perform the review yourself.
- Do not skip the review just because the code "looks fine." Evidence over assumptions.
- If the review finds no issues, say so clearly — don't invent problems.
