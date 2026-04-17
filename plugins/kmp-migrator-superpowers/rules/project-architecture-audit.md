# Project Architecture Audit

**The project is the source of truth, not this plugin.** Before proposing any migration, audit the existing target-platform code and follow its conventions.

## Why This Matters

A common failure mode of migration tools is imposing the tool's preferred architecture on a project that already has its own — producing inconsistent, hard-to-maintain code. This plugin treats the project's existing patterns as ground truth.

The reference files in this `rules/` directory describe **common platform idioms**. They are NOT the prescribed architecture for any particular project. If the project does something different and works, follow the project.

## Audit Checklist

Before brainstorming a migration, answer these questions about the target platform's existing code:

### Layering & Folders
- [ ] Is there a clear separation (e.g. `Domain/`, `Data/`, `Presentation/`)?
- [ ] How are features organized (per-feature folders, per-layer folders, hybrid)?
- [ ] Where do models live? Where do mappers live?

### State Management
- [ ] iOS: `@Published` + `ObservableObject`? `@Observable` (iOS 17+)? Combine `Subject`s? UIKit + delegates?
- [ ] Android: `StateFlow` + `ViewModel`? `LiveData`? Compose `mutableStateOf`? RxJava?
- [ ] Is there a single state struct/class, or many properties?

### Async / Concurrency
- [ ] iOS: `async/await`? `Task { }`? Combine? Closures? GCD?
- [ ] Android: Coroutines (`viewModelScope`, `lifecycleScope`)? Flow? RxJava?
- [ ] Common error-handling pattern: `Result<T>` / sealed class / throws?

### Dependency Injection
- [ ] iOS: `ServiceContainer` singleton? Swinject? Manual constructor? Property wrappers?
- [ ] Android: Hilt? Koin? Dagger? Manual?
- [ ] How are repositories registered (singleton vs factory)?
- [ ] How are ViewModels created?

### Navigation
- [ ] iOS: Coordinator pattern? `NavigationStack`? Storyboards? Programmatic push? Custom router?
- [ ] Android: Navigation Component? Custom `NavController`? Activity-based? Fragment-based?
- [ ] Is there a route enum / sealed class?

### Networking & Persistence
- [ ] HTTP client (URLSession / Alamofire / Ktor / Retrofit / OkHttp)?
- [ ] How are API paths defined (constants / enum / inline)?
- [ ] Persistence (Core Data / Realm / SwiftData / Room / DataStore / SharedPreferences / Keychain)?
- [ ] Caching layer present?

### UI Layer
- [ ] iOS: SwiftUI? UIKit + storyboards? UIKit programmatic? Mixed?
- [ ] Android: Jetpack Compose? XML + Views? Mixed?
- [ ] Theming / design system in place?

### Testing
- [ ] Test framework (XCTest / Quick + Nimble / JUnit / Kotest / MockK / Mockito)?
- [ ] Coverage of business logic vs. UI?
- [ ] Mocking strategy (protocol + manual mocks / library)?

### File / Module Conventions
- [ ] One class per file or grouped?
- [ ] Naming conventions (e.g. `UserRepository` vs `IUserRepository` vs `UserRepositoryProtocol`)?
- [ ] Comment language?
- [ ] Trailing newline / whitespace conventions (run `git log --stat` on a few files)?

## How to Audit

1. **Find similar already-migrated components.** If you're migrating a ViewModel, look at 2–3 existing ViewModels in the target. Read them in full.
2. **Find the DI container.** Read its registration file end-to-end.
3. **Find the navigation entry points.** Trace one route from request to screen presentation.
4. **Read the target's package/module structure.** `Glob` the folder tree.
5. **Read the project's CLAUDE.md / AGENTS.md / README** if present — they often document conventions.

## What to Put in the Spec

Document the audit findings in the migration spec under **Existing Architecture (audited)**. Be explicit about what the migration will follow:

```markdown
## Existing Architecture (audited)
- Pattern: MVVM + Coordinator (iOS) / MVVM + Hilt (Android)
- DI: ServiceContainer singleton with `lazy var` for repos, `func` for VMs
- State: `@Published private(set) var` for observable state
- Async: `Task { }` for ViewModel-initiated work, `async throws` for repository calls
- Navigation: Native Coordinator hierarchy, ViewModels call `CommonNavigator.shared`
- HTTP: URLSession + custom `NetworkContainer` with paths in `Const.Net.Paths.*`
- Files: one class per file, English comments, preserve trailing whitespace

This migration WILL follow the existing pattern.
Deviations: none.
```

## When You See Problems

If the audit reveals architectural problems that block a clean migration:

1. **Stop the brainstorm.** Do not proceed with a migration spec.
2. **Document the specific problem** — what conflicts, where, why it blocks the migration.
3. **Present 2–3 options** to the user:
   - Refactor first, migrate after (clean but slow)
   - Migrate with documented technical debt (fast but accumulates issues)
   - Reduce scope (migrate a smaller piece that doesn't hit the problem)
4. **Wait for the user's decision.** Do not silently choose.

This is brainstorming applied to the architecture itself. Resume the migration brainstorm only after the architectural decision is made.

## Anti-Patterns

- **DO NOT** assume the project follows the patterns described in this plugin's reference files
- **DO NOT** introduce a new pattern (e.g. add Coordinator pattern to a Storyboard-based app) as part of a migration
- **DO NOT** rename existing types to match the plugin's preferred naming (e.g. don't rename `OrderRepository` to `IOrderRepository` unless the project already uses the `I`-prefix convention)
- **DO NOT** add a new DI container if the project uses manual injection
- **DO NOT** silently restructure folders during migration
