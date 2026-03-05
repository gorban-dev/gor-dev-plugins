import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type TrackerClient, withErrorHandling } from "../client.js";

const CHARACTER_LIMIT = 25000;

function truncate(text: string): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  return (
    text.slice(0, CHARACTER_LIMIT) +
    "\n\n---\n*Response truncated. Use filters or pagination to narrow results.*"
  );
}

interface DisplayField {
  key?: string;
  display?: string;
  id?: string;
}
interface User {
  display?: string;
  id?: string;
  login?: string;
}
interface Issue {
  key: string;
  summary: string;
  status?: DisplayField;
  type?: DisplayField;
  priority?: DisplayField;
  assignee?: User;
  createdAt?: string;
  updatedAt?: string;
  originalEstimation?: string;
  estimation?: string;
  spent?: string;
  description?: string;
  queue?: DisplayField;
  parent?: { key?: string };
  tags?: string[];
}

function formatIssue(issue: Issue): string {
  let md = `# ${issue.key}: ${issue.summary}\n\n`;
  md += `**Status:** ${issue.status?.display ?? issue.status?.key ?? "N/A"}\n`;
  md += `**Type:** ${issue.type?.display ?? issue.type?.key ?? "N/A"}\n`;
  md += `**Priority:** ${issue.priority?.display ?? issue.priority?.key ?? "N/A"}\n`;
  md += `**Assignee:** ${issue.assignee?.display ?? "Unassigned"}\n`;
  md += `**Created:** ${issue.createdAt ?? "N/A"}\n`;
  md += `**Updated:** ${issue.updatedAt ?? "N/A"}\n`;
  if (issue.queue) md += `**Queue:** ${issue.queue.display ?? issue.queue.key ?? "N/A"}\n`;
  if (issue.parent?.key) md += `**Parent:** ${issue.parent.key}\n`;
  if (issue.tags?.length) md += `**Tags:** ${issue.tags.join(", ")}\n`;
  md += `\n`;
  if (issue.originalEstimation) md += `**Original Estimate:** ${issue.originalEstimation}\n`;
  if (issue.estimation) md += `**Remaining Estimate:** ${issue.estimation}\n`;
  if (issue.spent) md += `**Time Spent:** ${issue.spent}\n`;
  if (issue.description) md += `\n## Description\n\n${issue.description}\n`;
  return truncate(md);
}

function formatSearchResults(issues: Issue[], offset: number, perPage: number): string {
  if (!issues.length) return "No issues found.";
  const hasMore = issues.length >= perPage;
  let md = `# Search Results\n\nFound ${issues.length} issues (offset ${offset})`;
  if (hasMore) md += ` — more available`;
  md += `\n\n`;
  for (const issue of issues) {
    md += `## ${issue.key}: ${issue.summary}\n`;
    md += `**Status:** ${issue.status?.display ?? "N/A"} | `;
    md += `**Priority:** ${issue.priority?.display ?? "N/A"} | `;
    md += `**Assignee:** ${issue.assignee?.display ?? "Unassigned"}\n`;
    md += `**Updated:** ${issue.updatedAt ?? "N/A"}\n\n`;
  }
  if (hasMore) {
    md += `---\n*Use offset=${offset + issues.length} to see more results*\n`;
  }
  return truncate(md);
}

const GetIssueSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

const CreateIssueSchema = z.object({
  queue: z.string().min(1).describe("Queue key (e.g., PROJ)"),
  summary: z.string().min(1).max(255).describe("Issue title"),
  description: z.string().optional().describe("Issue description"),
  type: z.string().optional().describe("Issue type key: task, bug, story, epic, improvement"),
  priority: z.string().optional().describe("Priority key: trivial, minor, normal, critical, blocker"),
  assignee: z.string().optional().describe("Assignee login"),
  parent: z.string().optional().describe("Parent issue key for subtasks"),
  followers: z.array(z.string()).optional().describe("Follower logins"),
  tags: z.array(z.string()).optional().describe("Tags"),
  sprint: z.string().optional().describe("Sprint ID"),
}).strict();

const UpdateIssueSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  summary: z.string().optional().describe("Issue title"),
  description: z.string().optional().describe("Issue description"),
  assignee: z.string().optional().describe("Assignee login"),
  originalEstimation: z.string().optional().describe("Original estimate in ISO 8601 (PT8H, P1D)"),
  estimation: z.string().optional().describe("Remaining estimate in ISO 8601"),
  spent: z.string().optional().describe("Time spent in ISO 8601"),
  priority: z.string().optional().describe("Priority key"),
  type: z.string().optional().describe("Issue type key"),
}).strict();

