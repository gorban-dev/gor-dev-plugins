# Дизайн-система — тема, цвета, типографика

Проект использует **кастомную тему** (НЕ MaterialTheme). Название темы — проектное (например `EatGrowTheme`, `MyAppTheme`). Агент должен определить имя темы по существующему коду проекта (искать `*Theme` в `ui/theme/`).

Далее `{App}Theme` — placeholder для реального имени темы проекта.

## Как определить тему проекта

Искать в проекте:
1. `Grep` по паттерну `object.*Theme` в пакете `ui.theme`
2. Или по `CompositionLocalProvider` в файлах `*Theme.kt`

## Доступ к теме

```kotlin
// Цвета
{App}Theme.colors.orange500
{App}Theme.colors.grey100

// Типографика
{App}Theme.typography.body
{App}Theme.typography.h3
```

**ЗАПРЕЩЕНО:**
- `MaterialTheme.colorScheme.*` — не используется
- `MaterialTheme.typography.*` — не используется
- Хардкод `Color(0xFF...)` в UI — только через `{App}Theme.colors`
- Хардкод `TextStyle(fontSize = ...)` в UI — только через `{App}Theme.typography`

## Структура темы

```kotlin
@Composable
fun {App}Theme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(
        Local{App}Colors provides Colors,
        Local{App}Typography provides Typography,
        LocalRippleConfiguration provides CustomRippleConfiguration,
        content = content,
    )
}

object {App}Theme {
    val colors: {App}Colors
        @Composable get() = Local{App}Colors.current

    val typography: {App}Typography
        @Composable get() = Local{App}Typography.current
}
```

## Цветовые палитры

Типичные палитры с оттенками 50–900:

| Палитра | Пример | Диапазон |
|---------|--------|----------|
| Yellow | `{App}Theme.colors.yellow500` | 50–900 |
| Orange | `{App}Theme.colors.orange500` | 50–900 |
| Brown | `{App}Theme.colors.brown500` | 50–900 |
| Green | `{App}Theme.colors.green500` | 50–900 |
| Violet | `{App}Theme.colors.violet500` | 50–900 |
| Grey | `{App}Theme.colors.grey500` | 50–900 |

Конкретные палитры и специальные цвета зависят от проекта — определяй по `{App}Colors` data class.

## Типографика

Типичные стили:

| Стиль | Размер | Вес |
|-------|--------|-----|
| `h1`–`h5` | 61–25sp | SemiBold |
| `bodyXL` / `bodyXLBold` | 20sp | Normal / Bold |
| `body` / `bodyBold` | 16sp | Normal / Bold |
| `label` / `labelBold` | 13sp | Normal / SemiBold |
| `caption` / `captionBold` | 10sp | Normal / Bold |

Конкретные стили зависят от проекта — определяй по `{App}Typography` data class.

## Пример использования в UI

```kotlin
Text(
    text = viewState.title,
    style = {App}Theme.typography.h5,
    color = {App}Theme.colors.brown900,
)

Button(
    colors = ButtonDefaults.buttonColors(
        containerColor = {App}Theme.colors.orange500,
        contentColor = {App}Theme.colors.yellow50,
    )
) {
    Text(text = "Action", style = {App}Theme.typography.bodyBold)
}
```
