---
description: |
  Реализация Android фичи: создание с нуля, доработка существующей, или рефакторинг к архитектурному стандарту. Автоматически определяет режим работы по контексту. Используй для любых задач по написанию/изменению Android кода.

  <example>
  Context: Пользователь хочет создать новый экран
  user: "создай экран авторизации с email и паролем"
  assistant: "Использую implement skill в режиме create для создания auth feature."
  </example>

  <example>
  Context: Пользователь хочет добавить функционал на существующий экран
  user: "добавь пагинацию на экран каталога"
  assistant: "Использую implement skill в режиме modify для расширения catalog feature."
  </example>

  <example>
  Context: Пользователь хочет привести код к стандарту
  user: "отрефакторь экран профиля по нашей архитектуре"
  assistant: "Использую implement skill в режиме refactor для миграции profile feature."
  </example>

  <example>
  Context: Получен список архитектурных нарушений от review
  user: "исправь нарушения из ревью"
  assistant: "Использую implement skill для исправления архитектурных нарушений."
  </example>
---

# Implement — Android Feature Implementation

Ты реализуешь Android feature слои строго по архитектурным правилам проекта.

## Вход

Задача от пользователя: **$ARGUMENTS**

## Шаг 1: Определи режим работы

Автоматически определи тип задачи:

### Режим CREATE — фича не существует
Триггеры:
- Пользователь просит создать новый экран/фичу
- Фича не найдена по Glob паттернам в проекте
- Нужна полная структура с нуля

### Режим MODIFY — фича существует, нужно расширить
Триггеры:
- Пользователь просит добавить/изменить функционал
- Фича найдена в проекте
- Нужно расширить, а не создать с нуля

### Режим REFACTOR — фича существует, нужно привести к стандарту
Триггеры:
- Пользователь просит отрефакторить/мигрировать
- Получен список нарушений от review skill
- Нужно привести к архитектурному стандарту
- Миграция DI (Kodein → Koin)
- Разделение Screen/View

### Режим FIX — исправление конкретных нарушений
Триггеры:
- Получен список Issues от review или test-ui skill
- Нужно исправить конкретные проблемы
- Маппинг категория → файлы:
  - `[Структура]` → пакеты и файлы
  - `[Screen]` → {Feature}Screen.kt
  - `[View]` → {Feature}View.kt
  - `[ViewModel]` → {Feature}ViewModel.kt
  - `[ViewState/Event/Action]` → соответствующие файлы
  - `[UseCase]` → *UseCase.kt
  - `[Repository]` → *Repository.kt
  - `[DI]` → *DiModule.kt / *Module.kt
  - `[Rendering]` → {Feature}View.kt
  - `[Interaction]` → {Feature}View.kt + ViewModel
  - `[Navigation]` → {Feature}Screen.kt + ViewModel
  - `[Data]` → ViewModel + ViewState
  - `[Accessibility]` → {Feature}View.kt
  - `[Crash]` → ViewModel / UseCases

## Шаг 2: Подготовка проекта

1. **Определи базовый пакет** — из CLAUDE.md или существующих файлов
2. **Определи DI фреймворк** — `koin` или `kodein` из build.gradle или существующих модулей
3. **Определи навигацию** — по существующим Screen файлам
4. **Найди BaseSharedViewModel** — полный путь импорта
5. **Найди UseCase интерфейс** — полный путь импорта
6. **Прочитай правила** — `rules/android-core.md` (обязательно)

## Шаг 3: Выполнение по режиму

---

### Режим CREATE

Прочитай references: `references/architecture.md`, `references/base-viewmodel.md`, `references/theme-system.md`
Используй examples/ как образец для каждого файла.

**Порядок создания:**
1. Создай структуру папок:
   ```
   feature/{featureName}/
       presentation/screen/
       presentation/view/
       presentation/viewmodel/
       domain/usecase/
       domain/repository/
       data/datasource/
       data/repository/
       di/
   ```
2. Генерируй файлы в порядке:
   - `{Feature}ViewState.kt` — data class с дефолтными значениями
   - `{Feature}ViewEvent.kt` — sealed class событий от UI
   - `{Feature}ViewAction.kt` — sealed class одноразовых действий
   - `{Feature}ViewModel.kt` — наследует BaseSharedViewModel
   - `{Feature}Screen.kt` — тонкий адаптер
   - `{Feature}View.kt` — чистый UI с Preview
   - Use cases — по одному на действие
   - `I{Feature}Repository.kt` — интерфейс
   - `{Feature}Repository.kt` — реализация
   - DataSources — Local и/или Remote
   - `{Feature}DiModule.kt` — DI модуль

---

### Режим MODIFY

Прочитай references: `references/modification-rules.md`

1. **Прочитай все файлы фичи** (Screen, View, ViewModel, ViewState, ViewEvent, ViewAction, UseCases, Repository, DataSources, DI)
2. **Спланируй изменения** — что добавить/изменить
3. **Правила безопасной модификации:**
   - Не ломай существующие контракты (не удаляй поля, не меняй сигнатуры)
   - Новая логика — только в ViewModel
   - Новый UI — только в View
   - Новые данные — через UseCase → Repository → DataSource
   - Каждый новый класс — в отдельном файле
   - Обновляй DI модуль

---

### Режим REFACTOR

Прочитай references: `references/migration-guide.md`, `references/architecture.md`

1. **Аудит** — проверь по чеклисту из architecture.md
2. **План миграции:**
   - Создай недостающую структуру пакетов
   - Разделение файлов (отдельные классы)
   - Создание недостающих слоёв
   - Рефакторинг ViewModel к BaseSharedViewModel
   - Разделение Screen и View
   - Миграция DI (если нужно)
3. **Выполнение** — атомарные шаги, код компилируется после каждого
4. **Валидация** — повторный аудит

---

### Режим FIX

1. Получи список Issues (от review или test-ui)
2. Для каждого issue: найди файл → найди проблемное место → исправь строго по правилу
3. Не трогай код, который уже соответствует стандарту
4. После всех исправлений — валидация

## Шаг 4: Валидация (для всех режимов)

- [ ] Screen не содержит логики, remember, вычислений
- [ ] View в отдельном файле с Preview в {App}Theme
- [ ] View не содержит логики, remember, side-effects
- [ ] ViewModel наследует BaseSharedViewModel, нет Compose импортов
- [ ] UseCase наследует UseCase<Params, T>, execute() не operator fun
- [ ] UseCase возвращает Result<T>
- [ ] Repository имеет интерфейс I{Feature}Repository
- [ ] Каждый класс в отдельном файле
- [ ] Структура пакетов корректна
- [ ] DI модуль содержит все зависимости

## Шаг 5: Вывод

1. **Summary** — что сделано и в каком режиме
2. **Files** — список созданных/изменённых/удалённых файлов
3. **Full code** — код всех файлов
4. **Architecture validation** — подтверждение соблюдения правил
