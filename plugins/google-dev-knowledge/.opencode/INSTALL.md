# Installing google-dev-knowledge for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai)
- Git
- Google Developer Knowledge API key (https://aistudio.google.com/apikey)

## Installation

1. **Clone the marketplace** (if not already cloned):
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.config/opencode/gor-dev-plugins
   ```

2. **Add the skills path and MCP server to your `opencode.json`** (global or project-level):

   ```json
   {
     "skills": {
       "paths": ["~/.config/opencode/gor-dev-plugins/plugins/google-dev-knowledge/skills"]
     },
     "mcp": {
       "google-dev-knowledge": {
         "type": "remote",
         "url": "https://developerknowledge.googleapis.com/mcp",
         "headers": {
           "X-Goog-Api-Key": "your_api_key_here"
         }
       }
     }
   }
   ```

3. **Restart OpenCode.**

## Updating

```bash
cd ~/.config/opencode/gor-dev-plugins && git pull
```

## Uninstalling

Remove the `skills.paths` entry and the `mcp.google-dev-knowledge` block from `opencode.json`.
