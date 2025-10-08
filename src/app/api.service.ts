import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ErrorService } from './error.service';
import { Application, Category } from './core/models/data.models';

// Interfaces for raw API response objects, based on the swagger spec
interface ApiApplicationCategory {
  category: { id: number };
  sortOrder: number;
}

interface ApiApplication {
  id: number;
  name:string;
  url: string;
  iconUrlThumbnail?: string;
  applicationCategories: ApiApplicationCategory[];
}

interface ApiCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  sortOrder: number;
  applicationSortMode?: 'CUSTOM' | 'ALPHABETICAL';
  applications: ApiApplication[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly oauthService = inject(OAuthService);
  private readonly configService = inject(ConfigService);
  private readonly errorService = inject(ErrorService);
  private readonly apiUrl = this.configService.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
    });
  }

  private handleError() {
    return (error: HttpErrorResponse): Observable<never> => {
      if (error.status === 0) {
        this.errorService.showError('Could not connect to the backend. The service may be temporarily unavailable.');
      }
      return throwError(() => error);
    };
  }

  // Combines application and category data from the API into the format expected by the frontend
  getCategories(): Observable<Category[]> {
    return this.http.get<ApiCategory[]>(`${this.apiUrl}/api/categories`, { headers: this.getAuthHeaders() }).pipe(
      map(apiCategories => {
        const categories: Category[] = apiCategories.map(apiCat => ({
          id: apiCat.id,
          name: apiCat.name,
          description: apiCat.description,
          icon: apiCat.icon,
          enabled: apiCat.enabled,
          order: apiCat.sortOrder,
          applicationSortMode: apiCat.applicationSortMode,
          applications: (apiCat.applications || []).map(apiApp => ({
            id: apiApp.id,
            name: apiApp.name,
            url: apiApp.url,
            icon: apiApp.iconUrlThumbnail,
            order: apiApp.applicationCategories.find(ac => ac.category.id === apiCat.id)?.sortOrder ?? 0,
          })).sort((a, b) => a.order - b.order),
        }));
        return categories.sort((a, b) => a.order - b.order);
      }),
      catchError(this.handleError())
    );
  }

  // Category Methods
  addCategory(categoryData: { name: string }): Observable<Category> {
    const newCategory = { name: categoryData.name, enabled: true, applicationSortMode: 'CUSTOM', applications: [] };
    return this.http.post<Category>(`${this.apiUrl}/api/categories`, newCategory, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  updateCategory(category: Category): Observable<Category> {
    const apiCategory = { ...category, sortOrder: category.order };
    return this.http.put<Category>(`${this.apiUrl}/api/categories/${category.id}`, apiCategory, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/categories/${categoryId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  reorderCategories(categories: Category[]): Observable<void> {
    const payload = categories.map((c, index) => ({ id: c.id, sortOrder: index }));
    return this.http.post<void>(`${this.apiUrl}/api/categories/reorder`, payload, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  // Application Methods
  addApplication(appData: Omit<Application, 'id' | 'order'>, categoryIds: number[]): Observable<Application> {
    const payload = {
      ...appData,
      applicationCategories: categoryIds.map(id => ({ category: { id } })),
    };
    return this.http.post<Application>(`${this.apiUrl}/api/applications`, payload, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  updateApplication(app: Application, categoryIds: number[]): Observable<Application> {
    const payload = {
      ...app,
      applicationCategories: categoryIds.map(id => ({ category: { id } })),
    };
    return this.http.put<Application>(`${this.apiUrl}/api/applications/${app.id}`, payload, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  deleteApplication(appId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/applications/${appId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }

  reorderApplications(categoryId: number, applications: Application[]): Observable<void> {
    const payload = applications.map((app, index) => ({
      id: app.id,
      applicationCategories: [{
        id: { applicationId: app.id, categoryId: categoryId },
        sortOrder: index,
      }],
    }));
    return this.http.post<void>(`${this.apiUrl}/api/applications/reorder`, payload, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError()));
  }
}