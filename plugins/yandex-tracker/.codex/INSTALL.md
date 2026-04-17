# Installing yandex-tracker for Codex

## Prerequisites

- Git
- OpenAI Codex CLI
- Node.js 18+
- Yandex Tracker OAuth token and org ID

## Installation

1. **Clone the marketplace** (if not already cloned):
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.codex/gor-dev-plugins
   ```

2. **Install MCP dependencies:**
   ```bash
   cd ~/.codex/gor-dev-plugins/plugins/yandex-tracker
   npm install
   npm run build
   ```

3. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/gor-dev-plugins/plugins/yandex-tracker/skills ~/.agents/skills/yandex-tracker
   ```

4. **Configure the MCP server** in your Codex `~/.codex/config.toml`:

   ```toml
   [mcp_servers.yandex-tracker]
   command = "node"
   args = ["~/.codex/gor-dev-plugins/plugins/yandex-tracker/dist/bundle.js"]

   [mcp_servers.yandex-tracker.env]
   YANDEX_TRACKER_TOKEN = "your_oauth_token_here"
   YANDEX_TRACKER_ORG_ID = "your_org_id_here"
   ```

5. **Restart Codex.**

## Notes

- The `agents/tracker-manager.md` agent is Claude Code-only. On Codex you drive the workflow yourself by calling MCP tools.

## Updating

```bash
cd ~/.codex/gor-dev-plugins && git pull
cd plugins/yandex-tracker && npm install && npm run build
```

## Uninstalling

```bash
rm ~/.agents/skills/yandex-tracker
```

Then remove the `[mcp_servers.yandex-tracker]` block from `~/.codex/config.toml`.
