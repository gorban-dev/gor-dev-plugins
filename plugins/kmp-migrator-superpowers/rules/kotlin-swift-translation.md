# Kotlin ↔ Swift Translation

Bidirectional reference for translating idioms between Kotlin (KMM) and Swift (iOS). Use this during the implementation phase.

**This is a reference, not a prescription.** The project's existing patterns take priority — see `project-architecture-audit.md`.

## Type System

| Kotlin | Swift | Notes |
|---|---|---|
| `val x: Int = 5` | `let x: Int = 5` | Immutable |
| `var x: Int = 5` | `var x: Int = 5` | Mutable |
| `Int?` | `Int?` | Optional / nullable |
| `String` (non-null) | `String` (non-optional) | Both default to non-null |
| `List<T>` | `[T]` | Read-only list |
| `MutableList<T>` | `[T]` (with `var`) | Swift arrays are value types |
| `Map<K, V>` | `[K: V]` | |
| `Set<T>` | `Set<T>` | |
| `Pair<A, B>` | `(A, B)` | Tuple |
| `Triple<A, B, C>` | `(A, B, C)` | |
| `Any` | `Any` | |
| `Unit` | `Void` / `()` | |
| `Nothing` | `Never` | |
| `Long` | `Int64` | Swift `Int` is platform-dependent (64-bit on modern devices) |
| `Float` | `Float` | |
| `Double` | `Double` | |
| `Boolean` | `Bool` | |
| `Char` | `Character` | |
| `ByteArray` | `Data` or `[UInt8]` | |

## Domain Modeling

| Kotlin | Swift | Notes |
|---|---|---|
| `data class Foo(val x: Int)` | `struct Foo: Equatable { let x: Int }` | Add `Equatable`/`Hashable`/`Codable` as needed |
| `data class Foo(val x: Int)` (network) | `struct Foo: Codable { let x: Int }` with `CodingKeys` | For JSON / network |
| `class Foo(val x: Int)` (no data) | `class Foo { let x: Int; init(...) {} }` | Reference type |
| `enum class Status { ACTIVE, DISABLED }` | `enum Status { case active, disabled }` | Swift enum cases are lowerCamelCase |
| `sealed class Result { data class Ok(val value: T) : Result(); object Err : Result() }` | `enum Result<T> { case ok(T); case err }` | |
| `sealed interface Action` | `enum Action` (cases) or `protocol Action` | Depends on usage; for UI events, often replaced by direct method calls |
| `object Foo` | `enum Foo { static let ... }` or singleton class | Swift `enum` with no cases is a common namespace pattern |
| `companion object` | `static` members on the type | |

## ViewModels (presentation layer)

| Kotlin (KMM ViewModel) | Swift (iOS ViewModel) | Notes |
|---|---|---|
| `class FooVM : BaseSharedViewModel<S, A, E>()` | `class FooVM: ObservableObject` | Common iOS pattern |
| `private val _state = MutableStateFlow(State())` | `@Published private(set) var state = State()` | |
| `val state: StateFlow<State> = _state.asStateFlow()` | (covered by `@Published`) | |
| `viewModelScope.launch { ... }` | `Task { ... }` | |
| `obtainEvent(event: ScreenEvent)` (MVI) | direct methods (`backTapped()`, `save(name:)`) | iOS rarely benefits from event/action enums for UI events |
| `_state.update { it.copy(loading = true) }` | `state.loading = true` (or `state = state.copy(loading: true)` if state is a struct) | |
| `coroutineScope { ... }` | `await withTaskGroup(of:) { ... }` | For structured concurrency |

If the iOS project already uses MVI / Action / Event patterns, follow the project. The note above applies only when starting from greenfield iOS code.

## Async / Concurrency

| Kotlin | Swift | Notes |
|---|---|---|
| `suspend fun foo(): T` | `func foo() async -> T` or `func foo() async throws -> T` | Add `throws` if the source can fail |
| `delay(300L)` | `try? await Task.sleep(nanoseconds: 300_000_000)` | Or `Task.sleep(for: .milliseconds(300))` on iOS 16+ |
| `withContext(Dispatchers.IO) { ... }` | `await Task.detached(priority: .background) { ... }.value` | Or just rely on actor isolation |
| `withContext(Dispatchers.Main) { ... }` | `await MainActor.run { ... }` | |
| `flow { emit(x) }` | `AsyncStream { continuation in ... }` | |
| `Flow<T>.collect { ... }` | `for await value in stream { ... }` | |
| `StateFlow<T>` | `@Published var` (in ObservableObject) | |
| `MutableSharedFlow<T>` | `PassthroughSubject<T, Never>` (Combine) | |
| `runBlocking { ... }` | (avoid in production) | |

## Control Flow

