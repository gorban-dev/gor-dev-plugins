const API_BASE_URL = "https://api.tracker.yandex.net/v2";

interface ClientConfig {
  token?: string;
  iamToken?: string;
  orgId?: string;
  cloudOrgId?: string;
}

export class TrackerClient {
  private readonly authHeader: string;
  private readonly orgIdHeaderName: string;
  private readonly orgIdHeaderValue: string;

  constructor(config: ClientConfig) {
    if (config.iamToken) {
      this.authHeader = `Bearer ${config.iamToken}`;
    } else if (config.token) {
      this.authHeader = `OAuth ${config.token}`;
    } else {
      throw new Error("Either token or iamToken must be provided");
    }

    if (config.cloudOrgId) {
      this.orgIdHeaderName = "X-Cloud-Org-Id";
      this.orgIdHeaderValue = config.cloudOrgId;
    } else if (config.orgId) {
      this.orgIdHeaderName = "X-Org-Id";
      this.orgIdHeaderValue = config.orgId;
    } else {
      throw new Error("Either orgId or cloudOrgId must be provided");
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      [this.orgIdHeaderName]: this.orgIdHeaderValue,
      "Content-Type": "application/json",
    };

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
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      [this.orgIdHeaderName]: this.orgIdHeaderValue,
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }

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
