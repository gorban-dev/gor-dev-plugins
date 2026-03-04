# gor-dev-plugins

Маркетплейс Claude Code плагинов для Android-разработки.

## Установка маркетплейса

```bash
/plugin marketplace add gorban-dev/gor-dev-plugins
```

## Доступные плагины

| Плагин | Описание | Установка |
|--------|----------|-----------|
| **swagger-android** | Генерация Kotlin data models из Swagger/OpenAPI | `/plugin install swagger-android@gor-dev-plugins` |
| **android-arch** | Создание, доработка и рефакторинг фич по архитектурным правилам (Compose, Screen/View, Clean Architecture, Koin/Kodein) | `/plugin install android-arch@gor-dev-plugins` |
| **yandex-tracker** | Yandex Tracker MCP сервер: задачи, тайм-трекинг, комментарии, спринты | `/plugin install yandex-tracker@gor-dev-plugins` |

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
