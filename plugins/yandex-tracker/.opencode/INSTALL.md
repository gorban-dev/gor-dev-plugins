# Installing yandex-tracker for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai)
- Git
- Node.js 18+
- Yandex Tracker OAuth token and org ID

## Installation

1. **Clone the marketplace** (if not already cloned):
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.config/opencode/gor-dev-plugins
   ```

2. **Install MCP dependencies:**
   ```bash
   cd ~/.config/opencode/gor-dev-plugins/plugins/yandex-tracker
   npm install
   npm run build
   ```

3. **Add the skills path and MCP server to your `opencode.json`** (global or project-level):

   ```json
   {
     "skills": {
       "paths": ["~/.config/opencode/gor-dev-plugins/plugins/yandex-tracker/skills"]
     },
     "mcp": {
       "yandex-tracker": {
         "type": "local",
         "command": ["node", "~/.config/opencode/gor-dev-plugins/plugins/yandex-tracker/dist/bundle.js"],
         "environment": {
           "YANDEX_TRACKER_TOKEN": "your_oauth_token_here",
           "YANDEX_TRACKER_ORG_ID": "your_org_id_here"
         }
       }
     }
   }
   ```

4. **Restart OpenCode.**

## Notes

- The `agents/tracker-manager.md` agent is Claude Code-only. On OpenCode use `@mention` subagents or drive MCP calls directly.

## Updating

```bash
cd ~/.config/opencode/gor-dev-plugins && git pull
cd plugins/yandex-tracker && npm install && npm run build
```

## Uninstalling

Remove the `skills.paths` entry and the `mcp.yandex-tracker` block from `opencode.json`.
