import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // Get the runtime config from the window object
  private runtimeConfig = (window as any).env || {};

  // Merge the build-time environment and runtime environment
  public config = {
    ...environment, // Spread the build-time config (e.g., production: true)
    ...this.runtimeConfig // Spread the runtime config (e.g., apiUrl, clientId)
  };

  constructor() {
    console.log('Unified Config:', this.config);
  }
}
