import { z } from "zod";

export const GetIssueSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  response_format: z
    .enum(["json", "markdown"])
    .default("markdown")
    .describe("Output format: 'markdown' for human-readable or 'json' for structured data"),
}).strict();

export const CreateIssueSchema = z.object({
  queue: z.string().min(1).describe("Queue key (e.g., PROJ)"),
  summary: z.string().min(1).max(255).describe("Issue title"),
  description: z.string().optional().describe("Issue description (plain text or wiki markup)"),
  type: z.string().optional().describe("Issue type key (e.g., 'task', 'bug', 'story', 'epic')"),
  priority: z.string().optional().describe("Priority key (e.g., 'trivial', 'minor', 'normal', 'critical', 'blocker')"),
  assignee: z.string().optional().describe("Assignee login"),
  parent: z.string().optional().describe("Parent issue key (e.g., PROJ-100)"),
  followers: z.array(z.string()).optional().describe("Follower logins"),
  tags: z.array(z.string()).optional().describe("Tags"),
  sprint: z.string().optional().describe("Sprint ID"),
}).strict();

export const UpdateIssueSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  summary: z.string().optional().describe("Issue summary/title"),
  description: z.string().optional().describe("Issue description"),
  status: z.string().optional().describe("Status key (e.g., 'open', 'inProgress', 'closed')"),
  assignee: z.string().optional().describe("Assignee login"),
  originalEstimation: z.string().optional().describe("Original estimate in ISO 8601 (e.g., 'PT8H', 'P1D', 'P1W')"),
  estimation: z.string().optional().describe("Remaining estimate in ISO 8601 (e.g., 'PT4H', 'P2D')"),
  spent: z.string().optional().describe("Time spent in ISO 8601 (e.g., 'PT2H')"),
  priority: z.string().optional().describe("Priority key (e.g., 'minor', 'normal', 'critical')"),
  type: z.string().optional().describe("Issue type key (e.g., 'task', 'bug', 'improvement')"),
}).strict();

export const SearchIssuesSchema = z.object({
  query: z.string().optional().describe("Query in Yandex Tracker language (e.g., 'Queue: PROJ AND Status: open')"),
  filter: z.record(z.unknown()).optional().describe("Filter object (alternative to query)"),
  order: z.array(z.string()).optional().describe("Sort order (e.g., ['-updated', '+priority'])"),
  limit: z.number().int().min(1).max(100).default(20).describe("Max results (1-100, default: 20)"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset (default: 0)"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export const AddWorklogSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  duration: z.string().describe("Duration in ISO 8601 (e.g., 'PT2H', 'PT30M', 'P1D')"),
  start: z.string().optional().describe("Start time in ISO 8601 (default: now)"),
  comment: z.string().optional().describe("Work description"),
}).strict();

export const GetWorklogsSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export const GetCommentsSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  expand: z.string().optional().describe("Extra fields (e.g., 'attachments,reactions')"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export const AddCommentSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  text: z.string().min(1).describe("Comment text"),
  summonees: z.array(z.string()).optional().describe("Logins to mention/summon"),
}).strict();

export const GetTransitionsSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export const TransitionIssueSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  transition_id: z.string().describe("Transition ID from get_transitions"),
  comment: z.string().optional().describe("Comment for the transition"),
}).strict();

export const GetIssueLinksSchema = z.object({
  issue_key: z.string().describe("Issue key (e.g., MYQUEUE-123)"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export const LinkIssuesSchema = z.object({
  issue_key: z.string().describe("Source issue key (e.g., MYQUEUE-123)"),
  relationship: z.string().describe("Link type: 'relates', 'depends on', 'is dependent by', 'is subtask for', 'is parent task for', 'duplicates', 'is duplicated by'"),
  issue: z.string().describe("Target issue key (e.g., MYQUEUE-456)"),
}).strict();
