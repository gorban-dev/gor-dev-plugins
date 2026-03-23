#!/bin/bash
# Android Dev — Session Start Hook
# Инжектирует skill-first правила и каталог скилов при каждом старте/compact/clear
# По образцу superpowers (obra/superpowers)

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cat <<'SKILLS_CATALOG'
## Android Dev — Skill-First Rule

**ОБЯЗАТЕЛЬНО**: Перед началом ЛЮБОЙ задачи проверь, какой skill применим.
Если есть хоть 1% шанс что skill подходит — ИСПОЛЬЗУЙ ЕГО.
Скилы кодируют лучшие практики и предотвращают ошибки.

### Доступные скилы:

| Skill | Когда использовать |
|-------|-------------------|
| `brainstorm` | "как лучше сделать", "давай подумаем", нетривиальные архитектурные решения |
| `plan` | "спланируй", "разбей на задачи", сложная многошаговая работа |
| `implement` | Создать фичу, доработать существующую, отрефакторить, исправить нарушения |
| `debug` | Баги, краши, "не работает", ошибки, 2+ неудачных попытки исправить |
| `tdd` | Test-driven development для UseCases, mappers, бизнес-логики |
| `review` | Проверка после реализации — архитектура + code quality |
| `test-ui` | UI-тестирование на устройстве через claude-in-mobile |
| `verify` | Финальная проверка — evidence-based, без "should work" |

### Проактивный workflow (полный автомат):

```
implement → review (авто) → fix если FAIL (макс 3) → test-ui (авто) → fix если FAIL (макс 3) → verify (авто) → отчёт
```

Для нетривиальных задач: `brainstorm → plan → implement → review → test-ui → verify`

### Правила:
- `rules/android-core.md` имеет АБСОЛЮТНЫЙ приоритет
- Каждый класс в отдельном файле
- Screen — тонкий адаптер, View — чистый UI, ViewModel — вся логика
- UseCase: suspend fun execute() (НЕ operator fun invoke)
SKILLS_CATALOG
