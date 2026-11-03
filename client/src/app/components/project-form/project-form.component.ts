import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {
  projectForm!: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  projectId = '';

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.projectId;

    this.projectForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['active', Validators.required]
    });

    if (this.isEditMode) {
      this.loadProject();
    }
  }

  loadProject(): void {
    this.loading = true;
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description,
          status: project.status
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load project';
        this.loading = false;
        console.error('Load error:', error);
      }
    });
  }

  get f() {
    return this.projectForm.controls;
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const projectData = this.projectForm.value;

    if (this.isEditMode) {
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to update project';
          this.loading = false;
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: (project) => {
          this.router.navigate(['/projects', project._id]);
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to create project';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/projects', this.projectId]);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}
