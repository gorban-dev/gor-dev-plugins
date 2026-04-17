# Installing google-dev-knowledge for Codex

## Prerequisites

- Git
- OpenAI Codex CLI
- Google Developer Knowledge API key (https://aistudio.google.com/apikey)

## Installation

1. **Clone the marketplace** (if not already cloned):
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.codex/gor-dev-plugins
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/gor-dev-plugins/plugins/google-dev-knowledge/skills ~/.agents/skills/google-dev-knowledge
   ```

3. **Configure the MCP server** in your Codex `~/.codex/config.toml`:

   ```toml
   [mcp_servers.google-dev-knowledge]
   transport = "http"
   url = "https://developerknowledge.googleapis.com/mcp"
   headers = { "X-Goog-Api-Key" = "your_api_key_here" }
   ```

4. **Restart Codex.**

## Updating

```bash
cd ~/.codex/gor-dev-plugins && git pull
```

## Uninstalling

```bash
rm ~/.agents/skills/google-dev-knowledge
```

Then remove the `[mcp_servers.google-dev-knowledge]` block from `~/.codex/config.toml`.
