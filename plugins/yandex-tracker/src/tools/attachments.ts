import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type TrackerClient, withErrorHandling } from "../client.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";

interface Attachment {
  id?: string;
  name?: string;
  size?: number;
  mimetype?: string;
  createdAt?: string;
  createdBy?: { display?: string };
}

function formatAttachments(attachments: Attachment[]): string {
  if (!attachments.length) return "No attachments found.";
  let md = `# Attachments (${attachments.length})\n\n`;
  md += `| ID | Name | Size | Type | Uploaded By | Date |\n`;
  md += `|----|------|------|------|-------------|------|\n`;
  for (const a of attachments) {
    const sizeKb = a.size ? `${Math.round(a.size / 1024)}KB` : "N/A";
    md += `| ${a.id ?? "N/A"} | ${a.name ?? "N/A"} | ${sizeKb} | ${a.mimetype ?? "N/A"} | ${a.createdBy?.display ?? "N/A"} | ${a.createdAt ?? "N/A"} |\n`;
  }
  return md;
}

// Attachment names come from the server, so they may contain path separators
// or traversal segments. Strip them before joining with the output directory.
function safeFileName(attachment: Attachment): string {
  const name = basename(attachment.name ?? "");
  if (!name || name === "." || name === "..") {
    return `attachment-${attachment.id ?? "unnamed"}`;
  }
  return name;
}

function selectAttachments(
  attachments: Attachment[],
  attachmentId?: string,
  filename?: string,
): Attachment[] {
  if (attachmentId) return attachments.filter((a) => a.id === attachmentId);
  if (filename) {
    const wanted = filename.toLowerCase();
    return attachments.filter((a) => (a.name ?? "").toLowerCase() === wanted);
  }
  return attachments;
}

const ListAttachmentsSchema = z.object({
  issue_key: z.string().describe("Issue key"),
  response_format: z.enum(["json", "markdown"]).default("markdown").describe("Output format"),
}).strict();

const UploadAttachmentSchema = z.object({
  issue_key: z.string().describe("Issue key"),
  file_path: z.string().describe("Absolute path to the file to upload"),
  filename: z.string().optional().describe("Override filename (default: use file's basename)"),
}).strict();

const DownloadAttachmentSchema = z.object({
  issue_key: z.string().describe("Issue key"),
  attachment_id: z.string().optional().describe("Download one attachment by ID (from list_attachments)"),
  filename: z.string().optional().describe("Download attachments matching this name (case-insensitive)"),
  output_dir: z.string().optional().describe("Directory to save into (default: <tmp>/yandex-tracker/<ISSUE-KEY>)"),
}).strict();

export function registerAttachmentTools(server: McpServer, client: TrackerClient): void {
  server.registerTool(
    "yandex_tracker_list_attachments",
    {
      title: "List Attachments",
      description: `List all attachments for an issue.

Args:
  - issue_key (string, required): Issue key
  - response_format: "json" or "markdown"

Returns: Table of attachments with ID, name, size, type, uploader, date.
Pass an ID to yandex_tracker_download_attachment to save the file locally.`,
      inputSchema: ListAttachmentsSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof ListAttachmentsSchema>) => {
      const attachments = await client.request<Attachment[]>(`/issues/${args.issue_key}/attachments`);
      const text = args.response_format === "json"
        ? JSON.stringify(attachments, null, 2)
        : formatAttachments(Array.isArray(attachments) ? attachments : []);
      return { content: [{ type: "text" as const, text }] };
    }),
  );

  server.registerTool(
    "yandex_tracker_download_attachment",
    {
      title: "Download Attachment",
      description: `Download issue attachments to the local filesystem so they can be read.

Args:
  - issue_key (string, required): Issue key
  - attachment_id (string): Download a single attachment by ID
  - filename (string): Download attachments with this name (case-insensitive)
  - output_dir (string): Target directory (default: <tmp>/yandex-tracker/<ISSUE-KEY>)

With neither attachment_id nor filename, every attachment on the issue is downloaded.

Returns: Table of saved files with absolute paths. Read a path with your file-reading
tool to inspect the content (images, PDFs, logs, code).`,
      inputSchema: DownloadAttachmentSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof DownloadAttachmentSchema>) => {
      const response = await client.request<Attachment[]>(`/issues/${args.issue_key}/attachments`);
      const attachments = Array.isArray(response) ? response : [];
      const selected = selectAttachments(attachments, args.attachment_id, args.filename);

      if (!selected.length) {
        const available = attachments.length
          ? attachments.map((a) => `  ${a.id ?? "N/A"} — ${a.name ?? "N/A"}`).join("\n")
          : "  (issue has no attachments)";
        throw new Error(`No attachment matched in ${args.issue_key}.\nAvailable:\n${available}`);
      }

      const outputDir = args.output_dir ?? join(tmpdir(), "yandex-tracker", args.issue_key);
      await mkdir(outputDir, { recursive: true });

      let md = `# Downloaded ${selected.length} attachment(s) from ${args.issue_key}\n\n`;
      md += `| File | Size | Type | Path |\n`;
      md += `|------|------|------|------|\n`;

      for (const attachment of selected) {
        if (!attachment.id) continue;
        const name = safeFileName(attachment);
        const fileResponse = await client.requestRaw(
          `/issues/${args.issue_key}/attachments/${attachment.id}/${encodeURIComponent(attachment.name ?? name)}`,
        );
        const data = Buffer.from(await fileResponse.arrayBuffer());
        const filePath = join(outputDir, name);
        await writeFile(filePath, data);
        md += `| ${name} | ${data.length} bytes | ${attachment.mimetype ?? "N/A"} | ${filePath} |\n`;
      }

      return { content: [{ type: "text" as const, text: md }] };
    }),
  );

  server.registerTool(
    "yandex_tracker_upload_attachment",
    {
      title: "Upload Attachment",
      description: `Upload a file as an attachment to an issue.

Args:
  - issue_key (string, required): Issue key
  - file_path (string, required): Absolute path to the file
  - filename (string): Override filename

Returns: Confirmation with attachment details.`,
      inputSchema: UploadAttachmentSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    withErrorHandling(async (args: z.infer<typeof UploadAttachmentSchema>) => {
      const fileData = await readFile(args.file_path);
      const name = args.filename ?? basename(args.file_path);
      const qp = new URLSearchParams({ filename: name });
      const response = await client.requestRaw(
        `/issues/${args.issue_key}/attachments?${qp.toString()}`,
        { method: "POST", body: fileData },
        "application/octet-stream",
      );
      const result = (await response.json()) as Attachment;
      return { content: [{ type: "text" as const, text: `Attachment uploaded to ${args.issue_key}\n\nName: ${result.name ?? name}\nSize: ${result.size ?? fileData.length} bytes` }] };
    }),
  );
}
