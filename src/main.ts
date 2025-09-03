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

    // Only proceed with OAuth setup if the configuration was fetched successfully
    if (authConfig) {
      oauthService.configure(authConfig);
      await oauthService.loadDiscoveryDocumentAndTryLogin();
      if (oauthService.hasValidAccessToken()) {
        oauthService.setupAutomaticSilentRefresh();
      }
    } else {
      // If authConfig is null, it means fetching failed. Log a warning.
      // The app will continue to load, and the login screen will show the error.
      console.warn('App Initializer: AuthConfig could not be built. Skipping OAuth setup.');
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
