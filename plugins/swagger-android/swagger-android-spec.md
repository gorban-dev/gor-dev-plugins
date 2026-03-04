# ТЗ: Плагин swagger-android для Claude Code

## 1. Общее описание

**Название плагина:** `swagger-android`
**Назначение:** Автоматическая генерация Android Kotlin data-моделей из Swagger/OpenAPI спецификации с разделением на Data/Domain слои и маппингом между ними.
**Публикация:** Claude Code Marketplace
**Лицензия:** MIT
**Категория:** development
**Keywords:** android, kotlin, swagger, openapi, models, codegen, kotlinx-serialization

## 2. Архитектура плагина

Архитектура: **Script + Agent + Skill** (без MCP-сервера, без внешних npm-зависимостей).

```
swagger-android/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── agents/
│   └── swagger-model-generator.md      ← Основной агент генерации
├── scripts/
│   └── get-swagger-models.js           ← Node.js скрипт для работы со Swagger API
├── skills/
│   └── swagger-kotlin-conventions/
│       ├── SKILL.md                    ← Правила генерации Kotlin кода
│       ├── examples/
│       │   ├── response-model.kt       ← Пример response-модели (Data + Domain + Mapper)
│       │   └── request-model.kt        ← Пример request-модели (только Data)
│       └── references/
│           ├── type-mapping.md         ← Таблица маппинга JSON Schema → Kotlin
│           └── edge-cases.md           ← Обработка сложных случаев
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## 3. Компонент: Script (`scripts/get-swagger-models.js`)

### 3.1 Назначение
Node.js скрипт, который получает Swagger/OpenAPI JSON по URL, извлекает определения моделей для указанных endpoint-ов и **предобрабатывает их до компактного формата**. Без внешних npm-зависимостей — только встроенные модули Node.js.

**Ключевой принцип: скрипт максимально сокращает объём данных перед передачей агенту.** Вместо сырых Swagger-определений скрипт отдаёт уже разрезолвленные, классифицированные и типизированные модели. Это критично для экономии токенов — сырой Swagger JSON может занимать мегабайты, а агенту нужен минимум информации для генерации кода.

### 3.2 Что делает скрипт (предобработка)

1. **Загружает** полный Swagger JSON по URL
2. **Находит** endpoint-ы по запросу пользователя
3. **Резолвит** все `$ref` ссылки рекурсивно
4. **Классифицирует** каждую модель: `response` / `request` / `enum`
5. **Конвертирует типы** JSON Schema → Kotlin (`integer` + `int64` → `Long`)
6. **Извлекает описания** полей (`description`) из Swagger для KDoc-комментариев
7. **Определяет nullable** — по `required` массиву и `nullable: true`
8. **Конвертирует имена** полей в camelCase (из snake_case)
9. **Отдаёт** компактный JSON — только то, что нужно агенту для генерации файлов

### 3.3 Конфигурация
- URL берётся из файла `.env` (переменная `SWAGGER_URL`)
- Формат URL с Basic Auth: `https://login:password@host/path`
- Скрипт ищет `.env` в текущей директории и до 2 уровней вверх (CWD, `../`, `../../`)
- URL можно переопределить флагом `--url="..."`

### 3.4 Режимы работы

```bash
# Список всех endpoint-ов (компактный)
node "$CLAUDE_PLUGIN_ROOT/scripts/get-swagger-models.js" --list

# Модели для конкретных endpoint-ов (предобработанные)
node "$CLAUDE_PLUGIN_ROOT/scripts/get-swagger-models.js" --endpoints="GET /products,POST /cart/add"

# Конкретная модель и все её зависимости
node "$CLAUDE_PLUGIN_ROOT/scripts/get-swagger-models.js" --model=ProductDto

# Все определения из спецификации
node "$CLAUDE_PLUGIN_ROOT/scripts/get-swagger-models.js" --all

# Override URL
node "$CLAUDE_PLUGIN_ROOT/scripts/get-swagger-models.js" --url="https://login:pass@host/path" --endpoints="GET /orders"
```

### 3.5 Технические требования
- Поддержка Swagger 2.0 и OpenAPI 3.0/3.1
- Рекурсивный resolve всех `$ref` ссылок
- Гибкий матчинг endpoint-ов: `"GET /products"`, `"/products"`, `"products"`
- Следование HTTP-редиректам
- Таймаут запроса: 30 секунд
- Вывод: JSON в stdout, ошибки в stderr
- При отсутствии `.env` — информативное сообщение с инструкцией

