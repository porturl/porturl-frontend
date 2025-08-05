import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Application Portal</h2>
        <p class="mt-2 text-sm text-gray-600">Please log in to continue.</p>
        <button (click)="login()" class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Sign in with SSO
        </button>
      </div>
    </div>
  `,
})
export class LoginComponent {
  constructor(private oauthService: OAuthService) {}

  login(): void {
    this.oauthService.initCodeFlow();
  }
}
