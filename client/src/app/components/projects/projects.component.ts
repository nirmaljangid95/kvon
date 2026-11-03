import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filterStatus = 'all';

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = projects;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load projects';
        this.loading = false;
        console.error('Projects error:', error);
      }
    });
  }

  filterProjects(): void {
    let filtered = [...this.projects];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(project =>
        project.status?.toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

    this.filteredProjects = filtered;
  }

  onSearchChange(): void {
    this.filterProjects();
  }

  onStatusFilterChange(): void {
    this.filterProjects();
  }

  createProject(): void {
    this.router.navigate(['/projects/new']);
  }

  viewProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  editProject(projectId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  deleteProject(projectId: string, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    this.projectService.deleteProject(projectId).subscribe({
      next: () => {
        this.loadProjects();
      },
      error: (error) => {
        alert('Failed to delete project');
        console.error('Delete error:', error);
      }
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-default';
    const statusMap: { [key: string]: string } = {
      'active': 'status-active',
      'completed': 'status-completed',
      'on-hold': 'status-onhold',
      'archived': 'status-archived'
    };
    return statusMap[status?.toLowerCase()] || 'status-default';
  }
}