### 3.6 Формат вывода

**--list** (компактный список endpoint-ов):
```json
{
  "endpoints": [
    { "method": "GET", "path": "/api/products", "summary": "Get products list" },
    { "method": "POST", "path": "/api/products", "summary": "Create a product" }
  ],
  "totalDefinitions": 42
}
```

**--endpoints / --model** (предобработанные модели для агента):
```json
{
  "models": [
    {
      "name": "Product",
      "kind": "response",
      "description": "Product entity from the catalog",
      "fields": [
        {
          "jsonKey": "id",
          "kotlinName": "id",
          "kotlinType": "Int",
          "nullable": false,
          "description": "Unique product identifier"
        },
        {
          "jsonKey": "product_name",
          "kotlinName": "productName",
          "kotlinType": "String",
          "nullable": false,
          "description": "Display name of the product"
        },
        {
          "jsonKey": "description",
          "kotlinName": "description",
          "kotlinType": "String",
          "nullable": true,
          "description": "Optional product description"
        },
        {
          "jsonKey": "price",
          "kotlinName": "price",
          "kotlinType": "Double",
          "nullable": false,
          "description": null
        },
        {
          "jsonKey": "category",
          "kotlinName": "category",
          "kotlinType": "ref:Category",
          "nullable": false,
          "description": "Product category"
        },
        {
          "jsonKey": "tags",
          "kotlinName": "tags",
          "kotlinType": "List<String>",
          "nullable": false,
          "description": "Search tags"
        },
        {
          "jsonKey": "created_at",
          "kotlinName": "createdAt",
          "kotlinType": "String",
          "nullable": false,
          "description": "Creation timestamp in ISO 8601"
        },
        {
          "jsonKey": "status",
          "kotlinName": "status",
          "kotlinType": "enum:ProductStatus",
          "nullable": false,
          "description": "Current product status"
        }
      ]
    },
    {
      "name": "ProductStatus",
      "kind": "enum",
      "description": "Possible product statuses",
      "values": [
        { "jsonValue": "active", "kotlinName": "ACTIVE" },
        { "jsonValue": "archived", "kotlinName": "ARCHIVED" },
        { "jsonValue": "draft", "kotlinName": "DRAFT" }
      ]
    },
    {
      "name": "Category",
      "kind": "response",
      "description": null,
      "fields": [
        {
          "jsonKey": "id",
          "kotlinName": "id",
          "kotlinType": "Int",
          "nullable": false,
          "description": null
        },
        {
          "jsonKey": "name",
          "kotlinName": "name",
          "kotlinType": "String",
          "nullable": false,
          "description": "Category display name"
        }
      ]
    },
    {
      "name": "CreateProductRequest",
      "kind": "request",
      "description": "Request body for creating a new product",
      "fields": [
        {
          "jsonKey": "name",
          "kotlinName": "name",
          "kotlinType": "String",
          "nullable": false,
          "description": "Product name"
        },
        {
          "jsonKey": "price",
          "kotlinName": "price",
          "kotlinType": "Double",
          "nullable": false,
          "description": null
        }
      ]
    }
  ]
}
```

### 3.7 Правила предобработки в скрипте

**Конвертация типов** (скрипт делает сам, агенту не нужно):

| JSON Schema | format | Результат в `kotlinType` |
|-------------|--------|--------------------------|
| `string` | — | `String` |
| `string` | `date` / `date-time` / `uuid` / `email` | `String` |
| `string` + `enum` | — | `enum:EnumName` |
| `integer` | — / `int32` | `Int` |
| `integer` | `int64` | `Long` |
| `number` | — / `double` | `Double` |
| `number` | `float` | `Float` |
| `boolean` | — | `Boolean` |
| `array` (items: T) | — | `List<T>` или `List<ref:Name>` |
| `$ref` | — | `ref:ModelName` |
| `object` (inline) | — | `ref:ParentFieldName` (выносится как отдельная модель) |

**Конвертация имён полей:**
- `snake_case` → `camelCase`: `product_name` → `productName`
- `kebab-case` → `camelCase`: `product-name` → `productName`
- Оригинальное имя сохраняется в `jsonKey` (для `@SerialName`)

