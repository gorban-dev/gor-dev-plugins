#!/usr/bin/env node

import { installSkill } from "./install-skill.js";

if (process.argv.includes("--install-skill")) {
  installSkill();
  process.exit(0);
}

// Auto-install skill on server startup
try {
  installSkill(true);
} catch {
  // Ignore errors — skill install is non-critical
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YandexTrackerClient } from "./services/tracker-client.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { registerIssueTools } from "./tools/issues.js";
import { registerWorklogTools } from "./tools/worklogs.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerTransitionTools } from "./tools/transitions.js";
import { registerLinkTools } from "./tools/links.js";

// Environment variables
const API_TOKEN = process.env.YANDEX_TRACKER_TOKEN;
const ORG_ID = process.env.YANDEX_TRACKER_ORG_ID;
const IAM_TOKEN = process.env.YANDEX_TRACKER_IAM_TOKEN;
const CLOUD_ORG_ID = process.env.YANDEX_TRACKER_CLOUD_ORG_ID;

if (!API_TOKEN && !IAM_TOKEN) {
  console.error("Error: YANDEX_TRACKER_TOKEN or YANDEX_TRACKER_IAM_TOKEN must be set");
  process.exit(1);
}

if (!ORG_ID && !CLOUD_ORG_ID) {
  console.error("Error: YANDEX_TRACKER_ORG_ID or YANDEX_TRACKER_CLOUD_ORG_ID must be set");
  process.exit(1);
}

// Initialize client
const client = new YandexTrackerClient({
  token: API_TOKEN,
  iamToken: IAM_TOKEN,
  orgId: ORG_ID,
  cloudOrgId: CLOUD_ORG_ID,
});

// Initialize MCP server
const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

// Register all tools
registerIssueTools(server, client);
registerWorklogTools(server, client);
registerCommentTools(server, client);
registerTransitionTools(server, client);
registerLinkTools(server, client);

// Start server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Yandex Tracker MCP Server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Server error:", error);
  process.exit(1);
});
