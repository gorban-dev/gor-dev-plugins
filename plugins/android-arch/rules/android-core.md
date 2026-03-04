# Android Architecture Core Rules

Эти правила действуют ВСЕГДА при работе с Android-кодом в проекте.

## Screen/View разделение
- **Screen** — тонкий адаптер: читает viewState из ViewModel, передаёт в View вместе с eventHandler. Никакой логики, remember, вычислений.
- **View** — чистый UI: только вёрстка по viewState и вызов eventHandler. Никакой логики, remember, side-effects.

## ViewModel
- Единственный источник логики. Наследует `BaseSharedViewModel<State, Action, Event>`.
- Хранит состояние, обрабатывает события через `obtainEvent()`, выполняет use cases.
- Навигация — только внутри ViewModel через средства навигации проекта.
- Compose-зависимости в ViewModel ЗАПРЕЩЕНЫ.

## UseCase
- Отдельный класс: `{Feature}{Action}UseCase.kt`. Наследует `UseCase<Params, Result>`.
- Одна функция `suspend fun execute(params): Result` (НЕ operator fun).
- Всегда возвращает `Result<T>`. Обработка ошибок — в UseCase.
- Зависит только от Repository.

## Repository
- Интерфейс `I{Feature}Repository` + реализация `{Feature}Repository`.
- Зависит только от DataSources. Возвращает чистые данные.

## DataSource
- `{Feature}LocalDataSource.kt`, `{Feature}RemoteDataSource.kt`.
- Зависит от: Ktor, SQLDelight, FileSystem, платформенных API.

## Naming conventions
- `{Feature}Screen.kt`, `{Feature}View.kt`, `{Feature}ViewModel.kt`
- `{Feature}ViewState.kt`, `{Feature}ViewEvent.kt`, `{Feature}ViewAction.kt`
- `{Feature}{Action}UseCase.kt`, `I{Feature}Repository.kt`, `{Feature}Repository.kt`

## Структура пакетов
```
feature/{featureName}/
    presentation/screen/  presentation/view/  presentation/viewmodel/
    domain/usecase/  domain/repository/
    data/datasource/  data/repository/
    di/
```

## Правила файлов
- Каждый класс (включая enum, sealed) — отдельный файл. Никаких god-файлов.

## DI
- Проект использует Koin или Kodein — определяй по build.gradle / существующим модулям.
- Модули строятся по официальной документации фреймворка.

## Запреты
- Compose-зависимости в ViewModel
- Бизнес-логика в View
- remember / side-effects в Screen
- God-файлы (несколько классов в одном файле)
- operator fun invoke в UseCase
