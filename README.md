<div align="center">

# gor-dev-plugins

**Multi-platform plugin marketplace for Android, KMM and iOS development**

[![Marketplace](https://img.shields.io/badge/marketplace-v2.1.0-blue?style=flat-square)](https://github.com/gorban-dev/gor-dev-plugins/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Plugins](https://img.shields.io/badge/plugins-5-orange?style=flat-square)](#available-plugins)

[Claude Code](https://claude.com/claude-code) · [Cursor](https://cursor.com) · [OpenAI Codex CLI](https://github.com/openai/codex) · [Gemini CLI](https://github.com/google-gemini/gemini-cli) · [OpenCode](https://opencode.ai)

</div>

---

## Available Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| [**android-dev**](plugins/android-dev) | `2.0.0` | Unified Android developer agent: brainstorm → plan → implement → review → test → verify |
| [**kmp-migrator-superpowers**](plugins/kmp-migrator-superpowers) | `1.0.0` | Bidirectional KMM ↔ iOS migration toolkit on the Superpowers methodology |
| [**swagger-android**](plugins/swagger-android) | `1.2.0` | Generate Android Kotlin data models from Swagger/OpenAPI specs |
| [**yandex-tracker**](plugins/yandex-tracker) | `1.0.0` | Yandex Tracker MCP server: 30+ tools, agent, workflows, sprint planning |
| [**google-dev-knowledge**](plugins/google-dev-knowledge) | `1.0.0` | Real-time access to official Google developer docs (Android, Firebase, Cloud, Flutter, TensorFlow, Google AI) |

---

## Installation

### Claude Code

Add the marketplace and install plugins:

```bash
/plugin marketplace add gorban-dev/gor-dev-plugins
/plugin install <plugin-name>@gor-dev-plugins
```

Or pin everything in your project's `.claude/settings.json`:

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
    "kmp-migrator-superpowers@gor-dev-plugins": true,
    "swagger-android@gor-dev-plugins": true,
    "yandex-tracker@gor-dev-plugins": true,
    "google-dev-knowledge@gor-dev-plugins": true
  }
}
```

### Other platforms

Each plugin ships per-platform manifests and a dedicated `INSTALL.md` inside its directory:

| Platform | Where to look |
|----------|---------------|
| **Cursor** | `<plugin>/.cursor-plugin/plugin.json` |
| **Codex CLI** | `<plugin>/.codex/INSTALL.md` |
| **Gemini CLI** | `<plugin>/gemini-extension.json` + `<plugin>/GEMINI.md` |
| **OpenCode** | `<plugin>/.opencode/INSTALL.md` |

---

## Plugins

### android-dev `v2.0.0`

One agent replaces 6 separate agents and 14 skills.

**Agent** — `android-dev` (model: opus). Senior Android developer that automatically picks the right skill and proactively runs the full development cycle.

**Skills**

| Skill | Description |
|-------|-------------|
| `brainstorm` | Explore approaches and design solutions before coding |
| `plan` | Create granular implementation plans (2–5 min tasks) and execute |
| `implement` | Build features from scratch, modify existing, or refactor |
| `debug` | Systematic debugging: root cause → hypothesis → fix → verify |
| `tdd` | Test-driven development: RED → GREEN → REFACTOR |
| `review` | Two-pass review: architecture (8 cats) + code quality (6 cats) |
| `test-ui` | UI testing on device via claude-in-mobile CLI |
| `verify` | Evidence-based completion check — no "should work" |

**Proactive workflow**

```
implement → review (auto) → fix if FAIL (max 3) → test-ui (auto) → verify (auto) → report
```

For complex tasks:

```
brainstorm → plan → implement → review → test-ui → verify
```

**Architecture rules** (Jetpack Compose + Clean Architecture)

- **Screen** — thin adapter (`collectAsStateWithLifecycle`, `CollectWithLifecycle`)
- **View** — pure UI, no logic or side-effects
- **ViewModel** — `BaseSharedViewModel`, `handleEvent()`, `updateState`
- **UseCase** — `suspend fun execute()`, returns `Result<T>`
- **Repository** — interface + impl, depends only on DataSources

---

### kmp-migrator-superpowers `v1.0.0`

Bidirectional **KMM ↔ iOS** migration toolkit on top of the [Superpowers](https://github.com/obra/superpowers) methodology by Jesse Vincent. Both directions:

- **KMM → iOS** — extract shared Kotlin into native Swift in `iosApp/`
- **iOS → KMM** — lift duplicated native Swift into shared Kotlin

Five-phase workflow with HARD-GATEs: `brainstorm → plan → execute → review → verify`. Preserves business logic line-by-line; honors the project's existing architecture.

The plugin keeps the full Superpowers skill set unchanged and adds an extended `using-superpowers` skill (KMM ↔ iOS Migration Mode) plus a `rules/` directory with the migration playbook and reference material.

---

### swagger-android `v1.2.0`

Generates Android Kotlin data models from Swagger / OpenAPI specifications.

- Data classes with `kotlinx-serialization`
- Domain ↔ Data mappers
- Enum mappers
- Naming conventions enforced via the `swagger-kotlin-conventions` skill

---

### yandex-tracker `v1.0.0`

Local MCP server with **30+ tools** covering the Yandex Tracker API: issues, comments, worklogs, checklists, sprints, boards, queues, transitions, attachments. Ships with the `tracker-manager` agent for interactive task execution and skills for daily workflows (standups, sprint planning, time tracking).

---

### google-dev-knowledge `v1.0.0`

Remote MCP server (Google Developer Knowledge API) with real-time access to official documentation: **Android · Firebase · Cloud · Chrome · Flutter · TensorFlow · web.dev · Google AI**.

Requires a free API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

---

## Migration from v1.x

If you were using `android-arch` and `dev-workflow`, replace them with `android-dev`:

```diff
  "enabledPlugins": {
-   "dev-workflow@gor-dev-plugins": true,
-   "android-arch@gor-dev-plugins": true,
+   "android-dev@gor-dev-plugins": true,
  }
```

---

## License

MIT — see individual plugins for details.

Built with ♥ by [Sergey Gorban](https://github.com/gorban-dev).