| Kotlin | Swift | Notes |
|---|---|---|
| `if (cond) { } else { }` | `if cond { } else { }` | No parens around condition |
| `when (x) { 1 -> a; else -> b }` | `switch x { case 1: a; default: b }` | Swift requires `default:` if not exhaustive |
| `when { cond1 -> a; cond2 -> b }` | `if cond1 { } else if cond2 { }` | Or `switch` with bound expressions |
| `x?.let { it + 1 }` | `x.map { $0 + 1 }` (Optional.map) | |
| `x?.let { block(it) } ?: fallback` | `if let x { block(x) } else { fallback }` | |
| `x ?: y` | `x ?? y` | Nil-coalescing |
| `x?.foo()` | `x?.foo()` | Optional chaining |
| `x!!` | `x!` (force unwrap — avoid) | |
| `for (i in 0..n)` | `for i in 0...n` | Closed range |
| `for (i in 0 until n)` | `for i in 0..<n` | Half-open range |
| `try { } catch (e: Foo) { }` | `do { try ... } catch let e as Foo { }` | |
| `throw FooException()` | `throw FooError()` | Define `enum FooError: Error` |
| `requireNotNull(x)` | `guard let x else { ... }` | |
| `check(cond)` | `assert(cond)` (debug) or `precondition(cond)` (release) | |
| `lateinit var` | `var x: T!` (implicitly unwrapped) — avoid; prefer `var x: T?` | |

## Collections

| Kotlin | Swift |
|---|---|
| `list.map { it.x }` | `list.map { $0.x }` |
| `list.filter { it > 0 }` | `list.filter { $0 > 0 }` |
| `list.firstOrNull { ... }` | `list.first(where: ...)` |
| `list.find { ... }` | `list.first(where: ...)` |
| `list.any { ... }` | `list.contains(where: ...)` |
| `list.all { ... }` | `list.allSatisfy(...)` |
| `list.flatMap { ... }` | `list.flatMap { ... }` |
| `list.groupBy { ... }` | `Dictionary(grouping: list, by: ...)` |
| `list.sortedBy { ... }` | `list.sorted { $0.x < $1.x }` |
| `list.distinct()` | `Array(Set(list))` (loses order) or `list.reduce(into: []) { ... }` |
| `list.take(n)` | `list.prefix(n)` |
| `list.drop(n)` | `list.dropFirst(n)` |
| `list.orEmpty()` | `list ?? []` |
| `string.orEmpty()` | `string ?? ""` |
| `list.size` | `list.count` |
| `list.isEmpty()` | `list.isEmpty` |
| `list.isNotEmpty()` | `!list.isEmpty` |
| `list.joinToString(",")` | `list.joined(separator: ",")` |

## Strings

| Kotlin | Swift |
|---|---|
| `"Hello, $name"` | `"Hello, \(name)"` |
| `"""multiline"""` | `"""multiline"""` |
| `string.length` | `string.count` |
| `string.substring(0, 5)` | `String(string.prefix(5))` |
| `string.startsWith("x")` | `string.hasPrefix("x")` |
| `string.endsWith("x")` | `string.hasSuffix("x")` |
| `string.replace("a", "b")` | `string.replacingOccurrences(of: "a", with: "b")` |
| `string.split(",")` | `string.split(separator: ",").map(String.init)` |

## Interfaces / Protocols

| Kotlin | Swift |
|---|---|
| `interface Repository { fun fetch(): T }` | `protocol Repository { func fetch() -> T }` |
| `interface Repository { fun fetch(): T = default }` | `protocol Repository { func fetch() -> T }` + `extension Repository { func fetch() -> T { default } }` |
| `class Impl : Repository { override fun fetch(): T = ... }` | `class Impl: Repository { func fetch() -> T { ... } }` (no `override` for protocol conformance) |
| Generic interface `Repository<T>` | Associated type: `protocol Repository { associatedtype T; func fetch() -> T }` |

## Repositories / Use Cases

| Kotlin | Swift |
|---|---|
| `interface IOrderRepository { suspend fun getOrders(): List<Order> }` | `protocol OrderRepository { func getOrders() async throws -> [Order] }` |
| `class OrderRepositoryImpl(private val ds: OrderDataSource) : IOrderRepository` | `final class OrderRepositoryImpl: OrderRepository { let ds: OrderDataSource; init(ds: OrderDataSource) { self.ds = ds } }` |
| `class GetOrdersUseCase(private val repo: IOrderRepository) { suspend fun execute(params: Params): List<Order> = ... }` | `final class GetOrdersUseCase { let repo: OrderRepository; init(...); func execute(_ params: Params) async throws -> [Order] { ... } }` |

The naming convention (`I`-prefix or `Protocol`-suffix or no suffix) MUST follow the existing project. Audit first.

## Equality / Identity

| Kotlin | Swift |
|---|---|
| `a == b` (structural) | `a == b` (Equatable) |
| `a === b` (referential) | `a === b` (AnyObject) |
| `a.equals(b)` | `a == b` |

## Visibility

| Kotlin | Swift |
|---|---|
| `public` (default) | `internal` (default) |
| `internal` | `internal` |
| `private` | `private` (file-scope) or `fileprivate` |
| `protected` | (no equivalent for value types; use `internal` + comment) |

## Common Anti-Patterns During Translation

- **Adding `try?` everywhere** — preserve the source's error handling shape; if it propagates, use `try`; if it crashes, use `try!` (rare); if it explicitly swallows, use `try?`
- **Force-unwrapping optionals** — `!` is almost always wrong; prefer `guard let` / `if let`
- **Using `class` for value types** — Kotlin `data class` → Swift `struct`, not `class`
- **Adding `@MainActor` to ViewModels** — usually unnecessary; iOS dispatches UI updates explicitly
- **Replacing `LiveData`/`StateFlow` with closures** — keep the observable nature; use `@Published` / `Combine.Subject`
