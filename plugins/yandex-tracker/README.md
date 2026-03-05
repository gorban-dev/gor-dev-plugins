# Yandex Tracker Plugin

Full Yandex Tracker integration for Claude Code: **30+ MCP tools**, interactive **agent**, and **skill** with workflow patterns.

## Features

- **30+ MCP tools** covering the full Yandex Tracker API v2
- **tracker-manager agent** for interactive task execution with step-by-step confirmation
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

### Attachments (2 tools)
| Tool | Description |
|------|-------------|
| `list_attachments` | List issue attachments |
| `upload_attachment` | Upload a file to issue |

## Agent: tracker-manager

Interactive agent for task execution with user confirmation at each step.

**Example:** "Выполни задачу ARU-7743" triggers:
1. Fetches issue data, comments, checklist, links
2. Builds execution plan
3. Shows plan and asks for confirmation
4. Moves issue to "In Progress"
5. Executes with step-by-step approval
6. Logs time, adds comment, transitions to Done

**Other intents:**
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

The MCP server reads credentials from environment variables. Add them to your `~/.zshrc` (macOS) or `~/.bashrc` (Linux):

**Option A: OAuth Token**
```bash
export YANDEX_TRACKER_TOKEN="y0_your_oauth_token"
export YANDEX_TRACKER_ORG_ID="your_org_id"
```

**Option B: IAM Token**
```bash
export YANDEX_TRACKER_IAM_TOKEN="your_iam_token"
export YANDEX_TRACKER_CLOUD_ORG_ID="your_cloud_org_id"
```

After adding, restart your terminal or run `source ~/.zshrc`, then launch Claude Code from the same terminal.

### 3. Install plugin

Install as a Claude Code plugin — the bundled MCP server (`dist/bundle.js`) is included and works immediately, no `npm install` required.

## License

MIT
