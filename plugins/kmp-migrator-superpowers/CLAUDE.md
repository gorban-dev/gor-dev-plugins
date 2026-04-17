# kmp-migrator-superpowers — Project Notes

This file is for AI coding agents working **on this plugin's source** (not for end users invoking the plugin).

## What This Plugin Is

A KMM ↔ iOS bidirectional migration plugin built on top of [Superpowers](https://github.com/obra/superpowers) by Jesse Vincent. It keeps the full Superpowers skill set unchanged and adds:

- A **KMM ↔ iOS Migration Mode** section appended to `skills/using-superpowers/SKILL.md`
- A `rules/` directory with the migration playbook and reference material

## Architecture

```
.claude-plugin/        ← Claude Code manifests (plugin.json + marketplace.json)
.cursor-plugin/        ← Cursor manifest
.codex/                ← Codex installer
.opencode/             ← OpenCode plugin entry point
gemini-extension.json  ← Gemini extension manifest
package.json           ← npm-style metadata (used by OpenCode)

hooks/                 ← SessionStart hook injects using-superpowers into context
skills/                ← All Superpowers skills (unchanged) + extended using-superpowers
rules/                 ← Migration-specific reference material (NEW in this plugin)
docs/                  ← Platform-specific install docs (codex, opencode, windows)
scripts/               ← bump-version.sh and friends
```

## When Modifying

### Skills
The Superpowers skills (`brainstorming`, `writing-plans`, etc.) are carefully tuned. Do not casually edit their content. If a change is genuinely needed, treat it as a behavior change, test it across multiple sessions, and document the reason.

The exception is `skills/using-superpowers/SKILL.md` — its **KMM ↔ iOS Migration Mode** section is original to this plugin and can be evolved freely.

### Rules
`rules/*.md` are reference material loaded by the agent during migration tasks. Edit them as the migration approach evolves. Keep them **platform-agnostic about projects** — describe common iOS / Android / KMM patterns, not the patterns of any one project. Project-specific conventions are discovered during the architecture audit (see `rules/project-architecture-audit.md`).

### Versioning
Run `scripts/bump-version.sh` to bump version across all manifests listed in `.version-bump.json`. Do not edit version fields by hand — drift causes installer failures.

### Multi-Platform Manifests
Every manifest must agree on `name`, `version`, `description`. The harness picks one based on which CLI/IDE is loading the plugin:
- `.claude-plugin/plugin.json` — Claude Code
- `.cursor-plugin/plugin.json` — Cursor
- `gemini-extension.json` — Gemini CLI
- `package.json` — OpenCode (and npm metadata)
- `.codex/INSTALL.md` — Codex install instructions
- `.opencode/INSTALL.md` + `.opencode/plugins/*.js` — OpenCode plugin

When you change `name`, `description`, or `version`, update **all** of them.

## Commit Conventions

- Imperative mood, present tense ("add migration-workflow rule", not "added")
- One concern per commit
- No `Co-Authored-By` lines
- No mention of tooling that produced the change

## Whitespace Rules

These rules apply to this repo too:
- Use `Edit` for existing files; `Write` only for brand-new files
- Do not strip trailing whitespace from blank lines
- Do not add or remove trailing newlines at end of files

See `rules/whitespace-rules.md` for the full version (those rules apply to the user's projects during migration; the same hygiene applies to this plugin's source).
