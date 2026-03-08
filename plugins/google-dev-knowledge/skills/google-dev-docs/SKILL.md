---
name: google-dev-docs
version: 1.0.0
description: This skill should be used when the user asks about official Google developer documentation, including Android, Firebase, Google Cloud, Chrome Extensions, Flutter, Dart, TensorFlow, Google AI (Gemini), web.dev, Google Ads, or Google Maps Platform. Triggers on questions like "how do I use Jetpack Compose", "Firebase Auth setup", "Cloud Run deployment guide", "Firestore security rules", "Flutter state management", "Chrome extension manifest v3", "TensorFlow model serving", "Gemini API tutorial", or troubleshooting errors from Google services.
---

# Google Developer Knowledge

Real-time access to official Google developer documentation via the Developer Knowledge API.

## Tool Catalog (3 tools)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `search_documents` | Search across all supported Google documentation domains | Finding relevant docs by topic, API name, error message, or concept |
| `get_document` | Retrieve full content of a specific document by name | Reading a known document after finding it via search |
| `batch_get_documents` | Retrieve multiple documents in a single request (up to 100) | Deep research requiring content from several related pages |

## Supported Domains

| Domain | Topics |
|--------|--------|
| Android Developers | Jetpack, Compose, Architecture, Kotlin, NDK, Play |
| Firebase | Auth, Firestore, Realtime DB, Cloud Functions, Crashlytics, Remote Config |
| Google Cloud | GKE, Cloud Run, BigQuery, Pub/Sub, IAM, Terraform on GCP |
| Chrome Extensions | Manifest V3, APIs, Web Store, DevTools |
| Flutter | Widgets, State management, Platform channels, Packages |
| Dart | Language, Core libraries, Package ecosystem |
| TensorFlow | Keras, TFLite, TF Serving, TFX pipelines |
| Google AI (Gemini) | Gemini API, AI Studio, Model tuning, Embeddings |
| web.dev | Core Web Vitals, PWA, Performance, Accessibility |
| Google Ads | Google Ads API, Campaign management, Reporting |
| Google Maps Platform | Maps SDK, Places API, Routes API, Geocoding |

## Critical Patterns

### Document Name Format
Documents returned by `search_documents` include a `name` field (e.g., `documents/firebase--firestore--manage-data--add-data`). Use this exact value with `get_document` and `batch_get_documents`.

### Parent Field
The `search_documents` tool accepts an optional `parent` parameter to scope searches to a specific domain. Example: `search_documents(query: "auth email link", parent: "firebase")`. The `documents/` prefix is not needed — pass the domain key directly (e.g., `android`, `firebase`, `cloud`, `flutter`).

### Effective Queries
- Use specific API/class names: `"Jetpack Compose LazyColumn"` not `"list in Android"`
- Include product context: `"Firebase Auth email link sign-in"` not `"email login"`
- For errors, include the error text: `"PERMISSION_DENIED Cloud Storage rules"`
- Combine topic + action: `"Flutter platform channel invoke method"`

### Batch Limits
`batch_get_documents` accepts up to **100** document names per request. Group related documents for efficient retrieval.

## Workflows

See [workflows.md](references/workflows.md) for detailed workflow patterns:
- Quick Lookup
- Deep Research
- Code-Aware Lookup
- Error Troubleshooting
- Migration Guide Research
