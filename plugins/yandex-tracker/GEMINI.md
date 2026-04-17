# yandex-tracker

Yandex Tracker MCP server: 30+ tools for issue management, time tracking, comments, sprint planning.

## Setup

Set the env vars before launching Gemini CLI:

```bash
export YANDEX_TRACKER_TOKEN="your_oauth_token"
export YANDEX_TRACKER_ORG_ID="your_org_id"
```

Get a token at https://oauth.yandex.com.

## When to use

- User mentions a Tracker issue (e.g. `PROJ-123`)
- User asks to execute, complete, search, comment on, transition, or log time on a task
- User asks for a daily standup summary or sprint plan

The `tracker-manager` agent (Claude Code-only) orchestrates multi-step workflows; on Gemini you call MCP tools directly.