**Классификация моделей:**
- `"kind": "response"` — модель используется в response body endpoint-а (нужен Data + Domain + Mapper)
- `"kind": "request"` — модель используется в request body endpoint-а (нужен только Data)
- `"kind": "enum"` — enum-тип (нужен Data enum + Domain enum + Mapper)

**Описания полей:**
- `"description"` берётся из поля `description` в Swagger-схеме
- Если описания нет — `null`
- Описание модели берётся из `description` объекта schema

---

## 4. Компонент: Agent (`agents/swagger-model-generator.md`)

### 4.1 Назначение
Основной агент. Получает от пользователя запрос или ТЗ с перечислением endpoint-ов, запускает скрипт, анализирует JSON-схемы и генерирует Kotlin-файлы в структуре Android-проекта.

### 4.2 Триггеры агента (примеры запросов)
- «Сгенерируй модели для фичи catalog: GET /api/products, GET /api/products/{id}»
- «Создай data-классы для корзины: POST /cart/add, GET /cart, DELETE /cart/{id}»
- «Покажи все доступные endpoint-ы в Swagger»
- «Сгенерируй модели для авторизации — POST /auth/login, POST /auth/refresh»

### 4.3 Workflow агента

```
1. ПАРСИНГ ЗАПРОСА
   ├─ Извлечь имя фичи (явно из запроса или по пути endpoint-а: /api/cart/... → cart)
   └─ Извлечь список endpoint-ов (метод + путь)

2. ОПРЕДЕЛЕНИЕ ПРОЕКТА
   ├─ Найти base_src_path (ищет build.gradle.kts / build.gradle)
   ├─ Определить base_package (из applicationId или спросить пользователя)
   └─ Проверить наличие .env с SWAGGER_URL

3. ПОЛУЧЕНИЕ ПРЕДОБРАБОТАННЫХ МОДЕЛЕЙ
   └─ Запустить: node scripts/get-swagger-models.js --endpoints="..."
       Скрипт возвращает уже классифицированные модели с Kotlin-типами,
       camelCase-именами полей и description-комментариями.
       Агенту НЕ нужно парсить сырой Swagger — всё уже готово.

4. ПРОВЕРКА КОНФЛИКТОВ
   ├─ Определить какие файлы уже есть в проекте
   └─ Если есть конфликты → спросить пользователя (перезаписать / пропустить)

5. ГЕНЕРАЦИЯ ФАЙЛОВ (по данным из скрипта)
   ├─ Для каждой модели с kind="response":
   │   ├─ Data model (Ktor-префикс, @Serializable, KDoc) → data/model/
   │   ├─ Domain model (чистое имя, KDoc) → domain/model/
   │   └─ Mapper (.toDomain()) → data/model/
   ├─ Для каждой модели с kind="request":
   │   └─ Data model (Ktor-префикс, @Serializable, KDoc) → data/model/
   └─ Для каждой модели с kind="enum":
       ├─ Data enum (Ktor-префикс, @Serializable, UNKNOWN) → data/model/
       ├─ Domain enum (чистое имя, UNKNOWN) → domain/model/
       └─ Mapper (when-выражение) → data/model/

6. ОТЧЁТ
   └─ Вывести список созданных файлов с путями
```

**Экономия токенов:** Скрипт берёт на себя всю тяжёлую работу по парсингу Swagger — resolve `$ref`, определение типов, классификацию моделей, извлечение описаний. Агент получает компактный JSON и только применяет шаблоны именования (Ktor-префикс) и записывает файлы. Это сокращает потребление токенов в разы по сравнению с передачей сырого Swagger JSON в контекст агента.

### 4.4 Определение имени фичи

Приоритет:
1. Явно указано в запросе: «для фичи **catalog**»
2. Извлекается из пути endpoint-а: `/api/v1/catalog/products` → `catalog`
3. Если невозможно определить → спросить пользователя

---

## 5. Конвенции именования (захардкожены)

### 5.1 Модели

| Слой | Префикс | Суффикс | Пример | Аннотации |
|------|---------|---------|--------|-----------|
| Data | `Ktor` | — | `KtorProduct` | `@Serializable`, `@SerialName` |
| Domain | — | — | `Product` | нет |

**Правило:** к имени из Swagger добавляется префикс `Ktor` для Data-слоя. Domain-модель = имя из Swagger без изменений.

### 5.2 Enum

