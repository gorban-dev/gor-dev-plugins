---
name: swagger-kotlin-conventions
description: Rules and conventions for generating Android Kotlin data models, domain models, enums and mappers from Swagger/OpenAPI specifications. Used by the swagger-model-generator agent.
---

# Skill: swagger-kotlin-conventions

Rules for generating Android Kotlin models from Swagger/OpenAPI data.
This skill is used by the `swagger-model-generator` agent.

---

## 1. Naming Conventions

### 1.1 Class Names

| Layer | Rule | Example |
|-------|------|---------|
| Data model | `Ktor` prefix + Swagger name | `KtorProduct`, `KtorCreateProductRequest` |
| Domain model | Swagger name, no changes | `Product` |
| Data enum | `Ktor` prefix + Swagger name | `KtorProductStatus` |
| Domain enum | Swagger name, no changes | `ProductStatus` |

### 1.2 File Names

| File type | Name | Location |
|-----------|------|----------|
| Data response model | `KtorProduct.kt` | `feature/{name}/data/model/` |
| Data request model | `KtorCreateProductRequest.kt` | `feature/{name}/data/model/` |
| Data enum | `KtorProductStatus.kt` | `feature/{name}/data/model/` |
| Domain model | `Product.kt` | `feature/{name}/domain/model/` |
| Domain enum | `ProductStatus.kt` | `feature/{name}/domain/model/` |
| Mapper | `KtorProductMapper.kt` | `feature/{name}/data/model/` |
| Enum mapper | `KtorProductStatusMapper.kt` | `feature/{name}/data/model/` |

### 1.3 Package Structure

```
{base_package}.feature.{feature_name}.data.model
{base_package}.feature.{feature_name}.domain.model
```

Example: `com.company.app.feature.catalog.data.model`

---

## 2. Data Model (Response)

```kotlin
package com.company.app.feature.catalog.data.model

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

**Rules:**
- `@Serializable` on the class
- `@SerialName("jsonKey")` on EVERY field — even when `jsonKey == kotlinName`
- Field name: camelCase (from snake_case or kebab-case JSON key)
- `nullable=true` → `Type? = null`
- `nullable=false` + List type → `List<Type> = emptyList()`
- `nullable=false` + non-list → `Type` (no default)
- `description != null` → `/** description */` comment before field
- `description == null` → no comment
- Model `description != null` → `/** description */` KDoc before class

---

## 3. Data Model (Request)

```kotlin
package com.company.app.feature.catalog.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KtorCreateProductRequest(
    @SerialName("name") val name: String,
    @SerialName("price") val price: Double,
    @SerialName("category_id") val categoryId: Int
)
```

**Rules (differences from response):**
- Same annotation rules as response
- NO Domain model generated
- NO Mapper generated

---

## 4. Domain Model (Response only)

```kotlin
package com.company.app.feature.catalog.domain.model

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

**Rules:**
- No `@Serializable`, no `@SerialName` — pure domain class
- All type references use plain names (no `Ktor` prefix)
- `nullable=true` → `Type?` (no `= null` default)
- Lists → `List<Type>` (no `= emptyList()` default)
- KDoc comments transferred 1:1 from the Data model

---

## 5. Enum (Data)

```kotlin
package com.company.app.feature.catalog.data.model

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

**Rules:**
- `@Serializable` on the class
- `@SerialName("originalJsonValue")` on every value EXCEPT `UNKNOWN`
- Enum values: SCREAMING_SNAKE_CASE
- `UNKNOWN` is always the last value — no `@SerialName`
- KDoc on class if `description != null`

---

## 6. Enum (Domain)

```kotlin
package com.company.app.feature.catalog.domain.model

enum class ProductStatus {
    ACTIVE,
    ARCHIVED,
    DRAFT,
    UNKNOWN
}
```

**Rules:**
- No annotations
- Same values as Data enum
- `UNKNOWN` always present

---

## 7. Mapper (Response model)

```kotlin
package com.company.app.feature.catalog.data.model

