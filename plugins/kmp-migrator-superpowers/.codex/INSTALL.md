# Installing kmp-migrator-superpowers for Codex

Enable the migration skills in Codex via native skill discovery.

## Prerequisites

- Git

## Installation

1. **Clone the marketplace:**
   ```bash
   git clone https://github.com/gorban-dev/gor-dev-plugins.git ~/.codex/gor-dev-plugins
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/gor-dev-plugins/plugins/kmp-migrator-superpowers/skills ~/.agents/skills/kmp-migrator-superpowers
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\kmp-migrator-superpowers" "$env:USERPROFILE\.codex\gor-dev-plugins\plugins\kmp-migrator-superpowers\skills"
   ```

3. **Restart Codex** to discover the skills.

## Verify

```bash
ls -la ~/.agents/skills/kmp-migrator-superpowers
```

## Updating

```bash
cd ~/.codex/gor-dev-plugins && git pull
```

## Uninstalling

```bash
rm ~/.agents/skills/kmp-migrator-superpowers
```

Optionally delete the clone: `rm -rf ~/.codex/gor-dev-plugins` (removes ALL gor-dev-plugins).
