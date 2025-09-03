import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { OAuthService } from 'angular-oauth2-oidc';

// Create a mock OAuthService to satisfy the dependency injector
class MockOAuthService {
  // Add any methods that your component's constructor might call
  getIdentityClaims() { return null; }
  hasValidAccessToken() { return false; }
}

describe('AppComponent', () => {
  beforeEach(() => {
    // For standalone components, TestBed can be configured without `compileComponents`.
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AppComponent // Import the standalone component
      ],
      providers: [
        // Provide the mock service
        { provide: OAuthService, useClass: MockOAuthService }
      ]
    });
  });

  // This is the only test needed for the root component now.
  // It confirms that the component can be created without errors.
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // The tests for 'title' and 'render title' have been removed
  // as they are no longer relevant to the component's template.
});

