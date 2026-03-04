import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { YandexTrackerClient } from "../services/tracker-client.js";
import { GetCommentsSchema, AddCommentSchema } from "../schemas/index.js";
import { formatCommentsAsMarkdown } from "../formatters.js";

export function registerCommentTools(server: McpServer, client: YandexTrackerClient): void {

  server.registerTool(
    "yandex_tracker_get_comments",
    {
      title: "Get Issue Comments",
      description: `Get all comments for a specific issue.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - expand (string): Extra fields to include (e.g., "attachments,reactions")
  - response_format ("json"|"markdown", default: "markdown"): Output format

Returns:
  List of comments with author, text, creation date, and edit timestamps.

Examples:
  - "Show comments on PROJ-123" -> issue_key="PROJ-123"
  - "Get comments with attachments" -> issue_key="PROJ-123", expand="attachments"

Error Handling:
  - 404: Issue not found.`,
      inputSchema: GetCommentsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof GetCommentsSchema>) => {
      const comments = await client.getComments(args.issue_key, args.expand);
      if (args.response_format === "json") {
        return { content: [{ type: "text" as const, text: JSON.stringify(comments, null, 2) }] };
      }
      return { content: [{ type: "text" as const, text: formatCommentsAsMarkdown(comments) }] };
    }
  );

  server.registerTool(
    "yandex_tracker_add_comment",
    {
      title: "Add Comment to Issue",
      description: `Add a comment to an issue, optionally mentioning/summoning users.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - text (string, required): Comment text
  - summonees (string[]): Logins of users to mention — they will receive a notification

Returns:
  Created comment with author, text, and timestamp.

Examples:
  - "Comment on PROJ-123" -> issue_key="PROJ-123", text="Fixed in commit abc123"
  - "Mention john on PROJ-456" -> issue_key="PROJ-456", text="Please review", summonees=["john"]

Error Handling:
  - 404: Issue not found.
  - 400: Empty comment text.`,
      inputSchema: AddCommentSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof AddCommentSchema>) => {
      const { issue_key, ...commentData } = args;
      const comment = await client.addComment(issue_key, commentData);
      return {
        content: [{
          type: "text" as const,
          text: `Comment added to ${issue_key}\n\nBy: ${comment.createdBy?.display ?? "Unknown"}\nText: ${comment.text ?? ""}`,
        }],
      };
    }
  );
}
