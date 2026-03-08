# google-dev-knowledge

Claude Code plugin for real-time access to official Google developer documentation via the [Developer Knowledge API](https://developerknowledge.googleapis.com).

Covers 11+ Google domains: Android, Firebase, Google Cloud, Chrome, Flutter, Dart, TensorFlow, Google AI (Gemini), web.dev, Google Ads, and Google Maps Platform.

## Setup

### 1. Get an API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) or [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an API key with Developer Knowledge API access enabled

### 2. Export the API Key

```bash
export GOOGLE_DEV_API_KEY="your-api-key-here"
```

Add to your shell profile (`~/.zshrc`, `~/.bashrc`) for persistence.

### 3. Install the Plugin

```bash
/plugin install google-dev-knowledge@gor-dev-plugins
```

## Usage

Once installed, the plugin provides 3 MCP tools:

- **search_documents** — Search across all Google documentation domains
- **get_document** — Retrieve a specific document by name
- **batch_get_documents** — Retrieve up to 100 documents at once

The skill triggers automatically when you ask about Google APIs, SDKs, Firebase, Android, Flutter, Cloud, and other supported domains.

## Examples

```
"How do I implement Firebase Auth with email link?"
"What are the best practices for Firestore security rules?"
"Show me the Jetpack Compose Navigation docs"
"How to migrate from TensorFlow 1 to TensorFlow 2?"
```
