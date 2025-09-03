import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ErrorService } from './error.service';

export interface Application {
  id?: number;
  name: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService,
    private configService: ConfigService,
    private errorService: ErrorService
  ) {
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

  /**
   * A private error handler that uses the ErrorService to broadcast
   * a user-friendly message when the backend is unreachable.
   */
  private handleError() {
    return (error: HttpErrorResponse): Observable<never> => {
      // A status of 0 typically indicates a network error (CORS, backend down, etc.)
      if (error.status === 0) {
        this.errorService.showError('Could not connect to the backend. The service may be temporarily unavailable.');
      }
      // re-throw the error to be handled by the component's error callback if needed
      return throwError(() => error);
    };
  }

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/applications`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError())); // Add the error handling pipe
  }

  addApplication(app: Application): Observable<Application> {
    return this.http.post<Application>(`${this.apiUrl}/applications`, app, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  updateApplication(id: number, app: Application): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/applications/${id}`, app, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/applications/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }
}

