import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { IssueStatus, IssuePriority } from '../../models/issue.model';

@Component({
  selector: 'app-issue-form',
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.css']
})
export class IssueFormComponent implements OnInit {
  title = '';
  description = '';
  status: IssueStatus = 'To Do';
  priority: IssuePriority = 'Medium';
  projectId = '';
  projects: Project[] = [];
  loading = false;
  error = '';
  isEditMode = false;
  issueId: string | null = null;

  constructor(
    private issueService: IssueService,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    
    // Get projectId from query params
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.projectId = params['projectId'];
      }
    });

    // Check if editing
    this.issueId = this.route.snapshot.paramMap.get('id');
    if (this.issueId) {
      this.isEditMode = true;
      this.loadIssue();
    }
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        if (!this.projectId && data.length > 0) {
          this.projectId = data[0]._id;
        }
      },
      error: (err) => {
        this.error = 'Failed to load projects';
      }
    });
  }

  loadIssue(): void {
    if (this.issueId) {
      this.issueService.getIssue(this.issueId).subscribe({
        next: (issue) => {
          this.title = issue.title;
          this.description = issue.description || '';
          this.status = issue.status;
          this.priority = issue.priority;
          this.projectId = issue.projectId._id;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load issue';
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.projectId) {
      this.error = 'Title and project are required';
      return;
    }

    this.loading = true;
    this.error = '';

    const data = {
      title: this.title.trim(),
      description: this.description.trim(),
      status: this.status,
      priority: this.priority,
      projectId: this.projectId
    };

    const request = this.isEditMode && this.issueId
      ? this.issueService.updateIssue(this.issueId, data)
      : this.issueService.createIssue(data);

    request.subscribe({
      next: (issue) => {
        this.router.navigate(['/projects', issue.projectId._id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save issue';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    if (this.projectId) {
      this.router.navigate(['/projects', this.projectId]);
    } else {
      this.router.navigate(['/issues']);
    }
  }
}
