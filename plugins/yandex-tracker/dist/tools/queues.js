import { z } from "zod";
function formatQueue(queue) {
    let md = `# Queue: ${queue.key}\n\n`;
    md += `**Name:** ${queue.name ?? queue.key}\n`;
    if (queue.description)
        md += `**Description:** ${queue.description}\n`;
    if (queue.lead?.display)
        md += `**Lead:** ${queue.lead.display}\n`;
    if (queue.defaultType)
        md += `**Default Type:** ${queue.defaultType.display ?? queue.defaultType.key ?? "N/A"}\n`;
    if (queue.defaultPriority)
        md += `**Default Priority:** ${queue.defaultPriority.display ?? queue.defaultPriority.key ?? "N/A"}\n`;
    if (queue.issueTypesConfig?.length) {
        md += `\n**Issue Types:**\n`;
        for (const tc of queue.issueTypesConfig) {
            md += `- ${tc.issueType?.display ?? tc.issueType?.key ?? "N/A"}\n`;
        }
    }
    return md;
}
function formatQueues(queues) {
    if (!queues.length)
        return "No queues found.";
    let md = `# Queues (${queues.length})\n\n`;
    md += `| Key | Name | Lead |\n`;
    md += `|-----|------|------|\n`;
    for (const q of queues) {
        md += `| ${q.key} | ${q.name ?? "N/A"} | ${q.lead?.display ?? "N/A"} |\n`;
    }
    return md;
}
const GetQueueSchema = z.object({
    queue_key: z.string().describe("Queue key (e.g., PROJ)"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const ListQueuesSchema = z.object({
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
export function registerQueueTools(server, client) {
    server.registerTool("yandex_tracker_get_queue", {
        title: "Get Queue",
        description: `Get queue details — name, lead, default type/priority, allowed issue types.

Args:
  - queue_key (string, required): Queue key (e.g., "PROJ")
  - response_format: "json" or "markdown"

Returns: Queue info with name, description, lead, default settings.`,
        inputSchema: GetQueueSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const queue = await client.request(`/queues/${args.queue_key}`);
        const text = args.response_format === "json"
            ? JSON.stringify(queue, null, 2)
            : formatQueue(queue);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_list_queues", {
        title: "List Queues",
        description: `List all available queues.

Args:
  - response_format: "json" or "markdown"

Returns: Table of queues with key, name, lead.`,
        inputSchema: ListQueuesSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const queues = await client.request("/queues");
        const text = args.response_format === "json"
            ? JSON.stringify(queues, null, 2)
            : formatQueues(Array.isArray(queues) ? queues : []);
        return { content: [{ type: "text", text }] };
    });
}
//# sourceMappingURL=queues.js.map