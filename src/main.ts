import { provideHttpClient } from '@angular/common/http';
import {inject, provideZonelessChangeDetection, provideAppInitializer, NgModule} from '@angular/core';
import {bootstrapApplication, platformBrowser} from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';

import { AppComponent } from './app/app.component';
import { ConfigService } from './app/config.service';
import { authGuardFn } from './app/auth.guard';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { environment } from './environments/environment';
import { LoginComponent } from './app/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuardFn] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

// Factory function for the App Initializer
// Updated factory function with detailed logging
export async function initializeOAuthFactory() {
  const configService = inject(ConfigService);
  const oauthService = inject(OAuthService);

  console.log('App Initializer: Starting OAuth setup...');

  try {
    // Step 1: Fetch the dynamic config from the backend
    const authConfig = await configService.buildAuthConfig();
    console.log('App Initializer: AuthConfig built successfully:', authConfig);

    if (!authConfig.issuer) {
      console.error('App Initializer: FATAL - Issuer URL is empty after config. Halting auth setup.');
      return;
    }

    // Step 2: Configure the OAuthService with the fetched config
    oauthService.configure(authConfig);
    console.log('App Initializer: OAuthService configured.');

    // Step 3: Load the discovery document and attempt to log in
    const success = await oauthService.loadDiscoveryDocumentAndTryLogin();
    console.log('App Initializer: loadDiscoveryDocumentAndTryLogin result:', success);

    // Step 4: Set up silent refresh if the user is already logged in
    if (success && oauthService.hasValidAccessToken()) {
      console.log('App Initializer: User has valid token. Setting up silent refresh.');
      oauthService.setupAutomaticSilentRefresh();
    } else {
      console.log('App Initializer: No valid token found or initial login failed.');
    }

  } catch (error) {
    console.error('App Initializer: CRITICAL ERROR during OAuth setup:', error);
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    provideAppInitializer(initializeOAuthFactory),
  ]
}).catch(err => console.error(err));
