import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Application {
  id?: number;
  name: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl: string;

  constructor(private http: HttpClient,
              private oauthService: OAuthService,
              private configService: ConfigService) {

    this.apiUrl = this.configService.apiUrl;

    // You can also access build-time variables
    if (this.configService.isProduction) {
      console.log('Running in production mode.');
    }
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
  }

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/applications`, { headers: this.getAuthHeaders() });
  }

  addApplication(app: Application): Observable<Application> {
    return this.http.post<Application>(`${this.apiUrl}/applications`, app, { headers: this.getAuthHeaders() });
  }

  updateApplication(id: number, app: Application): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/applications/${id}`, app, { headers: this.getAuthHeaders() });
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/applications/${id}`, { headers: this.getAuthHeaders() });
  }
}
