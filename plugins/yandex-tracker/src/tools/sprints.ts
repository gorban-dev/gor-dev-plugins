import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type TrackerClient, withErrorHandling } from "../client.js";

interface Sprint {
  id?: number;
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  board?: { id?: number; name?: string };
}
interface DisplayField { key?: string; display?: string }
interface User { display?: string }
interface Issue {
  key: string;
  summary: string;
  status?: DisplayField;
  priority?: DisplayField;
  assignee?: User;
}

function formatSprint(sprint: Sprint): string {
  let md = `# Sprint: ${sprint.name ?? "N/A"}\n\n`;
  md += `**ID:** ${sprint.id ?? "N/A"}\n`;
  md += `**Status:** ${sprint.status ?? "N/A"}\n`;
  if (sprint.startDate) md += `**Start:** ${sprint.startDate}\n`;
  if (sprint.endDate) md += `**End:** ${sprint.endDate}\n`;
  if (sprint.board?.name) md += `**Board:** ${sprint.board.name}\n`;
  return md;
}

function formatSprints(sprints: Sprint[]): string {
  if (!sprints.length) return "No sprints found.";
  let md = `# Sprints (${sprints.length})\n\n`;
  md += `| ID | Name | Status | Start | End |\n`;
  md += `|----|------|--------|-------|-----|\n`;
  for (const s of sprints) {
    md += `| ${s.id ?? "N/A"} | ${s.name ?? "N/A"} | ${s.status ?? "N/A"} | ${s.startDate ?? "N/A"} | ${s.endDate ?? "N/A"} |\n`;
  }
  return md;
}

function formatSprintIssues(issues: Issue[]): string {
  if (!issues.length) return "No issues in this sprint.";
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

export function registerSprintTools(server: McpServer, client: TrackerClient): void {
  server.registerTool(
    "yandex_tracker_get_sprint",
    {
      title: "Get Sprint",
      description: `Get sprint details — name, status, dates.

Args:
  - sprint_id (number, required): Sprint ID
  - response_format: "json" or "markdown"

Returns: Sprint info with name, status, start/end dates, board.`,
      inputSchema: GetSprintSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof GetSprintSchema>) => {
      const sprint = await client.request<Sprint>(`/sprints/${args.sprint_id}`);
      const text = args.response_format === "json"
        ? JSON.stringify(sprint, null, 2)
        : formatSprint(sprint);
      return { content: [{ type: "text" as const, text }] };
    }),
  );

  server.registerTool(
    "yandex_tracker_list_sprints",
    {
      title: "List Sprints",
      description: `List all sprints for a board.

Args:
  - board_id (number, required): Board ID
  - response_format: "json" or "markdown"

Returns: Table of sprints with ID, name, status, dates.`,
      inputSchema: ListSprintsSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof ListSprintsSchema>) => {
      const sprints = await client.request<Sprint[]>(`/boards/${args.board_id}/sprints`);
      const text = args.response_format === "json"
        ? JSON.stringify(sprints, null, 2)
        : formatSprints(Array.isArray(sprints) ? sprints : []);
      return { content: [{ type: "text" as const, text }] };
    }),
  );

  server.registerTool(
    "yandex_tracker_get_sprint_issues",
    {
      title: "Get Sprint Issues",
      description: `Get all issues in a specific sprint.

Args:
  - board_id (number, required): Board ID
  - sprint_id (number, required): Sprint ID
  - response_format: "json" or "markdown"

Returns: List of issues with key, summary, status, priority, assignee.`,
      inputSchema: GetSprintIssuesSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof GetSprintIssuesSchema>) => {
      const issues = await client.request<Issue[]>(`/boards/${args.board_id}/sprints/${args.sprint_id}/issues`);
      const text = args.response_format === "json"
        ? JSON.stringify(issues, null, 2)
        : formatSprintIssues(Array.isArray(issues) ? issues : []);
      return { content: [{ type: "text" as const, text }] };
    }),
  );
}
