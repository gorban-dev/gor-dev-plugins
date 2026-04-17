# gor-dev-plugins

Multi-platform plugin marketplace for Android, KMM, and iOS development.

Works with: **Claude Code**, **Cursor**, **OpenAI Codex CLI**, **Gemini CLI**, **OpenCode**.

## Installation

### Claude Code

```bash
/plugin marketplace add gorban-dev/gor-dev-plugins
```

Then install individual plugins:

```bash
/plugin install <plugin-name>@gor-dev-plugins
```

### Other platforms (Cursor / Codex / Gemini / OpenCode)

Each plugin ships per-platform manifests and an `INSTALL.md` inside its directory:

- Cursor: `<plugin>/.cursor-plugin/plugin.json`
- Codex: `<plugin>/.codex/INSTALL.md`
- Gemini CLI: `<plugin>/gemini-extension.json` + `<plugin>/GEMINI.md`
- OpenCode: `<plugin>/.opencode/INSTALL.md`

## Available Plugins

| Plugin | Description |
|--------|-------------|
| **android-dev** | Unified Android developer agent: brainstorm → plan → implement → review → test → verify |
| **swagger-android** | Generate Android Kotlin data models from Swagger/OpenAPI specs |
| **yandex-tracker** | Yandex Tracker MCP server: 30+ tools, agent, workflows, sprint planning |
| **google-dev-knowledge** | Real-time access to official Google developer docs (Android, Firebase, Cloud, Flutter, TensorFlow, Google AI) |
| **kmp-migrator-superpowers** | Bidirectional KMM ↔ iOS migration toolkit on top of the Superpowers methodology |

## android-dev (v2.0.0)

One agent replaces 6 separate agents and 14 skills.

### Agent

**android-dev** (model: opus) — senior Android developer. Automatically selects the right skill and proactively runs the full development cycle.

### Skills

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

### Proactive workflow

```
implement → review (auto) → fix if FAIL (max 3) → test-ui (auto) → verify (auto) → report
```

For complex tasks:

```
brainstorm → plan → implement → review → test-ui → verify
```

### Architecture

Strict rules for Jetpack Compose + Clean Architecture:
- **Screen** — thin adapter (`collectAsStateWithLifecycle`, `CollectWithLifecycle`)
- **View** — pure UI, no logic or side-effects
- **ViewModel** — `BaseSharedViewModel`, `handleEvent()`, `updateState`
- **UseCase** — `suspend fun execute()`, returns `Result<T>`
- **Repository** — interface + impl, depends only on DataSources

## kmp-migrator-superpowers (v1.0.0)

Bidirectional KMM ↔ iOS migration toolkit on top of the [Superpowers](https://github.com/obra/superpowers) methodology by Jesse Vincent. Both directions:

- **KMM → iOS** — extract shared Kotlin into native Swift in `iosApp/`
- **iOS → KMM** — lift duplicated native Swift into shared Kotlin

Five-phase workflow with HARD-GATEs: brainstorm → plan → execute → review → verify. Preserves business logic line-by-line; honors the project's existing architecture.

The plugin keeps the full Superpowers skill set unchanged and adds an extended `using-superpowers` skill (KMM ↔ iOS Migration Mode) plus a `rules/` directory with the migration playbook and reference material.

## Project setup (Claude Code)

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
    "google-dev-knowledge@gor-dev-plugins": true,
    "kmp-migrator-superpowers@gor-dev-plugins": true
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
