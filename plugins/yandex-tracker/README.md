# Yandex Tracker Plugin

Full Yandex Tracker integration for Claude Code and Codex: **30+ MCP tools** and a workflow **skill**.

## Features

- **30+ MCP tools** covering the full Yandex Tracker API v2
- **yandex-tracker skill** with query language reference and workflow patterns

## MCP Tools

### Issues (4 tools)
| Tool | Description |
|------|-------------|
| `get_issue` | Get issue details by key |
| `create_issue` | Create a new issue |
| `update_issue` | Update issue fields |
| `search_issues` | Search with Tracker query language |

### Comments (4 tools)
| Tool | Description |
|------|-------------|
| `get_comments` | Get all comments |
| `add_comment` | Add comment with optional mentions |
| `update_comment` | Edit a comment |
| `delete_comment` | Delete a comment |

### Worklogs (4 tools)
| Tool | Description |
|------|-------------|
| `get_worklogs` | Get time tracking entries |
| `add_worklog` | Log time (ISO 8601: PT2H, P1D) |
| `update_worklog` | Edit a worklog |
| `delete_worklog` | Delete a worklog |

### Transitions (2 tools)
| Tool | Description |
|------|-------------|
| `get_transitions` | Get available status transitions |
| `transition_issue` | Execute a status transition |

### Links (3 tools)
| Tool | Description |
|------|-------------|
| `get_links` | Get issue links |
| `create_link` | Create a link between issues |
| `delete_link` | Delete a link |

### Checklists (4 tools)
| Tool | Description |
|------|-------------|
| `get_checklist` | Get checklist items |
| `add_checklist_item` | Add item with deadline/assignee |
| `update_checklist_item` | Update item (text, checked, etc.) |
| `delete_checklist_item` | Delete a checklist item |

### Queues (2 tools)
| Tool | Description |
|------|-------------|
| `get_queue` | Get queue details |
| `list_queues` | List all queues |

### Sprints (3 tools)
| Tool | Description |
|------|-------------|
| `get_sprint` | Get sprint details |
| `list_sprints` | List sprints for a board |
| `get_sprint_issues` | Get issues in a sprint |

### Boards (2 tools)
| Tool | Description |
|------|-------------|
| `get_board` | Get board with columns |
| `list_boards` | List all boards |

### Users (1 tool)
| Tool | Description |
|------|-------------|
| `get_myself` | Get current user info |

### Attachments (3 tools)
| Tool | Description |
|------|-------------|
| `list_attachments` | List issue attachments |
| `download_attachment` | Download attachments to disk so they can be read locally |
| `upload_attachment` | Upload a file to issue |

## Usage

The `yandex-tracker` skill loads automatically when a request touches Tracker. Example prompts:

- "Выполни задачу ARU-7743" — fetch issue, comments, checklist, links and attachments, then work through the task
- "Покажи мои задачи" — search and display current tasks
- "Залогируй 3 часа на ARU-123" — add worklog
- "Что у меня на сегодня?" — daily standup report
- "Переведи PROJ-456 в done" — status transition

## Setup

### 1. Get credentials

**Option A: OAuth Token** (Yandex 360)
- Get token at https://oauth.yandex.ru/
- Find Org ID in Yandex Tracker settings

**Option B: IAM Token** (Yandex Cloud)
- Use `yc iam create-token`
- Find Cloud Org ID in Yandex Cloud console

### 2. Set environment variables

The MCP server reads credentials from environment variables. You need one of two pairs:

| Variable | Description |
|----------|-------------|
| `YANDEX_TRACKER_TOKEN` | OAuth token (Yandex 360) |
| `YANDEX_TRACKER_ORG_ID` | Organization ID (Yandex 360) |
| `YANDEX_TRACKER_IAM_TOKEN` | IAM token (Yandex Cloud, alternative) |
| `YANDEX_TRACKER_CLOUD_ORG_ID` | Cloud Org ID (Yandex Cloud, alternative) |

#### macOS / Linux

Add to `~/.zshrc` (macOS) or `~/.bashrc` (Linux):

```bash
export YANDEX_TRACKER_TOKEN="y0_your_oauth_token"
export YANDEX_TRACKER_ORG_ID="your_org_id"
```

Then restart terminal or run `source ~/.zshrc`, and launch Claude Code from the same terminal.

#### Windows

**Option A: PowerShell profile** (recommended)

Add to your PowerShell profile (`$PROFILE`, usually `~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`):

```powershell
$env:YANDEX_TRACKER_TOKEN = "y0_your_oauth_token"
$env:YANDEX_TRACKER_ORG_ID = "your_org_id"
```

Then restart PowerShell and launch Claude Code from it.

**Option B: System environment variables** (persistent, all apps)

```powershell
[Environment]::SetEnvironmentVariable("YANDEX_TRACKER_TOKEN", "y0_your_oauth_token", "User")
[Environment]::SetEnvironmentVariable("YANDEX_TRACKER_ORG_ID", "your_org_id", "User")
```

Or set via **Settings → System → About → Advanced system settings → Environment Variables**.

After setting system variables, restart Claude Code (or log out and back in).

### 3. Install plugin

#### Claude Code

Install as a Claude Code plugin. The bundled MCP server (`dist/bundle.js`) is included and works immediately, no `npm install` required.

#### Codex

The Codex plugin manifest is included at `.codex-plugin/plugin.json`, and the repo-local marketplace entry is included at `.agents/plugins/marketplace.json`.

Install directly from GitHub:

```bash
codex plugin marketplace add gorban-dev/gor-dev-plugins --ref main
codex plugin add yandex-tracker@gor-dev-plugins
```

The bundled MCP server (`dist/bundle.js`) is committed, so no `npm install` or local build step is required for normal installation.

Start a new Codex thread after installation so the plugin skill and MCP tools are loaded.

Claude Code uses the shared `.mcp.json` with `${...}` placeholders. Codex uses
`.codex.mcp.json` through `.codex-plugin/plugin.json`, with `env_vars` so the
real credential values are inherited by name instead of passing placeholders
literally.

## License

MIT
