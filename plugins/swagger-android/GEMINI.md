# swagger-android

Generate Android Kotlin data models from Swagger/OpenAPI specifications.

## When to use

- User asks to generate Kotlin data classes from Swagger / OpenAPI endpoints
- User mentions a feature name with API paths (e.g. "models for catalog: GET /api/products")
- User asks to list available Swagger endpoints

## How

The `swagger-model-generator` agent fetches the Swagger schema, parses endpoints, and generates Kotlin files following project conventions (kotlinx-serialization).

The `swagger-kotlin-conventions` skill encodes naming, package, and serialization rules.

`scripts/get-swagger-models.js` is the underlying schema fetcher.
