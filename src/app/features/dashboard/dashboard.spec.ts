import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Dashboard } from './dashboard';
import { ApiService } from '../../api.service';
import { EditModeService } from '../../core/services/edit-mode.service';
import { SearchService } from '../../core/services/search.service';
import { SearchFilterPipe } from '../../core/pipes/search-filter-pipe';
import { OAuthService } from 'angular-oauth2-oidc';

// Mocks
class MockApiService {
  getCategories() { return of([]); }
  reorderCategories() { return of(undefined); }
  reorderApplications() { return of(undefined); }
  addCategory() { return of({}); }
  updateCategory() { return of({}); }
  deleteCategory() { return of(undefined); }
  addApplication() { return of({}); }
  updateApplication() { return of({}); }
  deleteApplication() { return of(undefined); }
}

class MockEditModeService {
  editMode = signal(false);
  toggleEditMode() {}
}

class MockSearchService {
  searchTerm = signal('');
  setSearchTerm() {}
}

class MockMatDialog {
  open() {
    return {
      afterClosed: () => of(null)
    };
  }
}

class MockOAuthService {
  getIdentityClaims() { return null; }
  hasValidAccessToken() { return false; }
}

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
        DragDropModule,
        NoopAnimationsModule,
        SearchFilterPipe,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: EditModeService, useClass: MockEditModeService },
        { provide: SearchService, useClass: MockSearchService },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: OAuthService, useClass: MockOAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});