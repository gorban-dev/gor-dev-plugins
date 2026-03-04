import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { YandexTrackerClient } from "../services/tracker-client.js";
import { AddWorklogSchema, GetWorklogsSchema } from "../schemas/index.js";
import { formatWorklogsAsMarkdown } from "../formatters.js";

export function registerWorklogTools(server: McpServer, client: YandexTrackerClient): void {

  server.registerTool(
    "yandex_tracker_add_worklog",
    {
      title: "Add Worklog to Issue",
      description: `Add a time tracking record (worklog) to an issue.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - duration (string, required): Time spent in ISO 8601 — "PT2H" (2 hours), "PT30M" (30 min), "P1D" (1 business day = 8h)
  - start (string): Start time in ISO 8601 (default: now)
  - comment (string): Description of work done

Returns:
  Confirmation with duration, start time, and comment.

Examples:
  - "Log 3 hours on PROJ-123" -> issue_key="PROJ-123", duration="PT3H"
  - "Log half day with comment" -> duration="PT4H", comment="Code review"

Error Handling:
  - 404: Issue not found.
  - 400: Invalid duration format. Use ISO 8601 (PT{hours}H{minutes}M).`,
      inputSchema: AddWorklogSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof AddWorklogSchema>) => {
      const { issue_key, ...worklogData } = args;
      const worklog = await client.addWorklog(issue_key, worklogData);
      return {
        content: [{
          type: "text" as const,
          text: `Worklog added to ${issue_key}\n\nDuration: ${worklog.duration}\nStart: ${worklog.start}${worklog.comment ? `\nComment: ${worklog.comment}` : ""}`,
        }],
      };
    }
  );

  server.registerTool(
    "yandex_tracker_get_worklogs",
    {
      title: "Get Issue Worklogs",
      description: `Get all time tracking records (worklogs) for an issue.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - response_format ("json"|"markdown", default: "markdown"): Output format

Returns:
  List of worklog entries with duration, start time, author, and comments.

Examples:
  - "Show time logs for PROJ-456" -> issue_key="PROJ-456"

Error Handling:
  - 404: Issue not found.`,
      inputSchema: GetWorklogsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof GetWorklogsSchema>) => {
      const worklogs = await client.getWorklogs(args.issue_key);
      if (args.response_format === "json") {
        return { content: [{ type: "text" as const, text: JSON.stringify(worklogs, null, 2) }] };
      }
      return { content: [{ type: "text" as const, text: formatWorklogsAsMarkdown(worklogs) }] };
    }
  );
}
