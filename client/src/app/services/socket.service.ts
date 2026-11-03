import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Issue } from '../models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  constructor() {}

  connect(): void {
    if (!this.socket) {
      this.socket = io(environment.socketUrl);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinProject(projectId: string): void {
    if (this.socket) {
      this.socket.emit('join-project', projectId);
    }
  }

  leaveProject(projectId: string): void {
    if (this.socket) {
      this.socket.emit('leave-project', projectId);
    }
  }

  onIssueCreated(): Observable<Issue> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('issue-created', (issue: Issue) => {
          observer.next(issue);
        });
      }
    });
  }

  onIssueUpdated(): Observable<Issue> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('issue-updated', (issue: Issue) => {
          observer.next(issue);
        });
      }
    });
  }

  onIssueDeleted(): Observable<{ _id: string }> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('issue-deleted', (data: { _id: string }) => {
          observer.next(data);
        });
      }
    });
  }

  onIssueUpdate(): Observable<Issue> {
    return this.onIssueUpdated();
  }

  onProjectUpdate(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('project-updated', (project: any) => {
          observer.next(project);
        });
      }
    });
  }
}
