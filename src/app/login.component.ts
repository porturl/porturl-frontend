import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  // Import CommonModule to use the async pipe
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Application Portal</h2>
        <p class="mt-2 text-sm text-gray-600">Please log in to continue.</p>
        <button
          (click)="login()"
          class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          [disabled]="(configError$ | async) !== null">
          Sign in with SSO
        </button>

        <!-- This block now uses the modern @if control flow -->
        @if (configError$ | async; as errorMessage) {
          <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p class="font-bold">Configuration Error</p>
            <p class="text-sm text-left">{{ errorMessage }}</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  public configError$: Observable<string | null>;

  constructor(
    private oauthService: OAuthService,
    private configService: ConfigService
  ) {
    // Get the error observable from the service
    this.configError$ = this.configService.configError$;
  }

  login(): void {
    // The button is disabled if there's an error, but this is a safeguard.
    // We only attempt to log in if there is no active configuration error.
    if (!this._hasError()) {
      this.oauthService.initCodeFlow();
    } else {
      console.error("Login prevented due to a configuration error.");
    }
  }

  // Helper to get the current error state synchronously
  private _hasError(): boolean {
    let hasError = false;
    this.configError$.subscribe(err => hasError = err !== null).unsubscribe();
    return hasError;
  }
}

