# Android Architecture Plugin

Claude Code плагин для создания, доработки и рефакторинга Android фич по единым архитектурным правилам.

**Стек:** Jetpack Compose, Clean Architecture, Screen/View/ViewModel, Koin/Kodein.

## Установка

```bash
claude plugins add /path/to/android-arch-plugin
```

Или добавь в `.claude/settings.json` проекта:
```json
{
  "enabledPlugins": {
    "android-arch@local:/path/to/android-arch-plugin": true
  }
}
```

## Что внутри

### Агенты

| Агент | Описание |
|-------|----------|
| **feature-builder** | Создание новых фич и доработка существующих |
| **arch-refactor** | Рефакторинг кода к архитектурному стандарту, миграция Kodein→Koin |

### Skills

| Skill | Описание |
|-------|----------|
| **create-feature** | Генерация полного feature slice с нуля (Screen, View, ViewModel, UseCase, Repository, DataSource, DI) |
| **modify-feature** | Безопасная доработка существующей фичи |
| **refactor-feature** | Приведение старого кода к стандарту |

### Rules

`android-core.md` — базовые архитектурные инварианты, всегда в контексте.

## Примеры использования

**Создать новую фичу:**
> Создай экран авторизации с email и паролем

**Доработать существующую:**
> Добавь пагинацию на экран списка товаров

**Рефакторинг:**
> Приведи ProfileScreen к нашей архитектуре

**Миграция DI:**
> Мигрируй DI фичи авторизации с Kodein на Koin

## Настройка под проект

Создай `CLAUDE.md` в корне Android-проекта с параметрами:

```markdown
# Project Config

## Android Architecture
- Базовый пакет: `com.company.app`
- DI: Koin (или Kodein)
- Навигация: Jetpack Navigation Compose
- BaseSharedViewModel: `com.company.app.common.base.BaseSharedViewModel`
- UseCase interface: `com.company.app.common.domain.UseCase`
```

Агенты автоматически читают CLAUDE.md и адаптируют генерацию под проект.

## Архитектура фичи

```
feature/{featureName}/
    presentation/
        screen/          # {Feature}Screen.kt — тонкий адаптер
        view/            # {Feature}View.kt — чистый UI
        viewmodel/       # {Feature}ViewModel.kt, ViewState, ViewEvent, ViewAction
    domain/
        usecase/         # {Feature}{Action}UseCase.kt
        repository/      # I{Feature}Repository.kt (интерфейс)
    data/
        repository/      # {Feature}Repository.kt (реализация)
        datasource/      # {Feature}RemoteDataSource.kt, {Feature}LocalDataSource.kt
    di/                  # {Feature}DiModule.kt
```
