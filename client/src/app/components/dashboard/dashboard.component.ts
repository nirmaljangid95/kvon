import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { ActivityService } from '../../services/activity.service';
import { DashboardStats } from '../../models/dashboard.model';
import { Activity } from '../../models/activity.model';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentActivities: Activity[] = [];
  loading = true;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private activityService: ActivityService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupRealtimeUpdates();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
        console.error('Dashboard error:', error);
      }
    });

    this.activityService.getRecentActivities(10).subscribe({
      next: (activities) => {
        this.recentActivities = activities;
      },
      error: (error) => {
        console.error('Activities error:', error);
      }
    });
  }

  setupRealtimeUpdates(): void {
    this.socketService.onIssueUpdate().subscribe(() => {
      this.loadDashboardData();
    });

    this.socketService.onProjectUpdate().subscribe(() => {
      this.loadDashboardData();
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'open': 'status-open',
      'in-progress': 'status-progress',
      'in progress': 'status-progress',
      'resolved': 'status-resolved',
      'closed': 'status-closed',
      'active': 'status-active',
      'completed': 'status-completed'
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

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'issue_created': '➕',
      'issue_updated': '✏️',
      'issue_closed': '✅',
      'project_created': '📁',
      'project_updated': '📝',
      'comment_added': '💬',
      'status_changed': '🔄',
      'priority_changed': '⚡'
    };
    return iconMap[type] || '📌';
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return d.toLocaleDateString();
  }
}
