import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { ProjectService } from '../../services/project.service';
import { Issue } from '../../models/issue.model';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent implements OnInit {
  issues: Issue[] = [];
  projects: Project[] = [];
  filteredIssues: Issue[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filterStatus = 'all';
  filterPriority = 'all';
  filterProject = 'all';

  constructor(
    private issueService: IssueService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    // Load projects first
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        console.error('Projects error:', error);
      }
    });

    // Load all issues across projects
    this.issueService.getAllIssues().subscribe({
      next: (issues) => {
        this.issues = issues;
        this.filteredIssues = issues;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load issues';
        this.loading = false;
        console.error('Issues error:', error);
      }
    });
  }

  filterIssues(): void {
    let filtered = [...this.issues];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(term) ||
        issue.description?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(issue =>
        issue.status.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

    // Filter by priority
    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(issue =>
        issue.priority.toLowerCase() === this.filterPriority.toLowerCase()
      );
    }

    // Filter by project
    if (this.filterProject !== 'all') {
      filtered = filtered.filter(issue => {
        const projectId = typeof issue.projectId === 'string' ? issue.projectId : issue.projectId._id;
        const issueProjectId = issue.project?._id || projectId;
        return issueProjectId === this.filterProject;
      });
    }

    this.filteredIssues = filtered;
  }

  onSearchChange(): void {
    this.filterIssues();
  }

  onFilterChange(): void {
    this.filterIssues();
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'open': 'status-open',
      'in-progress': 'status-progress',
      'in progress': 'status-progress',
      'resolved': 'status-resolved',
      'closed': 'status-closed'
    };
    return statusMap[status?.toLowerCase()] || 'status-default';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'critical': 'priority-critical'
    };
    return priorityMap[priority?.toLowerCase()] || 'priority-default';
  }

  getProjectName(issue: Issue): string {
    if (typeof issue.project === 'object' && issue.project?.name) {
      return issue.project.name;
    }
    return 'Unknown Project';
  }
}
