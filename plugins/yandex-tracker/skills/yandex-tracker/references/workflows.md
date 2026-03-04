# Yandex Tracker Workflows

## Table of Contents
- Sprint Planning
- Daily Standup
- Time Tracking
- Issue Triage
- Bulk Operations
- Link Management

---

## Sprint Planning

1. Search unestimated issues: `search_issues` with `Queue: PROJ AND Estimation: empty()`
2. For each issue: `update_issue` to set `originalEstimation` (e.g., `P1D`, `PT4H`)
3. Assign: `update_issue` with `assignee`
4. Verify: `search_issues` with `Queue: PROJ AND Sprint: "current"` to review sprint backlog

## Daily Standup

1. Find yesterday's work: `search_issues` with `Assignee: me() AND Updated: >= "today" - 1d`
2. Check each issue: `get_worklogs` to see time logged
3. Review blockers: `search_issues` with `Assignee: me() AND Status: open AND Priority: critical`

## Time Tracking

### Log daily work
For each task worked on:
1. `add_worklog` with duration (`PT2H`, `PT30M`) and descriptive comment
2. Verify: `get_worklogs` to confirm entry

### Weekly report
1. `search_issues` with `Assignee: me() AND Updated: >= "today" - 7d`
2. For each: `get_worklogs` to sum time
3. Present summary grouped by issue

## Issue Triage

### New bug workflow
1. `create_issue` with queue, summary, description, type: `bug`, priority
2. `link_issues` if related to existing issue (relationship: `relates` or `duplicates`)
3. `add_comment` with reproduction steps or context
4. `get_transitions` → `transition_issue` to move to appropriate status

### Status change
1. `get_transitions` to see available transitions — **never skip this step**
2. `transition_issue` with the correct ID
3. Optionally `add_comment` explaining the transition

## Bulk Operations

### Update multiple issues
1. `search_issues` to find target issues
2. Loop: `update_issue` for each (priority, assignee, estimates)
3. Optionally `add_comment` to each explaining the change

### Close resolved issues
1. `search_issues` with status filter
2. For each: `get_transitions` → find close transition → `transition_issue`

## Link Management

### Relationship types
| Type | Use When |
|------|----------|
| `relates` | General relationship |
| `depends on` | This issue needs the other done first |
| `is dependent by` | Other issue needs this done first |
| `is subtask for` | This is a child task |
| `is parent task for` | This is a parent task |
| `duplicates` | This is a duplicate of another |
| `is duplicated by` | Another issue duplicates this one |

### Create dependency chain
1. `link_issues` with `depends on` for sequential tasks
2. `get_issue_links` to verify the chain
