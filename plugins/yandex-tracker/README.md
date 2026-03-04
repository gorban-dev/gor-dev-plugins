# Yandex Tracker MCP Server

MCP (Model Context Protocol) server for integrating with Yandex Tracker API. Enables LLMs to manage issues, track time, handle comments, transitions, and links in Yandex Tracker.

## Features

- **Issue Management**: Create, read, and update issues
- **Time Tracking**: Add and retrieve worklog entries
- **Comments**: Read and add comments to issues
- **Workflow Transitions**: View available transitions and change issue status
- **Issue Links**: View and create links between issues
- **Search**: Query issues using Yandex Tracker query language
- **Dual Response Formats**: JSON (for processing) or Markdown (for readability)

## Installation

### Claude Code Plugin (Easiest) ⭐

Install as a plugin to get MCP server + skills automatically.

#### From GitHub (recommended)

Inside Claude Code session:
```bash
# Add marketplace
/plugin marketplace add gorban-dev/yandex-tracker-mcp-server

# Install plugin
/plugin install yandex-tracker
```

#### From npm + local path

```bash
# Install from npm
npm install -g @gor-dev/yandex-tracker-mcp

# Run Claude Code with plugin
claude --plugin-dir "$(npm root -g)/@gor-dev/yandex-tracker-mcp"
```

#### For local development

```bash
# Run Claude Code with local plugin directory
claude --plugin-dir /path/to/yandex-tracker-mcp-server
```

**Configure credentials:**
```bash
export YANDEX_TRACKER_TOKEN="your_token"
export YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id"
```

**What you get:**
- ✅ MCP server automatically configured via `.mcp.json`
- ✅ Skills auto-loaded (`/yandex-tracker:yandex-tracker` workflow)
- ✅ Easy updates via `/plugin update yandex-tracker`

### Claude Code — MCP Server (Advanced)

Adds the server for all your projects:

```bash
claude mcp add --scope user --transport stdio yandex-tracker -- \
  env YANDEX_TRACKER_TOKEN="your_token" \
      YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id" \
      npx -y @gor-dev/yandex-tracker-mcp
```

### Claude Code — Project

Adds the server only for the current project:

```bash
claude mcp add --transport stdio yandex-tracker -- \
  env YANDEX_TRACKER_TOKEN="your_token" \
      YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id" \
      npx -y @gor-dev/yandex-tracker-mcp
```

### Global npm Install

```bash
npm install -g @gor-dev/yandex-tracker-mcp
```

### Manual (from source)

```bash
git clone https://github.com/gorban-dev/yandex-tracker-mcp-server.git
cd yandex-tracker-mcp-server
npm install
npm run build
```

## Claude Skill

The server includes a Claude Code skill with workflow knowledge (sprint planning, daily standups, time tracking, query patterns, best practices).

**Automatic install:** The skill is installed automatically every time the MCP server starts. No extra steps needed.

**Manual install (optional):**

```bash
npx -y @gor-dev/yandex-tracker-mcp --install-skill
```

The skill files are installed to `~/.claude/skills/yandex-tracker/`.

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `YANDEX_TRACKER_TOKEN` | Yes* | OAuth token for authentication |
| `YANDEX_TRACKER_ORG_ID` | Yes* | Organization ID (for OAuth) |
| `YANDEX_TRACKER_IAM_TOKEN` | Yes* | IAM token (alternative to OAuth) |
| `YANDEX_TRACKER_CLOUD_ORG_ID` | Yes* | Cloud Organization ID (for IAM or OAuth) |

\*Either OAuth (`TOKEN` + `ORG_ID` or `CLOUD_ORG_ID`) or IAM (`IAM_TOKEN` + `CLOUD_ORG_ID`) pair is required.

### Option 1: OAuth Token (Recommended)

```bash
export YANDEX_TRACKER_TOKEN="your_oauth_token"
export YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id"
```

Get your OAuth token from [Yandex OAuth](https://oauth.yandex.ru/). Find your Cloud Organization ID in [Yandex Cloud Console](https://console.cloud.yandex.ru/).

**To make these variables permanent**, add them to your shell profile:

```bash
# For zsh (macOS default)
echo 'export YANDEX_TRACKER_TOKEN="your_oauth_token"' >> ~/.zshrc
echo 'export YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export YANDEX_TRACKER_TOKEN="your_oauth_token"' >> ~/.bashrc
echo 'export YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id"' >> ~/.bashrc
source ~/.bashrc
```

After adding to your profile, **restart Claude Code** to pick up the new environment variables.

### Option 2: IAM Token (Yandex Cloud)

```bash
export YANDEX_TRACKER_IAM_TOKEN="your_iam_token"
export YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id"
```

> IAM tokens expire after 12 hours. Regenerate with `yc iam create-token`.

### Manage MCP Server

```bash
claude mcp list                  # list all servers
claude mcp get yandex-tracker    # show config
claude mcp remove yandex-tracker # remove
```

### Project-specific `.mcp.json`

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "yandex-tracker": {
      "command": "env",
      "args": [
        "YANDEX_TRACKER_TOKEN=your_token",
        "YANDEX_TRACKER_CLOUD_ORG_ID=your_cloud_org_id",
        "npx", "-y", "@gor-dev/yandex-tracker-mcp"
      ]
    }
  }
}
```

### Claude Desktop

Config file locations:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "yandex-tracker": {
      "command": "npx",
      "args": ["-y", "@gor-dev/yandex-tracker-mcp"],
      "env": {
        "YANDEX_TRACKER_TOKEN": "your_token",
        "YANDEX_TRACKER_CLOUD_ORG_ID": "your_cloud_org_id"
      }
    }
  }
}
```

