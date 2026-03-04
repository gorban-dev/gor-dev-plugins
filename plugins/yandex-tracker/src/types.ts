/** Common display field pattern in Yandex Tracker API */
export interface TrackerDisplayField {
  key?: string;
  display?: string;
  id?: string;
}

/** User reference */
export interface TrackerUser {
  display?: string;
  id?: string;
  login?: string;
}

/** Issue object from Yandex Tracker API */
export interface TrackerIssue {
  key: string;
  summary: string;
  status?: TrackerDisplayField;
  type?: TrackerDisplayField;
  priority?: TrackerDisplayField;
  assignee?: TrackerUser;
  createdAt?: string;
  updatedAt?: string;
  originalEstimation?: string;
  estimation?: string;
  spent?: string;
  description?: string;
  queue?: TrackerDisplayField;
  parent?: { key?: string };
  tags?: string[];
}

/** Worklog entry */
export interface TrackerWorklog {
  duration: string;
  start: string;
  createdAt: string;
  createdBy?: TrackerUser;
  comment?: string;
}

/** Comment on an issue */
export interface TrackerComment {
  id?: number;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: TrackerUser;
}

/** Available status transition */
export interface TrackerTransition {
  id: string;
  display?: string;
  to?: TrackerDisplayField;
}

/** Link between issues */
export interface TrackerIssueLink {
  type?: TrackerDisplayField;
  direction?: string;
  object?: {
    key?: string;
    display?: string;
    summary?: string;
    status?: TrackerDisplayField;
  };
}

/** Paginated search result */
export interface SearchResult {
  issues: TrackerIssue[];
  total: number;
  count: number;
  offset: number;
  has_more: boolean;
  next_offset?: number;
}
