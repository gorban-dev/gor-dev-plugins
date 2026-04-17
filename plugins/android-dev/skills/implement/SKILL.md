---
name: implement
description: |
  Android feature implementation: creating from scratch, extending existing features, or refactoring to match the architectural standard. Automatically determines the working mode based on context. Use for any tasks involving writing/modifying Android code.

  <example>
  Context: User wants to create a new screen
  user: "create an authorization screen with email and password"
  assistant: "Using implement skill in create mode to build the auth feature."
  </example>

  <example>
  Context: User wants to add functionality to an existing screen
  user: "add pagination to the catalog screen"
  assistant: "Using implement skill in modify mode to extend the catalog feature."
  </example>

  <example>
  Context: User wants to bring code up to standard
  user: "refactor the profile screen to match our architecture"
  assistant: "Using implement skill in refactor mode to migrate the profile feature."
  </example>

  <example>
  Context: A list of architectural violations was received from review
  user: "fix the violations from the review"
  assistant: "Using implement skill to fix architectural violations."
  </example>
---

# Implement — Android Feature Implementation

You implement Android feature layers strictly following the project's architectural rules.

## Input

Task from user: **$ARGUMENTS**

## Step 1: Determine the working mode

Automatically determine the task type:

### CREATE mode — feature does not exist
Triggers:
- User asks to create a new screen/feature
- Feature not found by Glob patterns in the project
- Full structure needs to be built from scratch

### MODIFY mode — feature exists, needs to be extended
Triggers:
- User asks to add/change functionality
- Feature found in the project
- Needs to be extended, not built from scratch

### REFACTOR mode — feature exists, needs to be brought to standard
Triggers:
- User asks to refactor/migrate
- A list of violations received from review skill
- Needs to be brought to the architectural standard
- DI migration (Kodein → Koin)
- Screen/View separation

### FIX mode — fixing specific violations
Triggers:
- A list of Issues received from review or test-ui skill
- Specific problems need to be fixed
- Category → files mapping:
  - `[Structure]` → packages and files
  - `[Screen]` → {Feature}Screen.kt
  - `[View]` → {Feature}View.kt
  - `[ViewModel]` → {Feature}ViewModel.kt
  - `[ViewState/Event/Action]` → corresponding files
  - `[UseCase]` → *UseCase.kt
  - `[Repository]` → *Repository.kt
  - `[DI]` → *DiModule.kt / *Module.kt
  - `[Rendering]` → {Feature}View.kt
  - `[Interaction]` → {Feature}View.kt + ViewModel
  - `[Navigation]` → {Feature}Screen.kt + ViewModel
  - `[Data]` → ViewModel + ViewState
  - `[Accessibility]` → {Feature}View.kt
  - `[Crash]` → ViewModel / UseCases

## Step 2: Project preparation

1. **Determine the base package** — from CLAUDE.md or existing files
2. **Determine the DI framework** — `koin` or `kodein` from build.gradle or existing modules
3. **Determine navigation** — from existing Screen files
4. **Find BaseSharedViewModel** — full import path
5. **Find UseCase interface** — full import path
6. **Read the rules** — `$CLAUDE_PLUGIN_ROOT/rules/android-core.md` (required)

## Step 3: Execute by mode

---

### CREATE mode

Read references: `$CLAUDE_PLUGIN_ROOT/skills/implement/references/architecture.md`, `$CLAUDE_PLUGIN_ROOT/skills/implement/references/base-viewmodel.md`, `$CLAUDE_PLUGIN_ROOT/skills/implement/references/theme-system.md`
Use examples/ as a template for each file.

**Creation order:**
1. Create the folder structure:
   ```
   feature/{featureName}/
       presentation/screen/
       presentation/view/
       presentation/viewmodel/
       domain/usecase/
       domain/repository/
       data/datasource/
       data/repository/
       di/
   ```
2. Generate files in this order:
   - `{Feature}ViewState.kt` — data class with default values
   - `{Feature}ViewEvent.kt` — sealed class of UI events
   - `{Feature}ViewAction.kt` — sealed class of one-time actions
   - `{Feature}ViewModel.kt` — extends BaseSharedViewModel
   - `{Feature}Screen.kt` — thin adapter
   - `{Feature}View.kt` — pure UI with Preview
   - Use cases — one per action
   - `I{Feature}Repository.kt` — interface
   - `{Feature}Repository.kt` — implementation
   - DataSources — Local and/or Remote
   - `{Feature}DiModule.kt` — DI module

---

### MODIFY mode

Read references: `$CLAUDE_PLUGIN_ROOT/skills/implement/references/modification-rules.md`

1. **Read all feature files** (Screen, View, ViewModel, ViewState, ViewEvent, ViewAction, UseCases, Repository, DataSources, DI)
2. **Plan changes** — what to add/modify
3. **Safe modification rules:**
   - Do not break existing contracts (do not remove fields, do not change signatures)
   - New logic — only in ViewModel
   - New UI — only in View
   - New data — through UseCase → Repository → DataSource
   - Each new class — in a separate file
   - Update the DI module

---

### REFACTOR mode

Read references: `$CLAUDE_PLUGIN_ROOT/skills/implement/references/migration-guide.md`, `$CLAUDE_PLUGIN_ROOT/skills/implement/references/architecture.md`

1. **Audit** — check against the checklist from architecture.md
2. **Migration plan:**
   - Create missing package structure
   - Split files (separate classes)
   - Create missing layers
   - Refactor ViewModel to BaseSharedViewModel
   - Separate Screen and View
   - Migrate DI (if needed)
3. **Execution** — atomic steps, code compiles after each one
4. **Validation** — re-audit

---

### FIX mode

1. Get the list of Issues (from review or test-ui)
2. For each issue: find the file → find the problematic spot → fix strictly according to the rule
3. Do not touch code that already conforms to the standard
4. **UI state rule**: If review flags `remember`/`LaunchedEffect` in Screen — move them to View, do NOT delete them. `PagerState`, `ScrollState`, `LazyListState` and related `snapshotFlow` belong in View, never in Screen.
5. After all fixes — validation

## Step 4: Validation (for all modes)

- [ ] Screen contains no logic, remember, computations, no UI state (PagerState etc.)
- [ ] View is in a separate file with Preview in {App}Theme
- [ ] View contains no business logic; UI state (PagerState, ScrollState) is allowed in View
- [ ] ViewModel extends BaseSharedViewModel, no Compose imports
- [ ] UseCase extends UseCase<Params, T>, execute() not operator fun
- [ ] UseCase returns Result<T>
- [ ] Repository has an I{Feature}Repository interface
- [ ] Each class is in a separate file
- [ ] Package structure is correct
- [ ] DI module contains all dependencies

## Step 5: Output

1. **Summary** — what was done and in which mode
2. **Files** — list of created/modified/deleted files
3. **Full code** — code of all files
4. **Architecture validation** — confirmation of rule compliance
