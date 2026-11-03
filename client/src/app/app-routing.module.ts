import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { IssuesComponent } from './components/issues/issues.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'projects', 
    component: ProjectsComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'projects/new', 
    component: ProjectFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'projects/:id/edit', 
    component: ProjectFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'projects/:id', 
    component: ProjectDetailComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'issues', 
    component: IssuesComponent, 
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
