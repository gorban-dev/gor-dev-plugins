const API_BASE_URL = "https://api.tracker.yandex.net/v2";

interface ClientConfig {
  token?: string;
  iamToken?: string;
  orgId?: string;
  cloudOrgId?: string;
}

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

export function handleApiError(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `Error: ${message}` }],
  };
}

export function withErrorHandling<T extends unknown[]>(
  fn: (...args: T) => Promise<ToolResult>,
): (...args: T) => Promise<ToolResult> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export class TrackerClient {
  private readonly authHeader?: string;
  private readonly orgIdHeaderName?: string;
  private readonly orgIdHeaderValue?: string;

  constructor(config: ClientConfig) {
    const iamToken = normalizeEnvValue(config.iamToken);
    const token = normalizeEnvValue(config.token);
    const cloudOrgId = normalizeEnvValue(config.cloudOrgId);
    const orgId = normalizeEnvValue(config.orgId);

    if (iamToken) {
      this.authHeader = `Bearer ${iamToken}`;
    } else if (token) {
      this.authHeader = `OAuth ${token}`;
    }

    if (cloudOrgId) {
      this.orgIdHeaderName = "X-Cloud-Org-Id";
      this.orgIdHeaderValue = cloudOrgId;
    } else if (orgId) {
      this.orgIdHeaderName = "X-Org-Id";
      this.orgIdHeaderValue = orgId;
    }
  }

  private headers(contentType?: string): Record<string, string> {
    if (!this.authHeader) {
      throw new Error("Either YANDEX_TRACKER_TOKEN or YANDEX_TRACKER_IAM_TOKEN must be set");
    }
    if (!this.orgIdHeaderName || !this.orgIdHeaderValue) {
      throw new Error("Either YANDEX_TRACKER_ORG_ID or YANDEX_TRACKER_CLOUD_ORG_ID must be set");
    }

    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      [this.orgIdHeaderName]: this.orgIdHeaderValue,
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.headers("application/json");

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = (await response.json()) as Record<string, unknown>;
        if (Array.isArray(errorData.errorMessages)) {
          errorMessage += `\nDetails: ${(errorData.errorMessages as string[]).join(", ")}`;
        } else if (errorData.errors) {
          errorMessage += `\nErrors: ${JSON.stringify(errorData.errors)}`;
        }
      } catch {
        // ignore parse failure
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  async requestRaw(
    endpoint: string,
    options: RequestInit = {},
    contentType?: string,
  ): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.headers(contentType);

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = (await response.json()) as Record<string, unknown>;
        if (Array.isArray(errorData.errorMessages)) {
          errorMessage += `\nDetails: ${(errorData.errorMessages as string[]).join(", ")}`;
        }
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    return response;
  }
}

function normalizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (/^\$\{[A-Z0-9_]+\}$/.test(value)) return undefined;
  return value;
}
