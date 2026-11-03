import { Project } from './project.model';
import { Issue } from './issue.model';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  completedIssues?: number;
  highPriorityIssues?: number;
  recentProjects?: Project[];
  recentIssues?: Issue[];
}
