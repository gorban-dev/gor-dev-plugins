import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { YandexTrackerClient } from "../services/tracker-client.js";
import {
  GetIssueSchema,
  CreateIssueSchema,
  UpdateIssueSchema,
  SearchIssuesSchema,
} from "../schemas/index.js";
import {
  formatIssueAsMarkdown,
  formatSearchResultsAsMarkdown,
} from "../formatters.js";

export function registerIssueTools(server: McpServer, client: YandexTrackerClient): void {

  server.registerTool(
    "yandex_tracker_get_issue",
    {
      title: "Get Yandex Tracker Issue",
      description: `Get detailed information about a specific issue by its key.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - response_format ("json"|"markdown", default: "markdown"): Output format

Returns:
  Issue data: key, summary, status, type, priority, assignee, dates, estimates, description.

Examples:
  - "Show me issue PROJ-456" -> issue_key="PROJ-456"
  - "Get PROJ-123 in JSON" -> issue_key="PROJ-123", response_format="json"

Error Handling:
  - 404: Issue key not found. Check the format QUEUE-NUMBER.
  - 403: No access to this issue or queue.`,
      inputSchema: GetIssueSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof GetIssueSchema>) => {
      const issue = await client.getIssue(args.issue_key);
      if (args.response_format === "json") {
        return { content: [{ type: "text" as const, text: JSON.stringify(issue, null, 2) }] };
      }
      return { content: [{ type: "text" as const, text: formatIssueAsMarkdown(issue) }] };
    }
  );

  server.registerTool(
    "yandex_tracker_create_issue",
    {
      title: "Create Yandex Tracker Issue",
      description: `Create a new issue in Yandex Tracker.

Args:
  - queue (string, required): Queue key (e.g., "PROJ")
  - summary (string, required): Issue title (max 255 chars)
  - description (string): Issue body text
  - type (string): Issue type key — "task", "bug", "story", "epic", "improvement"
  - priority (string): Priority key — "trivial", "minor", "normal", "critical", "blocker"
  - assignee (string): Assignee login
  - parent (string): Parent issue key for subtasks (e.g., "PROJ-100")
  - followers (string[]): Follower logins
  - tags (string[]): Tags
  - sprint (string): Sprint ID

Returns:
  Created issue with key, summary, status, type, priority, assignee.

Examples:
  - "Create a bug in PROJ queue" -> queue="PROJ", summary="...", type="bug"
  - "Create subtask for PROJ-100" -> queue="PROJ", summary="...", parent="PROJ-100"

Error Handling:
  - 400: Invalid queue or missing required fields.
  - 403: No permission to create issues in this queue.`,
      inputSchema: CreateIssueSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof CreateIssueSchema>) => {
      const issue = await client.createIssue(args);
      return {
        content: [{ type: "text" as const, text: `Issue ${issue.key} created successfully\n\n${formatIssueAsMarkdown(issue)}` }],
      };
    }
  );

  server.registerTool(
    "yandex_tracker_update_issue",
    {
      title: "Update Yandex Tracker Issue",
      description: `Update fields of an existing issue. Only specified fields are changed.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - summary (string): New title
  - description (string): New description
  - status (string): Status key (e.g., "open", "inProgress", "closed")
  - assignee (string): Assignee login
  - originalEstimation (string): Original estimate in ISO 8601 (e.g., "PT8H", "P1D")
  - estimation (string): Remaining estimate in ISO 8601
  - spent (string): Time spent in ISO 8601
  - priority (string): Priority key
  - type (string): Issue type key

Returns:
  Updated issue with all current field values.

Examples:
  - "Set estimate for PROJ-456 to 16 hours" -> issue_key="PROJ-456", originalEstimation="PT16H"
  - "Assign PROJ-123 to john" -> issue_key="PROJ-123", assignee="john"

Error Handling:
  - 404: Issue not found.
  - 403: No permission to edit this issue.
  - 400: Invalid field value.`,
      inputSchema: UpdateIssueSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof UpdateIssueSchema>) => {
      const { issue_key, ...updates } = args;
      const issue = await client.updateIssue(issue_key, updates);
      return {
        content: [{ type: "text" as const, text: `Issue ${issue_key} updated successfully\n\n${formatIssueAsMarkdown(issue)}` }],
      };
    }
  );

  server.registerTool(
    "yandex_tracker_search_issues",
    {
      title: "Search Yandex Tracker Issues",
      description: `Search for issues using Yandex Tracker query language or filter objects.

Args:
  - query (string): Query string (e.g., "Queue: PROJ AND Assignee: me() AND Status: open")
  - filter (object): Alternative to query — filter as key-value pairs
  - order (string[]): Sort order (e.g., ["-updated", "+priority"])
  - limit (number, 1-100, default: 20): Max results per page
  - offset (number, default: 0): Pagination offset
  - response_format ("json"|"markdown", default: "markdown"): Output format

Returns:
  For JSON: { issues: [...], total, count, offset, has_more, next_offset }
  For Markdown: Formatted list with key, summary, status, priority, assignee.

Examples:
  - "Find open bugs in PROJ" -> query="Queue: PROJ AND Type: bug AND Status: open"
  - "My tasks this week" -> query="Assignee: me() AND Updated: >= \\"today\\" - 7d"
  - "Page 2 of results" -> offset=20, limit=20

Error Handling:
  - 400: Invalid query syntax. Check Yandex Tracker query language docs.`,
      inputSchema: SearchIssuesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof SearchIssuesSchema>) => {
      const result = await client.searchIssues(args);
      if (args.response_format === "json") {
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      }
      return { content: [{ type: "text" as const, text: formatSearchResultsAsMarkdown(result) }] };
    }
  );
}
