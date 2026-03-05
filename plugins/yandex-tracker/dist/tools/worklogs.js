import { z } from "zod";
function formatWorklogs(worklogs) {
    if (!worklogs.length)
        return "No worklog entries found.";
    let md = `# Worklog Entries (${worklogs.length})\n\n`;
    for (const log of worklogs) {
        md += `## ${log.createdBy?.display ?? "Unknown"}\n`;
        md += `**Duration:** ${log.duration}\n`;
        md += `**Start:** ${log.start}\n`;
        md += `**Created:** ${log.createdAt}\n`;
        if (log.comment)
            md += `**Comment:** ${log.comment}\n`;
        md += `\n`;
    }
    return md;
}
const GetWorklogsSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const AddWorklogSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    duration: z.string().describe("Duration in ISO 8601 (e.g., 'PT2H', 'PT30M', 'P1D')"),
    start: z.string().optional().describe("Start time in ISO 8601 (default: now)"),
    comment: z.string().optional().describe("Work description"),
}).strict();
const UpdateWorklogSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    worklog_id: z.string().describe("Worklog ID"),
    duration: z.string().optional().describe("New duration in ISO 8601"),
    start: z.string().optional().describe("New start time"),
    comment: z.string().optional().describe("New comment"),
}).strict();
const DeleteWorklogSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    worklog_id: z.string().describe("Worklog ID"),
}).strict();
export function registerWorklogTools(server, client) {
    server.registerTool("yandex_tracker_get_worklogs", {
        title: "Get Worklogs",
        description: `Get all time tracking records for an issue.

Args:
  - issue_key (string, required): Issue key
  - response_format: "json" or "markdown"

Returns: Worklog entries with duration, start time, author, comments.`,
        inputSchema: GetWorklogsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const worklogs = await client.request(`/issues/${args.issue_key}/worklog`);
        const text = args.response_format === "json"
            ? JSON.stringify(worklogs, null, 2)
            : formatWorklogs(worklogs);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_add_worklog", {
        title: "Add Worklog",
        description: `Add a time tracking record to an issue.

Args:
  - issue_key (string, required): Issue key
  - duration (string, required): ISO 8601 duration — "PT2H" (2h), "PT30M" (30m), "P1D" (8h business day)
  - start (string): Start time in ISO 8601 (default: now)
  - comment (string): Work description

Examples:
  - "Log 3 hours on PROJ-123" -> duration="PT3H"
  - "Log half day" -> duration="PT4H", comment="Code review"`,
        inputSchema: AddWorklogSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    }, async (args) => {
        const body = { duration: args.duration };
        if (args.start)
            body.start = args.start;
        if (args.comment)
            body.comment = args.comment;
        const worklog = await client.request(`/issues/${args.issue_key}/worklog`, { method: "POST", body: JSON.stringify(body) });
        return { content: [{ type: "text", text: `Worklog added to ${args.issue_key}\n\nDuration: ${worklog.duration}\nStart: ${worklog.start}${worklog.comment ? `\nComment: ${worklog.comment}` : ""}` }] };
    });
    server.registerTool("yandex_tracker_update_worklog", {
        title: "Update Worklog",
        description: `Update an existing worklog entry.

Args:
  - issue_key (string, required): Issue key
  - worklog_id (string, required): Worklog ID
  - duration, start, comment — optional new values

Returns: Updated worklog.`,
        inputSchema: UpdateWorklogSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const body = {};
        if (args.duration)
            body.duration = args.duration;
        if (args.start)
            body.start = args.start;
        if (args.comment)
            body.comment = args.comment;
        const worklog = await client.request(`/issues/${args.issue_key}/worklog/${args.worklog_id}`, { method: "PATCH", body: JSON.stringify(body) });
        return { content: [{ type: "text", text: `Worklog ${args.worklog_id} updated on ${args.issue_key}\nDuration: ${worklog.duration}` }] };
    });
    server.registerTool("yandex_tracker_delete_worklog", {
        title: "Delete Worklog",
        description: `Delete a worklog entry from an issue.

Args:
  - issue_key (string, required): Issue key
  - worklog_id (string, required): Worklog ID

Returns: Confirmation.`,
        inputSchema: DeleteWorklogSchema,
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        await client.request(`/issues/${args.issue_key}/worklog/${args.worklog_id}`, { method: "DELETE" });
        return { content: [{ type: "text", text: `Worklog ${args.worklog_id} deleted from ${args.issue_key}` }] };
    });
}
//# sourceMappingURL=worklogs.js.map