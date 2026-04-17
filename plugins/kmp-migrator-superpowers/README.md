# KMP Migrator Superpowers

A coding-agent plugin for **bidirectional migration between Kotlin Multiplatform Mobile (KMM) shared code and native iOS Swift**, built on top of the [Superpowers](https://github.com/obra/superpowers) methodology.

It works in both directions:

- **KMM → iOS** — extract shared Kotlin code (ViewModels, Repositories, DataSources, domain models, services, screen logic) into native Swift in `iosApp/`
- **iOS → KMM** — lift duplicated native Swift logic into shared Kotlin so Android and iOS can share a single source of truth

The plugin treats migration as a careful, evidence-based process — not a one-shot rewrite. Every migration goes through a research phase, a design spec, a granular execution plan, code review, and build-backed verification. Business logic must be preserved line-by-line; the existing project architecture must be honored.

## Why This Plugin

KMM ↔ native migrations are easy to get wrong. Common failure modes:

- Silently rewriting business logic during translation (skipping branches, "improving" defaults, dropping side effects)
- Inventing a new architecture inside the migrated layer instead of following the project's existing patterns
- Leaving unjustified `import shared` calls in the migrated layer, perpetuating the very dependency the migration was meant to remove
- Declaring "done" without proving the code builds, runs, and behaves the same

This plugin encodes hard rules against each of those failures and forces a disciplined workflow: brainstorm → plan → execute → review → verify, with **HARD-GATEs** at every phase boundary.

## How It Works

It piggybacks on the Superpowers skill system. The moment you start a session, the plugin's bootstrap loads `using-superpowers` (the skill driver) which now contains a **KMM ↔ iOS Migration Mode** section. As soon as you ask for a migration, the agent recognizes the task and applies the migration discipline on top of the standard Superpowers workflow.

The full migration playbook lives in `rules/migration-workflow.md`. Reference material — translation tables, platform patterns, fidelity rules, decision trees — lives in the rest of `rules/`.

## Installation

> Requires the underlying coding agent (Claude Code, Cursor, Codex, OpenCode, Gemini, or Copilot CLI) to be installed first.

This plugin ships as part of the **gor-dev-plugins** marketplace.

### Claude Code

```bash
/plugin marketplace add gorban-dev/gor-dev-plugins
/plugin install kmp-migrator-superpowers@gor-dev-plugins
```

### Cursor / Codex / Gemini / OpenCode

See `INSTALL.md` files inside the plugin directory:
- Cursor: install via `.cursor-plugin/`
- Codex: `.codex/INSTALL.md`
- Gemini: `gemini-extension.json`
- OpenCode: `.opencode/INSTALL.md`

## The Migration Workflow

Every migration follows the same five phases. Each phase has a HARD-GATE that prevents you from skipping ahead.

1. **Brainstorm** — read the source file end-to-end, map all dependencies (use `ast-index` first), identify side effects, audit the target project's existing architecture, write a migration spec listing every type to create / keep, every file to create / modify, every translation decision. **Stop. Wait for user approval.**

2. **Plan** — break the spec into 2–5 minute tasks with exact file paths, exact code, and verification criteria. Layer order: domain → repository → data → ViewModel → UI → DI → navigation → project file. **Stop. Wait for user approval.** Recommend `/compact` to free context for execution.

3. **Execute** — implement task by task, reading the source file alongside the target. Apply translation tables. Preserve every branch, default, null check, side effect, timing constant. Use `Edit` for existing files (never `Write` over an existing file).

4. **Review** — dual pass: spec compliance + code quality. Reviewer checks shared-model decisions, business-logic fidelity, platform idioms, file hygiene. Critical / Important issues block. After 3 failed fix-review cycles, escalate.

5. **Verify** — evidence-based. Build the target platform with `xcodebuild` or `./gradlew`. Quote the actual `BUILD SUCCEEDED` line. Banned language: "should work", "looks correct", "probably". Use UI-testing skills (e.g. `claude-in-mobile`) for runtime checks; never install builds manually.

The full playbook with templates is in `rules/migration-workflow.md`.

## What's Inside

### Skills (from Superpowers)

The plugin keeps the full Superpowers skill set unchanged:

- **brainstorming** — Socratic design refinement
- **writing-plans** — granular implementation plans
- **executing-plans** — batch execution with checkpoints
- **subagent-driven-development** — parallel subagent execution with two-stage review
- **dispatching-parallel-agents** — concurrent subagent workflows
- **test-driven-development** — RED-GREEN-REFACTOR
- **systematic-debugging** — 4-phase root-cause process
- **verification-before-completion** — evidence-based done check
- **requesting-code-review** / **receiving-code-review** — review etiquette
- **using-git-worktrees** — parallel branch workspaces
- **finishing-a-development-branch** — merge / PR / cleanup decisions
- **writing-skills** — meta-skill for creating new skills
- **using-superpowers** — the bootstrap skill that drives everything (extended with **KMM ↔ iOS Migration Mode**)

### Rules (migration-specific)

The `rules/` directory contains the migration playbook and reference material:

- `migration-workflow.md` — the full 5-phase playbook with HARD-GATEs
- `project-architecture-audit.md` — how to detect existing patterns and follow them
- `shared-model-decision-tree.md` — what to migrate vs. keep in shared
- `business-logic-fidelity.md` — non-negotiable rules for preserving behavior
- `kotlin-swift-translation.md` — bidirectional idiom translation table
- `ios-platform-patterns.md` — common iOS idioms (SwiftUI/UIKit, Combine, async/await, ObservableObject, Coordinator)
- `android-platform-patterns.md` — common Android + KMM idioms (Compose, Flow, Hilt/Koin, ViewModel, Navigation)
- `whitespace-rules.md` — file hygiene to keep diffs reviewable

These are **references, not prescriptions**. The project's existing architecture takes priority.

## Philosophy

- **The project is the source of truth.** This plugin's reference files describe common idioms. If your project uses different patterns and they work, follow the project.
- **Migration is not refactor.** Preserve every branch, default, null check, side effect, timing constant. Bug fixes go in separate tickets after the migration is verified.
- **Brainstorm before code.** No file is too small to skip the design phase. The design can be short — but it must exist and be approved.
- **Evidence over claims.** "Should work" is banned. Cite the build output. Run the screen.

## Updating

```bash
/plugin update kmp-migrator-superpowers
```

(or the equivalent for your coding-agent platform)

## License

MIT — see `LICENSE`.

This work derives from [Superpowers](https://github.com/obra/superpowers) by Jesse Vincent (also MIT). The Superpowers skill system, session-start hook architecture, and many of the original skill texts are reused here. Migration-specific extensions (the `rules/` directory and the KMM ↔ iOS Migration Mode section in `using-superpowers`) are original to this plugin.

## Issues

[https://github.com/gorban-dev/kmp-migrator-superpowers/issues](https://github.com/gorban-dev/kmp-migrator-superpowers/issues)
