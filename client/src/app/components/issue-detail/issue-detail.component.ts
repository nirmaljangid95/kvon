import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { Issue } from '../../models/issue.model';

@Component({
  selector: 'app-issue-detail',
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIssue(id);
    }
  }

  loadIssue(id: string): void {
    this.issueService.getIssue(id).subscribe({
      next: (data) => {
        this.issue = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load issue';
        this.loading = false;
      }
    });
  }

  editIssue(): void {
    if (this.issue) {
      this.router.navigate(['/issues', this.issue._id, 'edit']);
    }
  }

  deleteIssue(): void {
    if (this.issue && confirm('Are you sure you want to delete this issue?')) {
      this.issueService.deleteIssue(this.issue._id).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.issue!.projectId._id]);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete issue');
        }
      });
    }
  }

  changeStatus(status: string): void {
    if (this.issue) {
      this.issueService.updateIssue(this.issue._id, { status: status as any }).subscribe({
        next: (updated) => {
          this.issue = updated;
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to update status');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '');
  }

  getPriorityClass(priority: string): string {
    return 'priority-' + priority.toLowerCase();
  }
}