## Available Tools (12)

### Issue Management

| Tool | Description | Type |
|------|-------------|------|
| `yandex_tracker_get_issue` | Get issue details by key | Read |
| `yandex_tracker_create_issue` | Create a new issue | Write |
| `yandex_tracker_update_issue` | Update issue fields | Write |
| `yandex_tracker_search_issues` | Search issues with query language | Read |

### Time Tracking

| Tool | Description | Type |
|------|-------------|------|
| `yandex_tracker_add_worklog` | Log time spent on an issue | Write |
| `yandex_tracker_get_worklogs` | Get all worklogs for an issue | Read |

### Comments

| Tool | Description | Type |
|------|-------------|------|
| `yandex_tracker_get_comments` | Get all comments on an issue | Read |
| `yandex_tracker_add_comment` | Add a comment to an issue | Write |

### Workflow

| Tool | Description | Type |
|------|-------------|------|
| `yandex_tracker_get_transitions` | Get available status transitions | Read |
| `yandex_tracker_transition_issue` | Execute a status transition | Write |

### Links

| Tool | Description | Type |
|------|-------------|------|
| `yandex_tracker_get_issue_links` | Get all links for an issue | Read |
| `yandex_tracker_link_issues` | Create a link between issues | Write |

## Query Language

Yandex Tracker supports a powerful query language for searching issues:

```
# Issues assigned to me
Assignee: me()

# Issues in specific queue
Queue: PROJ

# Combine conditions
Queue: PROJ AND Status: open AND Assignee: me()

# Date ranges
Created: >= 2024-01-01 AND Created: <= 2024-01-31

# Priority and type
Priority: critical OR Priority: blocker
Type: bug

# Complex queries
Queue: API AND (Type: bug OR Type: improvement) AND Status: !closed
```

## ISO 8601 Duration Reference

Time values use ISO 8601 duration format:

| Duration | Format | Notes |
|----------|--------|-------|
| 30 minutes | `PT30M` | |
| 1 hour | `PT1H` | |
| 2 hours 30 min | `PT2H30M` | |
| 4 hours | `PT4H` | Half business day |
| 8 hours | `PT8H` or `P1D` | Full business day |
| 1 week | `P1W` or `P5D` | 5 business days = 40h |
| 2 weeks | `P2W` or `P10D` | |

> Yandex Tracker uses business days (8h) and business weeks (5d). `P1D` = 8 hours, `P1W` = 40 hours.

## Testing

```bash
npm run inspector
```

## Architecture

```
src/
├── index.ts              # McpServer initialization and startup
├── constants.ts          # API URL, CHARACTER_LIMIT, version
├── types.ts              # TypeScript interfaces for API responses
├── formatters.ts         # Markdown formatters for all entities
├── schemas/
│   └── index.ts          # Zod validation schemas (.strict())
├── services/
│   └── tracker-client.ts # Yandex Tracker API client
└── tools/
    ├── issues.ts         # get_issue, create_issue, update_issue, search_issues
    ├── worklogs.ts       # add_worklog, get_worklogs
    ├── comments.ts       # get_comments, add_comment
    ├── transitions.ts    # get_transitions, transition_issue
    └── links.ts          # get_issue_links, link_issues
```

## Development

```bash
npm install       # install dependencies
npm run build     # compile TypeScript
npm run dev       # watch mode
npm start         # start server
npm run inspector # test with MCP Inspector
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Invalid/expired token | Check token, regenerate IAM |
| 403 Forbidden | Wrong org ID or no access | Verify org ID type matches auth method |
| 404 Not Found | Issue doesn't exist | Check issue key format (QUEUE-NUMBER) |
| 429 Too Many Requests | Rate limit | Reduce request frequency |

## Security

- Never commit tokens to version control
- Use environment variables for credentials
- IAM tokens expire after 12 hours (prefer for temporary access)
- All requests use HTTPS

## License

MIT

## Links

- **npm:** https://www.npmjs.com/package/@gor-dev/yandex-tracker-mcp
- **GitHub:** https://github.com/gorban-dev/yandex-tracker-mcp-server
- **Yandex Tracker API:** https://yandex.cloud/en/docs/tracker/
- **MCP Specification:** https://modelcontextprotocol.io/
