# swagger-android

Claude Code plugin for generating Android Kotlin data models from Swagger/OpenAPI specifications.

Automatically produces a full three-layer architecture stack:
- **Data layer** — `@Serializable` data classes with `kotlinx.serialization` annotations (`KtorProduct`)
- **Domain layer** — clean Kotlin data classes without serialization concerns (`Product`)
- **Mapper** — extension functions `.toDomain()` connecting the two layers (`KtorProductMapper.kt`)

---

## Installation

Install via the Claude Code Marketplace:

```
/plugins install swagger-android
```

Or install from GitHub (once published):

```
/plugins install github:gorban-dev/swagger-android
```

---

## Setup

Create a `.env` file in the root of your Android project:

```env
SWAGGER_URL=https://login:password@your-host.example.com/swagger-json-path
```

The plugin automatically searches for `.env` in the current directory and up to 2 parent directories.

See `.env.example` for reference. The `.env` file is listed in `.gitignore` and is never committed.

---

## Usage

Talk to the agent using natural language. The agent understands Russian and English.

### List available endpoints

```
Покажи все endpoint-ы в Swagger
```
```
Show me all available Swagger endpoints
```

### Generate models for a feature

```
Сгенерируй модели для фичи catalog: GET /api/products, GET /api/products/{id}
```
```
Generate models for the cart feature: POST /cart/add, GET /cart, DELETE /cart/{id}
```
```
Создай data-классы для авторизации — POST /auth/login, POST /auth/refresh
```

### Override URL per request

```
Сгенерируй модели для GET /orders — используй https://login:pass@staging.example.com/api-docs
```

---

## Generated File Structure

For a feature named `catalog` with models `Product` and `Category` from the base package `com.company.app`:

```
app/src/main/java/com/company/app/feature/catalog/
├── data/
│   └── model/
│       ├── KtorProduct.kt              # Data model (@Serializable)
│       ├── KtorCategory.kt             # Nested data model
│       ├── KtorProductStatus.kt        # Data enum
│       ├── KtorProductMapper.kt        # Mapper: .toDomain()
│       ├── KtorCategoryMapper.kt       # Mapper: .toDomain()
│       └── KtorProductStatusMapper.kt  # Enum mapper
└── domain/
    └── model/
        ├── Product.kt                  # Domain model
        ├── Category.kt                 # Nested domain model
        └── ProductStatus.kt            # Domain enum
```

Request models (e.g., `CreateProductRequest`) generate only the Data layer file — no Domain model or Mapper.

---

## Naming Conventions

| Layer | Rule | Example |
|-------|------|---------|
| Data model | `Ktor` prefix | `KtorProduct` |
| Domain model | Plain name | `Product` |
| Data enum | `Ktor` prefix | `KtorProductStatus` |
| Domain enum | Plain name | `ProductStatus` |
| Mapper | `Ktor` prefix + `Mapper` suffix | `KtorProductMapper.kt` |

---

## Code Examples

### Data model

```kotlin
@Serializable
data class KtorProduct(
    /** Unique product identifier */
    @SerialName("id") val id: Int,
    /** Display name of the product */
    @SerialName("product_name") val productName: String,
    /** Optional product description */
    @SerialName("description") val description: String? = null,
    @SerialName("tags") val tags: List<String> = emptyList(),
    /** Current product status */
    @SerialName("status") val status: KtorProductStatus
)
```

### Domain model

```kotlin
data class Product(
    /** Unique product identifier */
    val id: Int,
    /** Display name of the product */
    val productName: String,
    /** Optional product description */
    val description: String?,
    val tags: List<String>,
    /** Current product status */
    val status: ProductStatus
)
```

### Mapper

```kotlin
fun KtorProduct.toDomain(): Product = Product(
    id = id,
    productName = productName,
    description = description,
    tags = tags,
    status = status.toDomain()
)
```

---

## Key Behaviors

- **KDoc comments** from Swagger `description` fields are placed on classes and individual fields
- **`@SerialName`** is added to every field, even when the JSON key matches the Kotlin field name
- **`UNKNOWN` fallback** is always added to every generated enum
- **Conflict detection** — the agent asks before overwriting any existing file
- **Feature name inference** — derived from endpoint path if not explicitly stated
- **Zero npm dependencies** — the Node.js script uses only built-in modules

---

## Requirements

- Node.js 18 or later
- Claude Code with plugin support
- A Swagger 2.0 or OpenAPI 3.0/3.1 specification URL

---

## License

MIT — see [LICENSE](LICENSE)
