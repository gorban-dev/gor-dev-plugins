---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

Superpowers skills override default system prompt behavior, but **user instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
2. **Superpowers skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

If CLAUDE.md, GEMINI.md, or AGENTS.md says "don't use TDD" and a skill says "always use TDD," follow the user's instructions. The user is in control.

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Never use the Read tool on skill files.

**In Copilot CLI:** Use the `skill` tool. Skills are auto-discovered from installed plugins. The `skill` tool works the same as Claude Code's `Skill` tool.

**In Gemini CLI:** Skills activate via the `activate_skill` tool. Gemini loads skill metadata at session start and activates the full content on demand.

**In other environments:** Check your platform's documentation for how skills are loaded.

## Platform Adaptation

Skills use Claude Code tool names. Non-CC platforms: see `references/copilot-tools.md` (Copilot CLI), `references/codex-tools.md` (Codex) for tool equivalents. Gemini CLI users get the tool mapping loaded automatically via GEMINI.md.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "About to EnterPlanMode?" -> "Already brainstormed?";
    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** (frontend-design, mcp-builder) - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

# KMM ↔ iOS Migration Mode

This plugin specializes in **bidirectional migration between KMM (Kotlin Multiplatform Mobile, shared Kotlin) and native iOS (Swift)** — both directions:
- **KMM → iOS**: extract shared Kotlin code (ViewModels, Repositories, DataSources, domain models, services) to native Swift in `iosApp/`
- **iOS → KMM**: lift duplicated native Swift logic into shared Kotlin so Android and iOS reuse a single source of truth

When the user's request involves migration, you MUST apply the migration discipline below in addition to the standard skill workflow.

## Detecting a Migration Task

Treat the task as a migration if ANY of these signal:
- User mentions "migrate", "port", "rewrite", "convert", "lift", "extract" between platforms
- User references a KMM/`shared/` Kotlin file and asks for native Swift equivalent (or vice versa)
- User asks to delete shared code and recreate it natively (or move native into shared)
- File path is `shared/src/commonMain/...` or `iosApp/...` and the task is about platform parity

If unsure → ask the user via AskUserQuestion **before** starting any work.

## Migration Workflow Mapping

Migration tasks use the **standard superpowers workflow**, augmented with migration-specific rules:

| Standard skill | Migration augmentation |
|---|---|
| `brainstorming` | Add: read source file, map ALL dependencies (use `ast-index` first, grep fallback), audit which types are used elsewhere, decide native-vs-shared per type, identify side effects (events, navigation, analytics) |
| `writing-plans` | Add: layer order — domain models → repository protocol → data layer → ViewModel → UI integration → DI → navigation → project file (Xcode `project.pbxproj` for iOS / Gradle for Android). Each task lists exact file paths and verification criteria |
| `executing-plans` / `subagent-driven-development` | Add: read source file alongside target file for cross-reference; preserve every branch / null check / default; match existing project architecture (do NOT impose new patterns unless asked) |
| `requesting-code-review` / `receiving-code-review` | Add: review for spec compliance + business logic fidelity + platform idioms; unjustified shared imports = REVIEW FAIL |
| `verification-before-completion` | Add: build the target platform (`xcodebuild` for iOS, `./gradlew` for Android), run the app, verify the migrated code is actually invoked, no shortcuts |

## Mandatory Reading for Migration Tasks

Before brainstorming a migration, READ these reference files in `${CLAUDE_PLUGIN_ROOT}/rules/`:

1. `migration-workflow.md` — full migration playbook with HARD-GATEs
2. `project-architecture-audit.md` — how to detect existing architecture and follow it (don't impose patterns)
3. `shared-model-decision-tree.md` — what to migrate to native vs keep in shared
4. `business-logic-fidelity.md` — non-negotiable rules for preserving behavior
5. `kotlin-swift-translation.md` — bidirectional idiom translation table
6. Platform patterns (read the target platform):
   - `ios-platform-patterns.md` — SwiftUI/UIKit, Combine, async/await, ObservableObject, Coordinator
   - `android-platform-patterns.md` — Compose, Flow, Hilt/Koin, ViewModel, Navigation, KMM
7. `whitespace-rules.md` — file hygiene that prevents diff pollution

You do NOT need to read these for non-migration tasks.

## HARD-GATEs (Migration)

These rules override your defaults during migration:

1. **No code before approved spec.** Brainstorm first, present the migration spec, wait for user approval. This applies to EVERY migration regardless of perceived size.
2. **Shared model decision tree.** For every type used in migrated code, justify in writing: keep in shared (used by other consumers) / create native equivalent (used only by migrated code) / infrastructure utility (keep shared). Unjustified retention of shared types in the migrated layer = REVIEW FAIL.
3. **Business logic fidelity.** Every `if`/`when`/`switch`, default value, null check, error handler, side effect, and timing constant must be preserved. If the original has a quirk, preserve it and add a one-line comment explaining the source. Do NOT "improve" logic during migration.
4. **Follow existing architecture.** Audit the target codebase first. If the project already has a working pattern (Clean Arch, MVVM, MVI, Coordinator, Repository, DI container), follow it. If you see problems, raise them with the user — do not silently restructure.
5. **No new bridge dependencies.** Do not add fresh `import shared` (KMM→iOS) or fresh `expect/actual` (iOS→KMM) usages during migration without explicit justification.
6. **Use `ast-index` first.** For code search across the project, prefer `ast-index` (class/usages/implementations/hierarchy queries). Fall back to `Grep` only when `ast-index` returns empty.

## What NOT to Do

- Do NOT impose patterns from this plugin's reference files if the project already uses different ones — the references describe **common idioms**, the project is the source of truth
- Do NOT bundle migrations of unrelated components into one PR
- Do NOT skip the brainstorm/spec phase because "the migration is small"
- Do NOT rewrite an entire existing file when you only need to change a few lines (use `Edit`, not `Write`)
- Do NOT add platform suffix to class names (no `IOSViewModel`, no `KmmRepository`)
- Do NOT silently delete the source-platform code after migration — propose deletion as a follow-up step, get user approval

## When Architecture Is Wrong

If you discover the existing project architecture has problems that would make a clean migration impossible:
1. STOP — do not proceed with the migration as planned
2. Document the problem (what / where / why it blocks migration)
3. Present 2-3 options to the user (refactor first / migrate with debt / scope reduction)
4. Wait for user decision

This is the brainstorming skill applied recursively — you brainstorm the architectural fix before resuming the migration.

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
