---
name: yandex-tracker
description: Specialized workflows for Yandex Tracker project management via 30+ MCP tools. Use when working with Yandex Tracker issues, sprints, boards, queues, checklists, time tracking, comments, status transitions, issue links, or attachments. Triggers on any task involving yandex_tracker_* MCP tools, Yandex Tracker queries, sprint planning, daily standups, time logging, or issue workflow management.
---

# Yandex Tracker

## Tool Catalog (30 tools)

### Issue Management
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_issue` | Need issue details (status, assignee, estimates, description) |
| `yandex_tracker_create_issue` | Creating a new task, bug, story, or epic |
| `yandex_tracker_update_issue` | Changing fields: summary, description, priority, assignee, estimates |
| `yandex_tracker_search_issues` | Finding issues by queue, status, assignee, dates, or custom queries |

### Comments
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_comments` | Reading discussion on an issue |
| `yandex_tracker_add_comment` | Adding a comment, optionally mentioning users |
| `yandex_tracker_update_comment` | Editing an existing comment |
| `yandex_tracker_delete_comment` | Removing a comment |

### Time Tracking
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_worklogs` | Reviewing time logs for an issue |
| `yandex_tracker_add_worklog` | Logging time spent on an issue |
| `yandex_tracker_update_worklog` | Correcting a worklog entry |
| `yandex_tracker_delete_worklog` | Removing a worklog entry |

### Workflow
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_transitions` | **Always call before transition_issue** to get valid transition IDs |
| `yandex_tracker_transition_issue` | Moving issue to a new status (open -> in progress -> closed) |

### Links
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_links` | Viewing dependencies and relationships |
| `yandex_tracker_create_link` | Creating relates/depends on/subtask/duplicate links |
| `yandex_tracker_delete_link` | Removing a link |

### Checklists
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_checklist` | Viewing checklist items (acceptance criteria, subtasks) |
| `yandex_tracker_add_checklist_item` | Adding a checklist item with optional deadline/assignee |
| `yandex_tracker_update_checklist_item` | Updating item text, marking done, changing assignee |
| `yandex_tracker_delete_checklist_item` | Removing a checklist item |

### Queues
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_queue` | Getting queue details, allowed issue types, lead |
| `yandex_tracker_list_queues` | Listing all available queues |

### Sprints
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_sprint` | Getting sprint details — name, dates, status |
| `yandex_tracker_list_sprints` | Listing all sprints for a board |
| `yandex_tracker_get_sprint_issues` | Getting all issues in a sprint |

### Boards
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_board` | Getting board details with columns |
| `yandex_tracker_list_boards` | Listing all available boards |

### Users
| Tool | Use When |
|------|----------|
| `yandex_tracker_get_myself` | Getting current user info (login for search queries) |

### Attachments
| Tool | Use When |
|------|----------|
| `yandex_tracker_list_attachments` | Listing files attached to an issue |
| `yandex_tracker_upload_attachment` | Uploading a file to an issue |

## Critical Patterns

### Status Transitions (2-step)
Never guess transition IDs. Always:
1. `get_transitions` -> read available IDs
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

### Link Relationship Types
| Type | Meaning |
|------|---------|
| `relates` | General relationship |
| `depends on` | This issue needs the other done first |
| `is dependent by` | Other issue needs this done first |
| `is subtask for` | Child task |
| `is parent task for` | Parent task |
| `duplicates` | This is a duplicate of another |
| `is duplicated by` | Another duplicates this one |

## Workflows

See [references/workflows.md](references/workflows.md) for detailed workflow patterns: task execution, sprint planning, daily standup, time tracking, issue triage, and checklist management.
