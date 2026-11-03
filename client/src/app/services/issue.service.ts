import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Issue, CreateIssueData, UpdateIssueData, IssueFilters } from '../models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = `${environment.apiUrl}/issues`;

  constructor(private http: HttpClient) {}

  getIssues(projectId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.apiUrl}?projectId=${projectId}`).pipe(
      map((response: any) => response.issues || response)
    );
  }

  getAllIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.apiUrl}/all`);
  }

  getIssue(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/${id}`);
  }

  createIssue(data: CreateIssueData): Observable<Issue> {
    return this.http.post<Issue>(this.apiUrl, data);
  }

  updateIssue(id: string, data: UpdateIssueData): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/${id}`, data);
  }

  deleteIssue(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  searchIssues(query: string): Observable<{ issues: Issue[] }> {
    const params = new HttpParams().set('q', query);
    return this.http.get<{ issues: Issue[] }>(`${this.apiUrl}/search`, { params });
  }
}
