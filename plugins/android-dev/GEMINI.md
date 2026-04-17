# Android Dev — Skill-First Rule

**MANDATORY**: Before starting ANY task, check which skill applies.
If there is even a 1% chance that a skill fits — USE IT.

## Available skills

| Skill | When to use |
|-------|-------------|
| `brainstorm` | "what's the best way", architectural discussions |
| `plan` | "plan it", complex multi-step work |
| `implement` | Create a feature, refactor, fix violations |
| `debug` | Bugs, crashes, "doesn't work", errors |
| `tdd` | TDD for UseCases, mappers, business logic |
| `review` | Architecture + code quality post-implementation |
| `test-ui` | UI testing on a device |
| `verify` | Evidence-based final check |

## Proactive workflow

```
implement → review (auto) → fix if FAIL (max 3) → test-ui (auto) → fix if FAIL (max 3) → verify (auto) → report
```

For non-trivial tasks: `brainstorm → plan → implement → review → test-ui → verify`

## Rules

`./rules/android-core.md` has ABSOLUTE priority. Each class in a separate file.
Screen — thin adapter, View — pure UI, ViewModel — all logic.
UseCase: `suspend fun execute()` (NOT `operator fun invoke`).