| Слой | Пример | Особенности |
|------|--------|-------------|
| Data | `KtorProductStatus` | `@Serializable`, `@SerialName` на каждом значении, `UNKNOWN` fallback |
| Domain | `ProductStatus` | Чистый enum, `UNKNOWN` fallback |

### 5.3 Файлы

| Тип файла | Имя файла | Расположение |
|-----------|-----------|--------------|
| Data response-модель | `KtorProduct.kt` | `feature/{name}/data/model/` |
| Data request-модель | `KtorCreateProductRequest.kt` | `feature/{name}/data/model/` |
| Data enum | `KtorProductStatus.kt` | `feature/{name}/data/model/` |
| Domain модель | `Product.kt` | `feature/{name}/domain/model/` |
| Domain enum | `ProductStatus.kt` | `feature/{name}/domain/model/` |
| Mapper | `KtorProductMapper.kt` | `feature/{name}/data/model/` |

### 5.4 Mapper

- Extension-функция `.toDomain()` — единственное имя, без вариаций
- Обратный маппер (domain → data) **не генерируется**
- Файл маппера лежит рядом с data-моделью
- Маппер генерируется **только для response-моделей** (не для request)

---

## 6. Пакетная структура (по фичам)

```
{base_src_path}/{base_package_as_path}/feature/{feature_name}/
├── data/
│   └── model/
│       ├── KtorProduct.kt                  ← Response data model
│       ├── KtorCategory.kt                 ← Вложенная response data model
│       ├── KtorProductStatus.kt            ← Data enum
│       ├── KtorProductMapper.kt            ← Mapper (.toDomain())
│       ├── KtorCategoryMapper.kt           ← Mapper для вложенной модели
│       ├── KtorProductStatusMapper.kt      ← Mapper для enum
│       └── KtorCreateProductRequest.kt     ← Request data model (без маппера)
└── domain/
    └── model/
        ├── Product.kt                      ← Domain model
        ├── Category.kt                     ← Вложенная domain model
        └── ProductStatus.kt               ← Domain enum
```

**Пример пути:** `app/src/main/java/com/company/app/feature/catalog/data/model/KtorProduct.kt`

---

## 7. Правила генерации кода

### 7.1 Data модель (response)

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Product entity from the catalog
 */
@Serializable
data class KtorProduct(
    /** Unique product identifier */
    @SerialName("id") val id: Int,
    /** Display name of the product */
    @SerialName("product_name") val productName: String,
    /** Optional product description */
    @SerialName("description") val description: String? = null,
    @SerialName("price") val price: Double,
    /** Product category */
    @SerialName("category") val category: KtorCategory,
    /** Search tags */
    @SerialName("tags") val tags: List<String> = emptyList(),
    @SerialName("images") val images: List<KtorProductImage> = emptyList(),
    /** Creation timestamp in ISO 8601 */
    @SerialName("created_at") val createdAt: String,
    /** Current product status */
    @SerialName("status") val status: KtorProductStatus
)
```

**Правила:**
- `@SerialName` на каждом поле — всегда, даже если имя совпадает с JSON-ключом
- Nullable поля: `T? = null` (дефолт null)
- Nullable коллекции: `List<T> = emptyList()` (дефолт пустой список, а не null)
- Даты (format: date, date-time): всегда `String` (ISO 8601)
- Имена полей: camelCase (из snake_case JSON через `@SerialName`)
- **KDoc-комментарии**: если в Swagger у поля есть `description` — добавлять `/** описание */` перед полем. Если описания нет — комментарий не добавлять. Если у модели есть `description` — добавлять KDoc перед классом

### 7.2 Data модель (request)

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KtorCreateProductRequest(
    @SerialName("name") val name: String,
    @SerialName("price") val price: Double,
    @SerialName("category_id") val categoryId: Int
)
```

**Отличия от response:**
- Domain-модель НЕ генерируется
- Mapper НЕ генерируется
- В остальном правила аннотаций те же

### 7.3 Domain модель (только для response)

```kotlin
/**
 * Product entity from the catalog
 */
data class Product(
    /** Unique product identifier */
    val id: Int,
    /** Display name of the product */
    val productName: String,
    /** Optional product description */
    val description: String?,
    val price: Double,
    /** Product category */
    val category: Category,
    /** Search tags */
    val tags: List<String>,
    val images: List<ProductImage>,
    /** Creation timestamp in ISO 8601 */
    val createdAt: String,
    /** Current product status */
    val status: ProductStatus
)
```

