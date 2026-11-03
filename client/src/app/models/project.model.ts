export interface Project {
  _id: string;
  name: string;
  description?: string;
  status?: string;
  members?: any[];
  memberCount?: number;
  issueCount?: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}
