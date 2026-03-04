# Edge Cases Reference

Solutions for complex Swagger/OpenAPI patterns when generating Kotlin code.

---

## 1. Response Wrappers

**Problem:** Many APIs wrap all responses in a generic envelope:
```json
{
  "data": { "id": 1, "name": "Product" },
  "error": null,
  "meta": { "total": 100 }
}
```

**Swagger definition:**
```json
{
  "ApiResponse": {
    "type": "object",
    "properties": {
      "data": { "$ref": "#/definitions/Product" },
      "error": { "type": "string", "nullable": true },
      "meta": { "$ref": "#/definitions/PageMeta" }
    }
  }
}
```

**Solution:** Generate a generic wrapper class once, reuse for all endpoints:

```kotlin
// KtorApiResponse.kt — Data layer
@Serializable
data class KtorApiResponse<T>(
    @SerialName("data") val data: T? = null,
    @SerialName("error") val error: String? = null,
    @SerialName("meta") val meta: KtorPageMeta? = null
)

// ApiResponse.kt — Domain layer
data class ApiResponse<T>(
    val data: T?,
    val error: String?,
    val meta: PageMeta?
)

// KtorApiResponseMapper.kt
fun <T, D> KtorApiResponse<T>.toDomain(mapData: (T) -> D): ApiResponse<D> = ApiResponse(
    data = data?.let(mapData),
    error = error,
    meta = meta?.toDomain()
)
```

---

## 2. Inline Nested Objects

**Problem:** A property is defined inline as an anonymous object rather than a `$ref`:
```json
{
  "Product": {
    "properties": {
      "dimensions": {
        "type": "object",
        "properties": {
          "width": { "type": "number" },
          "height": { "type": "number" }
        }
      }
    }
  }
}
```

**Solution:** The script extracts inline objects as separate named models using the parent name + field name. The agent generates them as standalone files:

```kotlin
// KtorProductDimensions.kt
@Serializable
data class KtorProductDimensions(
    @SerialName("width") val width: Double,
    @SerialName("height") val height: Double
)

// KtorProduct.kt references it
@Serializable
data class KtorProduct(
    @SerialName("dimensions") val dimensions: KtorProductDimensions? = null
)
```

---

## 3. allOf Composition

**Problem:** A schema composes multiple schemas:
```json
{
  "PremiumProduct": {
    "allOf": [
      { "$ref": "#/definitions/Product" },
      {
        "type": "object",
        "properties": {
          "discount": { "type": "number" },
          "exclusive": { "type": "boolean" }
        }
      }
    ]
  }
}
```

**Solution:** The script merges all properties into a single flat model. Generate as a single data class with all merged fields:

```kotlin
@Serializable
data class KtorPremiumProduct(
    // Fields from Product (merged)
    @SerialName("id") val id: Int,
    @SerialName("name") val name: String,
    // Fields added by allOf extension
    @SerialName("discount") val discount: Double,
    @SerialName("exclusive") val exclusive: Boolean
)
```

---

## 4. oneOf / anyOf with Discriminator (Polymorphism)

**Problem:** A field can be one of several types, identified by a discriminator field:
```json
{
  "Animal": {
    "oneOf": [
      { "$ref": "#/definitions/Dog" },
      { "$ref": "#/definitions/Cat" }
    ],
    "discriminator": {
      "propertyName": "type"
    }
  }
}
```

**Solution:** Generate as a `sealed class` hierarchy:

```kotlin
// KtorAnimal.kt — Data layer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator

@Serializable
@JsonClassDiscriminator("type")
sealed class KtorAnimal

@Serializable
@SerialName("dog")
data class KtorDog(
    @SerialName("name") val name: String,
    @SerialName("breed") val breed: String
) : KtorAnimal()

@Serializable
@SerialName("cat")
data class KtorCat(
    @SerialName("name") val name: String,
    @SerialName("indoor") val indoor: Boolean
) : KtorAnimal()

// Animal.kt — Domain layer
sealed class Animal

data class Dog(
    val name: String,
    val breed: String
) : Animal()

data class Cat(
    val name: String,
    val indoor: Boolean
) : Animal()

// KtorAnimalMapper.kt
fun KtorAnimal.toDomain(): Animal = when (this) {
    is KtorDog -> Dog(name = name, breed = breed)
    is KtorCat -> Cat(name = name, indoor = indoor)
}
```

---

## 5. oneOf / anyOf without Discriminator

**Problem:** A field can be multiple types but there is no discriminator to determine which.

