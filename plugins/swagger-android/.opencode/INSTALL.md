# Installing swagger-android for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai)
- Git

## Installation

1. **Clone the marketplace** (if not already cloned):
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.config/opencode/gor-dev-plugins
   ```

2. **Add the skills path to your `opencode.json`** (global or project-level):

   ```json
   {
     "skills": {
       "paths": ["~/.config/opencode/gor-dev-plugins/plugins/swagger-android/skills"]
     }
   }
   ```

3. **Restart OpenCode.**

## Notes

- The `agents/swagger-model-generator.md` agent is Claude Code-only. On OpenCode use the `@mention` subagent system or manually drive the workflow with the `swagger-kotlin-conventions` skill and `scripts/get-swagger-models.js`.

## Updating

```bash
cd ~/.config/opencode/gor-dev-plugins && git pull
```

## Uninstalling

Remove the path from `opencode.json`. Optionally delete the clone.
