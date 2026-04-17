# Installing kmp-migrator-superpowers for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed
- Git

## Installation

1. **Clone the marketplace:**
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.config/opencode/gor-dev-plugins
   ```

2. **Add the plugin to your `opencode.json`** (global or project-level):

   ```json
   {
     "plugin": ["file:~/.config/opencode/gor-dev-plugins/plugins/kmp-migrator-superpowers"]
   }
   ```

3. **Restart OpenCode.** The plugin's bootstrap (`KmpMigratorSuperpowersPlugin`) will inject KMM ↔ iOS Migration Mode into every session and register all skills.

Verify by asking: "Tell me about your KMM ↔ iOS migration skills"

## Usage

Use OpenCode's native `skill` tool:

```
use skill tool to list skills
use skill tool to load kmp-migrator-superpowers/brainstorming
```

## Updating

```bash
cd ~/.config/opencode/gor-dev-plugins && git pull
```

Then restart OpenCode.

## Troubleshooting

### Plugin not loading

1. Check logs: `opencode run --print-logs "hello" 2>&1 | grep -i kmp-migrator`
2. Verify the path in `opencode.json` matches the cloned location
3. Confirm `~/.config/opencode/gor-dev-plugins/plugins/kmp-migrator-superpowers/package.json` exists

### Skills not found

1. Use `skill` tool to list what's discovered
2. Restart OpenCode after the first install

### Tool mapping

When skills reference Claude Code tools:
- `TodoWrite` → `todowrite`
- `Task` with subagents → `@mention` syntax
- `Skill` tool → OpenCode's native `skill` tool
- File operations → your native tools

## Getting Help

- Report issues: https://github.com/gorban-dev/gor-dev-plugins/issues
