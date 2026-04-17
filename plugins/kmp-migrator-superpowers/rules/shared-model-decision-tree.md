# Shared Model Decision Tree

For every type referenced by the code being migrated, you MUST decide and document: keep in shared, create native equivalent, or already-native infrastructure.

This is a **HARD-GATE**. Unjustified retention of shared types in the migrated layer is a REVIEW FAIL.

## The Tree

For each type encountered in the source file:

```
1. Is the type used ONLY by the code being migrated?
   YES → CREATE a native equivalent on the target platform.
         Add it to "New Native Types" in the spec.
   NO  → continue to (2)

2. Is the type infrastructure / cross-cutting utility?
   (e.g. EventBus, Logger, CommonNavigator, StringUtils, DateUtils,
   NetworkClient, AnalyticsTracker — things many features depend on)
   YES → KEEP in shared (or current platform). Document in
         "Stays in Source Platform (justified)".
   NO  → continue to (3)

3. Is the type used by OTHER non-migrated code?
   (Other ViewModels still in shared, other native screens,
   tests, etc.)
   YES → KEEP in shared (or current platform). Document the
         consumers in "Stays in Source Platform (justified)".
   NO  → CREATE a native equivalent (this is case 1 — your audit
         missed something; rerun the dependency search).

4. Are you uncertain after running ast-index / Grep on consumers?
   ASK the user via AskUserQuestion. Migration mistakes
   are expensive — clarify before deciding.
```

## Direction-Specific Application

### KMM → iOS (extracting from shared)

- "Migrated code" = the new native Swift code in `iosApp/`
- Native equivalent = Swift `struct` / `enum` / `class` / `protocol`
- "Stays in shared" = the original Kotlin file remains in `shared/src/commonMain/`
- Goal: the migrated layer does not `import shared` for types that exist only to support it

### iOS → KMM (lifting into shared)

- "Migrated code" = the new shared Kotlin code in `shared/src/commonMain/`
- Native equivalent = Kotlin `data class` / `sealed class` / `interface`
- "Stays in source platform" = the iOS-specific Swift type remains in `iosApp/`
- Goal: the lifted shared layer does not depend on platform-specific types except via `expect/actual`

## Justification Format

Every type accounted for in the spec must have a one-line justification:

```markdown
| Dependency | Target Equivalent | Action | Justification |
|---|---|---|---|
| `OrderItem` | `OrderItem` (native struct) | create | used only by OrderListViewModel |
| `EventBus` | `shared.EventBus` | keep shared | infrastructure utility, used by 14 features |
| `OrderStatus` | `shared.OrderStatus` | keep shared | used by Android OrderHistoryFragment, not migrated |
| `DateFormatter` | already in `iosApp/Helpers/` | already exists | reuse |
```

## Common Pitfalls

### Pitfall 1: "I'll just import shared for now"

NO. Every `import shared` (KMM→iOS) or `expect/actual` reference (iOS→KMM) in the migrated layer must be justified in the spec. "For now" justifications snowball — they're what created the migration debt in the first place.

### Pitfall 2: Skipping the audit because "it's a small type"

A small enum can have many consumers. Run the consumer search anyway. Cost: 30 seconds. Cost of missing it: the type ends up duplicated and drifts.

### Pitfall 3: Assuming a sealed class "must" become a Swift enum

Check what the type's role actually is:
- A KMM `sealed class ScreenAction` representing UI events → should NOT cross to Swift; on iOS those become direct method calls / closures
- A KMM `sealed class OrderStatus` representing domain state → becomes a Swift `enum`
- A KMM `sealed class Result<T>` for error handling → check whether iOS code wants a custom `Result` type or `throws` semantics

The translation is contextual. See `kotlin-swift-translation.md`.

### Pitfall 4: Renaming during migration

Do NOT rename a type as part of migrating it. `Foo` (Kotlin) → `Foo` (Swift). If the project's naming convention demands a rename (e.g. `IRepository` → `RepositoryProtocol`), document the rename explicitly in the spec and apply it everywhere consistently — but separate the rename concern from the migration concern in the review.

### Pitfall 5: Migrating a model used by both directions of bridge code

If `shared.UserDto` is consumed by both an iOS native ViewModel (post-migration) and an Android Fragment (still using shared), keep it in shared. Don't duplicate. Document this in "Stays in shared".

## Verification in Review

The reviewer must check:

- [ ] Every type referenced by the migrated code appears in the spec's Dependency Map
- [ ] Every "create native" decision produced a corresponding new file
- [ ] Every "keep in shared" decision has a documented consumer (other code that still uses it)
- [ ] No `import shared` (or `expect/actual`) usages exist in migrated code without matching justification
- [ ] No platform suffix on type names (`UserIOS`, `OrderKmm`)
