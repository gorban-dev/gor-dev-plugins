# Business Logic Fidelity

**Migration ≠ refactor.** Every branch, default, null check, error path, side effect, and timing constant from the source must appear in the target. This is non-negotiable.

If the source has a bug or a quirk, **preserve it** and add a one-line comment explaining the source. Fixing bugs is a separate task that comes after the migration is verified.

## The Rules

### 1. Every conditional must be preserved

```kotlin
// SOURCE (Kotlin)
if (user.isPremium && order.total > 1000) {
    discount = 0.15
} else if (user.isPremium) {
    discount = 0.05
} else {
    discount = 0.0
}
```

```swift
// TARGET (Swift)
if user.isPremium && order.total > 1000 {
    discount = 0.15
} else if user.isPremium {
    discount = 0.05
} else {
    discount = 0.0
}
```

Do NOT collapse to a ternary, do NOT reorder branches, do NOT use guard clauses unless the source did.

### 2. Every default value must match

```kotlin
// SOURCE
val pageSize = config.pageSize ?: 20
val timeout = settings.timeoutMs ?: 5_000
```

```swift
// TARGET
let pageSize = config.pageSize ?? 20
let timeout = settings.timeoutMs ?? 5_000
```

Same magic numbers, same fallback values. If the source uses `20`, do not "improve" to `25`.

### 3. Every null check must be preserved

```kotlin
// SOURCE
val name = user?.profile?.displayName ?: "Anonymous"
```

```swift
// TARGET
let name = user?.profile?.displayName ?? "Anonymous"
```

Do not skip optional chaining steps. Do not assume the value is non-null because "it always is in practice."

### 4. Every error handler must be preserved

```kotlin
// SOURCE
try {
    repository.fetch()
} catch (e: NetworkException) {
    state = State.NetworkError
} catch (e: AuthException) {
    state = State.Unauthorized
} catch (e: Exception) {
    state = State.Unknown(e.message ?: "")
}
```

```swift
// TARGET
do {
    try await repository.fetch()
} catch let error as NetworkError {
    state = .networkError
} catch let error as AuthError {
    state = .unauthorized
} catch {
    state = .unknown(error.localizedDescription)
}
```

Do not collapse multiple catch branches into one. Do not silently swallow errors that the source surfaced.

### 5. Every side effect must fire

If the source posts an EventBus event after a successful save, the target must too. If the source logs analytics, the target must too. If the source writes to a cache, the target must too.

Side effects to track:
- Event bus / notification publishes
- Navigation triggers
- Analytics events
- Cache writes
- Persistent storage updates
- Logger calls
- UI feedback (toasts, snackbars, alerts)

### 6. Same timing constants

```kotlin
// SOURCE
delay(300L)  // debounce
```

```swift
// TARGET
try? await Task.sleep(nanoseconds: 300_000_000)  // 300ms — debounce
```

Same magnitude (300ms = 300ms). If the source uses `1000L`, target uses `1_000_000_000` ns. Do not round, do not "improve."

### 7. Preserve quirks with a comment

If the source has behavior that looks like a bug or oddity, preserve it AND document:

```swift
// NOTE: Preserved from source — refresh fires twice on first launch
// because legacy code initialized the observer before the first fetch.
// Track fix in <ticket-id> if needed.
viewModel.refresh()
viewModel.refresh()
```

Do NOT silently fix. The migration must produce identical observable behavior.

## Cross-Reference Procedure

After implementing a migrated method, perform line-by-line cross-reference:

1. Open the source file and the target file side by side
2. For each method in the source:
   - Locate the corresponding method in the target
   - Compare control flow: every `if`, `when`/`switch`, `try`/`catch`, loop
   - Compare every constant, default, magic number, string literal
   - Compare every external call (repository, service, navigator, event bus)
   - Compare every state mutation
3. Annotate any intentional deviation with a comment explaining why

## Verification in Review

The reviewer applies these checks per-method:

- [ ] Same conditions in same order
- [ ] Same defaults / fallback values
- [ ] Same null handling
- [ ] Same error catches
- [ ] Same side effects
- [ ] Same timing constants
- [ ] Any behavior change documented as a deliberate decision in the spec, not silently introduced

## When You Must Deviate

Only two reasons justify a behavior change during migration:

1. **The source code does not compile / is dead.** Document and ask the user.
2. **The target platform genuinely cannot express the source pattern.** (Rare. Most patterns translate. See `kotlin-swift-translation.md`.) Document the workaround in the spec, get user approval before implementing.

For everything else: preserve and migrate, fix later in a separate ticket.

## Anti-Patterns

- **DO NOT** "clean up" the code while migrating ("this loop is more idiomatic as a `map`")
- **DO NOT** add new validation that the source didn't have
- **DO NOT** add try/catch around code the source didn't wrap
- **DO NOT** change error messages / log strings
- **DO NOT** consolidate duplicate code into helpers as part of migration (do it after, in a separate task)
- **DO NOT** swap third-party calls for "better" alternatives (e.g. `Date()` for a date library)
