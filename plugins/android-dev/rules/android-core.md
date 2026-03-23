# Android Architecture Core Rules

These rules ALWAYS apply when working with Android code in the project.

## Screen/View Separation
- **Screen** — thin adapter: reads viewState via `collectAsStateWithLifecycle()`, subscribes to actions via `CollectWithLifecycle {}`, passes viewState and eventHandler to View. No logic, no remember, no computations. No UI state (PagerState, ScrollState, LazyListState — these belong in View).
- **View** — pure UI: only layout based on viewState and calling eventHandler. No business logic. UI state (`rememberPagerState`, `rememberScrollState`, `rememberLazyListState`) is allowed here. `LaunchedEffect`/`snapshotFlow` for syncing UI state with eventHandler is allowed here.

## ViewModel
- Single source of logic. Extends `BaseSharedViewModel<State, Action, Event>`.
- Holds state, processes events via `handleEvent()`, executes use cases.
- State updates: `updateState { it.copy(...) }`. One-off actions: `sendAction(...)`.
- Navigation — only within ViewModel through the project's navigation mechanism.
- Compose dependencies in ViewModel are FORBIDDEN.

## UseCase
- Separate class: `{Feature}{Action}UseCase.kt`. Extends `UseCase<Params, Result>`.
- Single function `suspend fun execute(params): Result` (NOT operator fun).
- Always returns `Result<T>`. Error handling — inside UseCase.
- Depends only on Repository.

## Repository
- Interface `I{Feature}Repository` + implementation `{Feature}Repository`.
- Depends only on DataSources. Returns clean data.

## DataSource
- `{Feature}LocalDataSource.kt`, `{Feature}RemoteDataSource.kt`.
- Depends on: Ktor, SQLDelight, FileSystem, platform APIs.

## Naming Conventions
- `{Feature}Screen.kt`, `{Feature}View.kt`, `{Feature}ViewModel.kt`
- `{Feature}ViewState.kt`, `{Feature}ViewEvent.kt`, `{Feature}ViewAction.kt`
- `{Feature}{Action}UseCase.kt`, `I{Feature}Repository.kt`, `{Feature}Repository.kt`

## Package Structure
```
feature/{featureName}/
    presentation/screen/  presentation/view/  presentation/viewmodel/
    domain/usecase/  domain/repository/
    data/datasource/  data/repository/
    di/
```

## File Rules
- Each class (including enum, sealed) — separate file. No god-files.

## DI
- Project uses Koin or Kodein — determine from build.gradle / existing modules.
- Modules follow the official framework documentation.

## Theme and Styles
- Project theme (`{App}Theme`) — determine the name from existing code (`object *Theme` in `ui/theme/`).
- Colors: `{App}Theme.colors.*`. NOT `MaterialTheme.colorScheme`, NOT hardcoded `Color(0xFF...)`.
- Typography: `{App}Theme.typography.*`. NOT `MaterialTheme.typography`, NOT hardcoded `TextStyle(fontSize = ...)`.

## View and Preview
- Each View — in a separate file `{Feature}View.kt` with a mandatory Preview.
- Preview naming: `{Feature}View_Preview` (with underscore, `private fun`).
- Preview **always** wrapped in `{App}Theme { }`.

## Prohibited
- Compose dependencies in ViewModel
- Business logic in View
- remember / side-effects in Screen (UI state belongs in View)
- God-files (multiple classes in one file)
- operator fun invoke in UseCase
- MaterialTheme for colors and typography — only `{App}Theme`
