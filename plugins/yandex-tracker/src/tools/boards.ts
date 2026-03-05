import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TrackerClient } from "../client.js";

interface Board {
  id?: number;
  name?: string;
  description?: string;
  status?: string;
  columns?: Array<{ id?: string; name?: string; statuses?: Array<{ key?: string; display?: string }> }>;
}

function formatBoard(board: Board): string {
  let md = `# Board: ${board.name ?? "N/A"}\n\n`;
  md += `**ID:** ${board.id ?? "N/A"}\n`;
  if (board.description) md += `**Description:** ${board.description}\n`;
  if (board.status) md += `**Status:** ${board.status}\n`;
  if (board.columns?.length) {
    md += `\n## Columns\n\n`;
    for (const col of board.columns) {
      md += `### ${col.name ?? "N/A"}\n`;
      if (col.statuses?.length) {
        for (const s of col.statuses) {
          md += `- ${s.display ?? s.key ?? "N/A"}\n`;
        }
      }
      md += `\n`;
    }
  }
  return md;
}

function formatBoards(boards: Board[]): string {
  if (!boards.length) return "No boards found.";
  let md = `# Boards (${boards.length})\n\n`;
  md += `| ID | Name | Description |\n`;
  md += `|----|------|-------------|\n`;
  for (const b of boards) {
    md += `| ${b.id ?? "N/A"} | ${b.name ?? "N/A"} | ${b.description ?? ""} |\n`;
  }
  return md;
}

const GetBoardSchema = z.object({
  board_id: z.number().describe("Board ID"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

const ListBoardsSchema = z.object({
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

export function registerBoardTools(server: McpServer, client: TrackerClient): void {
  server.registerTool(
    "yandex_tracker_get_board",
    {
      title: "Get Board",
      description: `Get board details including columns and statuses.

Args:
  - board_id (number, required): Board ID
  - response_format: "json" or "markdown"

Returns: Board info with name, columns, and status mappings.`,
      inputSchema: GetBoardSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: z.infer<typeof GetBoardSchema>) => {
      const board = await client.request<Board>(`/boards/${args.board_id}`);
      const text = args.response_format === "json"
        ? JSON.stringify(board, null, 2)
        : formatBoard(board);
      return { content: [{ type: "text" as const, text }] };
    },
  );

  server.registerTool(
    "yandex_tracker_list_boards",
    {
      title: "List Boards",
      description: `List all available boards.

Args:
  - response_format: "json" or "markdown"

Returns: Table of boards with ID, name, description.`,
      inputSchema: ListBoardsSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: z.infer<typeof ListBoardsSchema>) => {
      const boards = await client.request<Board[]>("/boards");
      const text = args.response_format === "json"
        ? JSON.stringify(boards, null, 2)
        : formatBoards(Array.isArray(boards) ? boards : []);
      return { content: [{ type: "text" as const, text }] };
    },
  );
}
