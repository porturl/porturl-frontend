import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, BehaviorSubject } from 'rxjs';
import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

// Defines the expected structure of the JSON response from /actuator/info
interface AppConfig {
  auth: {
    'issuer-uri': string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // A private subject to hold the error message.
  private _configError = new BehaviorSubject<string | null>(null);
  // A public observable that components can subscribe to.
  public configError$ = this._configError.asObservable();

  // Get runtime config from the window object (for apiUrl and clientId)
  private runtimeConfig = (window as any).env || {};

  constructor(private http: HttpClient) {}

  /**
   * Public getter for the backend API URL.
   * Other services will use this to get the configured URL.
   */
  public get apiUrl(): string {
    return this.runtimeConfig.apiUrl || '';
  }

  /**
   * Public getter for the production flag.
   */
  public get isProduction(): boolean {
    return environment.production;
  }

  /**
   * Fetches the remote configuration and builds the final AuthConfig object.
   * If it fails, it updates the configError$ observable.
   */
  async buildAuthConfig(): Promise<AuthConfig | null> {
    const apiUrl = this.runtimeConfig.apiUrl || '';
    if (!apiUrl) {
      const errorMessage = 'Backend API URL is not defined in src/assets/env.js';
      console.error(errorMessage);
      this._configError.next(errorMessage); // Notify subscribers of the error
      return null;
    }

    try {
      // Attempt to fetch the issuer URI from the backend's actuator endpoint
      const remoteConfig = await lastValueFrom(this.http.get<AppConfig>(`${apiUrl}/actuator/info`));
      const issuerUri = remoteConfig.auth['issuer-uri'];

      // On success, clear any previous error
      this._configError.next(null);

      // Build and return the final AuthConfig object
      return {
        ...environment.auth,
        issuer: issuerUri,
        clientId: this.runtimeConfig.clientId || environment.auth.clientId,
      };
    } catch (error) {
      const errorMessage = 'Could not connect to the backend to get the SSO configuration. Please ensure the backend is running and the API URL is correct.';
      console.error(errorMessage, error);
      this._configError.next(errorMessage); // Notify subscribers of the error
      return null;
    }
  }
}