const SearchIssuesSchema = z.object({
  query: z.string().optional().describe("Query in Yandex Tracker language (e.g., 'Queue: PROJ AND Status: open')"),
  filter: z.record(z.unknown()).optional().describe("Filter object (alternative to query)"),
  order: z.array(z.string()).optional().describe("Sort order (e.g., ['-updated', '+priority'])"),
  limit: z.number().int().min(1).max(100).default(20).describe("Max results (1-100, default: 20)"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export function registerIssueTools(server: McpServer, client: TrackerClient): void {
  server.registerTool(
    "yandex_tracker_get_issue",
    {
      title: "Get Issue",
      description: `Get detailed information about a Yandex Tracker issue by key.

Args:
  - issue_key (string, required): Issue key (e.g., "PROJ-123")
  - response_format ("json"|"markdown", default: "markdown"): Output format

Returns: Issue data with key, summary, status, type, priority, assignee, dates, estimates, description.

Examples:
  - "Show issue PROJ-456" -> issue_key="PROJ-456"
  - "Get PROJ-123 as JSON" -> issue_key="PROJ-123", response_format="json"`,
      inputSchema: GetIssueSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof GetIssueSchema>) => {
      const issue = await client.request<Issue>(`/issues/${args.issue_key}`);
      const text = args.response_format === "json"
        ? JSON.stringify(issue, null, 2)
        : formatIssue(issue);
      return { content: [{ type: "text" as const, text }] };
    }),
  );

  server.registerTool(
    "yandex_tracker_create_issue",
    {
      title: "Create Issue",
      description: `Create a new issue in Yandex Tracker.

Args:
  - queue (string, required): Queue key (e.g., "PROJ")
  - summary (string, required): Issue title (max 255 chars)
  - description, type, priority, assignee, parent, followers, tags, sprint — optional fields

Returns: Created issue with key, summary, status.

Examples:
  - "Create a bug in PROJ" -> queue="PROJ", summary="...", type="bug"
  - "Create subtask for PROJ-100" -> queue="PROJ", summary="...", parent="PROJ-100"`,
      inputSchema: CreateIssueSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof CreateIssueSchema>) => {
      const body: Record<string, unknown> = { queue: args.queue, summary: args.summary };
      if (args.description) body.description = args.description;
      if (args.type) body.type = { key: args.type };
      if (args.priority) body.priority = { key: args.priority };
      if (args.assignee) body.assignee = args.assignee;
      if (args.parent) body.parent = args.parent;
      if (args.followers) body.followers = { add: args.followers };
      if (args.tags) body.tags = args.tags;
      if (args.sprint) body.sprint = [{ id: args.sprint }];
      const issue = await client.request<Issue>("/issues", { method: "POST", body: JSON.stringify(body) });
      return { content: [{ type: "text" as const, text: `Issue ${issue.key} created\n\n${formatIssue(issue)}` }] };
    }),
  );

  server.registerTool(
    "yandex_tracker_update_issue",
    {
      title: "Update Issue",
      description: `Update fields of an existing issue. Only specified fields are changed.

Args:
  - issue_key (string, required): Issue key
  - summary, description, assignee, priority, type, originalEstimation, estimation, spent — optional

Returns: Updated issue.

Examples:
  - "Set estimate to 16h" -> issue_key="PROJ-456", originalEstimation="PT16H"
  - "Assign to john" -> issue_key="PROJ-123", assignee="john"`,
      inputSchema: UpdateIssueSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof UpdateIssueSchema>) => {
      const { issue_key, ...updates } = args;
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) continue;
        if (["type", "priority"].includes(key)) {
          body[key] = { key: value };
        } else {
          body[key] = value;
        }
      }
      const issue = await client.request<Issue>(`/issues/${issue_key}`, { method: "PATCH", body: JSON.stringify(body) });
      return { content: [{ type: "text" as const, text: `Issue ${issue_key} updated\n\n${formatIssue(issue)}` }] };
    }),
  );

  server.registerTool(
    "yandex_tracker_search_issues",
    {
      title: "Search Issues",
      description: `Search for issues using Yandex Tracker query language or filter objects.

Args:
  - query (string): Query string (e.g., "Queue: PROJ AND Assignee: me() AND Status: open")
  - filter (object): Alternative key-value filter
  - order (string[]): Sort order (e.g., ["-updated", "+priority"])
  - limit (number, 1-100, default: 20): Max results
  - offset (number, default: 0): Pagination offset
  - response_format ("json"|"markdown"): Output format

Examples:
  - "Find open bugs in PROJ" -> query="Queue: PROJ AND Type: bug AND Status: open"
  - "My tasks" -> query="Assignee: me() AND Status: !closed"`,
      inputSchema: SearchIssuesSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof SearchIssuesSchema>) => {
      const body: Record<string, unknown> = {};
      if (args.query) body.query = args.query;
      if (args.filter) body.filter = args.filter;
      if (args.order) body.order = args.order;
      const perPage = args.limit ?? 20;
      const page = Math.floor((args.offset ?? 0) / perPage) + 1;
      const qp = new URLSearchParams({ perPage: perPage.toString(), page: page.toString() });
      const issues = await client.request<Issue[]>(`/issues/_search?${qp.toString()}`, { method: "POST", body: JSON.stringify(body) });
      const safeIssues = Array.isArray(issues) ? issues : [];
      if (args.response_format === "json") {
        const result = { issues: safeIssues, count: safeIssues.length, offset: args.offset ?? 0, has_more: safeIssues.length >= perPage };
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      }
      return { content: [{ type: "text" as const, text: formatSearchResults(safeIssues, args.offset ?? 0, perPage) }] };
    }),
  );
}
