<div align="center">

# Mobile Dev Toolkit

**Plugins for Android development — OpenAPI models and Yandex Tracker**

[![Marketplace](https://img.shields.io/badge/marketplace-v3.0.0-blue?style=flat-square)](https://github.com/gorban-dev/gor-dev-plugins/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Plugins](https://img.shields.io/badge/plugins-2-orange?style=flat-square)](#available-plugins)

[Claude Code](https://claude.com/claude-code) · [Cursor](https://cursor.com) · [OpenAI Codex CLI](https://github.com/openai/codex) · [OpenCode](https://opencode.ai)

</div>

---

## Available Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| [**swagger-android**](plugins/swagger-android) | `1.2.0` | Generate Android Kotlin data models from Swagger/OpenAPI specs |
| [**yandex-tracker**](plugins/yandex-tracker) | `1.0.2` | Yandex Tracker MCP server: 30+ tools, agent, workflows, sprint planning |

> The development workflow plugins (`android-dev`, `kmp-migrator-superpowers`) moved to a standalone CLI — [**gor-mobile**](https://github.com/gorban-dev/gor-mobile). See [Migration to gor-mobile](#migration-to-gor-mobile).

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
    "swagger-android@gor-dev-plugins": true,
    "yandex-tracker@gor-dev-plugins": true
  }
}
```

### Codex

Add the marketplace directly from GitHub and install the plugin you need:

```bash
codex plugin marketplace add gorban-dev/gor-dev-plugins --ref main
codex plugin add yandex-tracker@gor-dev-plugins
```

Plugins that ship bundled MCP servers, such as `yandex-tracker`, include their built `dist/` assets in the repository, so normal installation does not require `npm install` or a local build.

### Other platforms

Each plugin ships per-platform manifests and a dedicated `INSTALL.md` inside its directory:

| Platform | Where to look |
|----------|---------------|
| **Cursor** | `<plugin>/.cursor-plugin/plugin.json` |
| **Codex CLI** | `<plugin>/.codex/INSTALL.md` |
| **OpenCode** | `<plugin>/.opencode/INSTALL.md` |

---

## Plugins

### swagger-android `v1.2.0`

Generates Android Kotlin data models from Swagger / OpenAPI specifications.

- Data classes with `kotlinx-serialization`
- Domain ↔ Data mappers
- Enum mappers
- Naming conventions enforced via the `swagger-kotlin-conventions` skill

---

### yandex-tracker `v1.0.2`

Local MCP server with **30+ tools** covering the Yandex Tracker API: issues, comments, worklogs, checklists, sprints, boards, queues, transitions, attachments. Ships with the `tracker-manager` agent for interactive task execution and skills for daily workflows (standups, sprint planning, time tracking).

---

## Migration to gor-mobile

`android-dev`, `kmp-migrator-superpowers` and `google-dev-knowledge` were removed in **v3.0.0**. Drop them from your config:

```diff
  "enabledPlugins": {
-   "android-dev@gor-dev-plugins": true,
-   "kmp-migrator-superpowers@gor-dev-plugins": true,
-   "google-dev-knowledge@gor-dev-plugins": true,
    "swagger-android@gor-dev-plugins": true,
    "yandex-tracker@gor-dev-plugins": true
  }
```

### android-dev, kmp-migrator-superpowers → gor-mobile

Both are superseded by [**gor-mobile**](https://github.com/gorban-dev/gor-mobile) — a standalone CLI instead of a plugin. It ships the same `brainstorm → plan → implement → review → verify` workflow with 14 skills, two review agents, hooks, rules packs and artifact retention, and works in both Claude Code (per-repo) and Codex (user-level).

```bash
brew install gorban-dev/gor-mobile/gor-mobile   # or: npm install -g gor-mobile
gor-mobile setup                                # one-time machine setup
cd ~/code/my-android-app && gor-mobile init     # install into the repo
```

Device work, project scaffolding, SDK/emulator management and Android docs lookup go through Google's [Android CLI](https://developer.android.com/tools/agents/android-cli), which `gor-mobile` requires and drives.

### google-dev-knowledge → official Google MCP server

The plugin was a thin wrapper around Google's own remote MCP server. Connect to it directly:

```bash
claude mcp add google-dev-knowledge --transport http https://developerknowledge.googleapis.com/mcp \
  --header "X-Goog-Api-Key: YOUR_API_KEY"
```

Docs: [developers.google.com/knowledge/mcp](https://developers.google.com/knowledge/mcp). For Android-only lookups, `android docs search` / `android docs fetch` from the Android CLI hits the Android Knowledge Base without an API key.

---

## License

MIT — see individual plugins for details.

Built with ♥ by [Sergey Gorban](https://github.com/gorban-dev).
