import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type TrackerClient, withErrorHandling } from "../client.js";

interface UserInfo {
  uid?: string;
  login?: string;
  display?: string;
  email?: string;
  trackerUid?: number;
}

const GetMyselfSchema = z.object({
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export function registerUserTools(server: McpServer, client: TrackerClient): void {
  server.registerTool(
    "yandex_tracker_get_myself",
    {
      title: "Get Current User",
      description: `Get information about the currently authenticated user. Useful to get your login for search queries with Assignee field.

Args:
  - response_format: "json" or "markdown"

Returns: User info with login, display name, email.`,
      inputSchema: GetMyselfSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof GetMyselfSchema>) => {
      const user = await client.request<UserInfo>("/myself");
      if (args.response_format === "json") {
        return { content: [{ type: "text" as const, text: JSON.stringify(user, null, 2) }] };
      }
      let md = `# Current User\n\n`;
      md += `**Login:** ${user.login ?? "N/A"}\n`;
      md += `**Display Name:** ${user.display ?? "N/A"}\n`;
      if (user.email) md += `**Email:** ${user.email}\n`;
      if (user.uid) md += `**UID:** ${user.uid}\n`;
      return { content: [{ type: "text" as const, text: md }] };
    }),
  );
}
