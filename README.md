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

One agent replaces 6 separate agents and 14 skills from the previous `android-arch` + `dev-workflow` plugins.

### Agent

**android-dev** (model: opus) — senior Android developer. Automatically selects the right skill and proactively runs the full development cycle.

### Skills

| Skill | Description |
|-------|-------------|
| `brainstorm` | Explore approaches and design solutions before coding. Proposes 2-3 options with trade-offs |
| `plan` | Create granular implementation plans (2-5 min tasks) and execute them step by step |
| `implement` | Build features from scratch, modify existing ones, or refactor to architecture standard |
| `debug` | Systematic debugging: root cause → hypothesis → fix → verify |
| `tdd` | Test-driven development: RED → GREEN → REFACTOR |
| `review` | Two-pass review: architecture compliance (8 categories) + code quality (6 categories) |
| `test-ui` | UI testing on device via claude-in-mobile CLI |
| `verify` | Evidence-based completion check — no "should work" claims allowed |

### Proactive Workflow

```
implement → review (auto) → fix if FAIL (max 3) → test-ui (auto) → verify (auto) → report
```

For complex tasks:
```
brainstorm → plan → implement → review → test-ui → verify
```

### Architecture

Strict rules for Jetpack Compose + Clean Architecture:
- **Screen** — thin adapter (collectAsStateWithLifecycle, CollectWithLifecycle)
- **View** — pure UI, no logic or side-effects
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
