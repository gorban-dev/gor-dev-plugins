# gor-dev-plugins

Claude Code plugin marketplace for Android development.

## Installation

```bash
/plugin marketplace add gorban-dev/gor-dev-plugins
```

## Available Plugins

| Plugin | Description | Install |
|--------|-------------|---------|
| **android-dev** | Unified Android developer: one proactive agent for the full cycle — brainstorm → plan → implement → review → test → verify | `/plugin install android-dev@gor-dev-plugins` |
| **swagger-android** | Generate Android Kotlin data models from Swagger/OpenAPI specs | `/plugin install swagger-android@gor-dev-plugins` |
| **yandex-tracker** | Yandex Tracker MCP server for issue management, time tracking, comments, workflows, and sprint planning | `/plugin install yandex-tracker@gor-dev-plugins` |
| **google-dev-knowledge** | Real-time access to official Google developer docs (Android, Firebase, Cloud, Flutter, TensorFlow, Google AI, etc.) | `/plugin install google-dev-knowledge@gor-dev-plugins` |

## android-dev (v2.0.0)

Один агент заменяет 6 отдельных агентов и 14 скилов из предыдущих `android-arch` + `dev-workflow`.

### Agent

**android-dev** (model: opus) — senior Android developer. Автоматически определяет нужный skill и проактивно запускает полный цикл без лишних вопросов.

### Skills

| Skill | Description |
|-------|-------------|
| `brainstorm` | Исследование и дизайн решения перед реализацией. 2-3 подхода с trade-offs |
| `plan` | Создание гранулярного плана (задачи по 2-5 мин) и пошаговое выполнение |
| `implement` | Реализация: создание фичи с нуля, доработка существующей, рефакторинг к стандарту |
| `debug` | Систематическая отладка: root cause → hypothesis → fix → verify |
| `tdd` | Test-driven development: RED → GREEN → REFACTOR |
| `review` | Двухпроходное ревью: архитектура (8 категорий) + code quality (6 категорий) |
| `test-ui` | UI-тестирование на устройстве через claude-in-mobile CLI |
| `verify` | Evidence-based проверка завершённости — без "should work" |

### Proactive Workflow

```
implement → review (auto) → fix if FAIL (max 3) → test-ui (auto) → verify (auto) → report
```

Для сложных задач:
```
brainstorm → plan → implement → review → test-ui → verify
```

### Architecture

Строгие правила для Jetpack Compose + Clean Architecture:
- **Screen** — тонкий адаптер (collectAsStateWithLifecycle)
- **View** — чистый UI, без логики и side-effects
- **ViewModel** — BaseSharedViewModel, handleEvent(), updateState
- **UseCase** — suspend fun execute(), returns Result<T>
- **Repository** — interface + impl, depends only on DataSources

## Project Setup

Add to your project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "gor-dev-plugins": {
      "source": {
        "source": "github",
        "repo": "gorban-dev/gor-dev-plugins"
      }
    }
  },
  "enabledPlugins": {
    "android-dev@gor-dev-plugins": true,
    "swagger-android@gor-dev-plugins": true,
    "yandex-tracker@gor-dev-plugins": true,
    "google-dev-knowledge@gor-dev-plugins": true
  }
}
```

## Migration from v1.x

If you were using `android-arch` and `dev-workflow`, replace them with `android-dev`:

```diff
  "enabledPlugins": {
-   "dev-workflow@gor-dev-plugins": true,
-   "android-arch@gor-dev-plugins": true,
+   "android-dev@gor-dev-plugins": true,
  }
```
