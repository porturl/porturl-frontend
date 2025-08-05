import { AuthConfig } from 'angular-oauth2-oidc';

const authConfig: AuthConfig = {
  // URL of the Identity Provider
  issuer: (window as any).env.issuer || 'https://sso.yourdomain.com/auth/realms/<yourrealm>',

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/dashboard',

  // The SPA's id for production
  clientId: (window as any).env.clientId || 'porturl',

  // Scopes ('openid' is required for OIDC)
  scope: 'openid profile email',

  responseType: 'code',

  showDebugInformation: false, // Turn off debug info in prod
  sessionChecksEnabled: true,
};

export const environment = {
  production: true,
  auth: authConfig
};
