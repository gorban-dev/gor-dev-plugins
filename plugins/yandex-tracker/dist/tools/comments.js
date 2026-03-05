import { z } from "zod";
function formatComments(comments) {
    if (!comments.length)
        return "No comments found.";
    let md = `# Comments (${comments.length})\n\n`;
    for (const c of comments) {
        md += `## ${c.createdBy?.display ?? "Unknown"} — ${c.createdAt ?? "N/A"}\n\n`;
        md += `${c.text ?? ""}\n\n`;
        if (c.updatedAt && c.updatedAt !== c.createdAt)
            md += `*Edited: ${c.updatedAt}*\n\n`;
        md += `---\n\n`;
    }
    return md;
}
const GetCommentsSchema = z.object({
    issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
    expand: z.string().optional().describe("Extra fields (e.g., 'attachments,reactions')"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const AddCommentSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    text: z.string().min(1).describe("Comment text"),
    summonees: z.array(z.string()).optional().describe("Logins to mention/summon"),
}).strict();
const UpdateCommentSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    comment_id: z.number().describe("Comment ID"),
    text: z.string().min(1).describe("New comment text"),
}).strict();
const DeleteCommentSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    comment_id: z.number().describe("Comment ID"),
}).strict();
export function registerCommentTools(server, client) {
    server.registerTool("yandex_tracker_get_comments", {
        title: "Get Comments",
        description: `Get all comments for an issue.

Args:
  - issue_key (string, required): Issue key
  - expand (string): Extra fields (e.g., "attachments,reactions")
  - response_format: "json" or "markdown"

Returns: List of comments with author, text, timestamps.`,
        inputSchema: GetCommentsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const qp = args.expand ? `?expand=${encodeURIComponent(args.expand)}` : "";
        const comments = await client.request(`/issues/${args.issue_key}/comments${qp}`);
        const text = args.response_format === "json"
            ? JSON.stringify(comments, null, 2)
            : formatComments(comments);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_add_comment", {
        title: "Add Comment",
        description: `Add a comment to an issue, optionally mentioning users.

Args:
  - issue_key (string, required): Issue key
  - text (string, required): Comment text
  - summonees (string[]): Logins to mention

Returns: Created comment with author and timestamp.`,
        inputSchema: AddCommentSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    }, async (args) => {
        const body = { text: args.text };
        if (args.summonees)
            body.summonees = args.summonees;
        const comment = await client.request(`/issues/${args.issue_key}/comments`, { method: "POST", body: JSON.stringify(body) });
        return { content: [{ type: "text", text: `Comment added to ${args.issue_key}\n\nBy: ${comment.createdBy?.display ?? "Unknown"}\nText: ${comment.text ?? ""}` }] };
    });
    server.registerTool("yandex_tracker_update_comment", {
        title: "Update Comment",
        description: `Update an existing comment on an issue.

Args:
  - issue_key (string, required): Issue key
  - comment_id (number, required): Comment ID
  - text (string, required): New comment text

Returns: Updated comment.`,
        inputSchema: UpdateCommentSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const comment = await client.request(`/issues/${args.issue_key}/comments/${args.comment_id}`, { method: "PATCH", body: JSON.stringify({ text: args.text }) });
        return { content: [{ type: "text", text: `Comment ${args.comment_id} updated on ${args.issue_key}\n\nText: ${comment.text ?? ""}` }] };
    });
    server.registerTool("yandex_tracker_delete_comment", {
        title: "Delete Comment",
        description: `Delete a comment from an issue.

Args:
  - issue_key (string, required): Issue key
  - comment_id (number, required): Comment ID

Returns: Confirmation.`,
        inputSchema: DeleteCommentSchema,
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        await client.request(`/issues/${args.issue_key}/comments/${args.comment_id}`, { method: "DELETE" });
        return { content: [{ type: "text", text: `Comment ${args.comment_id} deleted from ${args.issue_key}` }] };
    });
}
//# sourceMappingURL=comments.js.map