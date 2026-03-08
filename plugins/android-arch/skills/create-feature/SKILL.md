---
description: "Создание нового Android feature slice с нуля: Screen, View, ViewModel, UseCases, Repository, DataSources, DI module. Используй когда нужно создать новую фичу, новый экран, новый функционал в Android проекте."
---

# Create Feature — создание нового feature slice

Ты создаёшь production-ready Compose Android feature slice строго по архитектурным правилам.

## Workflow

### Шаг 1: Определи параметры
1. **FeatureName** — преобразуй в PascalCase (snake/kebab → Pascal).
2. **Базовый пакет** — возьми из CLAUDE.md проекта (например `com.company.app`).
3. **DI фреймворк** — определи по проекту:
   - Ищи в `build.gradle` / `build.gradle.kts`: `koin` или `kodein`.
   - Или посмотри существующие DI модули в проекте.
4. **Навигация** — определи по проекту (Jetpack Navigation, кастомный роутер и т.д.).
5. **Описание фичи** — какие экраны, какие данные, какие действия пользователя.

### Шаг 2: Создай структуру папок
Используй scaffold.sh или создай вручную:
```
feature/{featureName}/
    presentation/
        screen/
        view/
        viewmodel/
    domain/
        usecase/
        repository/
    data/
        datasource/
        repository/
    di/
```

### Шаг 3: Сгенерируй файлы
В порядке создания:
1. `{Feature}ViewState.kt` — состояние экрана
2. `{Feature}ViewEvent.kt` — события от UI
3. `{Feature}ViewAction.kt` — одноразовые действия (навигация, toast и т.д.)
4. `{Feature}ViewModel.kt` — наследует BaseSharedViewModel
5. `{Feature}Screen.kt` — тонкий адаптер
6. `{Feature}View.kt` — чистый UI с Preview
7. Use cases — по одному на каждое действие
8. `I{Feature}Repository.kt` — интерфейс
9. `{Feature}Repository.kt` — реализация
10. DataSources — Local и/или Remote по необходимости
11. `{Feature}DiModule.kt` — DI модуль (Koin или Kodein)

### Шаг 4: Валидация
Проверь каждый файл:
- [ ] Screen не содержит логики, remember, вычислений
- [ ] Каждый View в отдельном файле с Preview
- [ ] Preview: `{Feature}View_Preview` (private fun, обёрнутый в `{App}Theme { }`)
- [ ] View не содержит логики, remember, side-effects
- [ ] ViewModel наследует BaseSharedViewModel
- [ ] ViewModel не импортирует Compose
- [ ] Каждый UseCase наследует UseCase<Params, T>
- [ ] execute() НЕ является operator fun
- [ ] UseCase возвращает Result<T>
- [ ] Repository имеет интерфейс I{Feature}Repository
- [ ] Каждый класс в отдельном файле
- [ ] Naming conventions соблюдены
- [ ] Структура пакетов корректна

### Шаг 5: Вывод
Ответ содержит:
1. **Summary** — описание сгенерированной фичи
2. **Folder tree** — структура папок
3. **File list** — полный список файлов
4. **Full code** — код всех файлов в порядке: Screen → View → ViewState → Events → Actions → ViewModel → UseCases → Repository → DataSources → DI module
5. **Architecture validation** — подтверждение соблюдения всех правил
