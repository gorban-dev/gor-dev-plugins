# dev-workflow

Unified development workflow plugin for Claude Code. Provides a structured process layer on top of domain-specific plugins: **design → planning → execution → verification → review**.

## Skills

| Skill | Description | Trigger Examples |
|-------|-------------|-----------------|
| `design` | Brainstorming & design gate — explore options, propose approaches, produce spec | "how should we...", "brainstorm", "design" |
| `plan-task` | Granular task breakdown with file maps and verification criteria | "plan", "break down", "create a plan" |
| `execute-plan` | Step-by-step plan execution with domain skill integration | "execute plan", "start the plan" |
| `verify` | Evidence-based verification before completion claims | "verify", "check if done", "is it ready" |
| `debug` | Systematic 4-phase debugging methodology | "debug", "not working", "bug" |
| `tdd` | Test-driven development (RED-GREEN-REFACTOR) for business logic | "tdd", "test first" |
| `code-review` | Structured code quality review | "code review", "review changes" |

## Agents

| Agent | Purpose | Model |
|-------|---------|-------|
| `code-reviewer` | Generic code quality analysis (naming, duplication, security, performance) | sonnet |
| `plan-reviewer` | Plan document validation (granularity, paths, dependencies) | sonnet |

## Workflow

```
User Request
    │
    ▼
  design ──→ spec document (docs/designs/)
    │
    ▼
  plan-task ──→ granular plan (docs/plans/)
    │
    ▼
  execute-plan ──→ invokes domain skills (android-arch, swagger-android, etc.)
    │
    ▼
  verify ──→ evidence-based completion check
    │
    ▼
  code-review ──→ quality review
```

Each skill is independently usable — you don't have to follow the full pipeline.

## Integration with Domain Plugins

This plugin works alongside domain-specific plugins:

- **android-arch**: `plan-task` references `android-arch:create-feature`, `verify` suggests `android-arch:review-feature`
- **swagger-android**: `plan-task` references `swagger-android` for model generation tasks
- **yandex-tracker**: `debug` can create bug issues, `plan-task` can reference tracker tasks
- **google-dev-knowledge**: `design` uses docs research during exploration phase

## Testing

```bash
cd plugins/dev-workflow
pip install pytest pyyaml
python -m pytest tests/ -v
```

## Installation

The plugin is included in the gor-dev-plugins marketplace. It's automatically available when the marketplace is registered in Claude Code.
