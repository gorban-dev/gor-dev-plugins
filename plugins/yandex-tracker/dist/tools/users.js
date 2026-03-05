import { z } from "zod";
const GetMyselfSchema = z.object({
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
export function registerUserTools(server, client) {
    server.registerTool("yandex_tracker_get_myself", {
        title: "Get Current User",
        description: `Get information about the currently authenticated user. Useful to get your login for search queries with Assignee field.

Args:
  - response_format: "json" or "markdown"

Returns: User info with login, display name, email.`,
        inputSchema: GetMyselfSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const user = await client.request("/myself");
        if (args.response_format === "json") {
            return { content: [{ type: "text", text: JSON.stringify(user, null, 2) }] };
        }
        let md = `# Current User\n\n`;
        md += `**Login:** ${user.login ?? "N/A"}\n`;
        md += `**Display Name:** ${user.display ?? "N/A"}\n`;
        if (user.email)
            md += `**Email:** ${user.email}\n`;
        if (user.uid)
            md += `**UID:** ${user.uid}\n`;
        return { content: [{ type: "text", text: md }] };
    });
}
//# sourceMappingURL=users.js.map