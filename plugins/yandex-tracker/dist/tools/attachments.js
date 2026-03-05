import { z } from "zod";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
function formatAttachments(attachments) {
    if (!attachments.length)
        return "No attachments found.";
    let md = `# Attachments (${attachments.length})\n\n`;
    md += `| Name | Size | Type | Uploaded By | Date |\n`;
    md += `|------|------|------|-------------|------|\n`;
    for (const a of attachments) {
        const sizeKb = a.size ? `${Math.round(a.size / 1024)}KB` : "N/A";
        md += `| ${a.name ?? "N/A"} | ${sizeKb} | ${a.mimetype ?? "N/A"} | ${a.createdBy?.display ?? "N/A"} | ${a.createdAt ?? "N/A"} |\n`;
    }
    return md;
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
export function registerAttachmentTools(server, client) {
    server.registerTool("yandex_tracker_list_attachments", {
        title: "List Attachments",
        description: `List all attachments for an issue.

Args:
  - issue_key (string, required): Issue key
  - response_format: "json" or "markdown"

Returns: Table of attachments with name, size, type, uploader, date.`,
        inputSchema: ListAttachmentsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    }, async (args) => {
        const attachments = await client.request(`/issues/${args.issue_key}/attachments`);
        const text = args.response_format === "json"
            ? JSON.stringify(attachments, null, 2)
            : formatAttachments(Array.isArray(attachments) ? attachments : []);
        return { content: [{ type: "text", text }] };
    });
    server.registerTool("yandex_tracker_upload_attachment", {
        title: "Upload Attachment",
        description: `Upload a file as an attachment to an issue.

Args:
  - issue_key (string, required): Issue key
  - file_path (string, required): Absolute path to the file
  - filename (string): Override filename

Returns: Confirmation with attachment details.`,
        inputSchema: UploadAttachmentSchema,
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    }, async (args) => {
        const fileData = await readFile(args.file_path);
        const name = args.filename ?? basename(args.file_path);
        const qp = new URLSearchParams({ filename: name });
        const response = await client.requestRaw(`/issues/${args.issue_key}/attachments?${qp.toString()}`, { method: "POST", body: fileData }, "application/octet-stream");
        const result = (await response.json());
        return { content: [{ type: "text", text: `Attachment uploaded to ${args.issue_key}\n\nName: ${result.name ?? name}\nSize: ${result.size ?? fileData.length} bytes` }] };
    });
}
//# sourceMappingURL=attachments.js.map