**Правила:**
- Никаких аннотаций сериализации
- Nullable поля: `T?` (без дефолтного значения)
- Коллекции: `List<T>` (без дефолтного значения)
- Ссылки на другие модели — domain-имена (без `Ktor` префикса)
- **KDoc-комментарии**: те же что и в Data-модели — переносятся 1:1

### 7.4 Enum (data)

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Possible product statuses
 */
@Serializable
enum class KtorProductStatus {
    @SerialName("active") ACTIVE,
    @SerialName("archived") ARCHIVED,
    @SerialName("draft") DRAFT,
    UNKNOWN
}
```

**Правила:**
- Значения в SCREAMING_SNAKE_CASE
- `@SerialName` с оригинальным значением из Swagger
- Обязательный `UNKNOWN` — fallback для неизвестных значений (без `@SerialName`)
- KDoc-комментарий на классе — если есть `description` у enum-схемы в Swagger

### 7.5 Enum (domain)

```kotlin
enum class ProductStatus {
    ACTIVE,
    ARCHIVED,
    DRAFT,
    UNKNOWN
}
```

### 7.6 Mapper

```kotlin
// Файл: KtorProductMapper.kt
// Расположение: рядом с data-моделью в feature/{name}/data/model/

fun KtorProduct.toDomain(): Product = Product(
    id = id,
    name = name,
    description = description,
    price = price,
    category = category.toDomain(),
    tags = tags,
    images = images.map { it.toDomain() },
    createdAt = createdAt,
    status = status.toDomain()
)
```

```kotlin
// Файл: KtorProductStatusMapper.kt

