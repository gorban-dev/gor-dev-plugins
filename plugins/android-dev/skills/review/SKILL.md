---
description: |
  Архитектурное и code quality ревью Android кода. Двухпроходная проверка: (1) соответствие архитектурным правилам — 8 категорий, (2) качество кода — naming, duplication, error handling, security, performance, maintainability. Используй после реализации для проверки качества.

  <example>
  Context: Пользователь создал новую фичу и хочет проверить качество
  user: "сделай ревью фичи авторизации"
  assistant: "Использую review skill для двухпроходной проверки auth feature."
  </example>

  <example>
  Context: Пользователь отрефакторил код и хочет убедиться в корректности
  user: "проверь рефакторинг профиля"
  assistant: "Использую review skill для проверки архитектуры и качества кода profile feature."
  </example>

  <example>
  Context: Пользователь хочет проверить код перед коммитом
  user: "проверь мой код перед коммитом"
  assistant: "Использую review skill для полной проверки изменённых файлов."
  </example>
---

# Review — Architecture & Code Quality Review

Ты проводишь комплексное ревью Android кода: архитектура + качество. Два прохода, единый вердикт.

## Вход

Задача от пользователя: **$ARGUMENTS**

## Шаг 1: Определи scope

1. Получи от пользователя имя фичи или список файлов
2. Если указана фича — найди все файлы через Glob:
   - `**/feature/{featureName}/**/*.kt`
   - `**/features/{featureName}/**/*.kt`
   - `**/{featureName}/**/*.kt`
3. Если указаны конкретные файлы — используй их

## Шаг 2: Прочитай правила

1. **Обязательно**: `rules/android-core.md`
2. **Если доступны**: references из skill implement (`references/architecture.md`, `references/base-viewmodel.md`, `references/theme-system.md`)
3. Запомни все правила — они являются эталоном для проверки

## Шаг 3: Прочитай все файлы scope

Прочитай каждый файл фичи через Read tool. Не пропускай ни одного файла.

## Шаг 4: Pass 1 — Architecture Compliance

Проверь каждый файл по всем 8 категориям. Для каждого нарушения фиксируй файл, строку, правило.

### Категория 1: Структура пакетов
- [ ] Папки соответствуют стандарту (presentation/screen, presentation/view, presentation/viewmodel, domain/usecase, domain/repository, data/datasource, data/repository, di)
- [ ] Каждый класс в правильной папке
- [ ] Каждый класс в отдельном файле

### Категория 2: Screen
- [ ] Использует `collectAsStateWithLifecycle()` для state
- [ ] Использует `CollectWithLifecycle {}` для actions
- [ ] Нет `remember`, логики, вычислений в Screen

### Категория 3: View
- [ ] Сигнатура: `viewState` + `eventHandler` параметры
- [ ] Нет `remember`, `LaunchedEffect`, `SideEffect`
- [ ] Preview: `private fun {Feature}View_Preview` в `{App}Theme`
- [ ] Нет прямого использования `MaterialTheme`
- [ ] Нет хардкод цветов и типографики

### Категория 4: ViewModel
- [ ] Наследует `BaseSharedViewModel`
- [ ] `override fun handleEvent` для обработки событий
- [ ] `updateState { it.copy(...) }` для обновления состояния
- [ ] Нет Compose импортов (`androidx.compose.*`)
- [ ] Нет прямых вызовов Repository — только через UseCase

### Категория 5: ViewState / Event / Action
- [ ] Каждый в отдельном файле
- [ ] `ViewState` — data class с дефолтными значениями для всех полей
- [ ] `ViewEvent` — sealed class
- [ ] `ViewAction` — sealed class

### Категория 6: UseCase
- [ ] Наследует `UseCase`
- [ ] `suspend fun execute(...)` — НЕ `operator fun invoke`
- [ ] Возвращает `Result<T>`
- [ ] Зависит только от Repository (не от других UseCases, DataSources, etc.)

### Категория 7: Repository
- [ ] Есть интерфейс `I{Feature}Repository`
- [ ] Реализация находится в `data/repository/`
- [ ] Зависит только от DataSources (не от других Repositories, UseCases, etc.)

### Категория 8: DI Module
- [ ] Все зависимости фичи зарегистрированы (ViewModel, UseCases, Repository, DataSources)
- [ ] Стиль соответствует фреймворку проекта (Koin `module {}` / Kodein `bind<>()`)

## Шаг 5: Pass 2 — Code Quality

Проверь код по 6 категориям качества:

### 1. Naming & Readability
- Имена классов, функций, переменных понятны и следуют конвенциям Kotlin
- Функции не слишком длинные (>30 строк — повод задуматься)
- Код читается сверху вниз без необходимости прыгать по файлу

### 2. Duplication (DRY)
- Нет копипасты между файлами
- Общая логика вынесена в переиспользуемые компоненты
- Нет повторяющихся строк/блоков в View (вынести в отдельный Composable)

### 3. Error Handling
- UseCase возвращает Result<T>, ошибки обрабатываются
- ViewModel обрабатывает Result.failure и показывает ошибку пользователю
- Нет проглоченных исключений (пустой catch)
- Нет force-unwrap (`!!`) без обоснования

### 4. Security
- Нет захардкоженных API ключей, паролей, секретов
- Нет логирования чувствительных данных
- Корректное хранение токенов (не в SharedPreferences без шифрования)

### 5. Performance
- Нет тяжёлых операций в Composable функциях
- Нет лишних рекомпозиций (стабильные параметры, правильные ключи)
- Нет блокирующих вызовов на Main thread
- Корректное использование корутин (правильный dispatcher)

### 6. Maintainability
- Код легко расширить новым функционалом
- Зависимости инжектируются, а не создаются внутри
- Нет God-объектов (класс делает слишком много)
- Magic numbers/strings вынесены в константы

## Шаг 6: Формирование отчёта

Объедини результаты обоих проходов в единый отчёт:

```
## Scope
Files reviewed: {list of all reviewed files}
Rules: rules/android-core.md [+ references if used]

## Verdict
**PASS** / **FAIL**

PASS — если нет Critical и Important issues.
FAIL — если есть хотя бы один Critical или Important issue.

## Issues
{N}. [{Category}] {File.kt}:{line}
   Severity: Critical / Important / Suggestion
   Rule: {rule name or description}
   Problem: {concrete description of what's wrong}

## Strengths
{2-3 things done well — always find something positive}

## Summary
Files: {N}, Issues: {N} (Critical: {N}, Important: {N}, Suggestions: {N})
```

### Severity guidelines:
- **Critical** — нарушение архитектуры, потенциальный краш, утечка данных
- **Important** — отклонение от стандарта, потенциальная проблема
- **Suggestion** — улучшение качества, не обязательно к исправлению

## Правила

- **Read-only** — НИКОГДА не модифицируй код. Только читай и анализируй.
- **Конкретность** — указывай точные файлы и номера строк для каждого issue.
- **Объективность** — проверяй по правилам проекта, а не по личным предпочтениям.
- **Полнота** — проверь ВСЕ файлы scope, не пропускай ни одного.
- **Баланс** — всегда отмечай сильные стороны кода, не только проблемы.
