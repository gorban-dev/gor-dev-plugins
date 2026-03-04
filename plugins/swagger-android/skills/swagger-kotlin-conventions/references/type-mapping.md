# Type Mapping Reference: JSON Schema → Kotlin

This table defines how the `get-swagger-models.js` script converts JSON Schema types to Kotlin types. The agent reads these types from the script's `kotlinType` field and applies the `Ktor`-prefix rules when generating Data/Domain layers.

---

## Primary Type Table

| JSON Schema `type` | `format` | Script `kotlinType` | Data layer | Domain layer |
|--------------------|----------|---------------------|------------|--------------|
| `string` | _(none)_ | `String` | `String` | `String` |
| `string` | `date` | `String` | `String` | `String` |
| `string` | `date-time` | `String` | `String` | `String` |
| `string` | `uuid` | `String` | `String` | `String` |
| `string` | `email` | `String` | `String` | `String` |
| `string` | `uri` | `String` | `String` | `String` |
| `string` | `byte` | `String` | `String` | `String` |
| `string` | `binary` | `String` | `String` | `String` |
| `string` + `enum` values | _(any)_ | `enum:EnumName` | `KtorEnumName` | `EnumName` |
| `integer` | _(none)_ | `Int` | `Int` | `Int` |
| `integer` | `int32` | `Int` | `Int` | `Int` |
| `integer` | `int64` | `Long` | `Long` | `Long` |
| `number` | _(none)_ | `Double` | `Double` | `Double` |
| `number` | `double` | `Double` | `Double` | `Double` |
| `number` | `float` | `Float` | `Float` | `Float` |
| `boolean` | _(any)_ | `Boolean` | `Boolean` | `Boolean` |
| `array` (items: primitive) | — | `List<KotlinType>` | `List<KotlinType>` | `List<KotlinType>` |
| `array` (items: `$ref`) | — | `List<ref:ModelName>` | `List<KtorModelName>` | `List<ModelName>` |
| `array` (items: enum) | — | `List<enum:EnumName>` | `List<KtorEnumName>` | `List<EnumName>` |
| `object` with `$ref` | — | `ref:ModelName` | `KtorModelName` | `ModelName` |
| inline `object` | — | `ref:InlineName` | `KtorInlineName` | `InlineName` |
| `additionalProperties: true` | — | `Map<String, JsonElement>` | `Map<String, JsonElement>` | `Map<String, Any?>` |
| `additionalProperties: {type}` | — | `Map<String, T>` | `Map<String, T>` | `Map<String, T>` |
| `oneOf`/`anyOf` (no discriminator) | — | `JsonElement` | `JsonElement` | `Any?` |
| `oneOf`/`anyOf` (with discriminator) | — | `sealed:SealedName` | `sealed class KtorSealedName` | `sealed class SealedName` |
| unknown / no type | — | `Any` | `Any` | `Any` |

---

## Nullability Rules

| Condition | Data layer | Domain layer |
|-----------|------------|--------------|
| Field is in `required` array AND `nullable != true` | `Type` (no default) | `Type` (no default) |
| Field NOT in `required` OR `nullable: true` | `Type? = null` | `Type?` |
| List field, NOT nullable | `List<T> = emptyList()` | `List<T>` |
| List field, nullable | `List<T>? = null` | `List<T>?` |

---

## Date and Time

All date/time formats map to `String`. The application layer is responsible for parsing.

```kotlin
// Data model — always String
@SerialName("created_at") val createdAt: String

// Domain model — always String
val createdAt: String
```

No automatic conversion to `java.time.LocalDate`, `Instant`, or any date library type.

---

## Notes on Integer Types

- `integer` with no format → `Int` (safe default for most API IDs)
- `integer` with `format: int64` → `Long` (required for Unix timestamps, large IDs)
- If unsure about overflow — prefer `Long`

---

## Notes on Number Types

- `number` with no format → `Double` (safe default)
- `number` with `format: float` → `Float` (use only when spec explicitly states float)
- Monetary values in the spec are typically `Double` unless spec says otherwise

---

## Enum Handling

Swagger enum:
```json
{ "type": "string", "enum": ["active", "archived", "draft"] }
```

Script output:
```json
{
  "name": "ProductStatus",
  "kind": "enum",
  "values": [
    { "jsonValue": "active", "kotlinName": "ACTIVE" },
    { "jsonValue": "archived", "kotlinName": "ARCHIVED" },
    { "jsonValue": "draft", "kotlinName": "DRAFT" }
  ]
}
```

Generated Kotlin (Data):
```kotlin
@Serializable
enum class KtorProductStatus {
    @SerialName("active") ACTIVE,
    @SerialName("archived") ARCHIVED,
    @SerialName("draft") DRAFT,
    UNKNOWN
}
```

Generated Kotlin (Domain):
```kotlin
enum class ProductStatus {
    ACTIVE,
    ARCHIVED,
    DRAFT,
    UNKNOWN
}
```