fun KtorProductStatus.toDomain(): ProductStatus = when (this) {
    KtorProductStatus.ACTIVE -> ProductStatus.ACTIVE
    KtorProductStatus.ARCHIVED -> ProductStatus.ARCHIVED
    KtorProductStatus.DRAFT -> ProductStatus.DRAFT
    KtorProductStatus.UNKNOWN -> ProductStatus.UNKNOWN
}
```

**Правила маппера:**
- Имя функции: всегда `.toDomain()` — без вариаций
- Обратный маппер (domain → data) НЕ генерируется
- Для вложенных объектов: вызов `.toDomain()` рекурсивно
- Для списков: `.map { it.toDomain() }`
- Для enum: `when` с перечислением всех значений
- Каждый маппер в отдельном файле `Ktor{Name}Mapper.kt`

---

## 8. Таблица маппинга типов

| JSON Schema type | format | Kotlin тип (Data) | Kotlin тип (Domain) |
|-----------------|--------|-------------------|---------------------|
| `string` | — | `String` | `String` |
| `string` | `date` | `String` | `String` |
| `string` | `date-time` | `String` | `String` |
| `string` | `uuid` | `String` | `String` |
| `string` | `email` | `String` | `String` |
| `string` + `enum` | — | `enum class` с `UNKNOWN` | `enum class` с `UNKNOWN` |
| `integer` | — / `int32` | `Int` | `Int` |
| `integer` | `int64` | `Long` | `Long` |
| `number` | — / `double` | `Double` | `Double` |
| `number` | `float` | `Float` | `Float` |
| `boolean` | — | `Boolean` | `Boolean` |
| `array` | items: T | `List<KtorT> = emptyList()` | `List<T>` |
| `object` | — | `KtorT` (data class) | `T` (data class) |
| `$ref` | — | `KtorRefName` | `RefName` |
| nullable любой | — | `T? = null` | `T?` |

---

## 9. Обработка сложных случаев

### 9.1 Обёртки ответов
Сервер может отдавать ответы как напрямую, так и в обёртке (`{ "data": {...}, "error": null }`).
Агент должен:
- Анализировать Swagger-схему response для каждого endpoint
- Если обнаружена обёртка — генерировать generic-класс `KtorApiResponse<T>` или аналог
- Если нет обёртки — работать с моделью напрямую

### 9.2 Вложенные объекты
- Каждый вложенный `$ref` → отдельный Kotlin-файл
- Inline-объекты (без `$ref`) → отдельный класс с именем по контексту (например `KtorProductCategory`)

### 9.3 allOf (композиция)
- Объединить свойства всех схем в один data class
- Все обязательные поля из всех составных частей

### 9.4 oneOf / anyOf (полиморфизм)
- Если есть `discriminator` → `sealed class` + `@JsonClassDiscriminator`
- Если нет discriminator → `JsonElement` (отложенный парсинг)

### 9.5 Circular references
- Разорвать цикл через nullable-поле: `val parent: KtorCategory? = null`

### 9.6 Reserved keywords
- Kotlin reserved words в именах полей → backtick-экранирование: `` val `object`: String ``
- Или переименование через `@SerialName`

### 9.7 additionalProperties
- `additionalProperties: true` → `Map<String, JsonElement>`
- `additionalProperties: { type: string }` → `Map<String, String>`

---

## 10. Конфигурация (.env)

```env
# Swagger/OpenAPI JSON endpoint URL with basic auth
# Формат: https://login:password@host/swagger-json-path
SWAGGER_URL=https://login:password@your-host.example.com/get-swagger-model
```

- Файл `.env` размещается в корне Android-проекта
- Скрипт автоматически ищет `.env` от CWD вверх на 2 уровня
- `.env` добавлен в `.gitignore` — не коммитится

---

## 11. Определение структуры проекта

Агент должен автоматически определять:
1. **base_src_path** — путь к исходникам (обычно `app/src/main/java`)
2. **base_package** — базовый пакет приложения (из `applicationId` в `build.gradle.kts`)

Если не удаётся определить автоматически — спросить пользователя.

---

## 12. Обработка конфликтов

Если файл модели уже существует в проекте:
- Агент **спрашивает пользователя**: перезаписать или пропустить
- Никогда не перезаписывает молча

---

## 13. Компонент: Skill (`skills/swagger-kotlin-conventions/`)

### 13.1 SKILL.md
Содержит все правила из разделов 5–9 этого ТЗ в формате, удобном для агента:
- Конвенции именования
- Правила генерации каждого типа файлов
- Таблица маппинга типов
- Обработка сложных случаев

### 13.2 Примеры (`examples/`)

**response-model.kt** — полный пример response-модели:
- Data model с `@Serializable`, вложенными типами, enum, nullable, списками
- Domain model без аннотаций
- Mapper с `.toDomain()` включая enum-маппинг и списки

**request-model.kt** — пример request-модели:
- Только Data model с `@Serializable`
- Без Domain и Mapper

### 13.3 Справочники (`references/`)

**type-mapping.md** — полная таблица маппинга JSON Schema → Kotlin (из раздела 8)

**edge-cases.md** — решения для сложных случаев (из раздела 9):
- Полиморфизм, circular refs, reserved keywords
- additionalProperties, обёртки ответов
- Примеры кода для каждого случая

---

## 14. Файлы плагина

### 14.1 plugin.json
```json
{
  "name": "swagger-android",
  "version": "1.0.0",
  "description": "Generate Android Kotlin data models from Swagger/OpenAPI specifications",
  "license": "MIT",
  "keywords": ["android", "kotlin", "swagger", "openapi", "models", "codegen", "kotlinx-serialization"]
}
```

### 14.2 marketplace.json
```json
{
  "name": "swagger-android",
  "owner": {
    "name": "Sergey Gorban",
    "email": "gorban.dev@gmail.com"
  },
  "description": "Android Kotlin model generator from Swagger/OpenAPI — auto-generates Data/Domain/Mapper layers",
  "plugins": [
    {
      "name": "swagger-android",
      "description": "Generate three-layer Kotlin model stack (Data/Domain/Mapper) from Swagger/OpenAPI with kotlinx.serialization",
      "source": "./",
      "version": "1.0.0",
      "category": "development",
      "skills": ["./skills/swagger-kotlin-conventions"]
    }
  ]
}
```

### 14.3 .gitignore
```
.env
.claude/*.local.md
.DS_Store
node_modules/
```

### 14.4 .env.example
```env
# Swagger/OpenAPI JSON endpoint URL with basic auth
# Format: https://login:password@host/swagger-json-path
SWAGGER_URL=https://login:password@your-host.example.com/get-swagger-model
```

---

## 15. README.md

README должен содержать:
1. Краткое описание плагина
2. Установка (через маркетплейс)
3. Настройка `.env`
4. Примеры использования (запросы к агенту)
5. Описание генерируемой структуры файлов
6. Конвенции именования
