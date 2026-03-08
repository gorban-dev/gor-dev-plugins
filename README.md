# gor-dev-plugins

Claude Code plugin marketplace for Android development.

## Installation

```bash
/plugin marketplace add gorban-dev/gor-dev-plugins
```

## Available Plugins

| Plugin | Description | Details | Install |
|--------|-------------|---------|---------|
| **swagger-android** | Generate Android Kotlin data models from Swagger/OpenAPI specs | [README](https://github.com/gorban-dev/gor-dev-plugins/tree/main/plugins/swagger-android) | `/plugin install swagger-android@gor-dev-plugins` |
| **android-arch** | Create, modify and refactor Android features following strict architecture rules (Compose, Screen/View, Clean Architecture, Koin/Kodein) | [README](https://github.com/gorban-dev/gor-dev-plugins/tree/main/plugins/android-arch) | `/plugin install android-arch@gor-dev-plugins` |
| **yandex-tracker** | Yandex Tracker MCP server for issue management, time tracking, comments, workflows, and sprint planning | [README](https://github.com/gorban-dev/gor-dev-plugins/tree/main/plugins/yandex-tracker) | `/plugin install yandex-tracker@gor-dev-plugins` |
| **google-dev-knowledge** | Real-time access to official Google developer docs (Android, Firebase, Cloud, Flutter, TensorFlow, Google AI, etc.) | [README](https://github.com/gorban-dev/gor-dev-plugins/tree/main/plugins/google-dev-knowledge) | `/plugin install google-dev-knowledge@gor-dev-plugins` |

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
    "android-arch@gor-dev-plugins": true,
    "swagger-android@gor-dev-plugins": true,
    "yandex-tracker@gor-dev-plugins": true
  }
}
```
