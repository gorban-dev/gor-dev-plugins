#!/bin/bash
# Android Dev — Session Start Hook
# Injects skill-first rules and skill catalog on every start/compact/clear
# Based on superpowers pattern (obra/superpowers)

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cat <<'SKILLS_CATALOG'
## Android Dev — Skill-First Rule

**MANDATORY**: Before starting ANY task, check which skill applies.
If there is even a 1% chance that a skill fits — USE IT.
Skills encode best practices and prevent mistakes.

### Available skills:

| Skill | When to use |
|-------|-------------|
| `brainstorm` | "what's the best way", "let's think about", non-trivial architectural decisions |
| `plan` | "plan it", "break into tasks", complex multi-step work |
| `implement` | Create a feature, enhance an existing one, refactor, fix violations |
| `debug` | Bugs, crashes, "doesn't work", errors, 2+ failed attempts to fix |
| `tdd` | Test-driven development for UseCases, mappers, business logic |
| `review` | Post-implementation check — architecture + code quality |
| `test-ui` | UI testing on a device via claude-in-mobile |
| `verify` | Final check — evidence-based, no "should work" |

### Proactive workflow (full auto):

```
implement → review (auto) → fix if FAIL (max 3) → test-ui (auto) → fix if FAIL (max 3) → verify (auto) → report
```

For non-trivial tasks: `brainstorm → plan → implement → review → test-ui → verify`

### Rules:
- `$CLAUDE_PLUGIN_ROOT/rules/android-core.md` has ABSOLUTE priority
- Each class in a separate file
- Screen — thin adapter, View — pure UI, ViewModel — all logic
- UseCase: suspend fun execute() (NOT operator fun invoke)
SKILLS_CATALOG
