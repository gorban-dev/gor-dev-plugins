#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TrackerClient } from "./client.js";
import { registerIssueTools } from "./tools/issues.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerWorklogTools } from "./tools/worklogs.js";
import { registerTransitionTools } from "./tools/transitions.js";
import { registerLinkTools } from "./tools/links.js";
import { registerChecklistTools } from "./tools/checklists.js";
import { registerQueueTools } from "./tools/queues.js";
import { registerSprintTools } from "./tools/sprints.js";
import { registerBoardTools } from "./tools/boards.js";
import { registerUserTools } from "./tools/users.js";
import { registerAttachmentTools } from "./tools/attachments.js";

const API_TOKEN = process.env.YANDEX_TRACKER_TOKEN;
const ORG_ID = process.env.YANDEX_TRACKER_ORG_ID;
const IAM_TOKEN = process.env.YANDEX_TRACKER_IAM_TOKEN;
const CLOUD_ORG_ID = process.env.YANDEX_TRACKER_CLOUD_ORG_ID;

if (!API_TOKEN && !IAM_TOKEN) {
  console.error(
    "Error: YANDEX_TRACKER_TOKEN or YANDEX_TRACKER_IAM_TOKEN must be set",
  );
  process.exit(1);
}

if (!ORG_ID && !CLOUD_ORG_ID) {
  console.error(
    "Error: YANDEX_TRACKER_ORG_ID or YANDEX_TRACKER_CLOUD_ORG_ID must be set",
  );
  process.exit(1);
}

const client = new TrackerClient({
  token: API_TOKEN,
  iamToken: IAM_TOKEN,
  orgId: ORG_ID,
  cloudOrgId: CLOUD_ORG_ID,
});

const server = new McpServer({
  name: "yandex-tracker-mcp-server",
  version: "1.0.0",
});

registerIssueTools(server, client);
registerCommentTools(server, client);
registerWorklogTools(server, client);
registerTransitionTools(server, client);
registerLinkTools(server, client);
registerChecklistTools(server, client);
registerQueueTools(server, client);
registerSprintTools(server, client);
registerBoardTools(server, client);
registerUserTools(server, client);
registerAttachmentTools(server, client);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Yandex Tracker MCP Server v2 running on stdio");
}

main().catch((error: unknown) => {
  console.error("Server error:", error);
  process.exit(1);
});
