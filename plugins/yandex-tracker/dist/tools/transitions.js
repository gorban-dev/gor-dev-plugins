import { z } from "zod";
function formatTransitions(transitions) {
    if (!transitions.length)
        return "No available transitions.";
    let md = `# Available Transitions (${transitions.length})\n\n`;
    md += `| ID | Display Name | Target Status |\n`;
    md += `|----|-------------|---------------|\n`;
    for (const t of transitions) {
        md += `| ${t.id ?? "N/A"} | ${t.display ?? t.id ?? "N/A"} | ${t.to?.display ?? t.to?.key ?? "N/A"} |\n`;
    }
    md += `\nUse transition_issue with the ID to execute a transition.\n`;
    return md;
}
const GetTransitionsSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();
const TransitionIssueSchema = z.object({
    issue_key: z.string().describe("Issue key"),
    transition_id: z.string().describe("Transition ID from get_transitions"),
    comment: z.string().optional().describe("Comment for the transition"),
}).strict();
export function registerTransitionTools(server, client) {
    server.registerTool("yandex_tracker_get_transitions", {
        title: "Get Transitions",
        description: `Get available status transitions for an issue. ALWAYS call this before transition_issue.

Args:
  - issue_key (string, required): Issue key
  - response_format: "json" or "markdown"

Returns: Table of transitions with ID, display name, target status. Use the ID with transition_issue.`,
        inputSchema: GetTransitionsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const transitions = await client.request(`/issues/${args.issue_key}/transitions`);
        const text = args.response_format === "json"
            ? JSON.stringify(transitions, null, 2)
            : formatTransitions(transitions);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_transition_issue", {
        title: "Execute Transition",
        description: `Execute a status transition on an issue. First call get_transitions to find valid IDs.

Args:
  - issue_key (string, required): Issue key
  - transition_id (string, required): Transition ID from get_transitions
  - comment (string): Optional comment

Examples:
  - "Move PROJ-123 to in progress" -> get_transitions first, then transition_id="start_progress"
  - "Close PROJ-456" -> transition_id="close", comment="Done"`,
        inputSchema: TransitionIssueSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    }, async (args) => {
        const body = {};
        if (args.comment)
            body.comment = args.comment;
        await client.request(`/issues/${args.issue_key}/transitions/${args.transition_id}/_execute`, { method: "POST", body: JSON.stringify(body) });
        return { content: [{ type: "text", text: `Transition '${args.transition_id}' executed on ${args.issue_key}${args.comment ? `\nComment: ${args.comment}` : ""}` }] };
    });
}
//# sourceMappingURL=transitions.js.map