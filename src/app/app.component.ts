import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {OAuthService} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  title = 'porturl-frontend';

  // The OAuthService is already fully configured by the time this component is created.
  // You can still inject it here to use it for login/logout actions in your template.
  constructor(private oauthService: OAuthService) {
    console.log('AppComponent initialized. User is authenticated:', this.oauthService.hasValidAccessToken());
  }

  // You can add login/logout methods here if needed for your UI
  login() {
    this.oauthService.initCodeFlow();
  }

  logout() {
    this.oauthService.logOut();
  }
}
