# Installing android-dev for Codex

## Prerequisites

- Git
- OpenAI Codex CLI

## Installation

1. **Clone the marketplace** (if not already cloned):
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.codex/gor-dev-plugins
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/gor-dev-plugins/plugins/android-dev/skills ~/.agents/skills/android-dev
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\android-dev" "$env:USERPROFILE\.codex\gor-dev-plugins\plugins\android-dev\skills"
   ```

3. **Restart Codex.**

## Notes

- The `session-start.sh` hook (which auto-injects the skill catalog) is Claude Code-only. On Codex you discover skills through the native `skill` tool.
- The `agents/android-dev.md` agent is Claude Code-only. On Codex, instruct your session manually.

## Updating

```bash
cd ~/.codex/gor-dev-plugins && git pull
```

## Uninstalling

```bash
rm ~/.agents/skills/android-dev
```
