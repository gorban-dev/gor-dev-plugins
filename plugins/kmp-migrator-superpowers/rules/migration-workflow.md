# Migration Workflow

This file is the entry point for any KMM ↔ iOS migration. Read it before starting brainstorming.

## Direction Detection

Determine the migration direction from the user's request:

| Signal | Direction |
|---|---|
| "migrate from shared", "extract to native", "rewrite Kotlin in Swift", source path is `shared/src/commonMain/...` | **KMM → iOS** |
| "lift into shared", "move to KMM", "rewrite Swift in Kotlin", source path is `iosApp/...` | **iOS → KMM** |
| Ambiguous | ASK the user via `AskUserQuestion` before proceeding |

The direction shapes EVERY downstream decision (target language, project file format, idiomatic patterns, build command).

## Standard Workflow With Migration Augmentations

Migration follows the normal superpowers workflow. Each phase has additional checks specific to migration.

### Phase 1 — Brainstorming (rigid)

Use the `brainstorming` skill. In addition to standard brainstorm steps:

1. **Read the source file thoroughly** — every method, property, branch, default
2. **Map ALL dependencies** — for each type referenced by the source:
   - `ast-index class "<Name>"` to locate
   - `ast-index usages "<Name>"` to find all consumers
   - `ast-index implementations "<Interface>"` for protocol/interface implementations
   - `ast-index hierarchy "<Name>"` for inheritance
   - Fall back to `Grep` only if `ast-index` returns empty
3. **Identify side effects** — events bus posts, navigation calls, analytics, cache writes, persistent storage
4. **Audit existing target-platform code** — find similar already-migrated components to follow their pattern
5. **Apply the shared-model decision tree** — see `shared-model-decision-tree.md`
6. **Audit project architecture** — see `project-architecture-audit.md`. Spec MUST follow the existing patterns, not impose new ones
7. **Write the migration spec** — save to `docs/migrations/specs/{YYYY-MM-DD}-{component}-spec.md` in the user's project. Spec template:

```markdown
# Migration Spec: {ComponentName}

## Direction
KMM → iOS  (or iOS → KMM)

## Source
- File: `<path-to-source>`
- Layer: ViewModel / Repository / Service / Domain Model / View
- Responsibility: <one sentence>

## Existing Architecture (audited)
- Pattern: <e.g. MVVM + Coordinator, Clean Architecture, MVI>
- DI: <e.g. ServiceContainer, Hilt, Koin, manual>
- State management: <e.g. @Published, StateFlow, LiveData>
- Navigation: <e.g. Coordinator, Navigation Component, NavController>
- This migration WILL follow the existing pattern. Deviations: <none / list>

## Dependency Map
| Dependency | Target Equivalent | Action | Justification |
|---|---|---|---|
| <Type> | <NativeType / keep shared> | create / keep / already exists | why |

## New Native Types (replacing source)
1. `<path>` — replaces `<source-type>`

## Files to CREATE
1. `<path>` — purpose

## Files to MODIFY
1. `<path>` — what changes

## Stays in Source Platform (justified)
- `<Type>` — used by <consumers>

## Key Translation Decisions
- <source-pattern> → <target-pattern> (reason)

## Risks / Flags
- <anything uncertain>
```

**STOP after spec is written. Wait for user approval.**

### Phase 2 — Writing the Plan (rigid)

Use the `writing-plans` skill. In addition to standard steps:

1. Re-read the approved spec
2. Confirm all source paths still exist
3. Decompose into 2–5 minute tasks following the **layer order**:
   1. Domain models (native types replacing source types)
   2. Repository / data-layer protocols (if needed)
   3. Data layer implementation (DataSource, mappers, RepositoryImpl)
   4. ViewModel / Presenter
   5. UI integration (View / VC / Composable / Fragment updates)
   6. DI registration
   7. Navigation wiring
   8. Project file (Xcode `project.pbxproj` for iOS, `build.gradle` / module additions for Android)
4. Save to `docs/migrations/plans/{YYYY-MM-DD}-{component}-plan.md`

**STOP after plan is written. Wait for user approval. Recommend `/compact` before execution because spec + plan now live on disk and free context for the actual code work.**

### Phase 3 — Executing the Plan

Use `executing-plans` or `subagent-driven-development`. In addition to standard steps:

1. **Read the source file** alongside the target file for cross-reference
2. **Apply file-operation rules**:
   - New file → `Write`
   - Existing file → `Edit` ONLY (never `Write` over an existing file — see `whitespace-rules.md`)
   - Project file (`project.pbxproj`, `build.gradle`) → `Edit` only
3. **Cross-reference every branch** — compare each `if`/`when`/`switch` against the source
4. **Apply translation table** — see `kotlin-swift-translation.md`
5. **Apply platform patterns** — see `ios-platform-patterns.md` or `android-platform-patterns.md`

### Phase 4 — Code Review

Use `requesting-code-review`. The reviewer must check:

1. **Spec compliance** — every file from the spec exists with the planned changes
2. **Business logic fidelity** — line-by-line comparison of source vs. target (see `business-logic-fidelity.md`)
3. **Shared-model decisions honored** — no unjustified shared imports in migrated layer
4. **Existing architecture honored** — no surprise pattern changes
5. **Platform idioms** — target code feels native (see platform pattern files)
6. **File hygiene** — `Edit` used for existing files, no whitespace pollution

Severity: Critical (blocks) / Important (blocks) / Suggestion (note).

After 3 failed fix-review cycles, escalate to user — the migration approach itself may be the problem.

### Phase 5 — Verification

Use `verification-before-completion`. Evidence-based, no "should work":

1. **File existence** — `Glob` each new file, confirm
2. **Modifications applied** — `Read` each modified file, confirm changes are present
3. **Build the target platform**:
   - iOS: `xcodebuild -workspace <name>.xcworkspace -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16' build`
   - Android: `./gradlew :<module>:assembleDebug` (or the project's standard build command)
   - Quote the actual `BUILD SUCCEEDED` line as evidence; if failure, report the failure
4. **Runtime verification** (when possible) — install and exercise the migrated screen using the platform's UI testing skill (e.g. `claude-in-mobile`). Never install builds manually
5. **Cross-file wiring** — DI registration matches constructor, navigation creates the new component, UI binds to the new state

Banned language in the report: "should work", "should compile", "looks correct", "probably", "I think". Report only what was verified with evidence.

## HARD-GATEs Summary

These rules cannot be bypassed:

1. No code before approved spec
2. Shared-model decision tree applied to every type
3. Business logic fidelity preserved
4. Existing architecture honored (or refactor explicitly negotiated)
5. No new bridge dependencies without justification
6. `ast-index` before `Grep`
7. `Edit` for existing files, `Write` only for new ones
8. Evidence-based verification — no claims without proof
