import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getActivities(projectId?: string, limit: number = 20): Observable<Activity[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    return this.http.get<Activity[]>(this.apiUrl, { params });
  }

  getRecentActivities(limit: number = 10): Observable<Activity[]> {
    return this.getActivities(undefined, limit);
  }
}
