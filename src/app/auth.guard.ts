import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

export const authGuardFn: CanActivateFn = (route, state) => {
  // Use `inject` to get services from Angular's DI system
  const oauthService = inject(OAuthService);
  const router = inject(Router);

  if (oauthService.hasValidAccessToken()) {
    return true;
  }

  // If not authenticated, redirect to the login component
  router.navigate(['/login']);
  return false;
};