fun KtorProduct.toDomain(): Product = Product(
    id = id,
    productName = productName,
    description = description,
    price = price,
    category = category.toDomain(),
    tags = tags,
    images = images.map { it.toDomain() },
    createdAt = createdAt,
    status = status.toDomain()
)
```

**Rules:**
- Extension function: `fun KtorModel.toDomain(): Model = Model(`
- Function name is ALWAYS `.toDomain()` — no variations
- No reverse mapper (domain → data)
- Primitives and strings: `field = field`
- `ref:` types → `field = field.toDomain()`
- `List<ref:>` → `field = field.map { it.toDomain() }`
- `enum:` → `field = field.toDomain()`
- Nullable `ref:` → `field = field?.toDomain()`
- Nullable `List<ref:>` → `field = field?.map { it.toDomain() }`
- One mapper file per model: `KtorProductMapper.kt`
- File location: same `data/model/` folder as the data model

---

## 8. Enum Mapper

```kotlin
package com.company.app.feature.catalog.data.model

fun KtorProductStatus.toDomain(): ProductStatus = when (this) {
    KtorProductStatus.ACTIVE -> ProductStatus.ACTIVE
    KtorProductStatus.ARCHIVED -> ProductStatus.ARCHIVED
    KtorProductStatus.DRAFT -> ProductStatus.DRAFT
    KtorProductStatus.UNKNOWN -> ProductStatus.UNKNOWN
}
```

**Rules:**
- `when` expression with exhaustive mapping
- Every value explicitly mapped (including `UNKNOWN`)
- One file per enum: `KtorProductStatusMapper.kt`

---

## 9. kotlinType Reference (from script output)

The script outputs `kotlinType` values with these formats. Apply prefix rules when generating code:

| Script `kotlinType` | Data layer | Domain layer |
|---------------------|------------|--------------|
| `"Int"` | `Int` | `Int` |
| `"Long"` | `Long` | `Long` |
| `"Double"` | `Double` | `Double` |
| `"Float"` | `Float` | `Float` |
| `"Boolean"` | `Boolean` | `Boolean` |
| `"String"` | `String` | `String` |
| `"ref:Product"` | `KtorProduct` | `Product` |
| `"enum:ProductStatus"` | `KtorProductStatus` | `ProductStatus` |
| `"List<String>"` | `List<String>` | `List<String>` |
| `"List<ref:Product>"` | `List<KtorProduct>` | `List<Product>` |
| `"List<enum:Status>"` | `List<KtorStatus>` | `List<Status>` |
| `"Map<String, JsonElement>"` | `Map<String, JsonElement>` | `Map<String, Any?>` |
| `"Map<String, String>"` | `Map<String, String>` | `Map<String, String>` |
| `"JsonElement"` | `JsonElement` | `Any?` |
| `"sealed:Name"` | `sealed class KtorName` | `sealed class Name` |
| `"Any"` | `Any` | `Any` |

---

## 10. Complex Cases

See `references/edge-cases.md` for detailed guidance on:
- Response wrappers (ApiResponse\<T\>)
- Inline nested objects
- allOf composition
- oneOf/anyOf polymorphism
- Circular references
- Kotlin reserved words as field names
- additionalProperties

---

## 11. File Generation Checklist

For each model, verify before writing:

**Data model:**
- [ ] `@Serializable` annotation on class
- [ ] `@SerialName` on every single field (no exceptions)
- [ ] `Ktor` prefix on all reference types
- [ ] Correct imports: `kotlinx.serialization.SerialName`, `kotlinx.serialization.Serializable`
- [ ] Nullable fields have `= null` default
- [ ] List fields have `= emptyList()` default
- [ ] KDoc only on fields/classes with non-null description

**Domain model:**
- [ ] No serialization imports or annotations
- [ ] No `Ktor` prefix on any type
- [ ] Nullable fields are `Type?` without default value
- [ ] Lists are `List<Type>` without default value

**Mapper:**
- [ ] Function name is exactly `.toDomain()`
- [ ] All fields mapped
- [ ] Nested objects call `.toDomain()`
- [ ] Lists use `.map { it.toDomain() }`
- [ ] No reverse mapper exists

**Enum:**
- [ ] `UNKNOWN` value present in both Data and Domain
- [ ] `@SerialName` on all enum values except `UNKNOWN`
- [ ] Enum mapper covers all values exhaustively
