import { z } from "zod";
function formatLinks(links) {
    if (!links.length)
        return "No issue links found.";
    let md = `# Issue Links (${links.length})\n\n`;
    for (const link of links) {
        const type = link.type?.display ?? link.type?.id ?? "Unknown";
        const direction = link.direction ?? "";
        const obj = link.object;
        const key = obj?.key ?? "N/A";
        const summary = obj?.display ?? obj?.summary ?? "";
        const status = obj?.status?.display ?? "";
        md += `- **${type}** ${direction}: **${key}** ${summary}`;
        if (status)
            md += ` (${status})`;
        md += `\n`;
    }
    return md;
}
const GetLinksSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const CreateLinkSchema = z.object({
    issue_key: z.string().describe("Source issue key"),
    relationship: z.string().describe("Link type: 'relates', 'depends on', 'is dependent by', 'is subtask for', 'is parent task for', 'duplicates', 'is duplicated by'"),
    issue: z.string().describe("Target issue key"),
}).strict();
const DeleteLinkSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    link_id: z.string().describe("Link ID"),
}).strict();
export function registerLinkTools(server, client) {
    server.registerTool("yandex_tracker_get_links", {
        title: "Get Issue Links",
        description: `Get all links for an issue — dependencies, subtasks, duplicates, related.

Args:
  - issue_key (string, required): Issue key
  - response_format: "json" or "markdown"

Returns: List of linked issues with relationship type, direction, key, summary, status.`,
        inputSchema: GetLinksSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const links = await client.request(`/issues/${args.issue_key}/links`);
        const text = args.response_format === "json"
            ? JSON.stringify(links, null, 2)
            : formatLinks(links);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_create_link", {
        title: "Create Issue Link",
        description: `Create a link between two issues.

Args:
  - issue_key (string, required): Source issue key
  - relationship (string, required): Link type
  - issue (string, required): Target issue key

Examples:
  - "PROJ-123 depends on PROJ-100" -> relationship="depends on", issue="PROJ-100"
  - "Mark PROJ-456 as duplicate" -> relationship="duplicates", issue="PROJ-123"`,
        inputSchema: CreateLinkSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        await client.request(`/issues/${args.issue_key}/links`, {
            method: "POST",
            body: JSON.stringify({ relationship: args.relationship, issue: args.issue }),
        });
        return { content: [{ type: "text", text: `Link created: ${args.issue_key} --[${args.relationship}]--> ${args.issue}` }] };
    });
    server.registerTool("yandex_tracker_delete_link", {
        title: "Delete Issue Link",
        description: `Delete a link from an issue.

Args:
  - issue_key (string, required): Issue key
  - link_id (string, required): Link ID (from get_links response)

Returns: Confirmation.`,
        inputSchema: DeleteLinkSchema,
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        await client.request(`/issues/${args.issue_key}/links/${args.link_id}`, { method: "DELETE" });
        return { content: [{ type: "text", text: `Link ${args.link_id} deleted from ${args.issue_key}` }] };
    });
}
//# sourceMappingURL=links.js.map