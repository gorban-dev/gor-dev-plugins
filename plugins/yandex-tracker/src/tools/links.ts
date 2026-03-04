import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { YandexTrackerClient } from "../services/tracker-client.js";
import { GetIssueLinksSchema, LinkIssuesSchema } from "../schemas/index.js";
import { formatIssueLinksAsMarkdown } from "../formatters.js";

export function registerLinkTools(server: McpServer, client: YandexTrackerClient): void {

  server.registerTool(
    "yandex_tracker_get_issue_links",
    {
      title: "Get Issue Links",
      description: `Get all links for an issue — dependencies, subtasks, duplicates, and related issues.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - response_format ("json"|"markdown", default: "markdown"): Output format

Returns:
  List of linked issues with relationship type, direction, key, summary, and status.

Examples:
  - "Show dependencies of PROJ-123" -> issue_key="PROJ-123"

Error Handling:
  - 404: Issue not found.`,
      inputSchema: GetIssueLinksSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof GetIssueLinksSchema>) => {
      const links = await client.getIssueLinks(args.issue_key);
      if (args.response_format === "json") {
        return { content: [{ type: "text" as const, text: JSON.stringify(links, null, 2) }] };
      }
      return { content: [{ type: "text" as const, text: formatIssueLinksAsMarkdown(links) }] };
    }
  );

  server.registerTool(
    "yandex_tracker_link_issues",
    {
      title: "Link Two Issues",
      description: `Create a link between two issues.

Args:
  - issue_key (string, required): Source issue key (e.g., "MYQUEUE-123")
  - relationship (string, required): Link type — "relates", "depends on", "is dependent by", "is subtask for", "is parent task for", "duplicates", "is duplicated by"
  - issue (string, required): Target issue key (e.g., "MYQUEUE-456")

Returns:
  Confirmation with source, relationship, and target.

Examples:
  - "PROJ-123 depends on PROJ-100" -> issue_key="PROJ-123", relationship="depends on", issue="PROJ-100"
  - "Mark PROJ-456 as duplicate of PROJ-123" -> issue_key="PROJ-456", relationship="duplicates", issue="PROJ-123"

Error Handling:
  - 404: One or both issues not found.
  - 400: Invalid relationship type.`,
      inputSchema: LinkIssuesSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof LinkIssuesSchema>) => {
      await client.linkIssues(args.issue_key, {
        relationship: args.relationship,
        issue: args.issue,
      });
      return {
        content: [{
          type: "text" as const,
          text: `Link created: ${args.issue_key} --[${args.relationship}]--> ${args.issue}`,
        }],
      };
    }
  );
}
