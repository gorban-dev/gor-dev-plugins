import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { YandexTrackerClient } from "../services/tracker-client.js";
import { GetTransitionsSchema, TransitionIssueSchema } from "../schemas/index.js";
import { formatTransitionsAsMarkdown } from "../formatters.js";

export function registerTransitionTools(server: McpServer, client: YandexTrackerClient): void {

  server.registerTool(
    "yandex_tracker_get_transitions",
    {
      title: "Get Issue Transitions",
      description: `Get available status transitions for an issue. ALWAYS call this before transition_issue to discover valid transition IDs.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - response_format ("json"|"markdown", default: "markdown"): Output format

Returns:
  Table of available transitions with ID, display name, and target status.
  Use the ID value with transition_issue to execute the transition.

Examples:
  - "What status changes can I make on PROJ-123?" -> issue_key="PROJ-123"

Error Handling:
  - 404: Issue not found.`,
      inputSchema: GetTransitionsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof GetTransitionsSchema>) => {
      const transitions = await client.getTransitions(args.issue_key);
      if (args.response_format === "json") {
        return { content: [{ type: "text" as const, text: JSON.stringify(transitions, null, 2) }] };
      }
      return { content: [{ type: "text" as const, text: formatTransitionsAsMarkdown(transitions) }] };
    }
  );

  server.registerTool(
    "yandex_tracker_transition_issue",
    {
      title: "Execute Issue Transition",
      description: `Execute a status transition on an issue. First call get_transitions to find valid transition IDs.

Args:
  - issue_key (string, required): Issue key (e.g., "MYQUEUE-123")
  - transition_id (string, required): Transition ID from get_transitions (e.g., "start_progress", "close")
  - comment (string): Optional comment for the transition

Returns:
  Confirmation with transition ID and issue key.

Examples:
  - "Move PROJ-123 to in progress" -> first get_transitions, then transition_id="start_progress"
  - "Close PROJ-456 with comment" -> transition_id="close", comment="Done"

Error Handling:
  - 404: Issue or transition not found.
  - 400: Transition not available from current status. Call get_transitions first.
  - 403: No permission to change status.`,
      inputSchema: TransitionIssueSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (args: z.infer<typeof TransitionIssueSchema>) => {
      await client.transitionIssue(
        args.issue_key,
        args.transition_id,
        args.comment ? { comment: args.comment } : undefined
      );
      return {
        content: [{
          type: "text" as const,
          text: `Transition '${args.transition_id}' executed on ${args.issue_key}${args.comment ? `\nComment: ${args.comment}` : ""}`,
        }],
      };
    }
  );
}
