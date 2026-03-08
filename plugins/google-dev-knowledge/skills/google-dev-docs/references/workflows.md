# Workflows

## 1. Quick Lookup

Fast answer to a specific question using official docs.

```
1. search_documents(query: "<specific API or concept>")
2. get_document(name: "<best match from results>")
3. Answer the user's question based on document content
```

**Example:** "How do I set up Firebase Remote Config in Android?"
→ Search `"Firebase Remote Config Android setup"` → get top result → provide steps.

## 2. Deep Research

Comprehensive analysis requiring multiple sources.

```
1. search_documents(query: "<broad topic>")
2. Review results, identify 3-10 relevant documents
3. batch_get_documents(names: [<selected document names>])
4. Synthesize information across all documents
5. Present structured answer with references
```

**Example:** "Explain all Firestore security rules patterns"
→ Search → collect rule-related docs → batch retrieve → synthesize into guide.

## 3. Code-Aware Lookup

Analyze the user's project code, then search for relevant guidance.

```
1. Read project files to identify frameworks, APIs, versions
2. search_documents(query: "<framework/API from code> <specific topic>")
3. get_document(name: "<relevant result>")
4. Provide guidance tailored to the project's stack
```

**Example:** Project uses Jetpack Compose with Navigation
→ Detect Compose Navigation in code → search `"Compose Navigation type-safe arguments"` → provide guidance.

## 4. Error Troubleshooting

Find solutions for specific errors from Google services.

```
1. search_documents(query: "<error message> <product name>")
2. get_document(name: "<troubleshooting doc>")
3. If insufficient, search_documents(query: "<error code> <specific API>")
4. Provide fix with code example
```

**Example:** `"FAILED_PRECONDITION: The query requires an index"`
→ Search `"Firestore FAILED_PRECONDITION index"` → get doc → explain composite index creation.

## 5. Migration Guide Research

Plan upgrades between versions or technologies.

```
1. search_documents(query: "<product> migration <old version> to <new version>")
2. search_documents(query: "<product> breaking changes <new version>")
3. batch_get_documents(names: [<migration + changelog docs>])
4. Create step-by-step migration plan with breaking changes highlighted
```

**Example:** Migrate from Material 2 to Material 3 in Compose
→ Search migration guide + breaking changes → batch retrieve → produce migration checklist.
