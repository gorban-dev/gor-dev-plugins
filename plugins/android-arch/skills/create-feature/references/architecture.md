# Полные правила архитектуры Android Feature Slice

## 1. Screen (STRICT)

Файл: `presentation/screen/{Feature}Screen.kt`

Screen — тонкий адаптер между ViewModel и View.

**Содержит:**
- Получение ViewModel (через DI или viewModel())
- Чтение viewState через collectAsState()
- Передача viewState в View
- Передача eventHandler (obtainEvent) в View

**ЗАПРЕЩЕНО в Screen:**
- Бизнес-логика
- Навигация
- Состояние (remember)
- Вычисления
- Side-effects (LaunchedEffect для бизнес-логики)

## 2. View (STRICT)

Файл: `presentation/view/{Feature}View.kt`

View — чистый UI компонент.

**Содержит:**
- Composable функцию с параметрами `(viewState: {Feature}ViewState, eventHandler: ({Feature}ViewEvent) -> Unit)`
- Вёрстку на основе viewState
- Вызовы eventHandler для пользовательских действий
- Preview для светлой и тёмной темы (если в проекте есть поддержка тем)

**ЗАПРЕЩЕНО в View:**
- Любая логика (if/else для бизнес-решений)
- remember
- Side-effects (LaunchedEffect, DisposableEffect)
- Прямые вызовы ViewModel
- Навигация

**UI Guidelines:**
- Минимум вложенности Composable
- Если компонент используется в 5+ местах → вынести в `common/ui/{ComponentName}.kt`

## 3. ViewModel (STRICT)

Файл: `presentation/viewmodel/{Feature}ViewModel.kt`

ViewModel — единственный источник логики.

**Наследует:**
```kotlin
class {Feature}ViewModel(
    // use cases через конструктор
) : BaseSharedViewModel<{Feature}ViewState, {Feature}ViewAction, {Feature}ViewEvent>(
    initialState = {Feature}ViewState()
)
```

**Содержит:**
- Хранение и обновление состояния через `viewState = viewState.copy(...)`
- Обработка событий в `obtainEvent(viewEvent)`
- Выполнение use cases в coroutines (viewModelScope)
- Отправка одноразовых действий через `viewAction = ...`
- Навигация через средства навигации проекта

**Зависимости ViewModel (через конструктор / DI):**
- Use cases
- Платформенные классы (если common, через DI)

**ЗАПРЕЩЕНО в ViewModel:**
- Импорт Compose (`androidx.compose.*`)
- Прямая работа с Repository (только через UseCase)
- UI-логика

## 4. ViewState / ViewEvent / ViewAction

**ViewState** — `presentation/viewmodel/{Feature}ViewState.kt`
```kotlin
data class {Feature}ViewState(
    val isLoading: Boolean = false,
    val error: String? = null,
    // поля состояния экрана
)
```

**ViewEvent** — `presentation/viewmodel/{Feature}ViewEvent.kt`
```kotlin
sealed class {Feature}ViewEvent {
    // события от UI (клик, ввод, скролл и т.д.)
}
```

**ViewAction** — `presentation/viewmodel/{Feature}ViewAction.kt`
```kotlin
sealed class {Feature}ViewAction {
    // одноразовые действия (навигация, toast, snackbar)
}
```

## 5. UseCase (STRICT)

Файл: `domain/usecase/{Feature}{Action}UseCase.kt`

**Наследует:**
```kotlin
interface UseCase<in Params, out Result> {
    suspend fun execute(params: Params): Result
}
```

**Правила:**
- Одна функция `execute(params): Result` — НЕ operator fun
- Всегда возвращает `Result<T>` (допустима вариация `Result<Flow<T>>`)
- Вся обработка ошибок — внутри UseCase (try/catch → Result)
- Зависит только от Repository (или других UseCases — редко)
- Каждый UseCase — отдельный класс в отдельном файле

## 6. Repository

Файлы:
- `domain/repository/I{Feature}Repository.kt` — интерфейс
- `data/repository/{Feature}Repository.kt` — реализация

**Правила:**
- Каждый Repository имеет свой интерфейс
- Зависит только от DataSources и utility классов
- Возвращает чистые данные (не Result, не Flow — если только это не streaming)
- Не содержит бизнес-логики

## 7. DataSource

Файлы: `data/datasource/{Feature}LocalDataSource.kt`, `{Feature}RemoteDataSource.kt`

**Правила:**
- Простой provider данных
- Зависит от: Ktor (сеть), SQLDelight (БД), FileSystem, платформенных API
- Не содержит бизнес-логики

## 8. DI Module

Файл: `di/{Feature}DiModule.kt`

Агент определяет DI фреймворк проекта и генерирует соответственно.

**Koin:**
```kotlin
val {feature}Module = module {
    viewModel { {Feature}ViewModel(get(), get()) }
    single<I{Feature}Repository> { {Feature}Repository(get()) }
    single { {Feature}RemoteDataSource(get()) }
    factory { {Feature}{Action}UseCase(get()) }
}
```

**Kodein:**
```kotlin
val {feature}Module = DI.Module("{feature}Module") {
    bind<{Feature}ViewModel>() with provider { {Feature}ViewModel(instance(), instance()) }
    bind<I{Feature}Repository>() with singleton { {Feature}Repository(instance()) }
    bind<{Feature}RemoteDataSource>() with singleton { {Feature}RemoteDataSource(instance()) }
    bind<{Feature}{Action}UseCase>() with provider { {Feature}{Action}UseCase(instance()) }
}
```

## 9. Правила кода
- Только Kotlinx Serialization (не Gson, не Moshi)
- Каждый класс (включая enum, sealed) — отдельный файл
- Никаких god-файлов
