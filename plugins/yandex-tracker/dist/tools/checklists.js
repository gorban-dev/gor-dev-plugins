import { z } from "zod";
function formatChecklist(items) {
    if (!items.length)
        return "Checklist is empty.";
    let md = `# Checklist (${items.length} items)\n\n`;
    for (const item of items) {
        const check = item.checked ? "[x]" : "[ ]";
        md += `- ${check} ${item.text ?? "N/A"}`;
        if (item.assignee?.display)
            md += ` (@${item.assignee.display})`;
        if (item.deadline)
            md += ` — due ${item.deadline}`;
        md += `\n`;
    }
    return md;
}
const GetChecklistSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const AddChecklistItemSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    text: z.string().min(1).describe("Checklist item text"),
    checked: z.boolean().optional().describe("Initial checked state (default: false)"),
    deadline: z.string().optional().describe("Deadline in YYYY-MM-DD format"),
    assignee: z.string().optional().describe("Assignee login"),
}).strict();
const UpdateChecklistItemSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    item_id: z.string().describe("Checklist item ID"),
    text: z.string().optional().describe("New text"),
    checked: z.boolean().optional().describe("Checked state"),
    deadline: z.string().optional().describe("Deadline in YYYY-MM-DD"),
    assignee: z.string().optional().describe("Assignee login"),
}).strict();
const DeleteChecklistItemSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    item_id: z.string().describe("Checklist item ID"),
}).strict();
export function registerChecklistTools(server, client) {
    server.registerTool("yandex_tracker_get_checklist", {
        title: "Get Checklist",
        description: `Get the checklist items for an issue.

Args:
  - issue_key (string, required): Issue key
  - response_format: "json" or "markdown"

Returns: Checklist items with text, checked state, assignee, deadline.`,
        inputSchema: GetChecklistSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const items = await client.request(`/issues/${args.issue_key}/checklistItems`);
        const safeItems = Array.isArray(items) ? items : [];
        const text = args.response_format === "json"
            ? JSON.stringify(safeItems, null, 2)
            : formatChecklist(safeItems);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_add_checklist_item", {
        title: "Add Checklist Item",
        description: `Add an item to issue's checklist.

Args:
  - issue_key (string, required): Issue key
  - text (string, required): Item text
  - checked (boolean): Initial checked state
  - deadline (string): Deadline (YYYY-MM-DD)
  - assignee (string): Assignee login

Returns: Confirmation.`,
        inputSchema: AddChecklistItemSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    }, async (args) => {
        const body = { text: args.text };
        if (args.checked !== undefined)
            body.checked = args.checked;
        if (args.deadline)
            body.deadline = args.deadline;
        if (args.assignee)
            body.assignee = args.assignee;
        await client.request(`/issues/${args.issue_key}/checklistItems`, { method: "POST", body: JSON.stringify(body) });
        return { content: [{ type: "text", text: `Checklist item added to ${args.issue_key}: "${args.text}"` }] };
    });
    server.registerTool("yandex_tracker_update_checklist_item", {
        title: "Update Checklist Item",
        description: `Update a checklist item (text, checked state, deadline, assignee).

Args:
  - issue_key (string, required): Issue key
  - item_id (string, required): Item ID
  - text, checked, deadline, assignee — optional new values

Returns: Confirmation.`,
        inputSchema: UpdateChecklistItemSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const body = {};
        if (args.text)
            body.text = args.text;
        if (args.checked !== undefined)
            body.checked = args.checked;
        if (args.deadline)
            body.deadline = args.deadline;
        if (args.assignee)
            body.assignee = args.assignee;
        await client.request(`/issues/${args.issue_key}/checklistItems/${args.item_id}`, { method: "PATCH", body: JSON.stringify(body) });
        return { content: [{ type: "text", text: `Checklist item ${args.item_id} updated on ${args.issue_key}` }] };
    });
    server.registerTool("yandex_tracker_delete_checklist_item", {
        title: "Delete Checklist Item",
        description: `Delete a checklist item from an issue.

Args:
  - issue_key (string, required): Issue key
  - item_id (string, required): Item ID

Returns: Confirmation.`,
        inputSchema: DeleteChecklistItemSchema,
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        await client.request(`/issues/${args.issue_key}/checklistItems/${args.item_id}`, { method: "DELETE" });
        return { content: [{ type: "text", text: `Checklist item ${args.item_id} deleted from ${args.issue_key}` }] };
    });
}
//# sourceMappingURL=checklists.js.map