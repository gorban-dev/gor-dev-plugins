# Yandex Tracker Workflows

## Table of Contents
- Execute Task (Full Cycle)
- Sprint Planning
- Daily Standup
- Time Tracking
- Issue Triage
- Checklist Management
- Bulk Operations

---

## Execute Task (Full Cycle)

The primary workflow: take a task from start to completion.

### 1. Gather Context
```
get_issue (response_format="json")  — full task data
get_comments                         — discussion, requirements, clarifications
get_checklist                        — acceptance criteria, subtasks
get_links                            — dependencies, blockers, related tasks
```

### 2. Build Execution Plan
- Parse description, comments, and checklist into actionable steps
- Identify blockers from links (dependencies not yet resolved)
- Present plan to user and **wait for confirmation**

### 3. Start Work
```
get_transitions    — find "In Progress" transition ID
transition_issue   — move to In Progress
```

### 4. Execute Steps
- Work through plan steps with user confirmation at each milestone
- Update checklist items as they are completed:
```
update_checklist_item (checked=true)
```

### 5. Complete
```
add_worklog        — log time spent (duration in ISO 8601)
add_comment        — summarize completed work
get_transitions    — find "Done" or "Review" transition
transition_issue   — move to final status
```

---

## Sprint Planning

### Estimate unplanned issues
1. `search_issues` with `Queue: PROJ AND Estimation: empty() AND Sprint: "current"`
2. For each: `update_issue` to set `originalEstimation` (e.g., `P1D`, `PT4H`)

### Assign work
1. `search_issues` with `Queue: PROJ AND Sprint: "current" AND Assignee: empty()`
2. For each: `update_issue` with `assignee`

### Review sprint
1. `list_boards` — find board ID
2. `list_sprints` — find current sprint
3. `get_sprint_issues` — view all sprint issues

---

## Daily Standup

### Prepare report
1. **In Progress:** `search_issues` — `Assignee: me() AND Status: inProgress`
2. **Done Yesterday:** `search_issues` — `Assignee: me() AND Updated: >= "today" - 1d AND Status: closed`
3. **Blockers:** `search_issues` — `Assignee: me() AND Priority: critical AND Status: !closed`

### Report format
```
## Done
- PROJ-123: Implemented login flow
- PROJ-124: Fixed validation bug

## In Progress
- PROJ-125: Working on payment integration

## Blockers
- PROJ-126: Waiting for API access (critical)
```

---

## Time Tracking

### Log daily work
For each task:
```
add_worklog (duration="PT2H", comment="Implemented feature X")
```

### Common time formats
- "3 hours" -> `PT3H`
- "30 minutes" -> `PT30M`
- "1.5 hours" -> `PT1H30M`
- "1 day" -> `P1D` (= 8 business hours)
- "half day" -> `PT4H`

### Weekly report
1. `search_issues` with `Assignee: me() AND Updated: >= "today" - 7d`
2. For each: `get_worklogs` to sum time
3. Present summary grouped by issue

---

## Issue Triage

### New bug
1. `create_issue` — queue, summary, description, type="bug", priority
2. `create_link` if related to existing issue
3. `add_comment` with reproduction steps
4. `get_transitions` -> `transition_issue` to appropriate status

### Status change (always 2-step!)
1. `get_transitions` — **never skip this step**
2. `transition_issue` with the correct ID from step 1
3. Optionally `add_comment` explaining the transition

---

## Checklist Management

### View checklist
```
get_checklist — shows items with [x]/[ ] marks, assignees, deadlines
```

### Add acceptance criteria
```
add_checklist_item (text="Write unit tests", assignee="john", deadline="2024-03-15")
add_checklist_item (text="Update documentation")
add_checklist_item (text="Code review approved")
```

### Mark items done
```
update_checklist_item (item_id="...", checked=true)
```

---

## Bulk Operations

### Update multiple issues
1. `search_issues` to find targets
2. For each: `update_issue` (priority, assignee, estimates)
3. Optionally `add_comment` to each

### Close resolved issues
1. `search_issues` with status filter
2. For each: `get_transitions` -> find close transition -> `transition_issue`
