# Installing android-dev for OpenCode

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
       "paths": ["~/.config/opencode/gor-dev-plugins/plugins/android-dev/skills"]
     }
   }
   ```

3. **Restart OpenCode.**

Verify by listing skills:

```
use skill tool to list skills
```

## Notes

- The `session-start.sh` hook (which auto-injects the skill catalog) is Claude Code-only. On OpenCode you discover skills through the native `skill` tool.
- The `agents/android-dev.md` agent is Claude Code-only. On OpenCode use the agent system or `@mention` your own subagents.

## Updating

```bash
cd ~/.config/opencode/gor-dev-plugins && git pull
```

## Uninstalling

Remove the path from `opencode.json`. Optionally delete the clone.
