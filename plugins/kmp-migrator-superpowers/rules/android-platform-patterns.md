# Android & KMM Platform Patterns

Common idiomatic patterns for native Android (Kotlin) and KMM shared code. Reference for migration; **the project's existing patterns take priority** (see `project-architecture-audit.md`).

## State Management

### ViewModel + StateFlow (Compose / shared)

```kotlin
class FooViewModel(
    private val repository: ItemRepository
) : ViewModel() {

    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state.asStateFlow()

    data class State(
        val items: List<Item> = emptyList(),
        val isLoading: Boolean = false,
        val error: AppError? = null,
    )

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                val items = repository.fetch()
                _state.update { it.copy(items = items, isLoading = false) }
            } catch (e: Throwable) {
                _state.update {
                    it.copy(
                        error = AppError.from(e),
                        isLoading = false,
                    )
                }
            }
        }
    }
}
```

### KMM shared ViewModel (cross-platform)

```kotlin
class FooSharedViewModel(
    private val repository: ItemRepository,
) : BaseSharedViewModel<State, Action, Event>(initialState = State()) {

    sealed interface Action {
        data object Refresh : Action
        data class SelectItem(val id: String) : Action
    }

    sealed interface Event {
        data object NavigateBack : Event
    }

    override fun obtainEvent(viewEvent: Action) {
        when (viewEvent) {
            is Action.Refresh -> load()
            is Action.SelectItem -> select(viewEvent.id)
        }
    }
    // ...
}
```

KMM shared ViewModels often expose state via custom base class so iOS can `collect` it. Direction matters: when **lifting iOS code into shared**, the shared layer typically uses `StateFlow` + an MVI surface. When **migrating from shared to native**, you usually drop the MVI envelope and expose direct methods on the native ViewModel.

## Async / Coroutines

```kotlin
// viewModelScope — auto-cancels on ViewModel clear
viewModelScope.launch {
    val data = repository.fetch()
    _state.update { it.copy(data = data) }
}

// Dispatchers
withContext(Dispatchers.IO) {
    repository.fetchSync()
}

// suspend fun + Result
suspend fun fetch(): Result<List<Item>> = runCatching {
    api.getItems()
}

// Flow
fun observe(): Flow<List<Item>> = repository.itemsFlow()

// delay
delay(300L)  // 300 ms
```

## DI Patterns

### Hilt (Android-only)

```kotlin
@HiltViewModel
class OrderListViewModel @Inject constructor(
    private val repository: OrderRepository,
) : ViewModel()

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindOrderRepository(impl: OrderRepositoryImpl): OrderRepository
}
```

### Koin (KMM-friendly — works on iOS too)

```kotlin
val sharedModule = module {
    single<OrderRepository> { OrderRepositoryImpl(get()) }
    single<OrderDataSource> { OrderDataSourceImpl(get()) }
    factory { OrderListSharedViewModel(get()) }
}
```

For KMM code, Koin is the common DI choice because it works on both platforms. Hilt is Android-only.

## Navigation

### Navigation Compose

```kotlin
@Composable
fun AppNavGraph(navController: NavHostController) {
    NavHost(navController, startDestination = "orders") {
        composable("orders") { OrderListScreen(onSelect = { id ->
            navController.navigate("orders/$id")
        }) }
        composable("orders/{id}") { entry ->
            val id = entry.arguments?.getString("id").orEmpty()
            OrderDetailScreen(orderId = id)
        }
    }
}
```

### Single-activity + Fragment

```kotlin
class MainActivity : AppCompatActivity() {
    private val navController by lazy {
        findNavController(R.id.nav_host_fragment)
    }
    // ...
}
```

## Compose UI

```kotlin
@Composable
fun OrderListScreen(
    viewModel: OrderListViewModel = hiltViewModel(),
    onSelect: (String) -> Unit,
) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(Unit) { viewModel.load() }

    when {
        state.isLoading -> CircularProgressIndicator()
        state.error != null -> ErrorView(state.error!!)
        else -> LazyColumn {
            items(state.items) { item ->
                OrderRow(item, onClick = { onSelect(item.id) })
            }
        }
    }
}
```

## Repository / UseCase

