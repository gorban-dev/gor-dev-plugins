# Changelog

## v3.1.0 — Attachment download, tracker-manager agent removed

`yandex-tracker` 1.0.2 → 2.0.0.

### Added

`yandex_tracker_download_attachment` saves issue attachments to disk so the agent can read them — screenshots, logs, specs, anything the reporter attached.

| Argument | Effect |
|----------|--------|
| `attachment_id` | Download one attachment by ID |
| `filename` | Download attachments with this name (case-insensitive) |
| neither | Download every attachment on the issue |
| `output_dir` | Target directory; default `<tmp>/yandex-tracker/<ISSUE-KEY>` |

The response is a table of absolute paths — read one with your file-reading tool. `list_attachments` gained an **ID** column, since the ID was previously visible only with `response_format="json"`.

### Removed

`agents/tracker-manager.md`. A subagent cannot stop and ask the user, and the agent's entire execute-task flow — present plan, wait for confirmation, change code, confirm again — was built on exactly that. Everything read-only already worked in the main thread through the skill.

### Migrating

Nothing to change in settings. If you invoked the agent by name, drop the mention: the same workflows live in `skills/yandex-tracker/references/workflows.md` and run in the main thread, where confirmation prompts actually reach you.

## v3.0.0 — Workflow plugins move to gor-mobile

Three plugins are gone. The marketplace is now two plugins: `swagger-android` and `yandex-tracker`.

### Removed

| Plugin | Replacement |
|--------|-------------|
| `android-dev` | [gor-mobile](https://github.com/gorban-dev/gor-mobile) |
| `kmp-migrator-superpowers` | [gor-mobile](https://github.com/gorban-dev/gor-mobile) |
| `google-dev-knowledge` | Google's official [Developer Knowledge MCP server](https://developers.google.com/knowledge/mcp) |

### Migrating

Remove the three entries from `.claude/settings.json`:

```diff
  "enabledPlugins": {
-   "android-dev@gor-dev-plugins": true,
-   "kmp-migrator-superpowers@gor-dev-plugins": true,
-   "google-dev-knowledge@gor-dev-plugins": true,
    "swagger-android@gor-dev-plugins": true,
    "yandex-tracker@gor-dev-plugins": true
  }
```

**android-dev / kmp-migrator-superpowers → gor-mobile.** Same `brainstorm → plan → implement → review → verify` workflow, now a standalone CLI instead of a plugin: 14 skills, two review agents (`gor-mobile-code-reviewer`, `gor-mobile-code-reviewer-deep`), SessionStart/UserPromptSubmit/PreToolUse hooks, swappable rules packs, artifact retention with TTL. One skill set serves both Claude Code (per-repo) and Codex (user-level).

```bash
brew install gorban-dev/gor-mobile/gor-mobile   # or: npm install -g gor-mobile
gor-mobile setup                                # one-time machine setup
cd ~/code/my-android-app && gor-mobile init     # install into the repo
```

Device work, project scaffolding, SDK and emulator management, layout inspection and docs lookup run through Google's [Android CLI](https://developer.android.com/tools/agents/android-cli), which gor-mobile requires and drives.

**google-dev-knowledge → official MCP server.** The plugin was a wrapper around `https://developerknowledge.googleapis.com/mcp` — Google's own remote MCP server, GA since 16 April 2026. Connect to it directly:

```bash
claude mcp add google-dev-knowledge --transport http https://developerknowledge.googleapis.com/mcp \
  --header "X-Goog-Api-Key: YOUR_API_KEY"
```

Tool names changed on Google's side on 8 March 2026 — `get_document` and `batch_get_documents` were dropped in favour of `get_documents`, plus `answer_query` (GA since 17 July 2026). The plugin's skill still described the old ones, which is the other reason it is gone rather than patched.

For Android-only lookups, `android docs search` and `android docs fetch` hit the Android Knowledge Base with no API key. They cover `developer.android.com` only — Firebase, Cloud, Flutter, Dart and Maps still need the Developer Knowledge MCP server.

### Gemini CLI support dropped

`gemini-extension.json` and `GEMINI.md` are gone from both remaining plugins. The support was never functional: `yandex-tracker` pointed its MCP server at `${EXTENSION_ROOT}`, a variable Gemini CLI does not define — the documented ones are `${extensionPath}`, `${workspacePath}` and `${/}` — so the server could never start. No install instructions existed either. Cursor, Codex CLI and OpenCode manifests are unaffected.

### Changed

- `marketplace.json` — version `3.0.0`, plugin list trimmed to two
- CI — dropped the `android-dev` pytest job

---

Earlier releases: [v2.1.0](https://github.com/gorban-dev/gor-dev-plugins/releases/tag/v2.1.0) and below.
