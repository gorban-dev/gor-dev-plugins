# gor-dev-plugins

Маркетплейс Claude Code плагинов для Android-разработки.

## Установка маркетплейса

```bash
/plugin marketplace add gorban-dev/gor-dev-plugins
```

## Доступные плагины

| Плагин | Описание | Репозиторий | Установка |
|--------|----------|-------------|-----------|
| **swagger-android** | Генерация Kotlin data models из Swagger/OpenAPI | [gorban-dev/swagger-model-generator](https://github.com/gorban-dev/swagger-model-generator) | `/plugin install swagger-android@gor-dev-plugins` |
| **android-arch** | Создание, доработка и рефакторинг фич по архитектурным правилам (Compose, Screen/View, Clean Architecture, Koin/Kodein) | [gorban-dev/android-arch-plugin](https://github.com/gorban-dev/android-arch-plugin) | `/plugin install android-arch@gor-dev-plugins` |
| **yandex-tracker** | Yandex Tracker MCP сервер: задачи, тайм-трекинг, комментарии, спринты | [gorban-dev/yandex-tracker-mcp-server](https://github.com/gorban-dev/yandex-tracker-mcp-server) | `/plugin install yandex-tracker@gor-dev-plugins` |

## Добавление в проект

Добавьте в `.claude/settings.json` вашего проекта:

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
    "android-arch@gor-dev-plugins": true,
    "swagger-android@gor-dev-plugins": true,
    "yandex-tracker@gor-dev-plugins": true
  }
}
```
