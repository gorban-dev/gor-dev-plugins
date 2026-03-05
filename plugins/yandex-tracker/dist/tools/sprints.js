import { z } from "zod";
function formatSprint(sprint) {
    let md = `# Sprint: ${sprint.name ?? "N/A"}\n\n`;
    md += `**ID:** ${sprint.id ?? "N/A"}\n`;
    md += `**Status:** ${sprint.status ?? "N/A"}\n`;
    if (sprint.startDate)
        md += `**Start:** ${sprint.startDate}\n`;
    if (sprint.endDate)
        md += `**End:** ${sprint.endDate}\n`;
    if (sprint.board?.name)
        md += `**Board:** ${sprint.board.name}\n`;
    return md;
}
function formatSprints(sprints) {
    if (!sprints.length)
        return "No sprints found.";
    let md = `# Sprints (${sprints.length})\n\n`;
    md += `| ID | Name | Status | Start | End |\n`;
    md += `|----|------|--------|-------|-----|\n`;
    for (const s of sprints) {
        md += `| ${s.id ?? "N/A"} | ${s.name ?? "N/A"} | ${s.status ?? "N/A"} | ${s.startDate ?? "N/A"} | ${s.endDate ?? "N/A"} |\n`;
    }
    return md;
}
function formatSprintIssues(issues) {
    if (!issues.length)
        return "No issues in this sprint.";
    let md = `# Sprint Issues (${issues.length})\n\n`;
    for (const issue of issues) {
        md += `## ${issue.key}: ${issue.summary}\n`;
        md += `**Status:** ${issue.status?.display ?? "N/A"} | `;
        md += `**Priority:** ${issue.priority?.display ?? "N/A"} | `;
        md += `**Assignee:** ${issue.assignee?.display ?? "Unassigned"}\n\n`;
    }
    return md;
}
const GetSprintSchema = z.object({
    sprint_id: z.number().describe("Sprint ID"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const ListSprintsSchema = z.object({
    board_id: z.number().describe("Board ID"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const GetSprintIssuesSchema = z.object({
    board_id: z.number().describe("Board ID"),
    sprint_id: z.number().describe("Sprint ID"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
export function registerSprintTools(server, client) {
    server.registerTool("yandex_tracker_get_sprint", {
        title: "Get Sprint",
        description: `Get sprint details — name, status, dates.

Args:
  - sprint_id (number, required): Sprint ID
  - response_format: "json" or "markdown"

Returns: Sprint info with name, status, start/end dates, board.`,
        inputSchema: GetSprintSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const sprint = await client.request(`/sprints/${args.sprint_id}`);
        const text = args.response_format === "json"
            ? JSON.stringify(sprint, null, 2)
            : formatSprint(sprint);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_list_sprints", {
        title: "List Sprints",
        description: `List all sprints for a board.

Args:
  - board_id (number, required): Board ID
  - response_format: "json" or "markdown"

Returns: Table of sprints with ID, name, status, dates.`,
        inputSchema: ListSprintsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const sprints = await client.request(`/boards/${args.board_id}/sprints`);
        const text = args.response_format === "json"
            ? JSON.stringify(sprints, null, 2)
            : formatSprints(Array.isArray(sprints) ? sprints : []);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_get_sprint_issues", {
        title: "Get Sprint Issues",
        description: `Get all issues in a specific sprint.

Args:
  - board_id (number, required): Board ID
  - sprint_id (number, required): Sprint ID
  - response_format: "json" or "markdown"

Returns: List of issues with key, summary, status, priority, assignee.`,
        inputSchema: GetSprintIssuesSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const issues = await client.request(`/boards/${args.board_id}/sprints/${args.sprint_id}/issues`);
        const text = args.response_format === "json"
            ? JSON.stringify(issues, null, 2)
            : formatSprintIssues(Array.isArray(issues) ? issues : []);
        return { content: [{ type: "text", text }] };
    });
}
//# sourceMappingURL=sprints.js.map