**Solution:** Use `JsonElement` in Data layer, `Any?` in Domain layer. Add a comment explaining why:

```kotlin
// Data model
@Serializable
data class KtorWebhookPayload(
    @SerialName("event") val event: String,
    // Dynamic payload — type depends on "event" value
    @SerialName("data") val data: JsonElement? = null
)

// Domain model
data class WebhookPayload(
    val event: String,
    // Dynamic payload — parse manually based on event type
    val data: Any?
)

// Mapper
fun KtorWebhookPayload.toDomain(): WebhookPayload = WebhookPayload(
    event = event,
    data = data // Pass JsonElement as-is; caller parses it
)
```

---

## 6. Circular References

**Problem:** Model A has a field of type B, and model B has a field of type A:
```json
{
  "Category": {
    "properties": {
      "parent": { "$ref": "#/definitions/Category" },
      "children": { "items": { "$ref": "#/definitions/Category" } }
    }
  }
}
```

**Solution:** Break the cycle by making the back-reference nullable (nullable=true):

```kotlin
// KtorCategory.kt
@Serializable
data class KtorCategory(
    @SerialName("id") val id: Int,
    @SerialName("name") val name: String,
    // Nullable to break circular reference
    @SerialName("parent") val parent: KtorCategory? = null,
    @SerialName("children") val children: List<KtorCategory> = emptyList()
)

// Category.kt
data class Category(
    val id: Int,
    val name: String,
    val parent: Category?,
    val children: List<Category>
)
```

---

## 7. Kotlin Reserved Words as Field Names

**Problem:** Swagger has a field named with a Kotlin keyword: `object`, `class`, `fun`, `in`, `is`, `as`, `when`, `return`, `if`, `else`, `for`, `while`, `do`, `try`, `catch`, `finally`, `throw`, `new`, `this`, `super`, `null`, `true`, `false`, `val`, `var`, `by`, `where`, `interface`, `abstract`, `override`, `open`, `sealed`, `data`, `enum`, `annotation`, `companion`, `object`

**Solution:** Wrap in backticks OR rename the Kotlin field and keep the original in `@SerialName`:

```kotlin
// Option A: backtick escaping (preserves exact name)
@Serializable
data class KtorApiResponse(
    @SerialName("object") val `object`: String,
    @SerialName("class") val `class`: String? = null
)

// Option B: rename (cleaner, preferred when name is ambiguous)
@Serializable
data class KtorApiResponse(
    @SerialName("object") val objectType: String,
    @SerialName("class") val objectClass: String? = null
)
```

**Preference:** Option B (renaming) is preferred for readability. Option A is acceptable if the exact field name must be preserved in Kotlin.

---

## 8. additionalProperties

**Problem:** Schema allows arbitrary extra fields.

**Case A: `additionalProperties: true`** — any additional properties allowed:
```kotlin
@Serializable
data class KtorMetadata(
    @SerialName("version") val version: String,
    // Additional arbitrary properties
    @SerialName("extra") val extra: Map<String, JsonElement> = emptyMap()
)
```

**Case B: `additionalProperties: { type: string }`** — typed extra properties:
```kotlin
@Serializable
data class KtorLabels(
    @SerialName("required_label") val requiredLabel: String,
    // Additional string properties
    @SerialName("labels") val labels: Map<String, String> = emptyMap()
)
```

**Case C: Schema IS just `additionalProperties` (no other properties)**:
```kotlin
// The entire model is a map
typealias KtorStringMap = Map<String, String>
// Or as a data class wrapping the map if needed
```

---

## 9. Empty or Minimal Schemas

**Problem:** A schema has no properties (e.g., used as a marker type):
```json
{ "EmptyResponse": { "type": "object" } }
```

**Solution:** Generate as an empty data class:
```kotlin
@Serializable
data class KtorEmptyResponse(
    val placeholder: Unit = Unit  // Required for data class
)

// Or simply as an object if truly empty
@Serializable
class KtorEmptyResponse
```

---

## 10. Nullable Collections

**Problem:** Swagger says array is nullable.

**Rule:**
- Required AND nullable=false → `List<T> = emptyList()` in Data, `List<T>` in Domain
- Not required OR nullable=true → `List<T>? = null` in Data, `List<T>?` in Domain

```kotlin
// Data model
@SerialName("tags") val tags: List<String> = emptyList(),        // required, not nullable
@SerialName("badges") val badges: List<String>? = null,          // optional/nullable

// Domain model
val tags: List<String>,       // required
val badges: List<String>?,    // optional
```
