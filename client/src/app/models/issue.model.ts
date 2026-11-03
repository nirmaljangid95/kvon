export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  _id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: {
    _id: string;
    name: string;
  } | string;
  project?: {
    _id: string;
    name: string;
  };
  assignee?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIssueData {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  projectId: string;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
}

export interface IssueFilters {
  status?: IssueStatus;
  priority?: IssuePriority;
  projectId?: string;
  page?: number;
  limit?: number;
}
