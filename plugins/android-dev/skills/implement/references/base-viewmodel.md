# BaseSharedViewModel — справочник API

## Сигнатура

```kotlin
abstract class BaseSharedViewModel<State : Any, Action : Any, Event : Any>(
    initialState: State,
) : ViewModel()
```

**Дженерики:**
- `State` — неизменяемое состояние экрана (data class)
- `Action` — одноразовые события для UI: навигация, тосты, снэкбары (sealed class)
- `Event` — намерения пользователя из UI: клики, ввод, скролл (sealed class)

## Публичный API (для Screen/View)

| Метод | Возвращает | Назначение |
|-------|-----------|------------|
| `viewStates()` | `StateFlow<State>` | Подписка на состояние экрана |
| `viewActions()` | `Flow<Action>` | Подписка на одноразовые действия |
| `handleEvent(event)` | `Unit` | Отправка события от UI |

## Защищённый API (для наследников ViewModel)

| Метод / свойство | Тип | Назначение |
|------------------|-----|------------|
| `viewState` | `State` (get-only) | Текущее состояние (read-only) |
| `updateState(reducer)` | `(State) -> State` | Атомарное обновление состояния |
| `sendAction(action)` | `Action` | Отправка одноразового действия в UI |

## Внутренняя реализация

- Состояние хранится в `MutableStateFlow`, наружу отдаётся `StateFlow` (immutable)
- Действия передаются через `Channel(BUFFERED)` → `receiveAsFlow()` — гарантия доставки каждого действия ровно один раз
- `onCleared()` закрывает канал действий

## Паттерн использования в ViewModel

```kotlin
class {Feature}ViewModel(
    private val someUseCase: SomeUseCase
) : BaseSharedViewModel<{Feature}ViewState, {Feature}ViewAction, {Feature}ViewEvent>(
    initialState = {Feature}ViewState()
) {

    override fun handleEvent(event: {Feature}ViewEvent) {
        when (event) {
            is {Feature}ViewEvent.LoadData -> loadData()
            is {Feature}ViewEvent.OnItemClicked -> onItemClicked(event.itemId)
        }
    }

    private fun loadData() {
        viewModelScope.launch {
            updateState { it.copy(isLoading = true, error = null) }

            someUseCase.execute(Unit).fold(
                onSuccess = { data ->
                    updateState { it.copy(isLoading = false, title = data.title) }
                },
                onFailure = { error ->
                    updateState { it.copy(isLoading = false, error = error.message) }
                }
            )
        }
    }

    private fun onItemClicked(itemId: String) {
        sendAction({Feature}ViewAction.NavigateToDetail(itemId))
    }
}
```

## Паттерн использования в Screen

```kotlin
@Composable
fun {Feature}Screen(viewModel: {Feature}ViewModel = viewModel()) {
    val state by viewModel.viewStates().collectAsStateWithLifecycle()
    val context = LocalContext.current

    viewModel.viewActions().CollectWithLifecycle { action ->
        when (action) {
            is {Feature}ViewAction.ShowToast -> {
                Toast.makeText(context, action.message, Toast.LENGTH_SHORT).show()
            }
            is {Feature}ViewAction.NavigateToDetail -> { /* навигация */ }
        }
    }

    {Feature}View(
        viewState = state,
        eventHandler = viewModel::handleEvent
    )
}
```

**Важно:**
- Состояние: `collectAsStateWithLifecycle()` (НЕ `collectAsState()`) — автоматически останавливает подписку когда lifecycle уходит ниже STARTED
- Действия: `CollectWithLifecycle` — проектный extension, безопасно собирает Flow с учётом lifecycle

## CollectWithLifecycle extension

Проектный extension для lifecycle-aware сбора одноразовых действий. Должен существовать в проекте (обычно в `common/extensions/` или `common/ui/`). Если отсутствует — создать.

```kotlin
@Composable
fun <T> Flow<T>.CollectWithLifecycle(
    minActiveState: Lifecycle.State = Lifecycle.State.STARTED,
    collector: (T) -> Unit,
) {
    val lifecycle = LocalLifecycleOwner.current.lifecycle

    LaunchedEffect(Unit) {
        lifecycle.repeatOnLifecycle(minActiveState) {
            collect { collector(it) }
        }
    }
}
```
