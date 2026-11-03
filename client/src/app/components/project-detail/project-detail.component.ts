import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { IssueService } from '../../services/issue.service';
import { SocketService } from '../../services/socket.service';
import { Project } from '../../models/project.model';
import { Issue } from '../../models/issue.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  issues: Issue[] = [];
  loading = true;
  error = '';
  projectId = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private issueService: IssueService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params['id'];
    this.loadProjectData();
    this.setupRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.socketService.leaveProject(this.projectId);
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProjectData(): void {
    this.loading = true;
    this.error = '';

    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load project';
        this.loading = false;
        console.error('Project error:', error);
      }
    });

    this.issueService.getIssues(this.projectId).subscribe({
      next: (issues) => {
        this.issues = issues;
      },
      error: (error) => {
        console.error('Issues error:', error);
      }
    });
  }

  setupRealtimeUpdates(): void {
    this.socketService.joinProject(this.projectId);

    const issueSub = this.socketService.onIssueUpdate().subscribe(() => {
      this.loadProjectData();
    });

    const projectSub = this.socketService.onProjectUpdate().subscribe(() => {
      this.loadProjectData();
    });

    this.subscriptions.push(issueSub, projectSub);
  }

  editProject(): void {
    this.router.navigate(['/projects', this.projectId, 'edit']);
  }

  deleteProject(): void {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        alert('Failed to delete project');
        console.error('Delete error:', error);
      }
    });
  }

  getIssuesByStatus(status: string): Issue[] {
    return this.issues.filter(issue => 
      issue.status.toLowerCase() === status.toLowerCase()
    );
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
}
