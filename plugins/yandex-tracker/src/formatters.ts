import { CHARACTER_LIMIT } from "./constants.js";
import type {
  TrackerIssue,
  TrackerWorklog,
  TrackerComment,
  TrackerTransition,
  TrackerIssueLink,
  SearchResult,
} from "./types.js";

function truncate(text: string): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  return text.slice(0, CHARACTER_LIMIT) + "\n\n---\n*Response truncated. Use filters or pagination to narrow results.*";
}

export function formatIssueAsMarkdown(issue: TrackerIssue): string {
  let md = `# ${issue.key}: ${issue.summary}\n\n`;
  md += `**Status:** ${issue.status?.display ?? issue.status?.key ?? "N/A"}\n`;
  md += `**Type:** ${issue.type?.display ?? issue.type?.key ?? "N/A"}\n`;
  md += `**Priority:** ${issue.priority?.display ?? issue.priority?.key ?? "N/A"}\n`;
  md += `**Assignee:** ${issue.assignee?.display ?? "Unassigned"}\n`;
  md += `**Created:** ${issue.createdAt ?? "N/A"}\n`;
  md += `**Updated:** ${issue.updatedAt ?? "N/A"}\n\n`;

  if (issue.originalEstimation) md += `**Original Estimate:** ${issue.originalEstimation}\n`;
  if (issue.estimation) md += `**Remaining Estimate:** ${issue.estimation}\n`;
  if (issue.spent) md += `**Time Spent:** ${issue.spent}\n`;
  if (issue.description) md += `\n## Description\n\n${issue.description}\n`;

  return truncate(md);
}

export function formatSearchResultsAsMarkdown(result: SearchResult): string {
  if (!result.issues.length) return "No issues found.";

  let md = `# Search Results\n\n`;
  md += `Found ${result.count} issues (offset ${result.offset})`;
  if (result.has_more) md += ` — more available`;
  md += `\n\n`;

  for (const issue of result.issues) {
    md += `## ${issue.key}: ${issue.summary}\n`;
    md += `**Status:** ${issue.status?.display ?? "N/A"} | `;
    md += `**Priority:** ${issue.priority?.display ?? "N/A"} | `;
    md += `**Assignee:** ${issue.assignee?.display ?? "Unassigned"}\n`;
    md += `**Updated:** ${issue.updatedAt ?? "N/A"}\n\n`;
  }

  if (result.has_more && result.next_offset !== undefined) {
    md += `---\n*Use offset=${result.next_offset} to see more results*\n`;
  }

  return truncate(md);
}

export function formatWorklogsAsMarkdown(worklogs: TrackerWorklog[]): string {
  if (!worklogs.length) return "No worklog entries found.";

  let md = `# Worklog Entries (${worklogs.length})\n\n`;
  for (const log of worklogs) {
    md += `## ${log.createdBy?.display ?? "Unknown"}\n`;
    md += `**Duration:** ${log.duration}\n`;
    md += `**Start:** ${log.start}\n`;
    md += `**Created:** ${log.createdAt}\n`;
    if (log.comment) md += `**Comment:** ${log.comment}\n`;
    md += `\n`;
  }

  return truncate(md);
}

export function formatCommentsAsMarkdown(comments: TrackerComment[]): string {
  if (!comments.length) return "No comments found.";

  let md = `# Comments (${comments.length})\n\n`;
  for (const c of comments) {
    md += `## ${c.createdBy?.display ?? "Unknown"} — ${c.createdAt ?? "N/A"}\n\n`;
    md += `${c.text ?? ""}\n\n`;
    if (c.updatedAt && c.updatedAt !== c.createdAt) {
      md += `*Edited: ${c.updatedAt}*\n\n`;
    }
    md += `---\n\n`;
  }

  return truncate(md);
}

export function formatTransitionsAsMarkdown(transitions: TrackerTransition[]): string {
  if (!transitions.length) return "No available transitions.";

  let md = `# Available Transitions (${transitions.length})\n\n`;
  md += `| ID | Display Name | Target Status |\n`;
  md += `|----|-------------|---------------|\n`;

  for (const t of transitions) {
    md += `| ${t.id ?? "N/A"} | ${t.display ?? t.id ?? "N/A"} | ${t.to?.display ?? t.to?.key ?? "N/A"} |\n`;
  }

  md += `\nUse transition_issue with the ID to execute a transition.\n`;
  return truncate(md);
}

export function formatIssueLinksAsMarkdown(links: TrackerIssueLink[]): string {
  if (!links.length) return "No issue links found.";

  let md = `# Issue Links (${links.length})\n\n`;
  for (const link of links) {
    const type = link.type?.display ?? link.type?.id ?? "Unknown";
    const direction = link.direction ?? "";
    const obj = link.object;
    const key = obj?.key ?? "N/A";
    const summary = obj?.display ?? obj?.summary ?? "";
    const status = obj?.status?.display ?? "";

    md += `- **${type}** ${direction}: **${key}** ${summary}`;
    if (status) md += ` (${status})`;
    md += `\n`;
  }

  return truncate(md);
}
