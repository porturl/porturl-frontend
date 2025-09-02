import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

// Define the expected structure from /actuator/info
interface AppConfig {
  auth: {
    'issuer-uri': string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // Get runtime config from the window object for apiUrl and clientId
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
   */
  async buildAuthConfig(): Promise<AuthConfig> {
    const apiUrl = this.runtimeConfig.apiUrl || '';
    if (!apiUrl) {
      console.error('Backend API URL is not defined in src/assets/env.js');
      throw new Error('Backend API URL not found.');
    }

    // Fetch the issuer URI from the backend
    const remoteConfig = await lastValueFrom(this.http.get<AppConfig>(`${apiUrl}/actuator/info`));
    const issuerUri = remoteConfig.auth['issuer-uri'];

    // Build the final AuthConfig object
    return {
      ...environment.auth, // Base settings from environment.ts
      issuer: issuerUri,    // Set the dynamically fetched issuer
      clientId: this.runtimeConfig.clientId || environment.auth.clientId, // Use runtime clientId
    };
  }
}

