# Installing swagger-android for Codex

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
   ln -s ~/.codex/gor-dev-plugins/plugins/swagger-android/skills ~/.agents/skills/swagger-android
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\swagger-android" "$env:USERPROFILE\.codex\gor-dev-plugins\plugins\swagger-android\skills"
   ```

3. **Restart Codex.**

## Notes

- The `agents/swagger-model-generator.md` agent is Claude Code-only. On Codex, instruct your session to use `scripts/get-swagger-models.js` and the `swagger-kotlin-conventions` skill manually.

## Updating

```bash
cd ~/.codex/gor-dev-plugins && git pull
```

## Uninstalling

```bash
rm ~/.agents/skills/swagger-android
```
