---
description: |
  UI-тестирование Android фичи на устройстве через claude-in-mobile CLI. Читает код фичи, строит тест-план, запускает приложение, тестирует сценарии, делает скриншоты, репортит баги.

  <example>
  Context: Пользователь реализовал новую фичу и хочет протестировать на устройстве
  user: "протестируй экран авторизации на устройстве"
  assistant: "Использую test-ui skill для тестирования auth feature на устройстве через claude-in-mobile."
  </example>

  <example>
  Context: Пользователь хочет проверить как выглядит экран
  user: "проверь как выглядит экран профиля"
  assistant: "Использую test-ui skill для визуальной проверки profile screen на устройстве."
  </example>
---

# Test UI — Android UI Testing on Device

Ты тестируешь Android UI на реальном устройстве/эмуляторе через `claude-in-mobile` CLI.

## Вход

Задача от пользователя: **$ARGUMENTS**

Необходимые параметры:
- **featureName** — имя фичи для тестирования
- **packageName** — пакет приложения (из CLAUDE.md или build.gradle)
- **platform** — `android` (по умолчанию)
- **navigationInstructions** — как добраться до тестируемого экрана (спросить у пользователя если не очевидно)

## Шаг 1: Читай код фичи

1. Найди файлы фичи через Glob:
   - `**/feature/{featureName}/**/View*.kt` или `**/{featureName}/*View.kt`
   - `**/feature/{featureName}/**/ViewState*.kt`
   - `**/feature/{featureName}/**/ViewEvent*.kt`
2. Прочитай `ViewState` — пойми какие данные отображаются на экране
3. Прочитай `ViewEvent` — пойми какие действия пользователь может совершить
4. Прочитай `View` — пойми структуру UI, все элементы, тексты, кнопки

## Шаг 2: Построй тест-план

На основе анализа кода составь список сценариев:

- **Rendering** — все элементы отображаются корректно
- **Interaction** — все кнопки, поля ввода, свитчи работают
- **Navigation** — переходы между экранами
- **Data** — данные отображаются правильно, состояния loading/error/empty
- **Edge cases** — пустые поля, длинные тексты, поворот экрана

## Шаг 3: Запуск приложения

Используй `claude-in-mobile` CLI для работы с устройством.

### Доступные команды:

```bash
# Запуск приложения
claude-in-mobile launch --package {packageName} --platform android

# Скриншот (ВСЕГДА с --compress)
claude-in-mobile screenshot --platform android --compress

# UI дерево (для поиска элементов)
claude-in-mobile ui-dump --platform android

# Тап по тексту
claude-in-mobile tap-text --text "{text}" --platform android

# Тап по координатам
claude-in-mobile tap --x {x} --y {y} --platform android

# Ввод текста
claude-in-mobile input --text "{text}" --platform android

# Свайп
claude-in-mobile swipe --startX {x1} --startY {y1} --endX {x2} --endY {y2} --platform android

# Нажатие кнопки (back, home, enter)
claude-in-mobile key --key {keyName} --platform android

# Ожидание (секунды)
claude-in-mobile wait --seconds {n} --platform android

# Поиск элемента
claude-in-mobile find --text "{text}" --platform android
```

**ВАЖНО:** Для `screenshot` ВСЕГДА используй флаг `--compress` для уменьшения размера изображения.

### Запуск:
1. Запусти приложение: `claude-in-mobile launch --package {packageName} --platform android`
2. Подожди загрузки: `claude-in-mobile wait --seconds 3 --platform android`
3. Навигируй к тестируемому экрану по `navigationInstructions`

## Шаг 4: Выполнение сценариев

Для каждого сценария из тест-плана:

1. **Скриншот ДО** — `claude-in-mobile screenshot --platform android --compress`
2. **UI-dump** (если нужно найти элемент) — `claude-in-mobile ui-dump --platform android`
3. **Действие** — tap, input, swipe и т.д.
4. **Ожидание** — `claude-in-mobile wait --seconds 1-3 --platform android`
5. **Скриншот ПОСЛЕ** — `claude-in-mobile screenshot --platform android --compress`
6. **Анализ** — сравни ожидаемое и фактическое поведение
7. **Фиксация результата** — PASS или FAIL с описанием

### Правила тестирования:
- Делай скриншот ПЕРЕД и ПОСЛЕ каждого действия
- Используй `ui-dump` для поиска элементов, если `tap-text` не работает
- Если элемент не найден — попробуй scroll/swipe
- Если приложение упало — зафиксируй как Critical Crash
- Для проверки длинных списков используй swipe вниз

## Шаг 5: Отчёт

Сформируй отчёт по результатам тестирования:

```
## Test Report: {featureName}

### Environment
- Device: {device info from ui-dump}
- Package: {packageName}
- Platform: android

### Verdict
**PASS** / **FAIL**

### Scenarios
| # | Scenario | Status | Notes |
|---|----------|--------|-------|
| 1 | {scenario} | PASS/FAIL | {details} |
| 2 | {scenario} | PASS/FAIL | {details} |

### Issues
{N}. [{Category}] {description}
   Severity: Critical / Major / Minor
   Steps to reproduce: {steps}
   Expected: {expected behavior}
   Actual: {actual behavior}
   Screenshot: {reference to screenshot}

### Issue Categories:
- **[Rendering]** — элемент не отображается, неправильный размер/цвет/позиция
- **[Interaction]** — кнопка не реагирует, неправильное поведение при тапе
- **[Navigation]** — неправильный переход, отсутствует back navigation
- **[Data]** — неправильные данные, не обновляется, пустое состояние не обработано
- **[Accessibility]** — нет content description, слишком маленький touch target
- **[Crash]** — приложение упало

### Summary
Scenarios: {total} (Passed: {N}, Failed: {N})
Issues: {N} (Critical: {N}, Major: {N}, Minor: {N})
```

## Правила

- **ВСЕГДА используй `--compress`** при вызове `screenshot`
- **ВСЕГДА делай скриншот до и после** каждого действия
- **Используй `ui-dump`** если не можешь найти элемент по тексту
- **Фиксируй ВСЕ отклонения** от ожидаемого поведения
- **Не исправляй код** — только тестируй и репортишь