```kotlin
interface IOrderRepository {
    suspend fun getOrders(): List<Order>
    suspend fun getOrder(id: String): Order
    fun observeOrders(): Flow<List<Order>>
}

class OrderRepositoryImpl(
    private val ds: OrderDataSource,
    private val cache: OrderCache,
) : IOrderRepository {
    override suspend fun getOrders(): List<Order> {
        val cached = cache.all()
        if (cached.isNotEmpty()) return cached
        val fresh = ds.fetch()
        cache.put(fresh)
        return fresh
    }
    // ...
}

class GetOrdersUseCase(
    private val repository: IOrderRepository,
) {
    suspend fun execute(params: Params): List<Order> =
        repository.getOrders().filter { it.matches(params) }

    data class Params(val status: OrderStatus? = null)
}
```

The naming convention (`I`-prefix or no prefix, `UseCase` vs `Interactor`) MUST follow the existing project. Audit first.

## Networking (Ktor — KMM-friendly)

```kotlin
class OrderDataSourceImpl(private val client: HttpClient) : OrderDataSource {
    override suspend fun fetch(): List<OrderDto> =
        client.get("api/orders").body()
}
```

For Android-only projects, Retrofit + OkHttp is more common. KMM projects usually use Ktor because it's multiplatform.

## Persistence

Common options:
- **DataStore** (preferences, typed)
- **Room** (Android-only SQLite ORM)
- **SQLDelight** (KMM-friendly SQLite)
- **MultiplatformSettings** (KMM key-value)
- **EncryptedSharedPreferences** (Android secure storage)

Pick what the project uses. Do not introduce a new persistence layer during migration.

## KMM-Specific Patterns

### expect / actual

```kotlin
// commonMain
expect class PlatformDateFormatter {
    fun format(timestamp: Long): String
}

// iosMain
actual class PlatformDateFormatter {
    actual fun format(timestamp: Long): String =
        NSDateFormatter().apply { dateStyle = .medium }.string(from: NSDate(timestamp))
}

// androidMain
actual class PlatformDateFormatter {
    actual fun format(timestamp: Long): String =
        SimpleDateFormat.getDateInstance().format(Date(timestamp))
}
```

When **lifting iOS code into shared**, `expect/actual` is how platform-specific bits stay platform-specific while the shared logic lives in `commonMain`.

### Kotlin/Native Interop

Shared code consumed from Swift becomes Objective-C-ish bindings:
- `data class` → ObjC class with init
- `sealed class` → ObjC class hierarchy
- `suspend fun` → completion-handler-style or async (KMM 1.9+)
- `Flow<T>` → consumed via wrapper helpers

This shapes the KMM API: avoid generics that don't bridge cleanly, prefer concrete types at the boundary.

## Error Modeling

```kotlin
sealed class AppError : Throwable() {
    data object Network : AppError()
    data object Unauthorized : AppError()
    data object NotFound : AppError()
    data class Unknown(override val message: String) : AppError()

    companion object {
        fun from(throwable: Throwable): AppError = when (throwable) {
            is AppError -> throwable
            // map IOException, HttpException, etc.
            else -> Unknown(throwable.message.orEmpty())
        }
    }
}
```

## File Organization

Common conventions (audit project to confirm):

- Per-feature folders (`feature/order/data/`, `feature/order/domain/`, `feature/order/presentation/`)
- Or per-layer folders (`data/`, `domain/`, `presentation/`)
- Models in `domain/model/`, repositories in `domain/repository/` + `data/repository/`
- ViewModels in `presentation/viewmodel/` (Android) or `presentation/sharedviewmodel/` (KMM)
- Comment language matches project (often English)
- Trailing newline / whitespace conventions per `.editorconfig` if present

## Common Anti-Patterns to Avoid

- **`runBlocking` in production code** — almost always wrong; use `suspend` and proper scope
- **Holding `Context` in ViewModels** — leads to leaks; use `Application` context or pass it in
- **Mutable state outside StateFlow / mutableStateOf** — UI won't observe
- **Skipping `viewModelScope`** — coroutines leak when ViewModel is cleared
- **`!!` everywhere** — same problem as Swift's `!`; use `?.` and `?:`
- **Mixing Hilt + Koin** — pick one
- **Adding "Android" / "Kmm" suffix to types** — types are named for what they are
- **Calling `expect/actual` from shared business logic when not necessary** — keeps platform-specific code minimal
