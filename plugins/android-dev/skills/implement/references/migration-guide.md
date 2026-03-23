# Гайд по миграции

## Миграция Kodein → Koin

### Замены в DI модуле

| Kodein | Koin |
|--------|------|
| `DI.Module("name") { }` | `module { }` |
| `bind<IRepo>() with singleton { Repo(instance()) }` | `single<IRepo> { Repo(get()) }` |
| `bind<UseCase>() with provider { UseCase(instance()) }` | `factory { UseCase(get()) }` |
| `bind<ViewModel>() with provider { VM(instance()) }` | `viewModel { VM(get()) }` |
| `instance()` | `get()` |

### Шаги миграции DI
1. Замени imports: `org.kodein.di.*` → `org.koin.*`
2. Замени объявление модуля: `DI.Module("name")` → `module`
3. Замени биндинги по таблице выше
4. Замени получение зависимостей: `instance()` → `get()`
5. Обнови build.gradle: замени kodein артефакты на koin
6. Обнови точку инициализации DI в Application классе

### Важно
- Koin `single` = Kodein `singleton` (один экземпляр)
- Koin `factory` = Kodein `provider` (новый экземпляр каждый раз)
- Koin `viewModel` — специальный scope для ViewModel
- Kodein не имеет аналога `viewModel`, обычно используется `provider`

## Миграция к Screen/View разделению

### Если сейчас всё в одном файле (FeatureScreen.kt содержит и VM логику и UI):

1. Создай `{Feature}ViewState.kt` — вынеси состояние
2. Создай `{Feature}ViewEvent.kt` — определи события
3. Создай `{Feature}ViewAction.kt` — определи действия
4. Создай `{Feature}ViewModel.kt` — вынеси логику, наследуй BaseSharedViewModel
5. Создай `{Feature}View.kt` — вынеси UI, сделай чистый Composable с (viewState, eventHandler)
6. Оставь `{Feature}Screen.kt` — тонкий адаптер

### Если ViewModel не наследует BaseSharedViewModel:

1. Замени `MutableState`/`mutableStateOf` на `updateState { it.copy(...) }`
2. Замени прямые callback-и на sealed class ViewEvent
3. Добавь `handleEvent(event)` — единый обработчик событий
4. Замени `SharedFlow`/`Channel` для действий на `sendAction(...)`

## Миграция структуры пакетов

### Если плоская структура (всё в одном пакете):
```
// БЫЛО:
feature/example/
    ExampleScreen.kt
    ExampleViewModel.kt
    ExampleRepository.kt

// СТАЛО:
feature/example/
    presentation/screen/ExampleScreen.kt
    presentation/view/ExampleView.kt
    presentation/viewmodel/ExampleViewModel.kt
    presentation/viewmodel/ExampleViewState.kt
    presentation/viewmodel/ExampleViewEvent.kt
    presentation/viewmodel/ExampleViewAction.kt
    domain/usecase/GetExampleDataUseCase.kt
    domain/repository/IExampleRepository.kt
    data/repository/ExampleRepository.kt
    data/datasource/ExampleRemoteDataSource.kt
    di/ExampleDiModule.kt
```

### Шаги:
1. Создай папки по стандарту
2. Перемести файлы
3. Обнови package declarations
4. Обнови все импорты в проекте
5. Проверь DI модуль — пути могли измениться
