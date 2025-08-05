import { provideHttpClient } from '@angular/common/http';
import { inject, provideZonelessChangeDetection, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';

import { AppComponent } from './app/app.component';
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

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    provideAppInitializer(() => {
      const oauthService = inject(OAuthService);
      oauthService.configure(environment.auth);
      return oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
        if (oauthService.hasValidAccessToken()) {
          oauthService.setupAutomaticSilentRefresh();
        }
      });
    }),
  ]
}).catch(err => console.error(err));
