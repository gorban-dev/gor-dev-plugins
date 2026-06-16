# Installing Yandex Tracker for Codex

## Prerequisites

- Git
- OpenAI Codex CLI
- Yandex Tracker OAuth token and org ID

## Installation

1. **Register the GitHub marketplace with Codex:**
   ```bash
   codex plugin marketplace add gorban-dev/gor-dev-plugins --ref main
   ```

2. **Install the plugin from the marketplace:**
   ```bash
   codex plugin add yandex-tracker@gor-dev-plugins
   ```

3. **Provide Yandex Tracker credentials** in the environment that launches Codex:
   ```bash
   export YANDEX_TRACKER_TOKEN="your_oauth_token_here"
   export YANDEX_TRACKER_ORG_ID="your_org_id_here"
   ```

   Alternatively, use IAM credentials:
   ```bash
   export YANDEX_TRACKER_IAM_TOKEN="your_iam_token_here"
   export YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id_here"
   ```

4. **Start a new Codex thread** so the plugin skills and MCP tools are loaded.

## Notes

- The `agents/tracker-manager.md` agent is Claude Code-only. On Codex you drive the workflow yourself by calling MCP tools.
- The Codex plugin manifest is in `.codex-plugin/plugin.json`.
- The Codex marketplace entry is in `.agents/plugins/marketplace.json`.
- The MCP server uses `.mcp.json` with paths relative to the plugin root.
- The bundled MCP server (`dist/bundle.js`) is committed, so no `npm install` or local build step is required for normal installation.

## Updating

```bash
codex plugin marketplace add gorban-dev/gor-dev-plugins --ref main
codex plugin add yandex-tracker@gor-dev-plugins
```

## Uninstalling

```bash
codex plugin remove yandex-tracker
```
