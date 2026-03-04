---
name: yandex-tracker
description: Specialized workflows for Yandex Tracker project management via MCP tools. Use when working with Yandex Tracker issues, sprints, time tracking, comments, status transitions, or issue links. Triggers on any task involving yandex_tracker_* MCP tools, Yandex Tracker queries, sprint planning, daily standups, time logging, or issue workflow management.
---

# Yandex Tracker

## Tool Catalog (12 tools)

### Issue Management
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_issue` | Need issue details (status, assignee, estimates) |
| `yandex_tracker_create_issue` | Creating a new task, bug, story, or epic |
| `yandex_tracker_update_issue` | Changing fields: summary, description, priority, assignee, estimates |
| `yandex_tracker_search_issues` | Finding issues by queue, status, assignee, dates, or custom queries |

### Time Tracking
| Tool | Use When |
|------|----------|
| `yandex_tracker_add_worklog` | Logging time spent on an issue |
| `yandex_tracker_get_worklogs` | Reviewing time logs for an issue |

### Comments
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_comments` | Reading discussion on an issue |
| `yandex_tracker_add_comment` | Adding a comment, optionally mentioning users |

### Workflow
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_transitions` | **Always call before transition_issue** to get valid transition IDs |
| `yandex_tracker_transition_issue` | Moving issue to a new status (e.g., open → in progress → closed) |

### Links
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_issue_links` | Viewing dependencies and relationships |
| `yandex_tracker_link_issues` | Creating relates/depends on/subtask/duplicate links |

## Critical Patterns

### Status Transitions (2-step)
Never guess transition IDs. Always:
1. `get_transitions` → read available IDs
2. `transition_issue` with the exact ID from step 1

### Time Format (ISO 8601)
| Input | Format |
|-------|--------|
| 30 min | `PT30M` |
| 2h 30m | `PT2H30M` |
| 1 day (8h) | `P1D` |
| 1 week (40h) | `P1W` |
| 2 days + 4h | `P2DT4H` |

Business time: `P1D` = 8h, `P1W` = 5d = 40h.

### Query Language
```
Queue: PROJ AND Status: open AND Assignee: me()
Priority: critical OR Priority: blocker
Created: >= 2024-01-01
Type: bug AND Status: !closed
Queue: API AND (Type: bug OR Type: improvement)
```

Key functions: `me()`, `now()`, `empty()`.
Negation: `!closed`, `!empty()`.
Sorting via `order` parameter: `["-updated", "+priority"]`.

## Workflows

See [references/workflows.md](references/workflows.md) for detailed workflow patterns: sprint planning, daily standup, time tracking, issue triage, and bulk operations.
