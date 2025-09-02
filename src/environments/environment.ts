import { AuthConfig } from 'angular-oauth2-oidc';

const authConfig: AuthConfig = {

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/dashboard',

  // The SPA's id for development
  clientId: (window as any).env.clientId || 'porturl',

  // Scopes ('openid' is required for OIDC)
  scope: 'openid profile email',

  responseType: 'code',

  showDebugInformation: true,
  sessionChecksEnabled: true,
};

export const environment = {
  production: false,
  auth: authConfig
};
