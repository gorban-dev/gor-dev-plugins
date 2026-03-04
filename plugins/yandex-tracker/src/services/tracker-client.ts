import { API_BASE_URL } from "../constants.js";
import type {
  TrackerIssue,
  TrackerWorklog,
  TrackerComment,
  TrackerTransition,
  TrackerIssueLink,
  SearchResult,
} from "../types.js";

interface YandexTrackerConfig {
  token?: string;
  iamToken?: string;
  orgId?: string;
  cloudOrgId?: string;
}

export class YandexTrackerClient {
  private readonly authHeader: string;
  private readonly orgIdHeaderName: string;
  private readonly orgIdHeaderValue: string;

  constructor(config: YandexTrackerConfig) {
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        const errorData = await response.json() as Record<string, unknown>;
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

  async getIssue(issueKey: string): Promise<TrackerIssue> {
    return this.request<TrackerIssue>(`/issues/${issueKey}`);
  }

  async createIssue(params: {
    queue: string;
    summary: string;
    description?: string;
    type?: string;
    priority?: string;
    assignee?: string;
    parent?: string;
    followers?: string[];
    tags?: string[];
    sprint?: string;
  }): Promise<TrackerIssue> {
    const body: Record<string, unknown> = {
      queue: params.queue,
      summary: params.summary,
    };

    if (params.description) body.description = params.description;
    if (params.type) body.type = { key: params.type };
    if (params.priority) body.priority = { key: params.priority };
    if (params.assignee) body.assignee = params.assignee;
    if (params.parent) body.parent = params.parent;
    if (params.followers) body.followers = { add: params.followers };
    if (params.tags) body.tags = params.tags;
    if (params.sprint) body.sprint = [{ id: params.sprint }];

    return this.request<TrackerIssue>("/issues", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateIssue(issueKey: string, updates: Record<string, unknown>): Promise<TrackerIssue> {
    const body: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;

      if (["status", "type", "priority"].includes(key)) {
        body[key] = { key: value };
      } else {
        body[key] = value;
      }
    }

    return this.request<TrackerIssue>(`/issues/${issueKey}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async addWorklog(
    issueKey: string,
    worklog: { duration: string; start?: string; comment?: string }
  ): Promise<TrackerWorklog> {
    const body: Record<string, unknown> = { duration: worklog.duration };
    if (worklog.start) body.start = worklog.start;
    if (worklog.comment) body.comment = worklog.comment;

    return this.request<TrackerWorklog>(`/issues/${issueKey}/worklog`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getWorklogs(issueKey: string): Promise<TrackerWorklog[]> {
    return this.request<TrackerWorklog[]>(`/issues/${issueKey}/worklog`);
  }

  async searchIssues(params: {
    query?: string;
    filter?: Record<string, unknown>;
    order?: string[];
    limit?: number;
    offset?: number;
  }): Promise<SearchResult> {
    const body: Record<string, unknown> = {};
    if (params.query) body.query = params.query;
    if (params.filter) body.filter = params.filter;
    if (params.order) body.order = params.order;

    const perPage = params.limit ?? 20;
    const page = Math.floor((params.offset ?? 0) / perPage) + 1;
    const qp = new URLSearchParams();
    qp.append("perPage", perPage.toString());
    qp.append("page", page.toString());

    const issues = await this.request<TrackerIssue[]>(`/issues/_search?${qp.toString()}`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const safeIssues = Array.isArray(issues) ? issues : [];
    const offset = params.offset ?? 0;

    return {
      issues: safeIssues,
      total: safeIssues.length,
      count: safeIssues.length,
      offset,
      has_more: safeIssues.length >= perPage,
      ...(safeIssues.length >= perPage ? { next_offset: offset + safeIssues.length } : {}),
    };
  }

  async getComments(issueKey: string, expand?: string): Promise<TrackerComment[]> {
    const qp = expand ? `?expand=${encodeURIComponent(expand)}` : "";
    return this.request<TrackerComment[]>(`/issues/${issueKey}/comments${qp}`);
  }

  async addComment(
    issueKey: string,
    params: { text: string; summonees?: string[] }
  ): Promise<TrackerComment> {
    const body: Record<string, unknown> = { text: params.text };
    if (params.summonees) body.summonees = params.summonees;

    return this.request<TrackerComment>(`/issues/${issueKey}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getTransitions(issueKey: string): Promise<TrackerTransition[]> {
    return this.request<TrackerTransition[]>(`/issues/${issueKey}/transitions`);
  }

  async transitionIssue(
    issueKey: string,
    transitionId: string,
    params?: { comment?: string }
  ): Promise<TrackerTransition[]> {
    const body: Record<string, unknown> = {};
    if (params?.comment) body.comment = params.comment;

    return this.request<TrackerTransition[]>(
      `/issues/${issueKey}/transitions/${transitionId}/_execute`,
      { method: "POST", body: JSON.stringify(body) }
    );
  }

  async getIssueLinks(issueKey: string): Promise<TrackerIssueLink[]> {
    return this.request<TrackerIssueLink[]>(`/issues/${issueKey}/links`);
  }

  async linkIssues(
    issueKey: string,
    params: { relationship: string; issue: string }
  ): Promise<TrackerIssueLink> {
    return this.request<TrackerIssueLink>(`/issues/${issueKey}/links`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
